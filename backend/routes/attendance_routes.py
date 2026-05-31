from flask import Blueprint, jsonify, request
from services.db import query
from services.validators import validate_attendance, validate_grade

attendance_bp = Blueprint('attendance', __name__)

@attendance_bp.route('/api/attendance', methods=['POST'])
def mark_attendance():
    data = request.get_json()

    # ── Validate first ──
    is_valid, errors = validate_attendance(data)
    if not is_valid:
        return jsonify({"error": errors[0]}), 400

    query("""
        INSERT INTO Attendance(course_id, date, status, student_id)
        VALUES (%s,%s,%s,%s)
        ON DUPLICATE KEY UPDATE status=VALUES(status)
    """, (
        int(data['course_id']),
        data['date'],
        data['status'].lower(),
        int(data['student_id'])
    ), fetch=False)

    return jsonify({"msg": "Attendance updated"})


@attendance_bp.route('/api/attendance/<int:sid>/<int:cid>')
def get_attendance(sid, cid):
    if sid <= 0 or cid <= 0:
        return jsonify({"error": "Invalid IDs"}), 400

    records = query(
        "SELECT date, status FROM Attendance WHERE student_id=%s AND course_id=%s ORDER BY date DESC",
        (sid, cid)
    )
    pct_row = query("SELECT fn_attendance_pct(%s,%s) AS pct", (sid, cid))
    pct = float(pct_row[0]['pct']) if pct_row else 0.0
    for r in records:
        if hasattr(r['date'], 'isoformat'):
            r['date'] = r['date'].isoformat()
    return jsonify({"attendance_pct": pct, "records": records})


@attendance_bp.route('/api/progress', methods=['POST'])
def update_progress():
    data = request.get_json()

    # ── Validate first ──
    is_valid, errors = validate_grade(data)
    if not is_valid:
        return jsonify({"error": errors[0]}), 400

    sid        = int(data['student_id'])
    cid        = int(data['course_id'])
    new_grade  = float(data['grade'])
    completion = int(data['completion_pct'])

    existing = query(
        "SELECT grade FROM Progress WHERE student_id=%s AND course_id=%s",
        (sid, cid)
    )
    old_grade = existing[0]['grade'] if existing else None

    query("""
        INSERT INTO Progress(student_id, course_id, grade, completion_pct)
        VALUES (%s,%s,%s,%s)
        ON DUPLICATE KEY UPDATE
            grade=VALUES(grade),
            completion_pct=VALUES(completion_pct),
            last_updated=NOW()
    """, (sid, cid, new_grade, completion), fetch=False)

    if old_grade is None or float(old_grade) != new_grade:
        query("""
            INSERT INTO GradeHistory(student_id, course_id, old_grade, new_grade, changed_by, reason)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (sid, cid, old_grade, new_grade, 'system', 'Grade updated via portal'),
        fetch=False)

    cert = query(
        "SELECT cert_number FROM Certificates WHERE student_id=%s AND course_id=%s",
        (sid, cid)
    )
    msg = "Grade updated." + (
        f" Certificate issued: {cert[0]['cert_number']}" if cert else ""
    )
    return jsonify({"msg": msg, "message": msg})


@attendance_bp.route('/api/progress/<int:sid>/<int:cid>/history')
def grade_history(sid, cid):
    if sid <= 0 or cid <= 0:
        return jsonify({"error": "Invalid IDs"}), 400

    rows = query(
        """SELECT old_grade, new_grade, changed_at, changed_by, reason
           FROM GradeHistory
           WHERE student_id=%s AND course_id=%s
           ORDER BY changed_at DESC""",
        (sid, cid)
    )
    for r in rows:
        if r.get('changed_at') and hasattr(r['changed_at'], 'isoformat'):
            r['changed_at'] = r['changed_at'].isoformat()
    return jsonify(rows)