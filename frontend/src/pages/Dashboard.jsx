import { useEffect, useState } from "react";
import KpiCard from "../components/KpiCard";
import SearchBar from "../components/SearchBar";
import Icon from "../components/Icon";
import { Button, Text } from "../components/ui";
import { apiGet } from "../api/client";
import { movements as mockMovements } from "../data/mockData";

// Expected contract from backend (Darwin):
//   GET /api/dashboard/summary
//   -> {
//        kpis: [{ label, value, icon, colorState, delta, detail }],
//        criticalStock: [{ sku, name, stock, threshold, fill }],
//        throughput: { total, deltaLabel },
//        bars: number[24]   // hourly units moved, most recent last
//      }
// If this endpoint isn't live yet, the page falls back to the mock values
// below so the demo never shows a broken dashboard.

const fallbackKpis = [
  { label: "Total products in stock", value: "18,492", icon: "package", colorState: "positive", delta: "↑ 2.4%", detail: "vs last month" },
  { label: "Low / out of stock", value: "14", icon: "alert", colorState: "danger", delta: "5 critical", detail: "9 below threshold" },
  { label: "Pending receipts", value: "23", icon: "receipt", colorState: "warning", delta: "1,840 units", detail: "incoming" },
  { label: "Pending deliveries", value: "08", icon: "truck", colorState: "neutral", delta: "3 due", detail: "within 2 hours" },
  { label: "Transfers scheduled", value: "12", icon: "arrows", colorState: "positive", delta: "6 active", detail: "across 3 sites" },
];

const fallbackCriticalStock = [
  { sku: "PPE-4402", name: "Ridgeway Safety Gloves", stock: 32, threshold: 40, fill: "80%" },
  { sku: "ELC-2031", name: "Contactor 24V DC", stock: 9, threshold: 25, fill: "36%" },
  { sku: "CHM-5014", name: "ProSeal Adhesive 5L", stock: 6, threshold: 20, fill: "30%" },
  { sku: "MTL-8812", name: "Aluminium Sheet 2mm", stock: 11, threshold: 30, fill: "36%" },
];

const fallbackBars = [38, 52, 46, 61, 55, 70, 63, 76, 59, 67, 74, 62, 81, 78, 86, 69, 91, 83, 76, 88, 94, 82, 90, 96];
const fallbackThroughput = { total: "4,892", deltaLabel: "+12.6%" };

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard({ onNavigate }) {
  const [kpis, setKpis] = useState(fallbackKpis);
  const [criticalStock, setCriticalStock] = useState(fallbackCriticalStock);
  const [bars, setBars] = useState(fallbackBars);
  const [throughput, setThroughput] = useState(fallbackThroughput);
  const [recentMovements, setRecentMovements] = useState(mockMovements.slice(0, 5));
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState(getGreeting);

  useEffect(() => {
    const updateGreeting = () => setGreeting(getGreeting());
    updateGreeting();

    const greetingTimer = window.setInterval(updateGreeting, 60000);

    return () => window.clearInterval(greetingTimer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [summary, movementsResponse] = await Promise.all([
        apiGet("/dashboard/summary", null),
        apiGet("/movements?limit=5", null),
      ]);
      if (cancelled) return;

      if (summary) {
        setKpis(summary.kpis || fallbackKpis);
        setCriticalStock(summary.criticalStock || fallbackCriticalStock);
        setBars(summary.bars || fallbackBars);
        setThroughput(summary.throughput || fallbackThroughput);
      }
      if (movementsResponse) {
        setRecentMovements((movementsResponse.rows || movementsResponse).slice(0, 5));
      }
      setLoading(false);
    }

    load();
    // Keep the dashboard live: refresh every 8s so KPIs and the ledger tape
    // reflect deliveries/receipts happening from other tabs/screens.
    const interval = window.setInterval(load, 8000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div className="page dashboard-page">
      <header className="page-header dashboard-header">
        <div>
          <Text className="eyebrow">{loading ? "Syncing…" : "Live"} · Operational overview</Text>
          <Text as="h1" className="page-title">{greeting}, Arya.</Text>
          <Text className="page-subtitle">Your inventory network is stable. <b>{criticalStock.length} signals</b> need attention.</Text>
        </div>
        <div className="header-tools">
          <SearchBar />
          <Button className="primary-button" onClick={() => onNavigate("deliveries")}><Icon name="plus" size={16} /> New operation</Button>
        </div>
      </header>

      <section className="kpi-grid">
        {kpis.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}
      </section>

      <section className="dashboard-grid">
        <article className="panel flow-panel">
          <div className="panel-header">
            <div><Text className="panel-eyebrow">Network velocity</Text><Text as="h2">Stock movement flow</Text></div>
            <div className="legend"><span><i className="lime-dot" /> Outgoing</span><span><i className="muted-dot" /> Incoming</span></div>
          </div>
          <div className="chart-summary">
            <div><Text>24H THROUGHPUT</Text><strong>{throughput.total}</strong><span className="positive">{throughput.deltaLabel}</span></div>
            <Text>units moved across all warehouses</Text>
          </div>
          <div className="flow-chart">
            <div className="y-labels"><span>500</span><span>250</span><span>0</span></div>
            <div className="bars">
              {bars.map((height, index) => <span key={index} className={index > 19 ? "recent" : ""} style={{ "--bar-height": `${height}%` }} />)}
            </div>
          </div>
          <div className="x-labels"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>NOW</span></div>
        </article>

        <article className="panel risk-panel">
          <div className="panel-header">
            <div><Text className="panel-eyebrow danger">Attention queue</Text><Text as="h2">Critical stock</Text></div>
            <Button onClick={() => onNavigate("products")}>View all <Icon name="arrowRight" size={14} /></Button>
          </div>
          <div className="risk-list">
            {criticalStock.map((item) => (
              <div className="risk-row" key={item.sku}>
                <div className="risk-main">
                  <span className="risk-indicator" />
                  <div><Text>{item.name}</Text><Text>{item.sku}</Text></div>
                  <strong>{item.stock}</strong>
                </div>
                <div className="risk-meter"><span style={{ "--risk-fill": item.fill }} /></div>
                <div className="risk-foot"><span>ON HAND</span><span>REORDER {item.threshold}</span></div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel activity-panel">
          <div className="panel-header">
            <div><Text className="panel-eyebrow">Live tape</Text><Text as="h2">Latest movements</Text></div>
            <Button onClick={() => onNavigate("ledger")}>Open ledger <Icon name="arrowRight" size={14} /></Button>
          </div>
          <div className="movement-table compact-table">
            <div className="table-row table-head"><span>TIME</span><span>REFERENCE</span><span>PRODUCT</span><span>TYPE</span><span>QTY</span><span>STATUS</span></div>
            {recentMovements.map((movement) => (
              <div className="table-row" key={movement.id}>
                <span className="mono">{movement.time}</span>
                <span className="mono">{movement.id}</span>
                <span><b>{movement.product}</b><small>{movement.sku}</small></span>
                <span className={`movement-type type-${movement.type.toLowerCase()}`}>{movement.type}</span>
                <span className={movement.qty > 0 ? "positive" : "negative"}>{movement.qty > 0 ? "+" : ""}{movement.qty}</span>
                <span><i className="status-dot" /> {movement.status}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
