from flask import Flask, jsonify, render_template
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from datetime import datetime, date
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

from routes.auth_routes import auth_bp
from routes.student_routes import student_bp
from routes.course_routes import course_bp
from routes.enrollment_routes import enrollment_bp
from routes.attendance_routes import attendance_bp
from routes.payment_routes import payment_bp
from routes.other_routes import other_bp

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = os.getenv("SECRET_KEY", "fallback_dev_key_change_this")

# ── Rate Limiter Setup ──
# Tracks requests by IP address
# Default: 200 requests/day, 50/hour for all routes
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",  # stored in memory (fine for dev)
)

# ── Make limiter available to blueprints ──
app.limiter = limiter

class CustomJSONProvider(app.json_provider_class):
    def default(self, obj):
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        return super().default(obj)

app.json_provider_class = CustomJSONProvider
app.json = CustomJSONProvider(app)

# Register Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(student_bp)
app.register_blueprint(course_bp)
app.register_blueprint(enrollment_bp)
app.register_blueprint(attendance_bp)
app.register_blueprint(payment_bp)
app.register_blueprint(other_bp)

# ── Handle rate limit errors nicely ──
@app.errorhandler(429)
def rate_limit_exceeded(e):
    return jsonify({
        "error": "Too many attempts. Please wait a minute and try again.",
        "retry_after": "60 seconds"
    }), 429

@app.route('/')
def home():
    return render_template('index.html')

if __name__ == "__main__":
    app.run(debug=True)