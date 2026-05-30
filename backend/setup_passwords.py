import sys
import os
sys.path.append(os.path.dirname(__file__))

import bcrypt
from services.db import get_db
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(
        plain.encode('utf-8'),
        bcrypt.gensalt(rounds=12)
    ).decode('utf-8')

def setup():
    db = get_db()
    cur = db.cursor(dictionary=True)

    print("Setting up student passwords...")

    # Every student gets password = "student123"
    cur.execute("SELECT student_id FROM Student")
    students = cur.fetchall()

    for s in students:
        hashed = hash_password("student123")
        cur.execute(
            "UPDATE Student SET password=%s WHERE student_id=%s",
            (hashed, s['student_id'])
        )
        print(f"  ✓ Student {s['student_id']} password set")

    print("\nSetting up instructor passwords...")

    # Every instructor gets password = "faculty123"
    cur.execute("SELECT instructor_id FROM Instructor")
    instructors = cur.fetchall()

    for i in instructors:
        hashed = hash_password("faculty123")
        cur.execute(
            "UPDATE Instructor SET password=%s WHERE instructor_id=%s",
            (hashed, i['instructor_id'])
        )
        print(f"  ✓ Instructor {i['instructor_id']} password set")

    db.commit()
    cur.close()
    db.close()
    print("\n✅ All passwords hashed and stored in database!")
    print("\nDemo login credentials:")
    print("  Admin:      admin@snu.edu.in  /  admin123")
    print("  Student:    kavya@snu.edu.in  /  student123")
    print("  Instructor: sonia@snu.edu.in  /  faculty123")

if __name__ == "__main__":
    setup()