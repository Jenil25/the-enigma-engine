from app import app
from db import get_db

with app.app_context():
    db = get_db()
    cursor = db.cursor()
    try:
        print("Updating v_CustomerBookings view...")
        sql = """
        CREATE OR REPLACE VIEW v_CustomerBookings AS
        SELECT 
            b.bookingID,
            b.customerID,
            r.name AS roomName,
            b.scheduledTime,
            b.status AS bookingStatus,
            i.invoiceID,
            i.amountDue,
            i.status AS invoiceStatus
        FROM Bookings b
        JOIN Rooms r ON b.roomID = r.roomID
        LEFT JOIN Invoices i ON b.bookingID = i.bookingID
        ORDER BY b.scheduledTime DESC;
        """
        cursor.execute(sql)
        db.commit()
        print("View updated successfully!")
    except Exception as e:
        print(f"Error updating view: {e}")
    finally:
        cursor.close()
