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

export default function Dashboard() {
    const [counts, setCounts] = useState({ warehouses: null, products: null, orders: null, items: null });
    const [error, setError] = useState(null);

    useEffect(() => {
        Promise.all([api.getWarehouses(), api.getProducts(), api.getOrders(), api.getAllOrderItems()])
            .then(([w, p, o, i]) => setCounts({ warehouses: w.length, products: p.length, orders: o.length, items: i.length }))
            .catch(() => setError('SIGNAL LOST — Could not connect to API on port 8000.'));
    }, []);

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
        </div>
    );
}
