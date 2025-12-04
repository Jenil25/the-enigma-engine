from flask import Blueprint, jsonify, request
from db import get_db

staff_bp = Blueprint('staff', __name__)

@staff_bp.route('/', methods=['GET'])
def get_all_staff():
    db = get_db()
    cursor = db.cursor()
    try:
        query = """
            SELECT s.userID, s.role, s.hireDate, s.payRate, 
                   u.firstName, u.lastName, u.email, u.phone
            FROM Staff s
            JOIN Users u ON s.userID = u.userID
        """
        cursor.execute(query)
        staff = cursor.fetchall()
        return jsonify(staff), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()

@staff_bp.route('/<int:user_id>', methods=['PUT'])
def update_staff(user_id):
    data = request.json
    role = data.get('role')
    pay_rate = data.get('payRate')

    if not role or pay_rate is None:
         return jsonify({"error": "Missing required fields"}), 400

    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute(
            "UPDATE Staff SET role = %s, payRate = %s WHERE userID = %s",
            (role, pay_rate, user_id)
        )
        db.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Staff member not found"}), 404
        return jsonify({"message": "Staff updated successfully"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()

@staff_bp.route('/<int:user_id>', methods=['DELETE'])
def delete_staff(user_id):
    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute("DELETE FROM Users WHERE userID = %s", (user_id,))
        db.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "User not found"}), 404
        return jsonify({"message": "Staff member deleted successfully"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
