import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Warehouses from "./pages/Warehouses";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import { C, T } from "./theme";

const NAV_LINKS = [
    { to: "/", label: "> SONAR.EXE" },
    { to: "/warehouses", label: "WAREHOUSES" },
    { to: "/products", label: "PRODUCTS" },
    { to: "/orders", label: "ORDERS" },
];

function Nav() {
    const loc = useLocation();
    return (
        <nav style={{
            background: '#020902',
            borderBottom: `1px solid ${C.border}`,
            boxShadow: `0 2px 12px rgba(76,254,76,0.08)`,
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'stretch',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0', maxWidth: '1200px', width: '100%' }}>
                {NAV_LINKS.map(({ to, label }, idx) => {
                    const active = to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(to);
                    const isBrand = idx === 0;
                    return (
                        <Link key={to} to={to} style={{
                            fontFamily: C.font, fontSize: isBrand ? '13px' : '11px', fontWeight: '700',
                            letterSpacing: isBrand ? '1px' : '3px',
                            textDecoration: 'none', textTransform: 'uppercase',
                            color: active ? C.green : C.muted,
                            textShadow: active ? `0 0 10px ${C.green}` : 'none',
                            padding: '18px 20px',
                            borderBottom: active ? `3px solid ${C.green}` : '3px solid transparent',
                            marginRight: isBrand ? '32px' : '0',
                            transition: 'color 0.15s, border-color 0.15s',
                        }}>
                            {label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <div style={T.page}>
                <Nav />
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/warehouses" element={<Warehouses />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/orders" element={<Orders />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}
