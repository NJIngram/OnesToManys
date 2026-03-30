from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Date, Text, ForeignKey, DECIMAL, TIMESTAMP
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session
from typing import List, Optional
import datetime
from pydantic import BaseModel

DATABASE_URL = "sqlite:///../warehouse_orders.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- SQLAlchemy Models ---
class Warehouse(Base):
	__tablename__ = "warehouse"
	warehouse_id = Column(Integer, primary_key=True, index=True)
	name = Column(String, nullable=False)
	location = Column(String)
	orders = relationship("WarehouseOrder", back_populates="warehouse")

class Product(Base):
	__tablename__ = "product"
	product_sku = Column(String, primary_key=True, index=True)
	product_name = Column(String, nullable=False)
	description = Column(Text)
	unit_price = Column(DECIMAL(10,2), nullable=False)
	items = relationship("WarehouseOrderItem", back_populates="product")
	def display_product(self):
		return f"{self.product_name} (${self.unit_price})"

class WarehouseOrder(Base):
	__tablename__ = "warehouse_order"
	order_id = Column(Integer, primary_key=True, index=True)
	warehouse_id = Column(Integer, ForeignKey("warehouse.warehouse_id"), nullable=False)
	order_date = Column(Date, nullable=False)
	status = Column(String, nullable=False)
	created_at = Column(TIMESTAMP, default=datetime.datetime.utcnow)
	warehouse = relationship("Warehouse", back_populates="orders")
	items = relationship("WarehouseOrderItem", back_populates="order")
	@property
	def invoice_subtotal(self):
		return float(sum(item.extended_cost for item in self.items))
	def calculate_subtotal(self):
		return self.invoice_subtotal

class WarehouseOrderItem(Base):
	__tablename__ = "warehouse_order_item"
	item_id = Column(Integer, primary_key=True, index=True)
	order_id = Column(Integer, ForeignKey("warehouse_order.order_id"), nullable=False)
	product_sku = Column(String, ForeignKey("product.product_sku"), nullable=False)
	quantity = Column(Integer, nullable=False)
	unit_price = Column(DECIMAL(10,2), nullable=False)
	order = relationship("WarehouseOrder", back_populates="items")
	product = relationship("Product", back_populates="items")
	@property
	def extended_cost(self):
		# Only operate on instance values, not SQLAlchemy columns
		q = self.__dict__.get('quantity', 0)
		u = self.__dict__.get('unit_price', 0)
		try:
			return float(q) * float(u)
		except Exception:
			return 0.0
	def calculate_extended_cost(self):
		return self.extended_cost
	def display_product(self):
		if self.product:
			return self.product.display_product()
		return self.product_sku

Base.metadata.create_all(bind=engine)

# --- Pydantic Schemas ---
class WarehouseSchema(BaseModel):
	warehouse_id: int
	name: str
	location: Optional[str]
	class Config:
		orm_mode = True

class ProductSchema(BaseModel):
	product_sku: str
	product_name: str
	description: Optional[str]
	unit_price: float
	class Config:
		orm_mode = True

class WarehouseOrderItemSchema(BaseModel):
	item_id: int
	order_id: int
	product_sku: str
	quantity: int
	unit_price: float
	extended_cost: float
	class Config:
		orm_mode = True

class WarehouseOrderSchema(BaseModel):
	order_id: int
	warehouse_id: int
	order_date: datetime.date
	status: str
	created_at: Optional[datetime.datetime]
	invoice_subtotal: float
	class Config:
		orm_mode = True

def get_db():
	db = SessionLocal()
	try:
		yield db
	finally:
		db.close()
