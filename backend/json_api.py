from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.json_utils import export_all_to_json, import_all_from_json
import os

router = APIRouter()

@router.get("/export-json/")
def export_json(db: Session = Depends(get_db)):
    json_path = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', 'export.json'))
    export_all_to_json(json_path, db)
    return {"message": f"Exported all data to {json_path}"}

@router.post("/import-json/")
def import_json(db: Session = Depends(get_db)):
    json_path = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', 'export.json'))
    if not os.path.exists(json_path):
        raise HTTPException(status_code=404, detail="Export file not found")
    import_all_from_json(json_path, db)
    return {"message": f"Imported all data from {json_path}"}


