const tbody = document.getElementById('tbody');
const error = document.getElementById('error');
const modal = document.getElementById('modal');
const btnAdd = document.getElementById('btn-add');
const ordersTable = document.getElementById('orders-table');
const ordersTbody = document.getElementById('orders-tbody');
const selectedName = document.getElementById('selected-name');
const ordersHint = document.getElementById('orders-hint');

let editingId = null;

function showError(msg) {
    error.textContent = msg;
    error.style.display = '';
}

function openModal(warehouse = null) {
    editingId = warehouse ? warehouse.warehouse_id : null;
    document.getElementById('modal-title').textContent = warehouse ? 'Edit Warehouse' : 'Add Warehouse';
    document.getElementById('field-name').value = warehouse ? warehouse.name : '';
    document.getElementById('field-location').value = warehouse ? (warehouse.location || '') : '';
    modal.style.display = '';
}

function closeModal() {
    modal.style.display = 'none';
    editingId = null;
}

async function loadWarehouses() {
    try {
        const warehouses = await api.getWarehouses();
        tbody.innerHTML = '';
        warehouses.forEach(w => {
            const tr = document.createElement('tr');
            tr.style.cursor = 'pointer';
            tr.innerHTML = `
                <td>${w.warehouse_id}</td>
                <td>${w.name}</td>
                <td>${w.location || '—'}</td>
                <td>
                    <button onclick="event.stopPropagation(); editWarehouse(${w.warehouse_id}, '${w.name.replace(/'/g,"\\'")}', '${(w.location||'').replace(/'/g,"\\'")}')">Edit</button>
                    <button onclick="event.stopPropagation(); deleteWarehouse(${w.warehouse_id})">Delete</button>
                </td>`;
            tr.addEventListener('click', () => loadOrdersForWarehouse(w.warehouse_id, w.name));
            tbody.appendChild(tr);
        });
    } catch (e) {
        showError('Failed to load warehouses: ' + e.message);
    }
}

async function loadOrdersForWarehouse(id, name) {
    selectedName.textContent = name;
    ordersHint.style.display = 'none';
    try {
        const orders = await api.getWarehouseOrders(id);
        ordersTbody.innerHTML = '';
        if (orders.length === 0) {
            ordersTbody.innerHTML = '<tr><td colspan="4">No orders for this warehouse.</td></tr>';
        } else {
            orders.forEach(o => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${o.order_id}</td>
                    <td>${o.order_date}</td>
                    <td>${o.status}</td>
                    <td>$${o.invoice_subtotal.toFixed(2)}</td>`;
                ordersTbody.appendChild(tr);
            });
        }
        ordersTable.style.display = '';
    } catch (e) {
        showError('Failed to load orders: ' + e.message);
    }
}

function editWarehouse(id, name, location) {
    openModal({ warehouse_id: id, name, location });
}

async function deleteWarehouse(id) {
    if (!confirm('Delete this warehouse?')) return;
    try {
        await api.deleteWarehouse(id);
        loadWarehouses();
    } catch (e) {
        showError('Delete failed: ' + e.message);
    }
}

btnAdd.addEventListener('click', () => openModal());
document.getElementById('modal-cancel').addEventListener('click', closeModal);

document.getElementById('modal-save').addEventListener('click', async () => {
    const data = {
        name: document.getElementById('field-name').value.trim(),
        location: document.getElementById('field-location').value.trim() || null,
    };
    if (!data.name) { showError('Name is required.'); return; }
    try {
        if (editingId) {
            await api.updateWarehouse(editingId, data);
        } else {
            await api.createWarehouse(data);
        }
        closeModal();
        loadWarehouses();
    } catch (e) {
        showError('Save failed: ' + e.message);
    }
});

loadWarehouses();
