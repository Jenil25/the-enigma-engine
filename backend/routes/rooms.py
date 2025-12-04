from flask import Blueprint, jsonify, request
from db import get_db

rooms_bp = Blueprint('rooms', __name__)

@rooms_bp.route('/', methods=['GET'])
def get_rooms():
    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute("SELECT * FROM Rooms")
        rooms = cursor.fetchall()
        return jsonify(rooms), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()

@rooms_bp.route('/<int:room_id>', methods=['GET'])
def get_room(room_id):
    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute("SELECT * FROM Rooms WHERE roomID = %s", (room_id,))
        room = cursor.fetchone()
        if room:
            cursor.execute("SELECT * FROM Puzzles WHERE roomID = %s", (room_id,))
            puzzles = cursor.fetchall()
            room['puzzles'] = puzzles
            return jsonify(room), 200
        return jsonify({"error": "Room not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()

@rooms_bp.route('/', methods=['POST'])
def create_room():
    data = request.json
    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute(
            "INSERT INTO Rooms (name, description, difficultyLevel, maxPlayers, durationMinutes) VALUES (%s, %s, %s, %s, %s)",
            (data['name'], data.get('description'), data['difficultyLevel'], data['maxPlayers'], data['durationMinutes'])
        )
        db.commit()
        return jsonify({"message": "Room created", "roomId": cursor.lastrowid}), 201
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()

@rooms_bp.route('/<int:room_id>', methods=['PUT'])
def update_room(room_id):
    data = request.json
    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute(
            """UPDATE Rooms 
               SET name=%s, description=%s, difficultyLevel=%s, maxPlayers=%s, durationMinutes=%s 
               WHERE roomID=%s""",
            (data['name'], data.get('description'), data['difficultyLevel'], data['maxPlayers'], data['durationMinutes'], room_id)
        )
        db.commit()
        if cursor.rowcount == 0:
             return jsonify({"error": "Room not found or no change"}), 404
        return jsonify({"message": "Room updated"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()

@rooms_bp.route('/<int:room_id>', methods=['DELETE'])
def delete_room(room_id):
    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute("DELETE FROM Rooms WHERE roomID = %s", (room_id,))
        db.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Room not found"}), 404
        return jsonify({"message": "Room deleted"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()

@rooms_bp.route('/<int:room_id>/puzzles', methods=['POST'])
def create_puzzle(room_id):
    data = request.json
    puzzle_type = data.get('puzzleType')
    
    if puzzle_type not in ['Physical', 'Digital']:
        return jsonify({"error": "Invalid puzzle type"}), 400

    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute(
            "INSERT INTO Puzzles (roomID, name, description, puzzleType) VALUES (%s, %s, %s, %s)",
            (room_id, data['name'], data.get('description'), puzzle_type)
        )
        puzzle_id = cursor.lastrowid

        if puzzle_type == 'Physical':
            cursor.execute(
                "INSERT INTO Physical_Puzzles (puzzleID, resetInstructions, requiredPropID) VALUES (%s, %s, %s)",
                (puzzle_id, data.get('resetInstructions'), data.get('requiredPropID'))
            )
        else:
            cursor.execute(
                "INSERT INTO Digital_Puzzles (puzzleID, softwareEndpoint, correctAnswerHash) VALUES (%s, %s, %s)",
                (puzzle_id, data.get('softwareEndpoint'), data.get('correctAnswerHash'))
            )
        
        db.commit()
        return jsonify({"message": "Puzzle created", "puzzleId": puzzle_id}), 201
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
