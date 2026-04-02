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

// Sparkline: mini bar chart for a list of numeric values
function Sparkline({ values, color }) {
    const max = Math.max(...values, 1);
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '24px' }}>
            {values.map((v, i) => (
                <div
                    key={i}
                    style={{
                        flex: 1,
                        height: `${Math.round((v / max) * 100)}%`,
                        background: color,
                        opacity: 0.4 + 0.6 * (i / (values.length - 1)),
                        boxShadow: `0 0 4px ${color}`,
                        minHeight: '2px',
                    }}
                />
            ))}
        </div>
    );
}

export default function Dashboard() {
    const [counts, setCounts] = useState({ warehouses: null, products: null, orders: null, items: null });
    const [warehouseStats, setWarehouseStats] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => { loadAll(); }, []);

    async function loadAll() {
        try {
            const [warehouses, products, orders, items] = await Promise.all([
                api.getWarehouses(), api.getProducts(), api.getOrders(), api.getAllOrderItems()
            ]);
            setCounts({ warehouses: warehouses.length, products: products.length, orders: orders.length, items: items.length });

            // --- Warehouse stats ---
            const statsRaw = await Promise.all(
                warehouses.map(async w => {
                    const wOrders = await api.getWarehouseOrders(w.warehouse_id);
                    const total = wOrders.reduce((sum, o) => sum + (o.invoice_subtotal ?? 0), 0);
                    return { name: w.name, orderCount: wOrders.length, totalValue: total };
                })
            );
            setWarehouseStats(statsRaw);

            // --- Top products by order-item frequency ---
            const productFreq = {};
            for (const item of items) {
                const pid = item.product_sku;
                if (!productFreq[pid]) productFreq[pid] = { count: 0, quantity: 0 };
                productFreq[pid].count    += 1;
                productFreq[pid].quantity += item.quantity ?? 0;
            }
            const productMap = Object.fromEntries(products.map(p => [p.product_sku, p]));
            const sorted = Object.entries(productFreq)
                .sort(([, a], [, b]) => b.count - a.count)
                .slice(0, 5)
                .map(([pid, stats]) => ({
                    name: productMap[pid]?.product_name ?? `#${pid}`,
                    ...stats,
                }));
            setTopProducts(sorted);

            // --- Recent orders (last 8 by order_id descending, assume higher id = newer) ---
            const recent = [...orders]
                .sort((a, b) => b.order_id - a.order_id)
                .slice(0, 8)
                .map(o => ({
                    id: o.order_id,
                    warehouse: warehouses.find(w => w.warehouse_id === o.warehouse_id)?.name ?? '—',
                    subtotal: o.invoice_subtotal ?? 0,
                    status: o.status ?? 'UNKNOWN',
                }));
            setRecentOrders(recent);

        } catch (e) {
            setError('SIGNAL LOST — Could not connect to API on port 8000.');
        }
    }

    const maxOrders = Math.max(...warehouseStats.map(s => s.orderCount), 1);
    const maxValue  = Math.max(...warehouseStats.map(s => s.totalValue), 1);
    const maxProductCount = Math.max(...topProducts.map(p => p.count), 1);

    // Build a small sparkline dataset from warehouseStats order counts (sorted by name for consistency)
    const sparkValues = [...warehouseStats].sort((a, b) => a.name.localeCompare(b.name)).map(s => s.orderCount);

    const STATUS_COLOR = {
        COMPLETE:   C.green,
        PENDING:    C.amber,
        CANCELLED:  '#ff4444',
        SHIPPED:    '#44aaff',
    };

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

            {/* Summary cards */}
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

            {/* Warehouse activity */}
            {warehouseStats.length > 0 && (
                <div style={{ marginTop: '32px' }}>
                    <h2 style={T.h2}>WAREHOUSE ACTIVITY COMPARISON</h2>
                    <div style={T.tableWrap}>
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
                </div>
            )}

            {/* ── NEW: Two-column lower section ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '32px' }}>

                {/* Top Products */}
                {topProducts.length > 0 && (
                    <div>
                        <h2 style={T.h2}>TOP PRODUCTS BY ORDER FREQUENCY</h2>
                        <div style={{ background: C.panel, border: `1px solid ${C.border}`, padding: '16px', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}>
                            {topProducts.map((p, i) => (
                                <div key={p.name} style={{ marginBottom: i < topProducts.length - 1 ? '14px' : 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontFamily: C.font, fontSize: '11px', color: C.amber, letterSpacing: '1px' }}>
                                            #{i + 1} {p.name.toUpperCase()}
                                        </span>
                                        <span style={{ fontFamily: C.font, fontSize: '10px', color: C.muted }}>
                                            {p.count} orders · {p.quantity} units
                                        </span>
                                    </div>
                                    <Bar value={p.count} max={maxProductCount} color={C.green} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Orders Feed */}
                {recentOrders.length > 0 && (
                    <div>
                        <h2 style={T.h2}>RECENT ORDERS</h2>
                        <div style={{ background: C.panel, border: `1px solid ${C.border}`, boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}>
                            {recentOrders.map((o, i) => (
                                <div
                                    key={o.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '10px 16px',
                                        borderBottom: i < recentOrders.length - 1 ? `1px solid ${C.border}` : 'none',
                                        background: i % 2 === 0 ? 'transparent' : '#050f05',
                                    }}
                                >
                                    <div>
                                        <span style={{ fontFamily: C.font, fontSize: '11px', color: C.green, letterSpacing: '1px' }}>
                                            ORD-{String(o.id).padStart(4, '0')}
                                        </span>
                                        <span style={{ fontFamily: C.font, fontSize: '10px', color: C.muted, marginLeft: '10px' }}>
                                            {o.warehouse}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <span style={{ fontFamily: C.font, fontSize: '11px', color: C.amber }}>
                                            ${o.subtotal.toFixed(2)}
                                        </span>
                                        <span style={{
                                            fontFamily: C.font,
                                            fontSize: '9px',
                                            letterSpacing: '1px',
                                            color: STATUS_COLOR[o.status] ?? C.muted,
                                            textShadow: `0 0 6px ${STATUS_COLOR[o.status] ?? C.muted}`,
                                        }}>
                                            {o.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            <Link
                                to="/orders"
                                style={{
                                    display: 'block',
                                    padding: '8px 16px',
                                    fontFamily: C.font,
                                    fontSize: '10px',
                                    color: C.muted,
                                    letterSpacing: '2px',
                                    textDecoration: 'none',
                                    textAlign: 'center',
                                    borderTop: `1px solid ${C.border}`,
                                }}
                            >
                                [ VIEW ALL ORDERS ]
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
