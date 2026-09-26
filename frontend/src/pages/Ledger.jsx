import { useEffect, useMemo, useState } from "react";
import FilterBar from "../components/FilterBar";
import SearchBar from "../components/SearchBar";
import Icon from "../components/Icon";
import { Button, Text } from "../components/ui";
import { apiGet } from "../api/client";
import { movements as mockMovements } from "../data/mockData";

// Expected contract from backend (Darwin — StockMovement model):
//   GET /api/movements?documentType=&status=&warehouse=&category=
//   -> { rows: Movement[], stats: { net, transactions, inbound, outbound }, page, totalPages }
// Falls back to the local mock ledger + client-side filtering if the
// endpoint isn't reachable, so the table is never empty during the demo.

const defaultStats = { net: "+1,507", transactions: 248, inbound: "2,841", outbound: "1,334" };

export default function Ledger() {
  const [filters, setFilters] = useState({ documentType: "", status: "", warehouse: "", category: "" });
  const [rows, setRows] = useState(mockMovements);
  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, value]) => value))
    ).toString();

    apiGet(`/movements${params ? `?${params}` : ""}`, null).then((data) => {
      if (cancelled) return;
      if (data) {
        setRows(data.rows || data);
        if (data.stats) setStats(data.stats);
      } else {
        // No live endpoint yet — filter the local mock ledger the same way
        // the backend would, so filters still work end-to-end in the demo.
        setRows(mockMovements.filter((row) => {
          if (filters.documentType) {
            const expected = filters.documentType === "Internal" ? "Transfer" : filters.documentType.replace(/s$/, "");
            if (row.type !== expected) return false;
          }
          if (filters.status && row.status !== filters.status) return false;
          return true;
        }));
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [filters]);

  const rowCount = useMemo(() => rows.length, [rows]);

  return (
    <div className="page">
      <header className="page-header">
        <div><Text className="eyebrow">Immutable movement history / Audit ready</Text><Text as="h1" className="page-title">Stock ledger</Text><Text className="page-subtitle">Every unit in, out, and across your inventory network.</Text></div>
        <div className="header-tools"><SearchBar placeholder="Search movement, SKU, product…" /><Button className="secondary-button"><Icon name="receipt" size={16} /> Export CSV</Button></div>
      </header>
      <div className="ledger-stats">
        <div><Text>NET MOVEMENT / TODAY</Text><b className="positive">{stats.net}</b><span>units</span></div>
        <div><Text>TRANSACTIONS</Text><b>{stats.transactions}</b><span>posted</span></div>
        <div><Text>INBOUND</Text><b>{stats.inbound}</b><span>units</span></div>
        <div><Text>OUTBOUND</Text><b>{stats.outbound}</b><span>units</span></div>
        <div className="integrity"><Icon name="check" size={17} /><span><b>LEDGER INTEGRITY</b><small>{loading ? "Syncing…" : "Verified · 09:42:18"}</small></span></div>
      </div>
      <FilterBar filters={filters} onChange={setFilters} />
      <section className="panel ledger-panel">
        <div className="ledger-table">
          <div className="ledger-row ledger-head"><span>TIME</span><span>MOVEMENT ID</span><span>PRODUCT / SKU</span><span>ACTION</span><span>FROM</span><span>TO</span><span>QUANTITY</span><span>STATUS</span><span>BY</span></div>
          {rows.map((row) => (
            <div className="ledger-row" key={row.id}>
              <span className="mono">{row.time}<small>18 APR 2024</small></span>
              <span className="mono id-cell">{row.id}</span>
              <span><b>{row.product}</b><small>{row.sku}</small></span>
              <span><i className={`type-icon type-${row.type.toLowerCase()}`}><Icon name={row.type === "Delivery" ? "truck" : row.type === "Transfer" ? "transfer" : row.type === "Receipt" ? "inbox" : "sliders"} size={14} /></i>{row.type}</span>
              <span>{row.from}</span><span>{row.to}</span>
              <span className={`quantity ${row.qty > 0 ? "positive" : "negative"}`}>{row.qty > 0 ? "+" : ""}{row.qty}<small>UNITS</small></span>
              <span><i className="status-dot" /> {row.status}</span>
              <span className="user-chip">{row.user}</span>
            </div>
          ))}
        </div>
        <div className="table-footer"><Text>Showing {rowCount} of {stats.transactions} movements</Text><div><Button disabled>Previous</Button><span>1 / 36</span><Button>Next</Button></div></div>
      </section>
    </div>
  );
}
