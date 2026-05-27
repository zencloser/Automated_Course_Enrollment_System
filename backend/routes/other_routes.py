from flask import Blueprint, jsonify
from services.db import get_db, query

other_bp = Blueprint('other', __name__)

# ================= ALERTS =================

@other_bp.route('/api/alerts')
def get_alerts():
    rows = query("""
        SELECT a.*, s.full_name, c.course_name FROM alerts a
        LEFT JOIN student s ON a.student_id = s.student_id
        LEFT JOIN Course c  ON a.course_id  = c.course_id
        ORDER BY a.created_at DESC
    """)
    return jsonify(rows)

@other_bp.route('/api/alerts/student/<int:sid>')
def get_student_alerts(sid):
    rows = query("""
        SELECT a.*, s.full_name, c.course_name FROM alerts a
        LEFT JOIN Student s ON a.student_id = s.student_id
        LEFT JOIN Course c  ON a.course_id  = c.course_id
        WHERE a.student_id = %s
        ORDER BY a.created_at DESC
    """, (sid,))
    return jsonify(rows)

@other_bp.route('/api/alerts/<int:aid>/read', methods=['PUT'])
def mark_alert_read(aid):
    query("UPDATE alerts SET is_read=1 WHERE alert_id=%s", (aid,), fetch=False)
    return jsonify({"msg": "Marked as read"})

@other_bp.route('/api/alerts/check-due-payments', methods=['POST'])
def check_due_payments():
    """Generate payment due alerts for overdue installments"""
    overdue = query("""
        SELECT pi.payment_id, pi.installment_no, pi.due_date,
               pi.amount_due, p.student_id, p.course_id
        FROM PaymentInstallment pi
        JOIN Payment p ON pi.payment_id = p.payment_id
        WHERE pi.status = 'overdue' AND pi.paid_on IS NULL
    """)
    count = 0
    for row in overdue:
        existing = query("""
            SELECT alert_id FROM alerts
            WHERE student_id=%s AND alert_type='Payment'
            AND message LIKE %s AND is_read=0
        """, (row['student_id'], f"%Installment #{row['installment_no']}%"))
        if not existing:
            query("""
                INSERT INTO Alerts(student_id, course_id, alert_type, severity, message)
                VALUES (%s, %s, 'Payment', 'critical', %s)
            """, (
                row['student_id'], row['course_id'],
                f"Installment #{row['installment_no']} of ₹{float(row['amount_due']):,.0f} was due on {row['due_date']}. Please pay immediately."
            ), fetch=False)
            count += 1
    return jsonify({"msg": f"{count} payment alerts generated."})

# ================= ANALYTICS =================

@other_bp.route('/api/analytics/dashboard')
def dashboard():
    stats = {
        'total_students':      query("SELECT COUNT(*) AS c FROM student")[0]['c'],
        'active_courses':      query("SELECT COUNT(*) AS c FROM Course WHERE is_active=1")[0]['c'],
        'unread_alerts':       query("SELECT COUNT(*) AS c FROM alerts WHERE is_read=0")[0]['c'],
        'on_probation':        query("SELECT COUNT(*) AS c FROM student WHERE academic_probation=1")[0]['c'],
        'active_enrollments':  query("SELECT COUNT(*) AS c FROM Enrollment WHERE status='active'")[0]['c'],
        'on_waitlist':         query("SELECT COUNT(*) AS c FROM Waitlist WHERE status='waiting'")[0]['c'],
        'certificates_issued': query("SELECT COUNT(*) AS c FROM Certificates")[0]['c'],
        'avg_cgpa':            float(query("SELECT ROUND(AVG(cgpa),2) AS c FROM student")[0]['c'] or 0)
    }
    return jsonify(stats)

@other_bp.route('/api/analytics/dept-performance')
def dept_performance():
    return jsonify(query("SELECT d.dept_name, COUNT(s.student_id) AS students, ROUND(AVG(s.cgpa),2) AS avg_cgpa FROM Department d LEFT JOIN Student s ON d.dept_id=s.dept_id GROUP BY d.dept_name"))

