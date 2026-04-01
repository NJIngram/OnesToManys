const API_BASE = 'http://127.0.0.1:8000';

async function apiFetch(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status}: ${text}`);
    }
    return res.status === 204 ? null : res.json();
}

const api = {
    // Warehouses
    getWarehouses:       ()          => apiFetch('/warehouses/'),
    createWarehouse:     (data)      => apiFetch('/warehouses/', { method: 'POST', body: JSON.stringify(data) }),
    updateWarehouse:     (id, data)  => apiFetch(`/warehouses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteWarehouse:     (id)        => apiFetch(`/warehouses/${id}`, { method: 'DELETE' }),
    getWarehouseOrders:  (id)        => apiFetch(`/warehouses/${id}/orders`),

    // Products
    getProducts:         ()          => apiFetch('/products/'),
    createProduct:       (data)      => apiFetch('/products/', { method: 'POST', body: JSON.stringify(data) }),
    updateProduct:       (sku, data) => apiFetch(`/products/${sku}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteProduct:       (sku)       => apiFetch(`/products/${sku}`, { method: 'DELETE' }),

    // Orders
    getOrders:           ()          => apiFetch('/orders/'),
    createOrder:         (data)      => apiFetch('/orders/', { method: 'POST', body: JSON.stringify(data) }),
    updateOrder:         (id, data)  => apiFetch(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteOrder:         (id)        => apiFetch(`/orders/${id}`, { method: 'DELETE' }),
    getOrderItems:       (id)        => apiFetch(`/orders/${id}/items`),

    // Order Items
    getAllOrderItems:     ()          => apiFetch('/order_items/'),
    createOrderItem:     (data)      => apiFetch('/order_items/', { method: 'POST', body: JSON.stringify(data) }),
    updateOrderItem:     (id, data)  => apiFetch(`/order_items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteOrderItem:     (id)        => apiFetch(`/order_items/${id}`, { method: 'DELETE' }),
};
