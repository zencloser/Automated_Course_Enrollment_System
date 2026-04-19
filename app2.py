from flask import Flask, jsonify, request, render_template, session
from flask_cors import CORS
from datetime import datetime, date
import mysql.connector
from mysql.connector import Error
import os

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = os.getenv("SECRET_KEY", "aces_snu_2026_secret")

class CustomJSONProvider(app.json_provider_class):
    def default(self, obj):
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        return super().default(obj)

app.json_provider_class = CustomJSONProvider
app.json = CustomJSONProvider(app)

@app.route('/')
def home():
    return render_template('index.html')

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": os.getenv("DB_PASSWORD", ""),
    "database": "mydb"
}

def get_db():
    return mysql.connector.connect(**DB_CONFIG)

def query(sql, params=None, fetch=True):
    db = get_db()
    cur = db.cursor(dictionary=True)
    try:
        cur.execute(sql, params or ())
        if fetch:
            return cur.fetchall()
        db.commit()
    finally:
        cur.close()
        db.close()

# ================= AUTH =================

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"error": "Email and password required"}), 400

    email = data['email'].strip().lower()
    password = data['password'].strip()

    if email == 'admin@snu.edu.in' and password == 'admin123':
        session['user_id'] = 0
        session['user_type'] = 'admin'
        session['full_name'] = 'System Admin'
        session['role'] = 'Admin'
        return jsonify({"status": "ok", "user_type": "admin", "user_id": 0, "full_name": "System Admin", "role": "Admin"})

    rows = query("SELECT * FROM Student WHERE LOWER(email)=%s", (email,))
    if rows:
        s = rows[0]
        if password == str(s['student_id']) or password == 'student123':
            session['user_id'] = s['student_id']
            session['user_type'] = 'student'
            session['full_name'] = s['full_name']
            session['role'] = 'Student'
            return jsonify({"status": "ok", "user_type": "student", "user_id": s['student_id'], "full_name": s['full_name'], "role": "Student"})

    rows = query("SELECT * FROM Instructor WHERE LOWER(email)=%s", (email,))
    if rows:
        i = rows[0]
        if password == str(i['instructor_id']) or password == 'faculty123':
            session['user_id'] = i['instructor_id']
            session['user_type'] = 'instructor'
            session['full_name'] = i['full_name']
            session['role'] = 'Instructor'
            return jsonify({"status": "ok", "user_type": "instructor", "user_id": i['instructor_id'], "full_name": i['full_name'], "role": "Instructor"})

    return jsonify({"error": "Invalid email or password"}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"status": "logged out"})

@app.route('/api/me')
def me():
    if 'user_id' not in session:
        return jsonify({"logged_in": False})
    return jsonify({
        "logged_in": True,
        "user_id": session['user_id'],
        "user_type": session['user_type'],
        "full_name": session['full_name'],
        "role": session['role']
    })

# ================= STUDENTS =================

@app.route('/api/students')
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

@app.route('/api/students/<int:sid>')
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

@app.route('/api/students/<int:sid>/courses')
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

@app.route('/api/students/<int:sid>/attendance-detail')
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

# ================= COURSES =================

@app.route('/api/courses')
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

@app.route('/api/courses/<int:cid>/students')
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

# ================= ENROLLMENT =================

@app.route('/api/enroll', methods=['POST'])
def enroll():
    data = request.get_json()
    if not data or 'student_id' not in data or 'course_id' not in data:
        return jsonify({"error": "student_id and course_id required"}), 400
    sid = data['student_id']
    cid = data['course_id']
    try:
        db = get_db()
        cur = db.cursor()
        cur.callproc('sp_enroll_student', [sid, cid])
        db.commit()
        cur.close()
        db.close()
        check = query("SELECT status FROM Enrollment WHERE student_id=%s AND course_id=%s", (sid, cid))
        wait  = query("SELECT position FROM Waitlist WHERE student_id=%s AND course_id=%s AND status='waiting'", (sid, cid))
        if check:
            return jsonify({"status": "enrolled", "message": "Successfully enrolled!"})
        elif wait:
            return jsonify({"status": "waitlisted", "message": f"Added to waitlist at position {wait[0]['position']}"})
        else:
            return jsonify({"status": "duplicate", "message": "Already enrolled or waitlisted."})
    except Error as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/enrollment/<int:sid>/<int:cid>/drop', methods=['PUT'])
