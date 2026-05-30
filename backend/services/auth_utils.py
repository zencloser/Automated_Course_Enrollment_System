import bcrypt

def hash_password(plain_password: str) -> str:
    """Convert plain text password to bcrypt hash."""
    return bcrypt.hashpw(
        plain_password.encode('utf-8'),
        bcrypt.gensalt(rounds=12)
    ).decode('utf-8')

def check_password(plain_password: str, hashed_password: str) -> bool:
    """Check plain text password against stored bcrypt hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False