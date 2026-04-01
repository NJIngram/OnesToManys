import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { C, T } from '../theme';

const CARDS = [
    { key: 'warehouses', label: 'Warehouses',  to: '/warehouses', icon: '[W]' },
    { key: 'products',   label: 'Products',    to: '/products',   icon: '[P]' },
    { key: 'orders',     label: 'Orders',      to: '/orders',     icon: '[O]' },
    { key: 'items',      label: 'Order Items', to: null,          icon: '[I]' },
];

function Bar({ value, max, color }) {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ flex: 1, background: '#0a1a0a', height: '10px', border: `1px solid ${C.border}` }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, boxShadow: `0 0 6px ${color}`, transition: 'width 0.4s ease' }} />
            </div>
            <span style={{ fontFamily: C.font, fontSize: '10px', color: C.muted, minWidth: '32px', textAlign: 'right' }}>{pct}%</span>
        </div>
    );
}

export default function Dashboard() {
    const [counts, setCounts] = useState({ warehouses: null, products: null, orders: null, items: null });
    const [warehouseStats, setWarehouseStats] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => { loadAll(); }, []);

    async function loadAll() {
        try {
            const [warehouses, products, orders, items] = await Promise.all([
                api.getWarehouses(), api.getProducts(), api.getOrders(), api.getAllOrderItems()
            ]);
            setCounts({ warehouses: warehouses.length, products: products.length, orders: orders.length, items: items.length });

            const statsRaw = await Promise.all(
                warehouses.map(async w => {
                    const wOrders = await api.getWarehouseOrders(w.warehouse_id);
                    const total = wOrders.reduce((sum, o) => sum + (o.invoice_subtotal ?? 0), 0);
                    return { name: w.name, orderCount: wOrders.length, totalValue: total };
                })
            );
            setWarehouseStats(statsRaw);
        } catch (e) {
            setError('SIGNAL LOST — Could not connect to API on port 8000.');
        }
    }

    const maxOrders = Math.max(...warehouseStats.map(s => s.orderCount), 1);
    const maxValue  = Math.max(...warehouseStats.map(s => s.totalValue), 1);

    return (
        <div style={T.body}>
            <div style={{ fontFamily: C.font, fontSize: '11px', color: C.muted, letterSpacing: '3px', marginBottom: '8px' }}>
                DEEP SEA RESEARCH INSTITUTE (TM) SONAR UPLINK
            </div>
            <h1 style={T.h1}>MARINE INVENTORY SYSTEM v1.0</h1>

            {error && <div style={T.error}>{error}</div>}

            <div style={{ fontFamily: C.font, fontSize: '11px', color: C.muted, letterSpacing: '2px', marginBottom: '20px' }}>
                SONAR STATUS: <span style={{ color: C.green, textShadow: `0 0 6px ${C.green}` }}>SIGNAL ACQUIRED</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {CARDS.map(({ key, label, to, icon }) => {
                    const count = counts[key];
                    const inner = (
                        <div style={{ background: C.panel, border: `1px solid ${C.border}`, padding: '20px', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}>
                            <div style={{ fontFamily: C.font, fontSize: '11px', color: C.muted, letterSpacing: '3px', marginBottom: '10px' }}>
                                {icon} {label.toUpperCase()}
                            </div>
                            <div style={{ fontFamily: C.font, fontSize: '42px', fontWeight: '700', color: C.green, textShadow: `0 0 12px ${C.green}`, lineHeight: '1' }}>
                                {count ?? '...'}
                            </div>
                            {to && <div style={{ fontFamily: C.font, fontSize: '10px', color: C.muted, marginTop: '10px', letterSpacing: '2px' }}>
                                [ CLICK TO VIEW ]
                            </div>}
                        </div>
                    );
                    return to
                        ? <Link key={key} to={to} style={{ textDecoration: 'none' }}>{inner}</Link>
                        : <div key={key}>{inner}</div>;
                })}
            </div>

            {warehouseStats.length > 0 && (
                <div style={{ marginTop: '32px' }}>
                    <h2 style={T.h2}>WAREHOUSE ACTIVITY COMPARISON</h2>
                    <table style={T.table}>
                        <thead>
                            <tr>
                                {['Warehouse', 'Orders', 'Order Volume', 'Total Value ($)', 'Value Share'].map(h => (
                                    <th key={h} style={T.th}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {warehouseStats
                                .slice()
                                .sort((a, b) => b.totalValue - a.totalValue)
                                .map((s, i) => (
                                    <tr key={s.name} style={{ background: i % 2 === 0 ? 'transparent' : '#050f05' }}>
                                        <td style={{ ...T.td, color: C.amber }}>{s.name}</td>
                                        <td style={T.td}>{s.orderCount}</td>
                                        <td style={{ ...T.td, minWidth: '160px' }}>
                                            <Bar value={s.orderCount} max={maxOrders} color={C.greenMid} />
                                        </td>
                                        <td style={T.td}>${s.totalValue.toFixed(2)}</td>
                                        <td style={{ ...T.td, minWidth: '160px' }}>
                                            <Bar value={s.totalValue} max={maxValue} color={C.green} />
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
