from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os

_db_path = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'warehouse_orders.db'))
DATABASE_URL = f"sqlite:///{_db_path}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
