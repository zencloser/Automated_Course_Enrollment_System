from flask import Blueprint, jsonify, request
from datetime import date
from services.db import get_db, query

payment_bp = Blueprint('payment', __name__)

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

@payment_bp.route('/api/fee-structure')
def fee_structure():
    """Return fee structure for all departments"""
    return jsonify(DEPT_FEES)

@payment_bp.route('/api/fee-structure/<dept>')
def fee_structure_dept(dept):
    """Return fee structure for a specific department"""
    fees = DEPT_FEES.get(dept, DEPT_FEES['default'])
    return jsonify(fees)

@payment_bp.route('/api/student-fee-summary/<int:sid>')
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

@payment_bp.route('/api/payments/all')
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

@payment_bp.route('/api/payments/dept-summary')
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

@payment_bp.route('/api/payments/pending-by-dept/<dept_name>')
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

@payment_bp.route('/api/payments/pending/<dept>')
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

@payment_bp.route('/api/payments/<int:sid>')
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

@payment_bp.route('/api/payments/<int:pid>/installments')
def get_installments(pid):
    rows = query("SELECT installment_no, amount_due, amount_paid, due_date, paid_on, status FROM PaymentInstallment WHERE payment_id=%s ORDER BY installment_no", (pid,))
    for r in rows:
        for col in ['due_date','paid_on']:
            if r.get(col) and hasattr(r[col], 'isoformat'):
                r[col] = r[col].isoformat()
    return jsonify(rows)

@payment_bp.route('/api/payments/make', methods=['POST'])
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

        # Get next installment number for this payment
        cur.execute("SELECT COALESCE(MAX(installment_no), 0) + 1 AS next_no FROM PaymentInstallment WHERE payment_id=%s", (pid,))
        row = cur.fetchone()
        next_no = row['next_no'] if row else 1

        # INSERT with correct columns: installment_no, amount_due, amount_paid, due_date, paid_on, status
        cur.execute("""
            INSERT INTO PaymentInstallment
                (payment_id, installment_no, amount_due, amount_paid, due_date, paid_on, status)
            VALUES (%s, %s, %s, %s, %s, %s, 'paid')
        """, (pid, next_no, amount, amount, today, today))

        #  Optional alert
        if new_status == 'paid':
            cur.execute("""
                INSERT INTO Alerts(student_id, course_id, alert_type, severity, message)
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

        # INSERT installment with correct columns
        cur.execute("""
            INSERT INTO PaymentInstallment
                (payment_id, installment_no, amount_due, amount_paid, due_date, paid_on, status)
            VALUES (%s, 1, %s, %s, %s, %s, 'paid')
        """, (pid, amount, amount, today, today))

        db.commit()
        cur.close()
        db.close()

        return jsonify({
            "status": "success",
            "message": f"Payment of ₹{amount:,.0f} recorded successfully.",
            "payment_status": "partial",
            "transaction_id": f"TXN{sid}{int(amount)}"
        })