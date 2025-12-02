from flask import Flask, jsonify
from flask_cors import CORS
from db import init_db, get_db
from routes.auth import auth_bp
from routes.rooms import rooms_bp
from routes.bookings import bookings_bp
from routes.sessions import sessions_bp
from routes.analytics import analytics_bp

app = Flask(__name__)
CORS(app)

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(rooms_bp, url_prefix='/api/rooms')
app.register_blueprint(bookings_bp, url_prefix='/api/bookings')
app.register_blueprint(sessions_bp, url_prefix='/api/sessions')
app.register_blueprint(analytics_bp, url_prefix='/api/analytics')

@app.route('/')
def hello():
    return jsonify({"message": "Welcome to The Enigma Engine API"})

@app.route('/api/health')
def health():
    db = get_db()
    if db:
        return jsonify({"status": "healthy", "database": "connected"})
    return jsonify({"status": "unhealthy", "database": "disconnected"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
