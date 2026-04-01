import { useEffect, useState } from 'react';
import api from '../api';
import { C, T } from '../theme';

function Btn({ danger, onClick, children }) {
    return <button style={danger ? T.btnDanger : T.btn} onClick={onClick}>{children}</button>;
}

export default function Products() {
    const [products, setProducts] = useState([]);
    const [modal, setModal] = useState({ open: false, data: null });
    const [form, setForm] = useState({ product_sku: '', product_name: '', description: '', unit_price: '' });
    const [error, setError] = useState(null);
    const [hovered, setHovered] = useState(null);

    useEffect(() => { load(); }, []);

    async function load() {
        try { setProducts(await api.getProducts()); }
        catch (e) { setError(e.message); }
    }

    function openAdd() {
        setForm({ product_sku: '', product_name: '', description: '', unit_price: '' });
        setModal({ open: true, data: null });
    }

    function openEdit(p) {
        setForm({ product_sku: p.product_sku, product_name: p.product_name, description: p.description || '', unit_price: p.unit_price });
        setModal({ open: true, data: p });
    }

    async function save() {
        if (!form.product_sku) { setError('SKU is required.'); return; }
        if (!form.product_name) { setError('Name is required.'); return; }
        const price = parseFloat(form.unit_price);
        if (isNaN(price) || price < 0) { setError('Valid unit price required.'); return; }
        const payload = { product_sku: form.product_sku, product_name: form.product_name, description: form.description || null, unit_price: price };
        try {
            if (modal.data) await api.updateProduct(modal.data.product_sku, payload);
            else await api.createProduct(payload);
            setModal({ open: false, data: null });
            setError(null);
            load();
        } catch (e) { setError(e.message); }
    }

    async function remove(sku) {
        if (!confirm('Delete this product?')) return;
        try { await api.deleteProduct(sku); load(); }
        catch (e) { setError(e.message); }
    }

    return (
        <div style={T.body}>
            <h1 style={T.h1}>Products</h1>
            <Btn onClick={openAdd}>+ ADD PRODUCT</Btn>
            {error && <div style={{ ...T.error, marginTop: '12px' }}>{error}</div>}

            <table style={T.table}>
                <thead>
                    <tr>{['SKU', 'Name', 'Description', 'Unit Price', 'Actions'].map(h => <th key={h} style={T.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                    {products.map((p, i) => (
                        <tr key={p.product_sku}
                            onMouseEnter={() => setHovered(p.product_sku)}
                            onMouseLeave={() => setHovered(null)}
                            style={{ background: hovered === p.product_sku ? '#0a200a' : (i % 2 === 0 ? 'transparent' : '#050f05') }}
                        >
                            <td style={{ ...T.td, color: C.amber }}>{p.product_sku}</td>
                            <td style={T.td}>{p.product_name}</td>
                            <td style={{ ...T.td, color: C.muted }}>{p.description || '—'}</td>
                            <td style={T.td}>${parseFloat(p.unit_price).toFixed(2)}</td>
                            <td style={T.td}>
                                <Btn onClick={() => openEdit(p)}>EDIT</Btn>{' '}
                                <Btn danger onClick={() => remove(p.product_sku)}>DEL</Btn>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {modal.open && (
                <>
                    <div style={T.overlay} onClick={() => setModal({ open: false, data: null })} />
                    <div style={T.modal}>
                        <h3 style={T.h3}>{modal.data ? 'EDIT PRODUCT' : 'ADD PRODUCT'}</h3>
                        <div style={T.fieldWrap}>
                            <label style={T.label}>SKU</label>
                            <input style={T.input} value={form.product_sku} disabled={!!modal.data} onChange={e => setForm(f => ({ ...f, product_sku: e.target.value }))} />
                        </div>
                        <div style={T.fieldWrap}>
                            <label style={T.label}>Name</label>
                            <input style={T.input} value={form.product_name} onChange={e => setForm(f => ({ ...f, product_name: e.target.value }))} />
                        </div>
                        <div style={T.fieldWrap}>
                            <label style={T.label}>Description</label>
                            <input style={T.input} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                        </div>
                        <div style={T.fieldWrap}>
                            <label style={T.label}>Unit Price</label>
                            <input style={T.input} type="number" step="0.01" value={form.unit_price} onChange={e => setForm(f => ({ ...f, unit_price: e.target.value }))} />
                        </div>
                        <Btn onClick={save}>SAVE</Btn>{' '}
                        <Btn danger onClick={() => setModal({ open: false, data: null })}>CANCEL</Btn>
                    </div>
                </>
            )}
        </div>
    );
}
