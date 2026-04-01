from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.database import get_db
from backend.models import Product
from backend.schemas import ProductSchema

router = APIRouter(prefix="/products")


@router.post("/", response_model=ProductSchema)
def create_product(product: ProductSchema, db: Session = Depends(get_db)):
    db_product = Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


@router.get("/", response_model=List[ProductSchema])
def read_products(db: Session = Depends(get_db)):
    return db.query(Product).all()


@router.get("/{product_sku}", response_model=ProductSchema)
def read_product(product_sku: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.product_sku == product_sku).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/{product_sku}", response_model=ProductSchema)
def update_product(product_sku: str, product: ProductSchema, db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.product_sku == product_sku).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    for k, v in product.model_dump().items():
        setattr(db_product, k, v)
    db.commit()
    db.refresh(db_product)
    return db_product


@router.delete("/{product_sku}")
def delete_product(product_sku: str, db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.product_sku == product_sku).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(db_product)
    db.commit()
    return {"ok": True}
