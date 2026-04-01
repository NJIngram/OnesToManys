from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.database import get_db
from backend.models import Warehouse, WarehouseOrder
from backend.schemas import WarehouseSchema, WarehouseCreateSchema, WarehouseOrderSchema

router = APIRouter(prefix="/warehouses")


@router.post("/", response_model=WarehouseSchema)
def create_warehouse(warehouse: WarehouseCreateSchema, db: Session = Depends(get_db)):
    db_warehouse = Warehouse(**warehouse.model_dump())
    db.add(db_warehouse)
    db.commit()
    db.refresh(db_warehouse)
    return db_warehouse


@router.get("/", response_model=List[WarehouseSchema])
def read_warehouses(db: Session = Depends(get_db)):
    return db.query(Warehouse).all()


@router.get("/{warehouse_id}", response_model=WarehouseSchema)
def read_warehouse(warehouse_id: int, db: Session = Depends(get_db)):
    warehouse = db.query(Warehouse).filter(Warehouse.warehouse_id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return warehouse


@router.put("/{warehouse_id}", response_model=WarehouseSchema)
def update_warehouse(warehouse_id: int, warehouse: WarehouseCreateSchema, db: Session = Depends(get_db)):
    db_warehouse = db.query(Warehouse).filter(Warehouse.warehouse_id == warehouse_id).first()
    if not db_warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    for k, v in warehouse.model_dump().items():
        setattr(db_warehouse, k, v)
    db.commit()
    db.refresh(db_warehouse)
    return db_warehouse


@router.delete("/{warehouse_id}")
def delete_warehouse(warehouse_id: int, db: Session = Depends(get_db)):
    db_warehouse = db.query(Warehouse).filter(Warehouse.warehouse_id == warehouse_id).first()
    if not db_warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    db.delete(db_warehouse)
    db.commit()
    return {"ok": True}


# One-to-many: orders belonging to a warehouse
@router.get("/{warehouse_id}/orders", response_model=List[WarehouseOrderSchema])
def get_orders_for_warehouse(warehouse_id: int, db: Session = Depends(get_db)):
    return db.query(WarehouseOrder).filter(WarehouseOrder.warehouse_id == warehouse_id).all()
