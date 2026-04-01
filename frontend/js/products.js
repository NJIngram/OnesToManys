const tbody = document.getElementById('tbody');
const error = document.getElementById('error');
const modal = document.getElementById('modal');
const btnAdd = document.getElementById('btn-add');

let editingSku = null;

function showError(msg) {
    error.textContent = msg;
    error.style.display = '';
}

function openModal(product = null) {
    editingSku = product ? product.product_sku : null;
    document.getElementById('modal-title').textContent = product ? 'Edit Product' : 'Add Product';
    document.getElementById('field-sku').value = product ? product.product_sku : '';
    document.getElementById('field-sku').disabled = !!product;
    document.getElementById('field-name').value = product ? product.product_name : '';
    document.getElementById('field-description').value = product ? (product.description || '') : '';
    document.getElementById('field-price').value = product ? product.unit_price : '';
    modal.style.display = '';
}

function closeModal() {
    modal.style.display = 'none';
    editingSku = null;
}

async function loadProducts() {
    try {
        const products = await api.getProducts();
        tbody.innerHTML = '';
        products.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.product_sku}</td>
                <td>${p.product_name}</td>
                <td>${p.description || '—'}</td>
                <td>$${parseFloat(p.unit_price).toFixed(2)}</td>
                <td>
                    <button onclick="editProduct('${p.product_sku}')">Edit</button>
                    <button onclick="deleteProduct('${p.product_sku}')">Delete</button>
                </td>`;
            tbody.appendChild(tr);
        });
    } catch (e) {
        showError('Failed to load products: ' + e.message);
    }
}

// Store products in memory for edit lookups
let _products = [];
api.getProducts().then(p => { _products = p; });

function editProduct(sku) {
    const p = _products.find(x => x.product_sku === sku);
    if (p) openModal(p);
}

async function deleteProduct(sku) {
    if (!confirm('Delete this product?')) return;
    try {
        await api.deleteProduct(sku);
        loadProducts();
    } catch (e) {
        showError('Delete failed: ' + e.message);
    }
}

btnAdd.addEventListener('click', () => openModal());
document.getElementById('modal-cancel').addEventListener('click', closeModal);

document.getElementById('modal-save').addEventListener('click', async () => {
    const sku  = document.getElementById('field-sku').value.trim();
    const name = document.getElementById('field-name').value.trim();
    const desc = document.getElementById('field-description').value.trim();
    const price = parseFloat(document.getElementById('field-price').value);

    if (!sku)        { showError('SKU is required.'); return; }
    if (!name)       { showError('Name is required.'); return; }
    if (isNaN(price) || price < 0) { showError('Valid unit price is required.'); return; }

    const data = { product_sku: sku, product_name: name, description: desc || null, unit_price: price };
    try {
        if (editingSku) {
            await api.updateProduct(editingSku, data);
        } else {
            await api.createProduct(data);
        }
        closeModal();
        api.getProducts().then(p => { _products = p; });
        loadProducts();
    } catch (e) {
        showError('Save failed: ' + e.message);
    }
});

loadProducts();