@other_bp.route('/api/analytics/top-students')
def top_students():
    return jsonify(query("SELECT s.full_name, d.dept_name, s.cgpa, DENSE_RANK() OVER (PARTITION BY s.dept_id ORDER BY s.cgpa DESC) AS dept_rank, fn_scholarship_tier(s.student_id) AS scholarship FROM Student s JOIN Department d ON s.dept_id=d.dept_id ORDER BY s.cgpa DESC LIMIT 10"))

@other_bp.route('/api/analytics/attendance-grade-correlation')
def attendance_grade():
    return jsonify(query("""
        SELECT CASE WHEN att_pct>=75 THEN '75-100%' WHEN att_pct>=50 THEN '50-75%' ELSE 'Below 50%' END AS attendance_bucket,
               COUNT(*) AS student_count, ROUND(AVG(p.grade),2) AS avg_grade
        FROM (SELECT student_id, course_id, SUM(CASE WHEN status='present' THEN 1 ELSE 0 END)*100.0/COUNT(*) AS att_pct FROM Attendance GROUP BY student_id, course_id) a
        JOIN Progress p ON a.student_id=p.student_id AND a.course_id=p.course_id GROUP BY attendance_bucket
    """))

@other_bp.route('/api/analytics/at-risk')
def at_risk():
    return jsonify(query("""
        SELECT s.full_name, c.course_code, p.grade, fn_attendance_pct(s.student_id,c.course_id) AS att_pct,
               CASE WHEN p.grade<40 AND fn_attendance_pct(s.student_id,c.course_id)<75 THEN 'CRITICAL'
                    WHEN p.grade<40 THEN 'LOW GRADE' ELSE 'LOW ATTENDANCE' END AS risk_level
        FROM Student s JOIN Enrollment e ON s.student_id=e.student_id AND e.status='active'
        JOIN Course c ON e.course_id=c.course_id
        LEFT JOIN Progress p ON p.student_id=s.student_id AND p.course_id=c.course_id
        WHERE p.grade<40 OR fn_attendance_pct(s.student_id,c.course_id)<75
    """))

@other_bp.route('/api/analytics/course-health')
def course_health():
    return jsonify(query("""
        SELECT c.course_code, c.course_name, cc.max_seats, cc.enrolled_count,
               ROUND(cc.enrolled_count*100.0/NULLIF(cc.max_seats,0),1) AS fill_pct,
               COUNT(CASE WHEN e.status='dropped' THEN 1 END) AS dropouts, ROUND(AVG(p.grade),2) AS avg_grade
        FROM Course c LEFT JOIN CourseCapacity cc ON c.course_id=cc.course_id
        LEFT JOIN Enrollment e ON c.course_id=e.course_id
        LEFT JOIN Progress p ON e.student_id=p.student_id AND e.course_id=p.course_id
        GROUP BY c.course_id, c.course_code, c.course_name, cc.max_seats, cc.enrolled_count
    """))

# ================= REPORTS =================

@other_bp.route('/api/reports/scholarship')
def scholarship():
    return jsonify(query("SELECT s.full_name, s.cgpa, d.dept_name, fn_scholarship_tier(s.student_id) AS tier FROM Student s JOIN Department d ON s.dept_id=d.dept_id WHERE fn_scholarship_tier(s.student_id)!='None' ORDER BY s.cgpa DESC"))

@other_bp.route('/api/reports/semester/<int:cid>')
def sem_report(cid):
    db = get_db(); cur = db.cursor(dictionary=True); cur.callproc('sp_semester_report', [cid])
    res = [row for r in cur.stored_results() for row in r.fetchall()]
    cur.close(); db.close(); return jsonify(res)

@other_bp.route('/api/reports/recommendations/<int:sid>')
def recommendations(sid):
    db = get_db(); cur = db.cursor(dictionary=True); cur.callproc('sp_course_recommender', [sid])
    res = [row for r in cur.stored_results() for row in r.fetchall()]
    cur.close(); db.close(); return jsonify(res)