def drop_course(sid, cid):
    try:
        query("UPDATE Enrollment SET status='dropped' WHERE student_id=%s AND course_id=%s", (sid, cid), fetch=False)
        query("UPDATE CourseCapacity SET enrolled_count = enrolled_count - 1 WHERE course_id=%s", (cid,), fetch=False)
        return jsonify({"status": "dropped", "message": "Course dropped. Waitlist promotion triggered automatically."})
    except Error as e:
        return jsonify({"error": str(e)}), 500

# ================= ATTENDANCE =================

@app.route('/api/attendance', methods=['POST'])
def mark_attendance():
    data = request.get_json()
    if not data or not all(k in data for k in ['student_id','course_id','date','status']):
        return jsonify({"error": "Invalid attendance data"}), 400
    query("""
        INSERT INTO Attendance(course_id, date, status, student_id)
        VALUES (%s,%s,%s,%s)
        ON DUPLICATE KEY UPDATE status=VALUES(status)
    """, (data['course_id'], data['date'], data['status'], data['student_id']), fetch=False)
    return jsonify({"msg": "Attendance updated"})

@app.route('/api/attendance/<int:sid>/<int:cid>')
def get_attendance(sid, cid):
    records = query("SELECT date, status FROM Attendance WHERE student_id=%s AND course_id=%s ORDER BY date DESC", (sid, cid))
    pct_row = query("SELECT fn_attendance_pct(%s,%s) AS pct", (sid, cid))
    pct = float(pct_row[0]['pct']) if pct_row else 0.0
    for r in records:
        if hasattr(r['date'], 'isoformat'):
            r['date'] = r['date'].isoformat()
    return jsonify({"attendance_pct": pct, "records": records})

# ================= PROGRESS / GRADES =================

@app.route('/api/progress', methods=['POST'])
def update_progress():
    data = request.get_json()
    if not data or not all(k in data for k in ['student_id','course_id','grade','completion_pct']):
        return jsonify({"error": "Invalid progress data"}), 400
    query("""
        INSERT INTO Progress(student_id, course_id, grade, completion_pct)
        VALUES (%s,%s,%s,%s)
        ON DUPLICATE KEY UPDATE grade=VALUES(grade), completion_pct=VALUES(completion_pct), last_updated=NOW()
    """, (data['student_id'], data['course_id'], data['grade'], data['completion_pct']), fetch=False)
    cert = query("SELECT cert_number FROM Certificates WHERE student_id=%s AND course_id=%s", (data['student_id'], data['course_id']))
    msg = "Grade updated." + (f" Certificate issued: {cert[0]['cert_number']}" if cert else "")
    return jsonify({"msg": msg, "message": msg})

@app.route('/api/progress/<int:sid>/<int:cid>/history')
def grade_history(sid, cid):
    rows = query("SELECT old_grade, new_grade, changed_at, changed_by, reason FROM GradeHistory WHERE student_id=%s AND course_id=%s ORDER BY changed_at DESC", (sid, cid))
    for r in rows:
        if r.get('changed_at') and hasattr(r['changed_at'], 'isoformat'):
            r['changed_at'] = r['changed_at'].isoformat()
    return jsonify(rows)

# ================= PAYMENTS =================

