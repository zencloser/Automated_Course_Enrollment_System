import mysql.connector
import os
from dotenv import load_dotenv

# Load .env from the project root (one level above backend/)
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

DB_CONFIG = {
    "host":     os.getenv("DB_HOST", "localhost"),
    "user":     os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "mydb")
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