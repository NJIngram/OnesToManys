const tbody       = document.getElementById('tbody');
const error       = document.getElementById('error');
const modal       = document.getElementById('modal');
const itemModal   = document.getElementById('item-modal');
const btnAdd      = document.getElementById('btn-add');

let _warehouses = [];
let _products   = [];
let editingOrderId = null;
let editingItemId  = null;
let itemModalOrderId = null;

function showError(msg) {
    error.textContent = msg;
    error.style.display = '';
}

// ── Order modal ─────────────────────────────────────────────────────────────

function populateWarehouseSelect(selectedId = null) {
    const sel = document.getElementById('field-warehouse');
    sel.innerHTML = _warehouses.map(w =>
        `<option value="${w.warehouse_id}" ${w.warehouse_id === selectedId ? 'selected' : ''}>${w.name}</option>`
    ).join('');
}

function openOrderModal(order = null) {
    editingOrderId = order ? order.order_id : null;
    document.getElementById('modal-title').textContent = order ? 'Edit Order' : 'Add Order';
    populateWarehouseSelect(order ? order.warehouse_id : null);
    document.getElementById('field-date').value = order ? order.order_date : new Date().toISOString().slice(0, 10);
    document.getElementById('field-status').value = order ? order.status : 'Pending';
    modal.style.display = '';
}

function closeOrderModal() { modal.style.display = 'none'; editingOrderId = null; }

// ── Item modal ───────────────────────────────────────────────────────────────

function populateProductSelect(selectedSku = null) {
    const sel = document.getElementById('item-field-product');
    sel.innerHTML = _products.map(p =>
        `<option value="${p.product_sku}" data-price="${p.unit_price}" ${p.product_sku === selectedSku ? 'selected' : ''}>${p.product_name} (${p.product_sku})</option>`
    ).join('');
    // Pre-fill price from selected product
    const opt = sel.options[sel.selectedIndex];
    if (opt && !selectedSku) document.getElementById('item-field-price').value = parseFloat(opt.dataset.price).toFixed(2);
}

document.getElementById('item-field-product')?.addEventListener('change', function () {
    const opt = this.options[this.selectedIndex];
    document.getElementById('item-field-price').value = parseFloat(opt.dataset.price).toFixed(2);
});

function openItemModal(orderId, item = null) {
    itemModalOrderId = orderId;
    editingItemId    = item ? item.item_id : null;
    document.getElementById('item-modal-title').textContent = item ? 'Edit Item' : 'Add Item';
    populateProductSelect(item ? item.product_sku : null);
    document.getElementById('item-field-qty').value   = item ? item.quantity : 1;
    document.getElementById('item-field-price').value = item ? parseFloat(item.unit_price).toFixed(2) : '';
    itemModal.style.display = '';
}

function closeItemModal() { itemModal.style.display = 'none'; editingItemId = null; itemModalOrderId = null; }

// ── Load & render ────────────────────────────────────────────────────────────

async function loadOrders() {
    try {
        const orders = await api.getOrders();
        tbody.innerHTML = '';
        orders.forEach(o => {
            const wName = (_warehouses.find(w => w.warehouse_id === o.warehouse_id) || {}).name || o.warehouse_id;

            // Main row
            const tr = document.createElement('tr');
            tr.id = `order-row-${o.order_id}`;
            tr.style.cursor = 'pointer';
            tr.innerHTML = `
                <td id="expand-${o.order_id}">▶</td>
                <td>${o.order_id}</td>
                <td>${wName}</td>
                <td>${o.order_date}</td>
                <td>${o.status}</td>
                <td>$${o.invoice_subtotal.toFixed(2)}</td>
                <td>
                    <button onclick="event.stopPropagation(); editOrder(${o.order_id})">Edit</button>
                    <button onclick="event.stopPropagation(); deleteOrder(${o.order_id})">Delete</button>
                </td>`;
            tr.addEventListener('click', () => toggleItems(o.order_id));
            tbody.appendChild(tr);

            // Items sub-row (hidden by default)
            const subTr = document.createElement('tr');
            subTr.id = `items-row-${o.order_id}`;
            subTr.style.display = 'none';
            subTr.innerHTML = `<td colspan="7"><div id="items-container-${o.order_id}"><i>Loading...</i></div></td>`;
            tbody.appendChild(subTr);
        });
    } catch (e) {
        showError('Failed to load orders: ' + e.message);
    }
}

async function toggleItems(orderId) {
    const subRow  = document.getElementById(`items-row-${orderId}`);
    const expIcon = document.getElementById(`expand-${orderId}`);
    if (subRow.style.display !== 'none') {
        subRow.style.display = 'none';
        expIcon.textContent = '▶';
        return;
    }
    subRow.style.display = '';
    expIcon.textContent = '▼';
    await renderItems(orderId);
}