# Department-wise fee structure
DEPT_FEES = {
    "Computer Science": {
        "tuition": 350000,
        "lab": 25000,
        "library": 8000,
        "sports": 5000,
        "hostel": 80000,
        "mess": 50000,
        "laundry": 6000,
        "exam": 3000,
        "development": 15000,
        "total": 542000
    },
    "Electronics Engineering": {
        "tuition": 320000,
        "lab": 30000,
        "library": 8000,
        "sports": 5000,
        "hostel": 80000,
        "mess": 50000,
        "laundry": 6000,
        "exam": 3000,
        "development": 12000,
        "total": 514000
    },
    "Mathematics": {
        "tuition": 280000,
        "lab": 10000,
        "library": 10000,
        "sports": 5000,
        "hostel": 80000,
        "mess": 50000,
        "laundry": 6000,
        "exam": 3000,
        "development": 10000,
        "total": 454000
    },
    "Mechanical Engineering": {
        "tuition": 330000,
        "lab": 35000,
        "library": 8000,
        "sports": 5000,
        "hostel": 80000,
        "mess": 50000,
        "laundry": 6000,
        "exam": 3000,
        "development": 12000,
        "total": 529000
    },
    "default": {
        "tuition": 300000,
        "lab": 20000,
        "library": 8000,
        "sports": 5000,
        "hostel": 80000,
        "mess": 50000,
        "laundry": 6000,
        "exam": 3000,
        "development": 10000,
        "total": 482000
    }
}

@app.route('/api/fee-structure')
def fee_structure():
    """Return fee structure for all departments"""
    return jsonify(DEPT_FEES)

@app.route('/api/fee-structure/<dept>')
def fee_structure_dept(dept):
    """Return fee structure for a specific department"""
    fees = DEPT_FEES.get(dept, DEPT_FEES['default'])
    return jsonify(fees)

@app.route('/api/student-fee-summary/<int:sid>')
def student_fee_summary(sid):
    """Return fee summary + remaining balance for a student"""
    student = query("""
        SELECT s.student_id, s.full_name, d.dept_name
        FROM Student s
        LEFT JOIN Department d ON s.dept_id = d.dept_id
        WHERE s.student_id = %s
    """, (sid,))
    if not student:
        return jsonify({"error": "Student not found"}), 404

    s = student[0]
    dept_name = s.get('dept_name', 'default')
    fee_struct = DEPT_FEES.get(dept_name, DEPT_FEES['default'])

    # Get total paid from Payment table
    paid_rows = query("""
        SELECT COALESCE(SUM(paid_amount), 0) AS total_paid,
               COALESCE(SUM(total_amount), 0) AS total_billed
        FROM Payment WHERE student_id = %s
    """, (sid,))

    total_paid = float(paid_rows[0]['total_paid']) if paid_rows else 0
    total_billed = float(paid_rows[0]['total_billed']) if paid_rows else 0
    annual_fee = fee_struct['total']
    remaining = max(0, annual_fee - total_paid)

    return jsonify({
        "student": s,
        "fee_structure": fee_struct,
        "annual_fee": annual_fee,
        "total_paid": total_paid,
        "total_billed": total_billed,
        "remaining": remaining,
        "dept_name": dept_name
    })

@app.route('/api/payments/all')
def get_all_payments():
    """Admin/faculty: all students payment summary"""
    rows = query("""
        SELECT s.student_id, s.full_name, d.dept_name,
               COALESCE(SUM(p.total_amount),0) AS total_billed,
               COALESCE(SUM(p.paid_amount),0) AS total_paid,
               COALESCE(SUM(p.total_amount - p.paid_amount),0) AS balance,
               COUNT(CASE WHEN p.status IN ('pending','partial','overdue') THEN 1 END) AS pending_count
        FROM Student s
        LEFT JOIN Department d ON s.dept_id = d.dept_id
        LEFT JOIN Payment p ON s.student_id = p.student_id
        GROUP BY s.student_id, s.full_name, d.dept_name
        ORDER BY balance DESC
    """)
    return jsonify(rows)

