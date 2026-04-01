-- Sample data for warehouse, product, warehouse_order, and warehouse_order_item

-- Warehouses
INSERT OR IGNORE INTO warehouse (warehouse_id, name, location) VALUES (1, 'Central Warehouse', 'New York');
INSERT OR IGNORE INTO warehouse (warehouse_id, name, location) VALUES (2, 'West Coast Hub', 'Los Angeles');
INSERT OR IGNORE INTO warehouse (warehouse_id, name, location) VALUES (3, 'Midwest Depot', 'Chicago');

-- Products
INSERT OR IGNORE INTO product (product_sku, product_name, description, unit_price) VALUES ('SKU1001', 'Plankton Net', 'Fine mesh net for collecting plankton samples.', 5.99);
INSERT OR IGNORE INTO product (product_sku, product_name, description, unit_price) VALUES ('SKU1002', 'Water Sampler', 'Device for collecting water samples at various depths.', 8.49);
INSERT OR IGNORE INTO product (product_sku, product_name, description, unit_price) VALUES ('SKU1003', 'Secchi Disk', 'Disk used to measure water transparency.', 12.99);
INSERT OR IGNORE INTO product (product_sku, product_name, description, unit_price) VALUES ('SKU1004', 'Underwater Camera', 'Camera for capturing images and video underwater.', 15.99);
INSERT OR IGNORE INTO product (product_sku, product_name, description, unit_price) VALUES ('SKU1005', 'Dissolved Oxygen Meter', 'Instrument for measuring oxygen levels in water.', 22.50);

-- Warehouse Orders
INSERT OR IGNORE INTO warehouse_order (order_id, warehouse_id, order_date, status) VALUES (1, 1, '2026-03-01', 'Pending');
INSERT OR IGNORE INTO warehouse_order (order_id, warehouse_id, order_date, status) VALUES (2, 2, '2026-03-02', 'Shipped');
INSERT OR IGNORE INTO warehouse_order (order_id, warehouse_id, order_date, status) VALUES (3, 1, '2026-03-03', 'Delivered');
INSERT OR IGNORE INTO warehouse_order (order_id, warehouse_id, order_date, status) VALUES (4, 3, '2026-03-04', 'Pending');
INSERT OR IGNORE INTO warehouse_order (order_id, warehouse_id, order_date, status) VALUES (5, 2, '2026-03-05', 'Cancelled');

-- Warehouse Order Items
INSERT OR IGNORE INTO warehouse_order_item (item_id, order_id, product_sku, quantity, unit_price) VALUES (1, 1, 'SKU1001', 10, 5.99);
INSERT OR IGNORE INTO warehouse_order_item (item_id, order_id, product_sku, quantity, unit_price) VALUES (2, 1, 'SKU1002', 5, 8.49);
INSERT OR IGNORE INTO warehouse_order_item (item_id, order_id, product_sku, quantity, unit_price) VALUES (3, 2, 'SKU1003', 20, 12.99);
INSERT OR IGNORE INTO warehouse_order_item (item_id, order_id, product_sku, quantity, unit_price) VALUES (4, 2, 'SKU1004', 7, 15.99);
INSERT OR IGNORE INTO warehouse_order_item (item_id, order_id, product_sku, quantity, unit_price) VALUES (5, 3, 'SKU1005', 3, 22.50);
INSERT OR IGNORE INTO warehouse_order_item (item_id, order_id, product_sku, quantity, unit_price) VALUES (6, 3, 'SKU1001', 12, 5.99);
INSERT OR IGNORE INTO warehouse_order_item (item_id, order_id, product_sku, quantity, unit_price) VALUES (7, 4, 'SKU1002', 8, 8.49);
INSERT OR IGNORE INTO warehouse_order_item (item_id, order_id, product_sku, quantity, unit_price) VALUES (8, 4, 'SKU1003', 15, 12.99);
INSERT OR IGNORE INTO warehouse_order_item (item_id, order_id, product_sku, quantity, unit_price) VALUES (9, 5, 'SKU1004', 2, 15.99);
INSERT OR IGNORE INTO warehouse_order_item (item_id, order_id, product_sku, quantity, unit_price) VALUES (10, 5, 'SKU1005', 6, 22.50);
INSERT OR IGNORE INTO warehouse_order_item (item_id, order_id, product_sku, quantity, unit_price) VALUES (11, 1, 'SKU1003', 4, 12.99);
INSERT OR IGNORE INTO warehouse_order_item (item_id, order_id, product_sku, quantity, unit_price) VALUES (12, 2, 'SKU1005', 9, 22.50);
INSERT OR IGNORE INTO warehouse_order_item (item_id, order_id, product_sku, quantity, unit_price) VALUES (13, 3, 'SKU1002', 11, 8.49);
INSERT OR IGNORE INTO warehouse_order_item (item_id, order_id, product_sku, quantity, unit_price) VALUES (14, 4, 'SKU1001', 14, 5.99);
INSERT OR IGNORE INTO warehouse_order_item (item_id, order_id, product_sku, quantity, unit_price) VALUES (15, 5, 'SKU1003', 5, 12.99);
