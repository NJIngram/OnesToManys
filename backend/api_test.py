import requests
import json

BASE_URL = "http://127.0.0.1:8000"

# Helper to print responses

def print_response(resp):
    print(f"{resp.request.method} {resp.request.url}")
    print(f"Status: {resp.status_code}")
    try:
        print(json.dumps(resp.json(), indent=2))
    except Exception:
        print(resp.text)
    print("-" * 40)

# 1. Create Warehouse
data = {"name": "Main Warehouse", "location": "Downtown"}
r = requests.post(f"{BASE_URL}/warehouses/", json=data)
print_response(r)

# 2. List Warehouses
r = requests.get(f"{BASE_URL}/warehouses/")
print_response(r)
warehouse_id = r.json()[0]["warehouse_id"]

# 3. Create Product
data = {"product_sku": "SKU1001", "product_name": "Plankton Net", "description": "Fine mesh net for collecting plankton samples."}
r = requests.post(f"{BASE_URL}/products/", json=data)
print_response(r)

# 4. List Products
r = requests.get(f"{BASE_URL}/products/")
print_response(r)
product_sku = r.json()[0]["product_sku"]

# 5. Create Order
data = {"warehouse_id": warehouse_id, "order_date": "2026-03-30", "status": "pending"}
r = requests.post(f"{BASE_URL}/orders/", json=data)
print_response(r)
order_id = r.json()["order_id"]

# 6. List Orders
r = requests.get(f"{BASE_URL}/orders/")
print_response(r)

# 7. Create Order Item
data = {"order_id": order_id, "product_sku": product_sku, "quantity": 10, "unit_price": 5.99}
r = requests.post(f"{BASE_URL}/order_items/", json=data)
print_response(r)

# 8. List Order Items
r = requests.get(f"{BASE_URL}/order_items/")
print_response(r)
