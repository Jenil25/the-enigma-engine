from flask import Blueprint, jsonify
from db import get_db

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/revenue', methods=['GET'])
def get_revenue_report():
    # Monthly Revenue by Room
    db = get_db()
    cursor = db.cursor()
    try:
        query = """
            SELECT r.name as roomName, DATE_FORMAT(p.transactionTimestamp, '%%Y-%%m') as month, SUM(p.amountPaid) as totalRevenue
            FROM Payments p
            JOIN Invoices i ON p.invoiceID = i.invoiceID
            JOIN Bookings b ON i.bookingID = b.bookingID
            JOIN Rooms r ON b.roomID = r.roomID
            GROUP BY r.name, month
            ORDER BY month DESC, totalRevenue DESC
        """
        cursor.execute(query)
        report = cursor.fetchall()
        return jsonify(report), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()

@analytics_bp.route('/performance', methods=['GET'])
def get_performance_stats():
    # Success Rate vs Team Size
    db = get_db()
    cursor = db.cursor()
    try:
        query = """
            SELECT b.numPlayers, COUNT(*) as totalSessions, SUM(CASE WHEN gs.success = 1 THEN 1 ELSE 0 END) as successfulSessions,
                   (SUM(CASE WHEN gs.success = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100 as successRate
            FROM Game_Sessions gs
            JOIN Bookings b ON gs.bookingID = b.bookingID
            GROUP BY b.numPlayers
            ORDER BY b.numPlayers
        """
        cursor.execute(query)
        stats = cursor.fetchall()
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