@app.route('/api/payments/dept-summary')
def dept_payment_summary():
    """Admin: payment summary by department.
    pending_students is counted against DEPT_FEES (not just Payment rows),
    so students who have never made any payment are also included.
    """
    # Fetch all students with their dept and total paid so far
    students = query("""
        SELECT s.student_id, d.dept_name,
               COALESCE(SUM(p.paid_amount), 0) AS total_paid,
               COALESCE(SUM(p.total_amount), 0) AS total_billed
        FROM Department d
        LEFT JOIN Student s ON s.dept_id = d.dept_id
        LEFT JOIN Payment p ON p.student_id = s.student_id
        GROUP BY s.student_id, d.dept_name
    """)

    # Aggregate per department in Python, comparing against DEPT_FEES
    summary = {}
    for row in students:
        dept = row['dept_name'] or 'default'
        if dept not in summary:
            summary[dept] = {
                'dept_name': dept,
                'total_students': 0,
                'total_billed': 0.0,
                'total_paid': 0.0,
                'total_pending': 0.0,
                'pending_students': 0,
            }
        if row['student_id'] is None:
            continue  # dept exists but has no students
        annual_fee = DEPT_FEES.get(dept, DEPT_FEES['default'])['total']
        paid = float(row['total_paid'] or 0)
        remaining = max(0, annual_fee - paid)

        summary[dept]['total_students'] += 1
        summary[dept]['total_billed'] += float(row['total_billed'] or 0)
        summary[dept]['total_paid'] += paid
        summary[dept]['total_pending'] += remaining
        if remaining > 0:
            summary[dept]['pending_students'] += 1

    result = sorted(summary.values(), key=lambda d: d['dept_name'])
    return jsonify(result)

@app.route('/api/payments/pending-by-dept/<dept_name>')
def pending_by_dept(dept_name):
    rows = query("""
        SELECT s.student_id, s.full_name,
               (p.total_amount - p.paid_amount) AS due_amount
        FROM student s
        JOIN department d ON s.dept_id = d.dept_id
        JOIN payment p ON p.student_id = s.student_id
        WHERE d.dept_name = %s
          AND (p.total_amount - p.paid_amount) > 0
    """, (dept_name,))
    return jsonify(rows)

@app.route('/api/payments/pending/<dept>')
def pending_students(dept):
    rows = query("""
        SELECT s.student_id, s.full_name, d.dept_name,
               COALESCE(SUM(p.paid_amount),0) AS paid
        FROM Student s
        JOIN Department d ON s.dept_id = d.dept_id
        LEFT JOIN Payment p ON p.student_id = s.student_id
        WHERE d.dept_name = %s
        GROUP BY s.student_id, s.full_name, d.dept_name
    """, [dept])

    result = []

    for r in rows:
        fee = DEPT_FEES.get(r['dept_name'], DEPT_FEES['default'])['total']
        paid = float(r['paid'] or 0)
        pending = max(0, fee - paid)

        if pending > 0:
            result.append({
                "student_id": r['student_id'],
                "name": r['full_name'],
                "pending": pending
            })

    return jsonify(result)

@app.route('/api/payments/<int:sid>')
def get_payments(sid):
    rows = query("""
        SELECT p.payment_id, c.course_name, p.total_amount, p.paid_amount,
               ROUND(p.total_amount - p.paid_amount, 2) AS balance, p.status, p.payment_date
        FROM Payment p JOIN Course c ON p.course_id = c.course_id WHERE p.student_id = %s
    """, (sid,))
    for r in rows:
        if r.get('payment_date') and hasattr(r['payment_date'], 'isoformat'):
            r['payment_date'] = r['payment_date'].isoformat()
    return jsonify(rows)

@app.route('/api/payments/<int:pid>/installments')
def get_installments(pid):
    rows = query("SELECT installment_no, amount_due, amount_paid, due_date, paid_on, status FROM PaymentInstallment WHERE payment_id=%s ORDER BY installment_no", (pid,))
    for r in rows:
        for col in ['due_date','paid_on']:
            if r.get(col) and hasattr(r[col], 'isoformat'):
                r[col] = r[col].isoformat()
    return jsonify(rows)

