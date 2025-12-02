from flask import Blueprint, jsonify, request
from db import get_db

bookings_bp = Blueprint('bookings', __name__)

@bookings_bp.route('/', methods=['POST'])
def create_booking():
    data = request.json
    customer_id = data.get('customerId')
    room_id = data.get('roomId')
    scheduled_time = data.get('scheduledTime') # Format: 'YYYY-MM-DD HH:MM:SS'
    num_players = data.get('numPlayers')

    if not all([customer_id, room_id, scheduled_time, num_players]):
        return jsonify({"error": "Missing required fields"}), 400

    db = get_db()
    cursor = db.cursor()
    try:
        # Transaction Start
        # 1. Check Availability (Simplified: Check if slot is taken)
        cursor.execute(
            "SELECT * FROM Bookings WHERE roomID = %s AND scheduledTime = %s AND status != 'Cancelled'",
            (room_id, scheduled_time)
        )
        if cursor.fetchone():
            return jsonify({"error": "Room not available at this time"}), 409

        # 2. Create Booking
        cursor.execute(
            "INSERT INTO Bookings (customerID, roomID, scheduledTime, numPlayers, status) VALUES (%s, %s, %s, %s, 'Confirmed')",
            (customer_id, room_id, scheduled_time, num_players)
        )
        booking_id = cursor.lastrowid

        # 3. Create Invoice
        # Calculate amount (e.g., $25 per player)
        amount_due = float(num_players) * 25.00
        cursor.execute(
            "INSERT INTO Invoices (bookingID, amountDue, status) VALUES (%s, %s, 'Pending')",
            (booking_id, amount_due)
        )
        invoice_id = cursor.lastrowid

        db.commit()
        return jsonify({"message": "Booking confirmed", "bookingId": booking_id, "invoiceId": invoice_id}), 201

    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()

@bookings_bp.route('/customer/<int:customer_id>', methods=['GET'])
def get_customer_bookings(customer_id):
    db = get_db()
    cursor = db.cursor()
    try:
        query = """
            SELECT b.bookingID, r.name as roomName, b.scheduledTime, b.status, i.amountDue, i.status as invoiceStatus
            FROM Bookings b
            JOIN Rooms r ON b.roomID = r.roomID
            LEFT JOIN Invoices i ON b.bookingID = i.bookingID
            WHERE b.customerID = %s
            ORDER BY b.scheduledTime DESC
        """
        cursor.execute(query, (customer_id,))
        bookings = cursor.fetchall()
        return jsonify(bookings), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()

# --- Invoice & Payment Routes (Grouped with Bookings for now or can be separate) ---

@bookings_bp.route('/invoices/<int:invoice_id>/pay', methods=['POST'])
def pay_invoice(invoice_id):
    data = request.json
    amount = data.get('amount')
    method = data.get('paymentMethod', 'Credit Card')

    db = get_db()
    cursor = db.cursor()
    try:
        # 1. Record Payment
        cursor.execute(
            "INSERT INTO Payments (invoiceID, amountPaid, paymentMethod) VALUES (%s, %s, %s)",
            (invoice_id, amount, method)
        )
        
        # 2. Update Invoice Status
        cursor.execute(
            "UPDATE Invoices SET status = 'Paid' WHERE invoiceID = %s",
            (invoice_id,)
        )

        # 3. Update Customer Loyalty Points (Bonus: 10 points per payment)
        cursor.execute(
            """UPDATE Customers c
               JOIN Bookings b ON c.userID = b.customerID
               JOIN Invoices i ON b.bookingID = i.bookingID
               SET c.loyaltyPoints = c.loyaltyPoints + 10
               WHERE i.invoiceID = %s""",
            (invoice_id,)
        )

        db.commit()
        return jsonify({"message": "Payment successful"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
