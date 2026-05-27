from flask import Blueprint, jsonify
from services.db import query

course_bp = Blueprint('course', __name__)

@course_bp.route('/api/courses')
def get_courses():
    rows = query("""
        SELECT c.course_id, c.course_name, c.course_code,
               c.credits, c.semester,
               i.full_name AS instructor,
               cc.max_seats, cc.enrolled_count,
               ROUND(cc.enrolled_count * 100.0 / NULLIF(cc.max_seats,0), 1) AS fill_pct
        FROM Course c
        LEFT JOIN CourseCapacity cc ON c.course_id = cc.course_id
        LEFT JOIN Instructor i ON c.instructor_id = i.instructor_id
    """)
    return jsonify(rows)

@course_bp.route('/api/courses/<int:cid>/students')
def course_students(cid):
    rows = query("""
        SELECT s.full_name, e.status,
               p.grade,
               fn_attendance_pct(s.student_id, %s) AS attendance
        FROM Enrollment e
        JOIN Student s ON e.student_id = s.student_id
        LEFT JOIN Progress p
          ON p.student_id = e.student_id AND p.course_id = e.course_id
        WHERE e.course_id = %s
    """, (cid, cid))
    return jsonify(rows)