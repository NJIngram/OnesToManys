from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Date, Text, ForeignKey, DECIMAL, TIMESTAMP
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, Session
from typing import List, Optional
import datetime
from pydantic import BaseModel, ConfigDict

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
     
def get_db():
	db = SessionLocal()
	try:
		yield db
	finally:
		db.close()


# --- CRUD Endpoints ---

# Warehouse CRUD
@app.post("/warehouses/", response_model=WarehouseSchema)
def create_warehouse(warehouse: WarehouseSchema, db: Session = Depends(get_db)):
    db_warehouse = Warehouse(**warehouse.dict())
    db.add(db_warehouse)
    db.commit()
    db.refresh(db_warehouse)
    return db_warehouse

@app.get("/warehouses/", response_model=List[WarehouseSchema])
def read_warehouses(db: Session = Depends(get_db)):
    return db.query(Warehouse).all()

@app.get("/warehouses/{warehouse_id}", response_model=WarehouseSchema)
def read_warehouse(warehouse_id: int, db: Session = Depends(get_db)):
    warehouse = db.query(Warehouse).filter(Warehouse.warehouse_id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return warehouse

@app.put("/warehouses/{warehouse_id}", response_model=WarehouseSchema)
def update_warehouse(warehouse_id: int, warehouse: WarehouseSchema, db: Session = Depends(get_db)):
    db_warehouse = db.query(Warehouse).filter(Warehouse.warehouse_id == warehouse_id).first()
    if not db_warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    for k, v in warehouse.dict().items():
        setattr(db_warehouse, k, v)
    db.commit()
    db.refresh(db_warehouse)
    return db_warehouse

@app.delete("/warehouses/{warehouse_id}")
def delete_warehouse(warehouse_id: int, db: Session = Depends(get_db)):
    db_warehouse = db.query(Warehouse).filter(Warehouse.warehouse_id == warehouse_id).first()
    if not db_warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    db.delete(db_warehouse)
    db.commit()
    return {"ok": True}

# Product CRUD
@app.post("/products/", response_model=ProductSchema)
def create_product(product: ProductSchema, db: Session = Depends(get_db)):
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.get("/products/", response_model=List[ProductSchema])
def read_products(db: Session = Depends(get_db)):
    return db.query(Product).all()

@app.get("/products/{product_sku}", response_model=ProductSchema)
def read_product(product_sku: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.product_sku == product_sku).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.put("/products/{product_sku}", response_model=ProductSchema)
def update_product(product_sku: str, product: ProductSchema, db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.product_sku == product_sku).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    for k, v in product.dict().items():
        setattr(db_product, k, v)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.delete("/products/{product_sku}")
def delete_product(product_sku: str, db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.product_sku == product_sku).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(db_product)
    db.commit()
    return {"ok": True}

# WarehouseOrder CRUD
@app.post("/orders/", response_model=WarehouseOrderSchema)
def create_order(order: WarehouseOrderSchema, db: Session = Depends(get_db)):
    db_order = WarehouseOrder(**order.dict())
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

@app.get("/orders/", response_model=List[WarehouseOrderSchema])
def read_orders(db: Session = Depends(get_db)):
    return db.query(WarehouseOrder).all()

@app.get("/orders/{order_id}", response_model=WarehouseOrderSchema)
def read_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(WarehouseOrder).filter(WarehouseOrder.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@app.put("/orders/{order_id}", response_model=WarehouseOrderSchema)
def update_order(order_id: int, order: WarehouseOrderSchema, db: Session = Depends(get_db)):
    db_order = db.query(WarehouseOrder).filter(WarehouseOrder.order_id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    for k, v in order.dict().items():
        setattr(db_order, k, v)
    db.commit()
    db.refresh(db_order)
    return db_order

@app.delete("/orders/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    db_order = db.query(WarehouseOrder).filter(WarehouseOrder.order_id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    db.delete(db_order)
    db.commit()
    return {"ok": True}

# WarehouseOrderItem CRUD
@app.post("/order_items/", response_model=WarehouseOrderItemSchema)
def create_order_item(item: WarehouseOrderItemSchema, db: Session = Depends(get_db)):
    db_item = WarehouseOrderItem(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.get("/order_items/", response_model=List[WarehouseOrderItemSchema])
def read_order_items(db: Session = Depends(get_db)):
    return db.query(WarehouseOrderItem).all()

@app.get("/order_items/{item_id}", response_model=WarehouseOrderItemSchema)
def read_order_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(WarehouseOrderItem).filter(WarehouseOrderItem.item_id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Order item not found")
    return item

@app.put("/order_items/{item_id}", response_model=WarehouseOrderItemSchema)
def update_order_item(item_id: int, item: WarehouseOrderItemSchema, db: Session = Depends(get_db)):
    db_item = db.query(WarehouseOrderItem).filter(WarehouseOrderItem.item_id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Order item not found")
    for k, v in item.dict().items():
        setattr(db_item, k, v)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.delete("/order_items/{item_id}")
def delete_order_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(WarehouseOrderItem).filter(WarehouseOrderItem.item_id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Order item not found")
    db.delete(db_item)
    db.commit()
    return {"ok": True}

