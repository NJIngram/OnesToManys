import { useEffect, useState } from 'react';
import api from '../api';
import { C, T } from '../theme';

function Btn({ danger, onClick, children }) {
    return <button style={danger ? T.btnDanger : T.btn} onClick={onClick}>{children}</button>;
}

export default function Warehouses() {
    const [warehouses, setWarehouses] = useState([]);
    const [orders, setOrders] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [modal, setModal] = useState({ open: false, data: null });
    const [form, setForm] = useState({ name: '', location: '' });
    const [error, setError] = useState(null);
    const [hovered, setHovered] = useState(null);
    useEffect(() => { load(); }, []);

    async function load() {
        try { setWarehouses(await api.getWarehouses()); }
        catch (e) { setError(e.message); }
    }

    async function selectWarehouse(w) {
        setSelectedWarehouse(w);
        try { setOrders(await api.getWarehouseOrders(w.warehouse_id)); }
        catch (e) { setError(e.message); }
    }

    function openAdd() {
        setForm({ name: '', location: '' });
        setModal({ open: true, data: null });
    }

    function openEdit(w) {
        setForm({ name: w.name, location: w.location || '' });
        setModal({ open: true, data: w });
    }

    async function save() {
        const payload = { name: form.name, location: form.location || null };
        try {
            if (modal.data) await api.updateWarehouse(modal.data.warehouse_id, payload);
            else await api.createWarehouse(payload);
            setModal({ open: false, data: null });
            load();
        } catch (e) { setError(e.message); }
    }

    async function remove(id) {
        if (!confirm('Delete this warehouse?')) return;
        try { await api.deleteWarehouse(id); load(); }
        catch (e) { setError(e.message); }
    }

    return (
        <div style={T.body}>
            <h1 style={T.h1}>Warehouses</h1>
            <Btn onClick={openAdd}>+ ADD WAREHOUSE</Btn>
            {error && <div style={{ ...T.error, marginTop: '12px' }}>{error}</div>}

            <div style={T.tableWrap}>
            <table style={T.table}>
                <thead>
                    <tr>{['ID', 'Name', 'Location', 'Actions'].map(h => <th key={h} style={T.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                    {warehouses.map((w, i) => (
                        <tr key={w.warehouse_id}
                            onClick={() => selectWarehouse(w)}
                            onMouseEnter={() => setHovered(w.warehouse_id)}
                            onMouseLeave={() => setHovered(null)}
                            style={{ background: hovered === w.warehouse_id ? '#0a200a' : (i % 2 === 0 ? 'transparent' : '#050f05'), cursor: 'pointer' }}
                        >
                            <td style={T.td}>{w.warehouse_id}</td>
                            <td style={{ ...T.td, color: selectedWarehouse?.warehouse_id === w.warehouse_id ? C.amber : C.green }}>{w.name}</td>
                            <td style={T.td}>{w.location || '—'}</td>
                            <td style={T.td}>
                                <Btn onClick={e => { e.stopPropagation(); openEdit(w); }}>EDIT</Btn>{' '}
                                <Btn danger onClick={e => { e.stopPropagation(); remove(w.warehouse_id); }}>DEL</Btn>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>            </div>
            <hr style={T.divider} />
            <h2 style={T.h2}>Orders — {selectedWarehouse ? selectedWarehouse.name.toUpperCase() : 'SELECT A WAREHOUSE'}</h2>
            {!selectedWarehouse && <div style={T.muted}>&gt; Click a warehouse row to load its orders.</div>}
            {selectedWarehouse && (
                <table style={T.table}>
                    <thead>
                        <tr>{['Order ID', 'Date', 'Status', 'Subtotal'].map(h => <th key={h} style={T.th}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                        {orders.length === 0
                            ? <tr><td colSpan="4" style={{ ...T.td, color: C.muted }}>NO RECORDS FOUND</td></tr>
                            : orders.map((o, i) => (
                                <tr key={o.order_id} style={{ background: i % 2 === 0 ? 'transparent' : '#050f05' }}>
                                    <td style={T.td}>{o.order_id}</td>
                                    <td style={T.td}>{o.order_date || '—'}</td>
                                    <td style={T.td}>{o.status || '—'}</td>
                                    <td style={T.td}>${(o.invoice_subtotal ?? 0).toFixed(2)}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            )}

            {modal.open && (
                <>
                    <div style={T.overlay} onClick={() => setModal({ open: false, data: null })} />
                    <div style={T.modal}>
                        <h3 style={T.h3}>{modal.data ? 'EDIT WAREHOUSE' : 'ADD WAREHOUSE'}</h3>
                        <div style={T.fieldWrap}>
                            <label style={T.label}>Name</label>
                            <input style={T.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div style={T.fieldWrap}>
                            <label style={T.label}>Location</label>
                            <input style={T.input} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                        </div>
                        <Btn onClick={save}>SAVE</Btn>{' '}
                        <Btn danger onClick={() => setModal({ open: false, data: null })}>CANCEL</Btn>
                    </div>
                </>
            )}
        </div>
    );
}
