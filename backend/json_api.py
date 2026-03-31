from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from backend.main import get_db
from backend.json_utils import export_all_to_json, import_all_from_json
import os
#Create Router instance
@router.get("/export_json/")
def export_json():
    return {"message": "Export endpoint works!"}


