from flask import Flask, jsonify, render_template
from flask_cors import CORS
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

@app.route('/')
def home():
    return render_template('index.html')

if __name__ == "__main__":
    app.run(debug=True)