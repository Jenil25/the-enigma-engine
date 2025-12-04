from flask import Blueprint, jsonify, request
from db import get_db
import pymysql.cursors
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('firstName')
    last_name = data.get('lastName')
    phone = data.get('phone')
    role = data.get('role', 'Customer')

    if not all([email, password, first_name, last_name]):
        return jsonify({"error": "Missing required fields"}), 400

    hashed_password = generate_password_hash(password)
    db = get_db()
    cursor = db.cursor()

    try:
        cursor.callproc('sp_RegisterUser', (email, hashed_password, first_name, last_name, phone, role, 0))
        cursor.execute("SELECT @p_userID")
        
        # Calling stored procedure
        cursor.execute(
            "CALL sp_RegisterUser(%s, %s, %s, %s, %s, %s, @new_user_id)",
            (email, hashed_password, first_name, last_name, phone, role)
        )
        cursor.execute("SELECT @new_user_id")
        result = cursor.fetchone()
        user_id = result['@new_user_id']

        db.commit()
        return jsonify({"message": "User registered successfully", "userId": user_id}), 201

    except pymysql.IntegrityError:
        db.rollback()
        return jsonify({"error": "Email already exists"}), 409
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        return jsonify({"error": "Registration failed"}), 500
    finally:
        cursor.close()

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400

    db = get_db()
    cursor = db.cursor()

    try:
        cursor.execute("SELECT userID, hashedPassword, firstName, lastName FROM Users WHERE email = %s", (email,))
        user = cursor.fetchone()

        if user and check_password_hash(user['hashedPassword'], password):
            role = "Customer"
            cursor.execute("SELECT role FROM Staff WHERE userID = %s", (user['userID'],))
            staff_record = cursor.fetchone()
            if staff_record:
                role = staff_record['role']
            
            return jsonify({
                "message": "Login successful",
                "user": {
                    "id": user['userID'],
                    "firstName": user['firstName'],
                    "lastName": user['lastName'],
                    "role": role
                }
            }), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Login failed"}), 500
    finally:
        cursor.close()
