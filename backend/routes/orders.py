from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.database import get_db
from backend.models import WarehouseOrder, WarehouseOrderItem
from backend.schemas import WarehouseOrderSchema, WarehouseOrderCreateSchema, WarehouseOrderItemSchema

router = APIRouter(prefix="/orders")


@router.post("/", response_model=WarehouseOrderSchema)
def create_order(order: WarehouseOrderCreateSchema, db: Session = Depends(get_db)):
    db_order = WarehouseOrder(**order.model_dump())
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order


@router.get("/", response_model=List[WarehouseOrderSchema])
def read_orders(db: Session = Depends(get_db)):
    return db.query(WarehouseOrder).all()


@router.get("/{order_id}", response_model=WarehouseOrderSchema)
def read_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(WarehouseOrder).filter(WarehouseOrder.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.put("/{order_id}", response_model=WarehouseOrderSchema)
def update_order(order_id: int, order: WarehouseOrderCreateSchema, db: Session = Depends(get_db)):
    db_order = db.query(WarehouseOrder).filter(WarehouseOrder.order_id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    for k, v in order.model_dump().items():
        setattr(db_order, k, v)
    db.commit()
    db.refresh(db_order)
    return db_order


@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    db_order = db.query(WarehouseOrder).filter(WarehouseOrder.order_id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    db.delete(db_order)
    db.commit()
    return {"ok": True}


# One-to-many: items belonging to an order
@router.get("/{order_id}/items", response_model=List[WarehouseOrderItemSchema])
def get_items_for_order(order_id: int, db: Session = Depends(get_db)):
    return db.query(WarehouseOrderItem).filter(WarehouseOrderItem.order_id == order_id).all()
