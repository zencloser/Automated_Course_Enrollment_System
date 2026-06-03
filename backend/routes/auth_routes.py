from flask import Blueprint, jsonify, request, session, current_app
from services.db import query
from services.auth_utils import check_password
from services.validators import validate_login, sanitize_email
import os

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/login', methods=['POST'])
def login():
    # ── Rate limit this route strictly ──
    # Only 5 attempts per minute per IP address
    # This runs on every login attempt
    limiter = current_app.limiter
    limiter.limit("5 per minute")(lambda: None)()

    data = request.get_json()

    # ── Validate input first ──
    is_valid, errors = validate_login(data)
    if not is_valid:
        return jsonify({"error": errors[0]}), 400

    # Sanitize after validation
    email    = sanitize_email(data['email'])
    password = data['password'].strip()

    # ── Admin login ──
    if email == 'admin@snu.edu.in':
        admin_password = os.getenv("ADMIN_PASSWORD", "")
        if not admin_password:
            return jsonify({"error": "Admin not configured"}), 500
        if password == admin_password:
            session['user_id']   = 0
            session['user_type'] = 'admin'
            session['full_name'] = 'System Admin'
            session['role']      = 'Admin'
            return jsonify({
                "status": "ok", 
                "user_type": "admin",
                "user_id": 0, 
                "full_name": 
                "System Admin", 
                "role": "Admin"
            })
        return jsonify({"error": "Invalid email or password"}), 401

    # ── Student login ──
    rows = query(
        "SELECT student_id, full_name, password FROM Student WHERE LOWER(email)=%s",
        (email,)
    )
    if rows:
        s = rows[0]
        stored_hash = s.get('password', '')
        if stored_hash and check_password(password, stored_hash):
            session['user_id']   = s['student_id']
            session['user_type'] = 'student'
            session['full_name'] = s['full_name']
            session['role']      = 'Student'
            return jsonify({
                "status": "ok", 
                "user_type": "student",
                "user_id": s['student_id'],
                "full_name": s['full_name'], 
                "role": "Student"
            })
        return jsonify({"error": "Invalid email or password"}), 401

    # ── Instructor login ──
    rows = query(
        "SELECT instructor_id, full_name, password FROM Instructor WHERE LOWER(email)=%s",
        (email,)
    )
    if rows:
        i = rows[0]
        stored_hash = i.get('password', '')
        if stored_hash and check_password(password, stored_hash):
            session['user_id']   = i['instructor_id']
            session['user_type'] = 'instructor'
            session['full_name'] = i['full_name']
            session['role']      = 'Instructor'
            return jsonify({
                "status": "ok", 
                "user_type": "instructor",
                "user_id": i['instructor_id'],
                "full_name": i['full_name'], 
                "role": "Instructor"
            })
        return jsonify({"error": "Invalid email or password"}), 401

    return jsonify({"error": "Invalid email or password"}), 401


@auth_bp.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"status": "logged out"})


@auth_bp.route('/api/me')
def me():
    if 'user_id' not in session:
        return jsonify({"logged_in": False})
    return jsonify({
        "logged_in": True,
        "user_id":   session['user_id'],
        "user_type": session['user_type'],
        "full_name": session['full_name'],
        "role":      session['role']
    })