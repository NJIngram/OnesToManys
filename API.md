# API Documentation

This document describes the REST API endpoints for the Warehouse Order system.

---

## Warehouse

- **Create Warehouse**
  - `POST /warehouses/`
  - Request: `{ "name": "Main Warehouse", "location": "Downtown" }`
  - Response: Warehouse object

- **List Warehouses**
  - `GET /warehouses/`
  - Response: List of Warehouse objects

- **Get Warehouse**
  - `GET /warehouses/{warehouse_id}`
  - Response: Warehouse object

- **Update Warehouse**
  - `PUT /warehouses/{warehouse_id}`
  - Request: Warehouse object
  - Response: Updated Warehouse object

- **Delete Warehouse**
  - `DELETE /warehouses/{warehouse_id}`
  - Response: `{ "ok": true }`

---

## Product

- **Create Product**
  - `POST /products/`
  - Request: `{ "product_sku": "SKU1001", "product_name": "Plankton Net", "description": "...", "unit_price": 5.99 }`
  - Response: Product object

- **List Products**
  - `GET /products/`
  - Response: List of Product objects

- **Get Product**
  - `GET /products/{product_sku}`
  - Response: Product object

- **Update Product**
  - `PUT /products/{product_sku}`
  - Request: Product object
  - Response: Updated Product object

- **Delete Product**
  - `DELETE /products/{product_sku}`
  - Response: `{ "ok": true }`

---

## Warehouse Order

- **Create Order**
  - `POST /orders/`
  - Request: `{ "warehouse_id": 1, "order_date": "YYYY-MM-DD", "status": "pending" }`
  - Response: Order object

- **List Orders**
  - `GET /orders/`
  - Response: List of Order objects

- **Get Order**
  - `GET /orders/{order_id}`
  - Response: Order object

- **Update Order**
  - `PUT /orders/{order_id}`
  - Request: Order object
  - Response: Updated Order object

- **Delete Order**
  - `DELETE /orders/{order_id}`
  - Response: `{ "ok": true }`

---

## Warehouse Order Item

- **Create Order Item**
  - `POST /order_items/`
  - Request: `{ "order_id": 1, "product_sku": "SKU1001", "quantity": 10, "unit_price": 5.99 }`
  - Response: Order Item object

- **List Order Items**
  - `GET /order_items/`
  - Response: List of Order Item objects

- **Get Order Item**
  - `GET /order_items/{item_id}`
  - Response: Order Item object

- **Update Order Item**
  - `PUT /order_items/{item_id}`
  - Request: Order Item object
  - Response: Updated Order Item object

- **Delete Order Item**
  - `DELETE /order_items/{item_id}`
  - Response: `{ "ok": true }`

---

All endpoints return JSON. For more details, see the FastAPI interactive docs at `/docs` when the server is running.
