import { useEffect, useState } from 'react';
import api from '../api';
import { C, T } from '../theme';

function Btn({ danger, onClick, children }) {
    return <button style={danger ? T.btnDanger : T.btn} onClick={onClick}>{children}</button>;
}

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [products, setProducts] = useState([]);
    const [expanded, setExpanded] = useState(null);
    const [itemsMap, setItemsMap] = useState({});
    const [orderModal, setOrderModal] = useState({ open: false, data: null });
    const [itemModal, setItemModal] = useState({ open: false, data: null, orderId: null });
    const [orderForm, setOrderForm] = useState({ warehouse_id: '', order_date: '', notes: '' });
    const [itemForm, setItemForm] = useState({ product_sku: '', quantity: '', unit_price: '' });
    const [error, setError] = useState(null);
    const [hovered, setHovered] = useState(null);

    useEffect(() => {
        load();
        api.getWarehouses().then(setWarehouses).catch(e => setError(e.message));
        api.getProducts().then(setProducts).catch(e => setError(e.message));
    }, []);

    async function load() {
        try { setOrders(await api.getOrders()); }
        catch (e) { setError(e.message); }
    }

    async function toggleExpand(orderId) {
        if (expanded === orderId) { setExpanded(null); return; }
        try {
            const items = await api.getOrderItems(orderId);
            setItemsMap(m => ({ ...m, [orderId]: items }));
            setExpanded(orderId);
        } catch (e) { setError(e.message); }
    }

    function openAddOrder() {
        setOrderForm({ warehouse_id: '', order_date: new Date().toISOString().slice(0, 10), notes: '' });
        setOrderModal({ open: true, data: null });
    }

    function openEditOrder(o) {
        setOrderForm({ warehouse_id: o.warehouse_id, order_date: o.order_date ? o.order_date.slice(0, 10) : '', notes: o.notes || '' });
        setOrderModal({ open: true, data: o });
    }

    async function saveOrder() {
        if (!orderForm.warehouse_id) { setError('Warehouse is required.'); return; }
        const payload = { warehouse_id: parseInt(orderForm.warehouse_id), order_date: orderForm.order_date || null, notes: orderForm.notes || null };
        try {
            if (orderModal.data) await api.updateOrder(orderModal.data.order_id, payload);
            else await api.createOrder(payload);
            setOrderModal({ open: false, data: null });
            setError(null);
            load();
        } catch (e) { setError(e.message); }
    }

    async function deleteOrder(id) {
        if (!confirm('Delete this order?')) return;
        try { await api.deleteOrder(id); load(); if (expanded === id) setExpanded(null); }
        catch (e) { setError(e.message); }
    }

    function openAddItem(orderId) {
        setItemForm({ product_sku: '', quantity: '', unit_price: '' });
        setItemModal({ open: true, data: null, orderId });
    }

    function openEditItem(item, orderId) {
        setItemForm({ product_sku: item.product_sku, quantity: item.quantity, unit_price: item.unit_price });
        setItemModal({ open: true, data: item, orderId });
    }

    function handleProductChange(sku) {
        const p = products.find(x => x.product_sku === sku);
        setItemForm(f => ({ ...f, product_sku: sku, unit_price: p ? p.unit_price : '' }));
    }

    async function saveItem() {
        const { orderId, data } = itemModal;
        if (!itemForm.product_sku) { setError('Product is required.'); return; }
        const qty = parseInt(itemForm.quantity);
        const price = parseFloat(itemForm.unit_price);
        if (isNaN(qty) || qty < 1) { setError('Valid quantity required.'); return; }
        if (isNaN(price) || price < 0) { setError('Valid unit price required.'); return; }
        const payload = { order_id: orderId, product_sku: itemForm.product_sku, quantity: qty, unit_price: price };
        try {
            if (data) await api.updateOrderItem(data.item_id, payload);
            else await api.createOrderItem(payload);
            const items = await api.getOrderItems(orderId);
            setItemsMap(m => ({ ...m, [orderId]: items }));
            setItemModal({ open: false, data: null, orderId: null });
            setError(null);
        } catch (e) { setError(e.message); }
    }

    async function deleteItem(itemId, orderId) {
        if (!confirm('Delete this item?')) return;
        try {
            await api.deleteOrderItem(itemId);
            const items = await api.getOrderItems(orderId);
            setItemsMap(m => ({ ...m, [orderId]: items }));
        } catch (e) { setError(e.message); }
    }

    function warehouseName(id) {
        const w = warehouses.find(x => x.warehouse_id === id);
        return w ? w.name : id;
    }

    return (
        <div style={T.body}>
            <h1 style={T.h1}>Orders</h1>
            <Btn onClick={openAddOrder}>+ ADD ORDER</Btn>
            {error && <div style={{ ...T.error, marginTop: '12px' }}>{error}</div>}

            <div style={T.tableWrap}>
            <table style={T.table}>
                <thead>
                    <tr>{['ID', 'Warehouse', 'Date', 'Notes', 'Actions'].map(h => <th key={h} style={T.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                    {orders.map((o, i) => (
                        <>
                            <tr key={o.order_id}
                                onMouseEnter={() => setHovered(o.order_id)}
                                onMouseLeave={() => setHovered(null)}
                                style={{ background: hovered === o.order_id ? '#0a200a' : (i % 2 === 0 ? 'transparent' : '#050f05') }}
                            >
                                <td style={{ ...T.td, color: C.amber }}>{o.order_id}</td>
                                <td style={T.td}>{warehouseName(o.warehouse_id)}</td>
                                <td style={T.td}>{o.order_date ? o.order_date.slice(0, 10) : '—'}</td>
                                <td style={{ ...T.td, color: C.muted }}>{o.notes || '—'}</td>
                                <td style={T.td}>
                                    <Btn onClick={() => toggleExpand(o.order_id)}>
                                        {expanded === o.order_id ? '[-] ITEMS' : '[+] ITEMS'}
                                    </Btn>{' '}
                                    <Btn onClick={() => openEditOrder(o)}>EDIT</Btn>{' '}
                                    <Btn danger onClick={() => deleteOrder(o.order_id)}>DEL</Btn>
                                </td>
                            </tr>
                            {expanded === o.order_id && (
                                <tr key={`items-${o.order_id}`}>
                                    <td colSpan="5" style={{ ...T.td, padding: '0', borderLeft: `2px solid ${C.borderBright}` }}>
                                        <div style={{ background: '#030c03', padding: '14px 20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                                                <span style={{ fontFamily: C.font, fontSize: '11px', color: C.muted, letterSpacing: '2px' }}>
                                                    LINE ITEMS — ORDER #{o.order_id}
                                                </span>
                                                <Btn onClick={() => openAddItem(o.order_id)}>+ ADD ITEM</Btn>
                                            </div>
                                            <table style={T.subTable}>
                                                <thead>
                                                    <tr>{['Item ID', 'Product', 'Qty', 'Unit Price', 'Extended', 'Actions'].map(h => <th key={h} style={T.subTh}>{h}</th>)}</tr>
                                                </thead>
                                                <tbody>
                                                    {(itemsMap[o.order_id] || []).map(item => (
                                                        <tr key={item.item_id}>
                                                            <td style={T.subTd}>{item.item_id}</td>
                                                            <td style={{ ...T.subTd, color: C.amber }}>{item.product_sku}</td>
                                                            <td style={T.subTd}>{item.quantity}</td>
                                                            <td style={T.subTd}>${parseFloat(item.unit_price).toFixed(2)}</td>
                                                            <td style={{ ...T.subTd, color: C.green }}>${(item.quantity * item.unit_price).toFixed(2)}</td>
                                                            <td style={T.subTd}>
                                                                <Btn onClick={() => openEditItem(item, o.order_id)}>EDIT</Btn>{' '}
                                                                <Btn danger onClick={() => deleteItem(item.item_id, o.order_id)}>DEL</Btn>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </>
                    ))}
                </tbody>
            </table>            </div>
            {orderModal.open && (
                <>
                    <div style={T.overlay} onClick={() => setOrderModal({ open: false, data: null })} />
                    <div style={T.modal}>
                        <h3 style={T.h3}>{orderModal.data ? 'EDIT ORDER' : 'ADD ORDER'}</h3>
                        <div style={T.fieldWrap}>
                            <label style={T.label}>Warehouse</label>
                            <select style={T.select} value={orderForm.warehouse_id} onChange={e => setOrderForm(f => ({ ...f, warehouse_id: e.target.value }))}>
                                <option value="">-- SELECT --</option>
                                {warehouses.map(w => <option key={w.warehouse_id} value={w.warehouse_id}>{w.name}</option>)}
                            </select>
                        </div>
                        <div style={T.fieldWrap}>
                            <label style={T.label}>Order Date</label>
                            <input style={T.input} type="date" value={orderForm.order_date} onChange={e => setOrderForm(f => ({ ...f, order_date: e.target.value }))} />
                        </div>
                        <div style={T.fieldWrap}>
                            <label style={T.label}>Notes</label>
                            <input style={T.input} value={orderForm.notes} onChange={e => setOrderForm(f => ({ ...f, notes: e.target.value }))} />
                        </div>
                        <Btn onClick={saveOrder}>SAVE</Btn>{' '}
                        <Btn danger onClick={() => setOrderModal({ open: false, data: null })}>CANCEL</Btn>
                    </div>
                </>
            )}

            {itemModal.open && (
                <>
                    <div style={T.overlay} onClick={() => setItemModal({ open: false, data: null, orderId: null })} />
                    <div style={T.modal}>
                        <h3 style={T.h3}>{itemModal.data ? 'EDIT LINE ITEM' : 'ADD LINE ITEM'}</h3>
                        <div style={T.fieldWrap}>
                            <label style={T.label}>Product</label>
                            <select style={T.select} value={itemForm.product_sku} onChange={e => handleProductChange(e.target.value)}>
                                <option value="">-- SELECT --</option>
                                {products.map(p => <option key={p.product_sku} value={p.product_sku}>{p.product_name} ({p.product_sku})</option>)}
                            </select>
                        </div>
                        <div style={T.fieldWrap}>
                            <label style={T.label}>Quantity</label>
                            <input style={T.input} type="number" min="1" value={itemForm.quantity} onChange={e => setItemForm(f => ({ ...f, quantity: e.target.value }))} />
                        </div>
                        <div style={T.fieldWrap}>
                            <label style={T.label}>Unit Price</label>
                            <input style={T.input} type="number" step="0.01" value={itemForm.unit_price} onChange={e => setItemForm(f => ({ ...f, unit_price: e.target.value }))} />
                        </div>
                        <Btn onClick={saveItem}>SAVE</Btn>{' '}
                        <Btn danger onClick={() => setItemModal({ open: false, data: null, orderId: null })}>CANCEL</Btn>
                    </div>
                </>
            )}
        </div>
    );
}
