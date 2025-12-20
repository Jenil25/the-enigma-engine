from flask import Blueprint, jsonify, request
from db import get_db

sessions_bp = Blueprint('sessions', __name__)

@sessions_bp.route('/', methods=['POST'])
def start_session():
    data = request.json
    booking_id = data.get('bookingId')
    game_master_id = data.get('gameMasterId')

    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute(
            "INSERT INTO Game_Sessions (bookingID, gameMasterID, startTime, success) VALUES (%s, %s, NOW(), NULL)",
            (booking_id, game_master_id)
        )
        db.commit()
        return jsonify({"message": "Session started", "sessionId": cursor.lastrowid}), 201
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()

@sessions_bp.route('/<int:session_id>/end', methods=['POST'])
def end_session(session_id):
    data = request.json
    success = data.get('success', False)

    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute(
            "UPDATE Game_Sessions SET endTime = NOW(), success = %s WHERE sessionID = %s",
            (success, session_id)
        )
        db.commit()
        return jsonify({"message": "Session ended"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()

@sessions_bp.route('/<int:session_id>/hint', methods=['POST'])
def log_hint(session_id):
    data = request.json
    puzzle_id = data.get('puzzleId')
    hint_sequence = data.get('hintSequence')

    if not puzzle_id or not hint_sequence:
        return jsonify({"error": "puzzleId and hintSequence are required"}), 400

    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute(
            "INSERT INTO Session_Hints_Used (sessionID, puzzleID, hintSequence, timestampHintGiven) VALUES (%s, %s, %s, NOW())",
            (session_id, puzzle_id, hint_sequence)
        )
        db.commit()
        return jsonify({"message": "Hint logged"}), 201
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
