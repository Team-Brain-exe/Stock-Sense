import { useEffect, useMemo, useState } from "react";
import FilterBar from "../components/FilterBar";
import SearchBar from "../components/SearchBar";
import Icon from "../components/Icon";
import { Button, Input, Select, Text } from "../components/ui";
import { apiGet, apiPatch, apiPost } from "../api/client";
import { deliveriesSeed, productOptions } from "../data/mockData";

// Expected contract from backend (Darwin):
//   GET   /api/deliveries                     -> Delivery[]
//   POST  /api/deliveries                     -> Delivery   (creates, status: Waiting)
//   PATCH /api/deliveries/:id/advance         -> Delivery   (moves Waiting -> Packing -> Ready -> Done,
//                                                             decrements stock + writes ledger row on Done,
//                                                             and should trigger the low-stock alert server-side)
// Every call falls back to local state so the demo still works if the
// endpoint isn't wired up yet.

const emptyFilters = { documentType: "Delivery", status: "", warehouse: "", category: "" };
const statuses = ["Waiting", "Packing", "Ready", "Done"];

export default function Deliveries({ onLowStock }) {
  const [filters, setFilters] = useState(emptyFilters);
  const [deliveries, setDeliveries] = useState(deliveriesSeed);
  const [selected, setSelected] = useState(deliveriesSeed[0].id);
  const [creating, setCreating] = useState(false);
  const [product, setProduct] = useState(productOptions[0].sku);
  const [quantity, setQuantity] = useState(12);
  const [loading, setLoading] = useState(true);
  const active = deliveries.find((delivery) => delivery.id === selected);

  useEffect(() => {
    let cancelled = false;
    apiGet("/deliveries", null).then((rows) => {
      if (cancelled || !rows) { setLoading(false); return; }
      setDeliveries(rows);
      setSelected((current) => rows.some((row) => row.id === current) ? current : rows[0]?.id);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => deliveries.filter((delivery) => {
    if (filters.status && delivery.status !== filters.status) return false;
    if (filters.warehouse && delivery.warehouse !== filters.warehouse) return false;
    return true;
  }), [deliveries, filters]);

  const createDelivery = async (event) => {
    event.preventDefault();
    const localFallback = {
      id: `DEL-${1049 + deliveries.length}`,
      customer: "Axiom Field Services",
      items: 1,
      units: Number(quantity),
      warehouse: "Central Warehouse",
      eta: "Today, 15:30",
      status: "Waiting",
      progress: 0,
      product,
    };
    const created = await apiPost("/deliveries", {
      customer: localFallback.customer,
      product,
      quantity: Number(quantity),
      warehouse: localFallback.warehouse,
    }, localFallback);

    setDeliveries((items) => [created, ...items]);
    setSelected(created.id);
    setCreating(false);
  };

  const advance = async () => {
    if (!active) return;
    const nextProgress = Math.min(active.progress + 1, 3);
    const localFallback = { ...active, progress: nextProgress, status: statuses[nextProgress] };

    const updated = await apiPatch(`/deliveries/${active.id}/advance`, {}, localFallback);
    setDeliveries((items) => items.map((item) => item.id === active.id ? updated : item));

    if (nextProgress === 3) {
      // On validate, ask the backend for the resulting stock level so the
      // toast reflects the real ledger write. Fall back to a local estimate
      // if the delivery endpoint didn't return updated stock info.
      const chosen = productOptions.find((item) => item.sku === (active.product || "PPE-4402")) || productOptions[0];
      onLowStock({
        product: updated.productName || chosen.name,
        sku: updated.productSku || chosen.sku,
        location: updated.location || "CENTRAL / A-04",
        stock: updated.remainingStock ?? Math.max(0, chosen.stock - Number(active.units)),
        threshold: updated.threshold ?? chosen.threshold,
      });
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div><Text className="eyebrow">Outbound operations / {String(filtered.length).padStart(2, "0")} active</Text><Text as="h1" className="page-title">Deliveries</Text><Text className="page-subtitle">Pick, pack, and validate stock leaving your network.</Text></div>
        <div className="header-tools"><SearchBar placeholder="Search delivery, customer, SKU…" /><Button className="primary-button" onClick={() => setCreating(true)}><Icon name="plus" size={16} /> Create delivery</Button></div>
      </header>
      <FilterBar filters={filters} onChange={setFilters} />
      <div className="split-layout">
        <section className="panel delivery-list">
          <div className="list-head"><Text>{String(filtered.length).padStart(2, "0")} DELIVERY ORDERS</Text><Text>{loading ? "LOADING…" : "UPDATED LIVE"}</Text></div>
          {filtered.map((delivery) => (
            <Button className={`delivery-row ${selected === delivery.id ? "selected" : ""}`} key={delivery.id} onClick={() => setSelected(delivery.id)}>
              <span className="delivery-code">{delivery.id}</span>
              <span className="delivery-customer"><b>{delivery.customer}</b><small>{delivery.items} line items · {delivery.units} units</small></span>
              <span className="delivery-site"><small>SHIP FROM</small>{delivery.warehouse}</span>
              <span className="delivery-eta"><small>SCHEDULED</small>{delivery.eta}</span>
              <span className={`status-badge status-${delivery.status.toLowerCase()}`}>{delivery.status}</span>
              <Icon name="chevron" size={15} />
            </Button>
          ))}
        </section>
        {active && (
          <aside className="panel process-panel">
            <div className="process-top"><Text className="panel-eyebrow">Order workflow</Text><Text as="h2">{active.id}</Text><Text>{active.customer}</Text></div>
            <div className="process-steps">
              {["Order", "Pick", "Pack", "Validate"].map((step, index) => (
                <div className={`process-step ${index <= active.progress ? "complete" : ""} ${index === active.progress ? "current" : ""}`} key={step}>
                  <span>{index < active.progress ? <Icon name="check" size={15} /> : index + 1}</span>
                  <div><b>{step}</b><small>{index < active.progress ? "Completed" : index === active.progress ? "In progress" : "Pending"}</small></div>
                </div>
              ))}
            </div>
            <div className="order-metrics"><div><Text>UNITS</Text><b>{active.units}</b></div><div><Text>LINES</Text><b>{active.items}</b></div><div><Text>ZONE</Text><b>A–04</b></div></div>
            <div className="process-note"><Icon name="alert" size={16} /><Text>Validation posts stock changes instantly and writes a ledger movement.</Text></div>
            <Button className="primary-button full-button" disabled={active.progress === 3} onClick={advance}>
              {active.progress === 0 ? "Begin picking" : active.progress === 1 ? "Confirm packed" : active.progress === 2 ? "Validate delivery" : "Delivery validated"} <Icon name="arrowRight" size={16} />
            </Button>
          </aside>
        )}
      </div>
      {creating && (
        <div className="modal-backdrop">
          <form className="modal-panel" onSubmit={createDelivery}>
            <div className="modal-head"><div><Text className="panel-eyebrow">New outbound order</Text><Text as="h2">Create delivery</Text></div><Button aria-label="Close" onClick={() => setCreating(false)}><Icon name="close" size={18} /></Button></div>
            <label className="form-field"><Text as="span">Customer</Text><Input defaultValue="Axiom Field Services" required /></label>
            <label className="form-field"><Text as="span">Product / SKU</Text><Select value={product} onChange={(event) => setProduct(event.target.value)}>{productOptions.map((item) => <option value={item.sku} key={item.sku}>{item.name} · {item.sku}</option>)}</Select></label>
            <div className="form-grid"><label className="form-field"><Text as="span">Quantity</Text><Input type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label><label className="form-field"><Text as="span">Ship from</Text><Select><option>Central Warehouse</option><option>East Hub</option></Select></label></div>
            <div className="modal-actions"><Button onClick={() => setCreating(false)}>Cancel</Button><Button type="submit" className="primary-button">Create order <Icon name="arrowRight" size={16} /></Button></div>
          </form>
        </div>
      )}
    </div>
  );
}
