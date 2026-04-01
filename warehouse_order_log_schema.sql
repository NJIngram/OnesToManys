-- warehouse_order_log_schema.sql
-- Schema for Warehouse Order Log (Master-Detail)

-- Master table: WarehouseOrder
CREATE TABLE IF NOT EXISTS warehouse_order (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
    warehouse_id INTEGER NOT NULL,
    order_date DATE NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (warehouse_id) REFERENCES warehouse(warehouse_id)
);

-- Detail table: WarehouseOrderItem
CREATE TABLE IF NOT EXISTS warehouse_order_item (
    item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_sku TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES warehouse_order(order_id),
    FOREIGN KEY (product_sku) REFERENCES product(product_sku)
);

-- Optional: Warehouse table for reference
CREATE TABLE IF NOT EXISTS warehouse (
    warehouse_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location TEXT
);

-- Optional: Product table for reference
CREATE TABLE IF NOT EXISTS product (
    product_sku TEXT PRIMARY KEY,
    product_name TEXT NOT NULL,
    description TEXT,
    unit_price DECIMAL(10,2) NOT NULL
);