@app.route('/api/payments/make', methods=['POST'])
def make_payment():
    """Process a payment for a student"""

    data = request.get_json()
    if not data or not all(k in data for k in ['student_id', 'amount', 'payment_method']):
        return jsonify({"error": "student_id, amount, payment_method required"}), 400

    sid = data['student_id']
    amount = float(data['amount'])
    method = data['payment_method']

    if amount <= 0:
        return jsonify({"error": "Amount must be greater than 0"}), 400

    db = get_db()
    cur = db.cursor(dictionary=True)

    #  Check student exists
    cur.execute("SELECT student_id, full_name FROM Student WHERE student_id=%s", (sid,))
    student = cur.fetchone()
    if not student:
        cur.close()
        db.close()
        return jsonify({"error": "Student not found"}), 404

    #  Find oldest pending payment
    cur.execute("""
        SELECT payment_id, total_amount, paid_amount, course_id
        FROM Payment
        WHERE student_id=%s AND status IN ('pending','partial','overdue')
        ORDER BY payment_date ASC
        LIMIT 1
    """, (sid,))
    pending = cur.fetchone()

    today = date.today().isoformat()

    # =========================================================
    #  CASE 1: Existing payment found
    # =========================================================
    if pending:
        pid = pending['payment_id']
        total = float(pending['total_amount'])
        paid = float(pending['paid_amount'])

        new_paid = paid + amount

        if new_paid >= total:
            new_paid = total
            new_status = 'paid'
        else:
            new_status = 'partial'

        #  Update Payment table
        cur.execute("""
            UPDATE Payment
            SET paid_amount=%s, status=%s, payment_date=%s
            WHERE payment_id=%s
        """, (new_paid, new_status, today, pid))

        #  INSERT INTO INSTALLMENT TABLE (FIX)
        cur.execute("""
            INSERT INTO PaymentInstallment (payment_id, amount_paid, payment_date)
            VALUES (%s, %s, %s)
        """, (pid, amount, today))

        #  Optional alert
        if new_status == 'paid':
            cur.execute("""
                INSERT INTO alerts(student_id, course_id, alert_type, severity, message)
                VALUES (%s, %s, 'Payment', 'info', 'Payment completed successfully')
            """, (sid, pending['course_id']))

        db.commit()
        cur.close()
        db.close()

        return jsonify({
            "status": "success",
            "message": f"Payment of ₹{amount:,.0f} applied. Status: {new_status}",
            "payment_status": new_status,
            "transaction_id": f"TXN{pid}{int(amount)}"
        })

    # =========================================================
    # CASE 2: No payment exists → create new
    # =========================================================
    else:
        # Get course
        cur.execute("""
            SELECT course_id FROM Enrollment
            WHERE student_id=%s AND status='active'
            LIMIT 1
        """, (sid,))
        course = cur.fetchone()
        cid = course['course_id'] if course else 1

        # IMPORTANT: you can adjust this if you have fee logic
        total_amount = amount  # fallback (can improve later)

        # 🔧 Insert into Payment
        cur.execute("""
            INSERT INTO Payment(student_id, course_id, total_amount, paid_amount, payment_date, status)
            VALUES (%s, %s, %s, %s, %s, 'partial')
        """, (sid, cid, total_amount, amount, today))

        pid = cur.lastrowid

        # 🔧 INSERT INTO INSTALLMENT TABLE (FIX)
        cur.execute("""
            INSERT INTO PaymentInstallment (payment_id, amount_paid, payment_date)
            VALUES (%s, %s, %s)
        """, (pid, amount, today))

        db.commit()
        cur.close()
        db.close()

        return jsonify({
            "status": "success",
            "message": f"Payment of ₹{amount:,.0f} recorded successfully.",
            "payment_status": "partial",
            "transaction_id": f"TXN{sid}{int(amount)}"
        })

# ================= ALERTS =================

@app.route('/api/alerts')
def get_alerts():
    rows = query("""
        SELECT a.*, s.full_name, c.course_name FROM alerts a
        LEFT JOIN student s ON a.student_id = s.student_id
        LEFT JOIN Course c  ON a.course_id  = c.course_id
        ORDER BY a.created_at DESC
    """)
    return jsonify(rows)

