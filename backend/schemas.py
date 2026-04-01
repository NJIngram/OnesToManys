from pydantic import BaseModel, ConfigDict
from typing import Optional
import datetime


# --- Read schemas (returned by GET endpoints) ---

class WarehouseSchema(BaseModel):
    warehouse_id: int
    name: str
    location: Optional[str]
    model_config = ConfigDict(from_attributes=True)


class ProductSchema(BaseModel):
    product_sku: str
    product_name: str
    description: Optional[str]
    unit_price: float
    model_config = ConfigDict(from_attributes=True)


class WarehouseOrderItemSchema(BaseModel):
    item_id: int
    order_id: int
    product_sku: str
    quantity: int
    unit_price: float
    extended_cost: float
    model_config = ConfigDict(from_attributes=True)


class WarehouseOrderSchema(BaseModel):
    order_id: int
    warehouse_id: int
    order_date: datetime.date
    status: str
    created_at: Optional[datetime.datetime]
    invoice_subtotal: float
    model_config = ConfigDict(from_attributes=True)


# --- Write schemas (used by POST/PUT request bodies) ---

class WarehouseCreateSchema(BaseModel):
    name: str
    location: Optional[str] = None


class WarehouseOrderCreateSchema(BaseModel):
    warehouse_id: int
    order_date: datetime.date
    status: str


class WarehouseOrderItemCreateSchema(BaseModel):
    order_id: int
    product_sku: str
    quantity: int
    unit_price: float
