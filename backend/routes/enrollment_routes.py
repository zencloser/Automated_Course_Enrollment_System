from flask import Blueprint, jsonify, request
from mysql.connector import Error
from services.db import get_db, query
from services.validators import validate_enrollment

enrollment_bp = Blueprint('enrollment', __name__)

@enrollment_bp.route('/api/enroll', methods=['POST'])
def enroll():
    data = request.get_json()

    # ── Validate first ──
    is_valid, errors = validate_enrollment(data)
    if not is_valid:
        return jsonify({"error": errors[0]}), 400

    sid = int(data['student_id'])
    cid = int(data['course_id'])

    try:
        db = get_db()
        cur = db.cursor()
        cur.callproc('sp_enroll_student', [sid, cid])
        db.commit()
        cur.close()
        db.close()
        check = query(
            "SELECT status FROM Enrollment WHERE student_id=%s AND course_id=%s",
            (sid, cid)
        )
        wait = query(
            "SELECT position FROM Waitlist WHERE student_id=%s AND course_id=%s AND status='waiting'",
            (sid, cid)
        )
        if check:
            return jsonify({"status": "enrolled", "message": "Successfully enrolled!"})
        elif wait:
            return jsonify({
                "status": "waitlisted",
                "message": f"Added to waitlist at position {wait[0]['position']}"
            })
        else:
            return jsonify({"status": "duplicate", "message": "Already enrolled or waitlisted."})
    except Error as e:
        return jsonify({"error": str(e)}), 500


@enrollment_bp.route('/api/enrollment/<int:sid>/<int:cid>/drop', methods=['PUT'])
def drop_course(sid, cid):
    # URL params are already typed as int by Flask (<int:sid>)
    if sid <= 0 or cid <= 0:
        return jsonify({"error": "Invalid student_id or course_id"}), 400
    try:
        query(
            "UPDATE Enrollment SET status='dropped' WHERE student_id=%s AND course_id=%s",
            (sid, cid), fetch=False
        )
        query(
            "UPDATE CourseCapacity SET enrolled_count = enrolled_count - 1 WHERE course_id=%s",
            (cid,), fetch=False
        )
        return jsonify({
            "status": "dropped",
            "message": "Course dropped. Waitlist promotion triggered automatically."
        })
    except Error as e:
        return jsonify({"error": str(e)}), 500