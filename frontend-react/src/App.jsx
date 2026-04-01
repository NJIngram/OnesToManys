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
        <nav style={{ background: '#020902', borderBottom: `1px solid ${C.border}`, padding: '10px 24px', display: 'flex', gap: '32px', alignItems: 'center' }}>
            {NAV_LINKS.map(({ to, label }) => {
                const active = to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(to);
                return (
                    <Link key={to} to={to} style={{
                        fontFamily: C.font, fontSize: '12px', fontWeight: '700',
                        letterSpacing: '2px', textDecoration: 'none', textTransform: 'uppercase',
                        color: active ? C.green : C.muted,
                        textShadow: active ? `0 0 8px ${C.green}` : 'none',
                        paddingBottom: '2px',
                        borderBottom: active ? `1px solid ${C.green}` : '1px solid transparent',
                    }}>
                        {label}
                    </Link>
                );
            })}
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
