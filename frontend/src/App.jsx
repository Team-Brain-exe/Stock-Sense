import { useMemo, useState } from "react";
import Dashboard from "./pages/Dashboard.jsx";
import Deliveries from "./pages/Deliveries.jsx";
import Transfers from "./pages/Transfers.jsx";
import Ledger from "./pages/Ledger.jsx";
import LowStockToast from "./components/LowStockToast.jsx";
import useLowStockAlerts from "./hooks/useLowStockAlerts.js";
import Icon from "./components/Icon.jsx";
import { Button, Text } from "./components/ui.jsx";

// Products / Receipts / Adjustments are Harisha's pages. This app runs on
// its own without them — each shows a placeholder until her files land in
// frontend/src/pages/. Once they exist, swap the placeholder branch below
// for a real import, same pattern as Dashboard/Deliveries/Transfers/Ledger.

const navigation = [
  { id: "dashboard", label: "Dashboard", icon: "grid" },
  { id: "products", label: "Products", icon: "box" },
  { id: "receipts", label: "Receipts", icon: "inbox" },
  { id: "deliveries", label: "Deliveries", icon: "truck" },
  { id: "transfers", label: "Transfers", icon: "transfer" },
  { id: "adjustments", label: "Adjustments", icon: "sliders" },
  { id: "ledger", label: "Stock ledger", icon: "ledger" },
];

const placeholderCopy = {
  products: { eyebrow: "Inventory master", title: "Product intelligence", body: "A consolidated view of SKUs, thresholds, and warehouse availability." },
  receipts: { eyebrow: "Inbound operations", title: "Receipts", body: "Track expected inventory and confirm goods into available stock." },
  adjustments: { eyebrow: "Stock control", title: "Adjustments", body: "Review and reconcile controlled inventory corrections." },
};

function Placeholder({ page }) {
  const copy = placeholderCopy[page];
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <Text className="eyebrow">{copy.eyebrow}</Text>
          <Text as="h1" className="page-title">{copy.title}</Text>
          <Text className="page-subtitle">{copy.body}</Text>
        </div>
        <Button className="primary-button"><Icon name="plus" size={16} /> New record</Button>
      </header>
      <section className="empty-panel">
        <span className="empty-icon"><Icon name="scan" size={30} /></span>
        <Text as="h2">Module ready for connection</Text>
        <Text>This page belongs to a teammate — drop their file into src/pages/ and wire it up here.</Text>
      </section>
    </div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { alerts, dismissAlert, injectAlert } = useLowStockAlerts();

  const page = useMemo(() => {
    if (activePage === "dashboard") return <Dashboard onNavigate={setActivePage} />;
    if (activePage === "deliveries") return <Deliveries onLowStock={injectAlert} />;
    if (activePage === "transfers") return <Transfers />;
    if (activePage === "ledger") return <Ledger />;
    return <Placeholder page={activePage} />;
  }, [activePage, injectAlert]);

  const navigate = (id) => {
    setActivePage(id);
    setSidebarOpen(false);
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand-lockup">
          <div className="brand-mark"><span /><span /><span /></div>
          <div>
            <Text className="brand-name">STOCK—SENSE</Text>
            <Text className="brand-meta">INVENTORY INTELLIGENCE</Text>
          </div>
        </div>
        <div className="environment">
          <span className="live-dot" />
          <Text>Live operations</Text>
          <Text className="environment-code">US–EAST</Text>
        </div>
        <nav className="nav-list">
          <Text className="nav-label">Workspace</Text>
          {navigation.map((item) => (
            <Button
              key={item.id}
              className={`nav-item ${activePage === item.id ? "active" : ""}`}
              onClick={() => navigate(item.id)}
            >
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
              {item.id === "deliveries" && <span className="nav-count">08</span>}
            </Button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="system-health">
            <div className="health-head">
              <Text>System health</Text><Text className="positive">99.98%</Text>
            </div>
            <div className="health-line"><span /></div>
            <Text className="health-caption">All services operational</Text>
          </div>
          <div className="profile">
            <span className="avatar">AM</span>
            <div><Text className="profile-name">Arya Krishna CS</Text><Text className="profile-role">Operations lead</Text></div>
            <Icon name="more" size={18} />
          </div>
        </div>
      </aside>

      <main className="main-area">
        <div className="terminal-bar">
          <Button className="mobile-menu" aria-label="Toggle navigation" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Icon name="menu" size={20} />
          </Button>
          <div className="ticker"><span>SSX</span><b>WAREHOUSE NETWORK</b><i>+2.8%</i></div>
          <div className="terminal-status">
            <span className="status-item"><span className="live-dot" /> LIVE</span>
            <span className="status-item">LAST SYNC&nbsp; 09:42:18</span>
            <Button className="icon-button" aria-label="Notifications"><Icon name="bell" size={18} /><span className="notification-pip" /></Button>
          </div>
        </div>
        {page}
      </main>
      <LowStockToast alerts={alerts} onDismiss={dismissAlert} />
    </div>
  );
}
