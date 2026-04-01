import json
import decimal
import datetime
from sqlalchemy.orm import Session
from backend.models import Warehouse, Product, WarehouseOrder, WarehouseOrderItem

def _json_default(obj):
    if isinstance(obj, decimal.Decimal):
        return float(obj)
    if isinstance(obj, (datetime.date, datetime.datetime)):
        return obj.isoformat()
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

# Export all data to JSON file
def export_all_to_json(json_path: str, db: Session):
    """
    Export all tables to a single JSON file.
    """
    data = {
        "warehouses": [w.__dict__ for w in db.query(Warehouse).all()],
        "products": [p.__dict__ for p in db.query(Product).all()],
        "warehouse_orders": [wo.__dict__ for wo in db.query(WarehouseOrder).all()],
        "warehouse_order_items": [wi.__dict__ for wi in db.query(WarehouseOrderItem).all()],
    }
    # Remove SQLAlchemy internal state
    for table in data.values():
        for row in table:
            row.pop('_sa_instance_state', None)
    with open(json_path, 'w') as f:
        json.dump(data, f, indent=2, default=_json_default)
    print(f"Exported all data to {json_path}")

# Import all data from JSON file
def import_all_from_json(json_path: str, db: Session):
    """
    Import all tables from a single JSON file.
    """
    with open(json_path, 'r') as f:
        data = json.load(f)
    # Insert warehouses
    for w in data.get("warehouses", []):
        db.merge(Warehouse(**w))
    # Insert products
    for p in data.get("products", []):
        db.merge(Product(**p))
    # Insert warehouse orders
    for wo in data.get("warehouse_orders", []):
        db.merge(WarehouseOrder(**wo))
    # Insert warehouse order items
    for wi in data.get("warehouse_order_items", []):
        db.merge(WarehouseOrderItem(**wi))
    db.commit()
    print(f"Imported all data from {json_path}")

# Example usage (uncomment to use as script):
# from backend.main import SessionLocal
# db = SessionLocal()
# export_all_to_json('export.json', db)
# import_all_from_json('export.json', db)
# db.close()
