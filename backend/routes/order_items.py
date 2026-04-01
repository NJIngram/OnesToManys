from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.database import get_db
from backend.models import WarehouseOrderItem
from backend.schemas import WarehouseOrderItemSchema, WarehouseOrderItemCreateSchema

router = APIRouter(prefix="/order_items")


@router.post("/", response_model=WarehouseOrderItemSchema)
def create_order_item(item: WarehouseOrderItemCreateSchema, db: Session = Depends(get_db)):
    db_item = WarehouseOrderItem(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.get("/", response_model=List[WarehouseOrderItemSchema])
def read_order_items(db: Session = Depends(get_db)):
    return db.query(WarehouseOrderItem).all()


@router.get("/{item_id}", response_model=WarehouseOrderItemSchema)
def read_order_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(WarehouseOrderItem).filter(WarehouseOrderItem.item_id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Order item not found")
    return item


@router.put("/{item_id}", response_model=WarehouseOrderItemSchema)
def update_order_item(item_id: int, item: WarehouseOrderItemCreateSchema, db: Session = Depends(get_db)):
    db_item = db.query(WarehouseOrderItem).filter(WarehouseOrderItem.item_id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Order item not found")
    for k, v in item.model_dump().items():
        setattr(db_item, k, v)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/{item_id}")
def delete_order_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(WarehouseOrderItem).filter(WarehouseOrderItem.item_id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Order item not found")
    db.delete(db_item)
    db.commit()
    return {"ok": True}