@app.route('/api/alerts/student/<int:sid>')
def get_student_alerts(sid):
    rows = query("""
        SELECT a.*, s.full_name, c.course_name FROM alerts a
        LEFT JOIN Student s ON a.student_id = s.student_id
        LEFT JOIN Course c  ON a.course_id  = c.course_id
        WHERE a.student_id = %s
        ORDER BY a.created_at DESC
    """, (sid,))
    return jsonify(rows)

@app.route('/api/alerts/<int:aid>/read', methods=['PUT'])
def mark_alert_read(aid):
    query("UPDATE alerts SET is_read=1 WHERE alert_id=%s", (aid,), fetch=False)
    return jsonify({"msg": "Marked as read"})

@app.route('/api/alerts/check-due-payments', methods=['POST'])
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
                INSERT INTO alerts(student_id, course_id, alert_type, severity, message)
                VALUES (%s, %s, 'Payment', 'critical', %s)
            """, (
                row['student_id'], row['course_id'],
                f"Installment #{row['installment_no']} of ₹{float(row['amount_due']):,.0f} was due on {row['due_date']}. Please pay immediately."
            ), fetch=False)
            count += 1
    return jsonify({"msg": f"{count} payment alerts generated."})

# ================= ANALYTICS =================

@app.route('/api/analytics/dashboard')
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

@app.route('/api/analytics/dept-performance')
def dept_performance():
    return jsonify(query("SELECT d.dept_name, COUNT(s.student_id) AS students, ROUND(AVG(s.cgpa),2) AS avg_cgpa FROM Department d LEFT JOIN Student s ON d.dept_id=s.dept_id GROUP BY d.dept_name"))

@app.route('/api/analytics/top-students')
def top_students():
    return jsonify(query("SELECT s.full_name, d.dept_name, s.cgpa, DENSE_RANK() OVER (PARTITION BY s.dept_id ORDER BY s.cgpa DESC) AS dept_rank, fn_scholarship_tier(s.student_id) AS scholarship FROM Student s JOIN Department d ON s.dept_id=d.dept_id ORDER BY s.cgpa DESC LIMIT 10"))

@app.route('/api/analytics/attendance-grade-correlation')
def attendance_grade():
    return jsonify(query("""
        SELECT CASE WHEN att_pct>=75 THEN '75-100%' WHEN att_pct>=50 THEN '50-75%' ELSE 'Below 50%' END AS attendance_bucket,
               COUNT(*) AS student_count, ROUND(AVG(p.grade),2) AS avg_grade
        FROM (SELECT student_id, course_id, SUM(CASE WHEN status='present' THEN 1 ELSE 0 END)*100.0/COUNT(*) AS att_pct FROM Attendance GROUP BY student_id, course_id) a
        JOIN Progress p ON a.student_id=p.student_id AND a.course_id=p.course_id GROUP BY attendance_bucket
    """))

@app.route('/api/analytics/at-risk')
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

@app.route('/api/analytics/course-health')
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

@app.route('/api/reports/scholarship')
def scholarship():
    return jsonify(query("SELECT s.full_name, s.cgpa, d.dept_name, fn_scholarship_tier(s.student_id) AS tier FROM Student s JOIN Department d ON s.dept_id=d.dept_id WHERE fn_scholarship_tier(s.student_id)!='None' ORDER BY s.cgpa DESC"))

@app.route('/api/reports/semester/<int:cid>')
def sem_report(cid):
    db = get_db(); cur = db.cursor(dictionary=True); cur.callproc('sp_semester_report', [cid])
    res = [row for r in cur.stored_results() for row in r.fetchall()]
    cur.close(); db.close(); return jsonify(res)

@app.route('/api/reports/recommendations/<int:sid>')
def recommendations(sid):
    db = get_db(); cur = db.cursor(dictionary=True); cur.callproc('sp_course_recommender', [sid])
    res = [row for r in cur.stored_results() for row in r.fetchall()]
    cur.close(); db.close(); return jsonify(res)

if __name__ == "__main__":
    app.run(debug=True)