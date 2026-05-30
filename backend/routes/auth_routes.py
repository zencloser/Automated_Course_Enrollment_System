from flask import Blueprint, jsonify, request, session
from services.db import query
from services.auth_utils import hash_password, check_password
import os

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"error": "Email and password required"}), 400

    email    = data['email'].strip().lower()
    password = data['password'].strip()

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    # ── Admin login ──
    # Admin credentials come from .env only — nothing hardcoded
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
                "status":    "ok",
                "user_type": "admin",
                "user_id":   0,
                "full_name": "System Admin",
                "role":      "Admin"
            })
        # Wrong password — return same error as below (don't leak info)
        return jsonify({"error": "Invalid email or password"}), 401

    # ── Student login ──
    # Password is fetched from DB and compared using bcrypt
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
                "status":    "ok",
                "user_type": "student",
                "user_id":   s['student_id'],
                "full_name": s['full_name'],
                "role":      "Student"
            })
        return jsonify({"error": "Invalid email or password"}), 401

    # ── Instructor login ──
    # Password is fetched from DB and compared using bcrypt
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
                "status":    "ok",
                "user_type": "instructor",
                "user_id":   i['instructor_id'],
                "full_name": i['full_name'],
                "role":      "Instructor"
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