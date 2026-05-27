from flask import Blueprint, jsonify
from services.db import query

student_bp = Blueprint('student', __name__)

@student_bp.route('/api/students')
def get_students():
    rows = query("""
        SELECT s.student_id, s.full_name, s.email, s.cgpa,
               s.batch_year, s.academic_probation,
               d.dept_name, p.program_name
        FROM Student s
        LEFT JOIN Department d ON s.dept_id = d.dept_id
        LEFT JOIN Program p ON s.program_id = p.program_id
    """)
    return jsonify(rows)

@student_bp.route('/api/students/<int:sid>')
def get_student(sid):
    rows = query("""
        SELECT s.*, d.dept_name, p.program_name,
               fn_scholarship_tier(s.student_id) AS scholarship,
               fn_calculate_cgpa(s.student_id)   AS computed_cgpa
        FROM Student s
        LEFT JOIN Department d ON s.dept_id = d.dept_id
        LEFT JOIN Program p ON s.program_id = p.program_id
        WHERE s.student_id = %s
    """, (sid,))
    return jsonify(rows[0] if rows else {})

@student_bp.route('/api/students/<int:sid>/courses')
def student_courses(sid):
    rows = query("""
        SELECT c.course_name, c.course_code, c.credits, c.course_id,
               e.status,
               p.grade,
               fn_get_grade(p.grade) AS letter_grade,
               p.completion_pct,
               fn_attendance_pct(%s, c.course_id) AS attendance
        FROM Enrollment e
        JOIN Course c ON e.course_id = c.course_id
        LEFT JOIN Progress p
          ON p.student_id = e.student_id AND p.course_id = e.course_id
        WHERE e.student_id = %s AND e.status = 'active'
    """, (sid, sid))
    return jsonify(rows)

@student_bp.route('/api/students/<int:sid>/attendance-detail')
def student_attendance_detail(sid):
    rows = query("""
        SELECT c.course_id, c.course_name, c.course_code, c.credits,
               COUNT(a.date) AS total_classes,
               SUM(CASE WHEN a.status='present' THEN 1 ELSE 0 END) AS present_count,
               ROUND(fn_attendance_pct(%s, c.course_id), 2) AS attendance_pct
        FROM Enrollment e
        JOIN Course c ON e.course_id = c.course_id
        LEFT JOIN Attendance a ON a.student_id = e.student_id AND a.course_id = c.course_id
        WHERE e.student_id = %s AND e.status = 'active'
        GROUP BY c.course_id, c.course_name, c.course_code, c.credits
    """, (sid, sid))
    return jsonify(rows)