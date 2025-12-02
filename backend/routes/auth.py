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
    role = data.get('role', 'Customer') # Default to Customer

    if not all([email, password, first_name, last_name]):
        return jsonify({"error": "Missing required fields"}), 400

    hashed_password = generate_password_hash(password)
    db = get_db()
    cursor = db.cursor()

    try:
        # 1. Insert into Users
        cursor.execute(
            "INSERT INTO Users (email, hashedPassword, firstName, lastName, phone) VALUES (%s, %s, %s, %s, %s)",
            (email, hashed_password, first_name, last_name, phone)
        )
        user_id = cursor.lastrowid

        # 2. Insert into Child Table (Customer or Staff)
        if role == 'Customer':
            cursor.execute(
                "INSERT INTO Customers (userID, dateOfBirth, loyaltyPoints) VALUES (%s, NULL, 0)",
                (user_id,)
            )
        elif role in ['Admin', 'GameMaster']:
            cursor.execute(
                "INSERT INTO Staff (userID, role, hireDate, payRate) VALUES (%s, %s, CURDATE(), 0.00)",
                (user_id, role)
            )
        else:
             db.rollback()
             return jsonify({"error": "Invalid role"}), 400

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
        # Get User details
        cursor.execute("SELECT userID, hashedPassword, firstName, lastName FROM Users WHERE email = %s", (email,))
        user = cursor.fetchone()

        if user and check_password_hash(user['hashedPassword'], password):
            # Determine Role
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
