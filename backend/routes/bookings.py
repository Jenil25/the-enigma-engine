from flask import Blueprint, jsonify, request
from db import get_db

bookings_bp = Blueprint('bookings', __name__)

@bookings_bp.route('/', methods=['POST'])
def create_booking():
    data = request.json
    customer_id = data.get('customerId')
    room_id = data.get('roomId')
    scheduled_time = data.get('scheduledTime')
    num_players = data.get('numPlayers')

    if not all([customer_id, room_id, scheduled_time, num_players]):
        return jsonify({"error": "Missing required fields"}), 400

    db = get_db()
    cursor = db.cursor()
    try:
        # Call Stored Procedure
        cursor.execute(
            "CALL sp_CreateBooking(%s, %s, %s, %s, @new_booking_id, @new_invoice_id)",
            (customer_id, room_id, scheduled_time, num_players)
        )
        
        cursor.execute("SELECT @new_booking_id, @new_invoice_id")
        result = cursor.fetchone()
        booking_id = result['@new_booking_id']
        invoice_id = result['@new_invoice_id']

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
        query = "SELECT * FROM v_CustomerBookings WHERE customerID = %s"
        cursor.execute(query, (customer_id,))
        bookings = cursor.fetchall()
        return jsonify(bookings), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()

@bookings_bp.route('/schedule', methods=['GET'])
def get_schedule():
    db = get_db()
    cursor = db.cursor()
    try:
        query = """
            SELECT b.bookingID, b.customerID, b.roomID, b.scheduledTime, b.numPlayers, b.status,
                   r.name as roomName, r.durationMinutes,
                   u.firstName, u.lastName
            FROM Bookings b
            JOIN Rooms r ON b.roomID = r.roomID
            JOIN Users u ON b.customerID = u.userID
            WHERE b.status = 'Confirmed'
            ORDER BY b.scheduledTime ASC
        """
        cursor.execute(query)
        bookings = cursor.fetchall()
        return jsonify(bookings), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()

@bookings_bp.route('/invoices/<int:invoice_id>/pay', methods=['POST'])
def pay_invoice(invoice_id):
    data = request.json
    amount = data.get('amount')
    method = data.get('paymentMethod', 'Credit Card')

    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute(
            "INSERT INTO Payments (invoiceID, amountPaid, paymentMethod) VALUES (%s, %s, %s)",
            (invoice_id, amount, method)
        )
        
        cursor.execute(
            "UPDATE Invoices SET status = 'Paid' WHERE invoiceID = %s",
            (invoice_id,)
        )

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