async function renderItems(orderId) {
    const container = document.getElementById(`items-container-${orderId}`);
    try {
        const items = await api.getOrderItems(orderId);
        if (items.length === 0) {
            container.innerHTML = `<em>No items.</em> <button onclick="openItemModal(${orderId})">+ Add Item</button>`;
            return;
        }
        let html = `<table border="1" cellpadding="4" style="margin:4px 0;">
            <thead><tr><th>Item ID</th><th>SKU</th><th>Qty</th><th>Unit Price</th><th>Extended</th><th>Actions</th></tr></thead><tbody>`;
        items.forEach(i => {
            html += `<tr>
                <td>${i.item_id}</td>
                <td>${i.product_sku}</td>
                <td>${i.quantity}</td>
                <td>$${parseFloat(i.unit_price).toFixed(2)}</td>
                <td>$${i.extended_cost.toFixed(2)}</td>
                <td>
                    <button onclick="editItem(${orderId}, ${i.item_id})">Edit</button>
                    <button onclick="deleteItem(${i.item_id}, ${orderId})">Delete</button>
                </td>
            </tr>`;
        });
        html += `</tbody></table><button onclick="openItemModal(${orderId})">+ Add Item</button>`;
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = `<span style="color:red;">Failed to load items.</span>`;
    }
}

// ── Order CRUD ───────────────────────────────────────────────────────────────

let _orders = [];
function editOrder(id) {
    const o = _orders.find(x => x.order_id === id);
    if (o) openOrderModal(o);
}

async function deleteOrder(id) {
    if (!confirm('Delete this order and all its items?')) return;
    try {
        await api.deleteOrder(id);
        await refreshOrders();
    } catch (e) {
        showError('Delete failed: ' + e.message);
    }
}

btnAdd.addEventListener('click', () => openOrderModal());
document.getElementById('modal-cancel').addEventListener('click', closeOrderModal);

document.getElementById('modal-save').addEventListener('click', async () => {
    const warehouseId = parseInt(document.getElementById('field-warehouse').value);
    const orderDate   = document.getElementById('field-date').value;
    const status      = document.getElementById('field-status').value;
    if (!orderDate) { showError('Date is required.'); return; }
    const data = { warehouse_id: warehouseId, order_date: orderDate, status };
    try {
        if (editingOrderId) {
            await api.updateOrder(editingOrderId, data);
        } else {
            await api.createOrder(data);
        }
        closeOrderModal();
        await refreshOrders();
    } catch (e) {
        showError('Save failed: ' + e.message);
    }
});

// ── Item CRUD ────────────────────────────────────────────────────────────────

async function editItem(orderId, itemId) {
    const items = await api.getOrderItems(orderId);
    const item  = items.find(i => i.item_id === itemId);
    if (item) openItemModal(orderId, item);
}

async function deleteItem(itemId, orderId) {
    if (!confirm('Delete this item?')) return;
    try {
        await api.deleteOrderItem(itemId);
        await renderItems(orderId);
    } catch (e) {
        showError('Delete failed: ' + e.message);
    }
}

document.getElementById('item-modal-cancel').addEventListener('click', closeItemModal);

document.getElementById('item-modal-save').addEventListener('click', async () => {
    const sel   = document.getElementById('item-field-product');
    const sku   = sel.value;
    const qty   = parseInt(document.getElementById('item-field-qty').value);
    const price = parseFloat(document.getElementById('item-field-price').value);
    if (!sku)             { showError('Product is required.'); return; }
    if (isNaN(qty) || qty < 1) { showError('Quantity must be at least 1.'); return; }
    if (isNaN(price) || price < 0) { showError('Valid unit price required.'); return; }

    const data = { order_id: itemModalOrderId, product_sku: sku, quantity: qty, unit_price: price };
    try {
        if (editingItemId) {
            await api.updateOrderItem(editingItemId, data);
        } else {
            await api.createOrderItem(data);
        }
        closeItemModal();
        await renderItems(itemModalOrderId);
    } catch (e) {
        showError('Save failed: ' + e.message);
    }
});

// ── Init ─────────────────────────────────────────────────────────────────────

async function refreshOrders() {
    _orders = await api.getOrders();
    await loadOrders();
}

async function init() {
    try {
        [_warehouses, _products] = await Promise.all([api.getWarehouses(), api.getProducts()]);
        await refreshOrders();
    } catch (e) {
        showError('Failed to connect to the API: ' + e.message);
    }
}

init();
