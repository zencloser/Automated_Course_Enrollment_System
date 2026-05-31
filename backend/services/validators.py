import re
from functools import wraps
from flask import request, jsonify


# ─────────────────────────────────────────
#  SANITIZATION HELPERS
# ─────────────────────────────────────────

def sanitize_string(value: str, max_length: int = 255) -> str:
    """
    Strip whitespace and remove characters that have
    no place in normal user input.
    """
    if not isinstance(value, str):
        return ""
    # Strip leading/trailing whitespace
    value = value.strip()
    # Remove null bytes
    value = value.replace('\x00', '')
    # Truncate to max length
    return value[:max_length]


def sanitize_email(value: str) -> str:
    """Lowercase, strip and basic clean an email string."""
    if not isinstance(value, str):
        return ""
    return value.strip().lower()[:255]


def is_valid_email(value: str) -> bool:
    """Check email format with a simple regex."""
    pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return bool(re.match(pattern, value))


def is_positive_int(value) -> bool:
    """Check if value is a positive integer (or a string of one)."""
    try:
        return int(value) > 0
    except (TypeError, ValueError):
        return False


def is_valid_grade(value) -> bool:
    """Grade must be a number between 0 and 100."""
    try:
        f = float(value)
        return 0.0 <= f <= 100.0
    except (TypeError, ValueError):
        return False


def is_valid_date(value: str) -> bool:
    """Date must be in YYYY-MM-DD format."""
    if not isinstance(value, str):
        return False
    pattern = r'^\d{4}-\d{2}-\d{2}$'
    return bool(re.match(pattern, value))


def is_valid_attendance_status(value: str) -> bool:
    """Attendance status must be exactly present or absent."""
    return value in ('present', 'absent')


# ─────────────────────────────────────────
#  REUSABLE VALIDATION SCHEMAS
#  Each function returns (is_valid, errors)
# ─────────────────────────────────────────

def validate_login(data: dict):
    errors = []
    if not data:
        return False, ["Request body is required"]

    email = sanitize_email(data.get('email', ''))
    password = sanitize_string(data.get('password', ''), max_length=128)

    if not email:
        errors.append("Email is required")
    elif not is_valid_email(email):
        errors.append("Invalid email format")

    if not password:
        errors.append("Password is required")
    elif len(password) < 1:
        errors.append("Password cannot be empty")

    return len(errors) == 0, errors


def validate_enrollment(data: dict):
    errors = []
    if not data:
        return False, ["Request body is required"]

    if 'student_id' not in data:
        errors.append("student_id is required")
    elif not is_positive_int(data['student_id']):
        errors.append("student_id must be a positive integer")

    if 'course_id' not in data:
        errors.append("course_id is required")
    elif not is_positive_int(data['course_id']):
        errors.append("course_id must be a positive integer")

    return len(errors) == 0, errors


def validate_attendance(data: dict):
    errors = []
    if not data:
        return False, ["Request body is required"]

    if 'student_id' not in data:
        errors.append("student_id is required")
    elif not is_positive_int(data['student_id']):
        errors.append("student_id must be a positive integer")

    if 'course_id' not in data:
        errors.append("course_id is required")
    elif not is_positive_int(data['course_id']):
        errors.append("course_id must be a positive integer")

    if 'date' not in data:
        errors.append("date is required")
    elif not is_valid_date(str(data['date'])):
        errors.append("date must be in YYYY-MM-DD format")

    if 'status' not in data:
        errors.append("status is required")
    elif not is_valid_attendance_status(str(data['status']).lower()):
        errors.append("status must be 'present' or 'absent'")

    return len(errors) == 0, errors


def validate_grade(data: dict):
    errors = []
    if not data:
        return False, ["Request body is required"]

    if 'student_id' not in data:
        errors.append("student_id is required")
    elif not is_positive_int(data['student_id']):
        errors.append("student_id must be a positive integer")

    if 'course_id' not in data:
        errors.append("course_id is required")
    elif not is_positive_int(data['course_id']):
        errors.append("course_id must be a positive integer")

    if 'grade' not in data:
        errors.append("grade is required")
    elif not is_valid_grade(data['grade']):
        errors.append("grade must be a number between 0 and 100")

    if 'completion_pct' not in data:
        errors.append("completion_pct is required")
    else:
        try:
            pct = int(data['completion_pct'])
            if not (0 <= pct <= 100):
                errors.append("completion_pct must be between 0 and 100")
        except (TypeError, ValueError):
            errors.append("completion_pct must be an integer")

    return len(errors) == 0, errors


def validate_payment(data: dict):
    errors = []
    if not data:
        return False, ["Request body is required"]

    if 'student_id' not in data:
        errors.append("student_id is required")
    elif not is_positive_int(data['student_id']):
        errors.append("student_id must be a positive integer")

    if 'amount' not in data:
        errors.append("amount is required")
    else:
        try:
            amt = float(data['amount'])
            if amt <= 0:
                errors.append("amount must be greater than 0")
            elif amt > 10000000:
                errors.append("amount is unrealistically large")
        except (TypeError, ValueError):
            errors.append("amount must be a valid number")

    allowed_methods = ['upi', 'netbanking', 'card', 'dd', 'cash']
    if 'payment_method' not in data:
        errors.append("payment_method is required")
    elif data['payment_method'] not in allowed_methods:
        errors.append(f"payment_method must be one of: {', '.join(allowed_methods)}")

    return len(errors) == 0, errors