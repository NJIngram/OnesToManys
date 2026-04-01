import hashlib
import os
from sqlalchemy import text
from backend.database import engine, Base

_SCHEMA_FILE = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'warehouse_order_log_schema.sql'))
_DATA_FILE   = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'sample_warehouse_order_data.sql'))


def run_sql_file(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    with open(filepath, "r") as f:
        sql = f.read()
    with engine.begin() as conn:
        for statement in sql.split(";"):
            lines = [l for l in statement.splitlines() if not l.strip().startswith('--')]
            stmt = '\n'.join(lines).strip()
            if not stmt:
                continue
            conn.execute(text(stmt))
    print(f"Executed SQL from {filepath}")


def _fingerprint():
    h = hashlib.md5()
    for fp in (_SCHEMA_FILE, _DATA_FILE):
        if os.path.exists(fp):
            with open(fp, "rb") as f:
                h.update(f.read())
    return h.hexdigest()


def _reset_and_seed():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    run_sql_file(_SCHEMA_FILE)
    run_sql_file(_DATA_FILE)


def init_db():
    current_hash = _fingerprint()
    try:
        with engine.connect() as conn:
            stored = conn.execute(text("SELECT hash FROM _schema_version LIMIT 1")).scalar()
    except Exception:
        stored = None

    if stored != current_hash:
        print("Schema or data files changed — resetting database.")
        _reset_and_seed()
        with engine.begin() as conn:
            conn.execute(text("CREATE TABLE IF NOT EXISTS _schema_version (hash TEXT)"))
            conn.execute(text("DELETE FROM _schema_version"))
            conn.execute(text("INSERT INTO _schema_version (hash) VALUES (:h)"), {"h": current_hash})
        print("Database reset and seeded.")
    else:
        print("Database is up to date.")
