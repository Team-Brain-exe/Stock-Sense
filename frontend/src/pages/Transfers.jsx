import { useState } from "react";
import FilterBar from "../components/FilterBar";
import Icon from "../components/Icon";
import { Button, Input, Select, Text } from "../components/ui";
import { apiPost } from "../api/client";
import { productOptions } from "../data/mockData";

// Expected contract from backend (Darwin):
//   POST /api/transfers -> { id, product, from, to, quantity, status }
// Location total stock is unchanged by design — only the location field
// on the product moves, and a Transfer row is written to the ledger.

export default function Transfers() {
  const [filters, setFilters] = useState({ documentType: "Internal", status: "", warehouse: "", category: "" });
  const [product, setProduct] = useState(productOptions[0].sku);
  const [fromLocation, setFromLocation] = useState("Central / A-04");
  const [toLocation, setToLocation] = useState("East Hub / C-04");
  const [quantity, setQuantity] = useState(12);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const submitTransfer = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    const localFallback = { id: `TRF-${2094}`, product, from: fromLocation, to: toLocation, quantity: Number(quantity), status: "Scheduled" };
    const result = await apiPost("/transfers", {
      product,
      from: fromLocation,
      to: toLocation,
      quantity: Number(quantity),
    }, localFallback);
    setSubmitted(result);
    setSubmitting(false);
  };

  return (
    <div className="page">
      <header className="page-header"><div><Text className="eyebrow">Internal logistics / 12 scheduled</Text><Text as="h1" className="page-title">Transfers</Text><Text className="page-subtitle">Rebalance stock across warehouses without changing total inventory.</Text></div></header>
      <FilterBar filters={filters} onChange={setFilters} />
      <section className="transfer-layout">
        <form className="panel transfer-form" onSubmit={submitTransfer}>
          <div className="panel-header"><div><Text className="panel-eyebrow">Movement request</Text><Text as="h2">Schedule internal transfer</Text></div><span className="status-badge status-ready">Live availability</span></div>
          <label className="form-field">
            <Text as="span">Product</Text>
            <Select value={product} onChange={(event) => setProduct(event.target.value)}>
              {productOptions.map((item) => <option value={item.sku} key={item.sku}>{item.name} · {item.sku}</option>)}
            </Select>
            <small>{productOptions.find((item) => item.sku === product)?.stock ?? 0} available across the network</small>
          </label>
          <div className="route-fields">
            <label className="form-field location-field">
              <Text as="span">From location</Text>
              <div><span className="location-code">WH–A</span><Select value={fromLocation} onChange={(event) => setFromLocation(event.target.value)}><option>Central / A-04</option><option>Central / C-12</option></Select></div>
            </label>
            <span className="route-arrow"><Icon name="arrowRight" size={22} /></span>
            <label className="form-field location-field">
              <Text as="span">To location</Text>
              <div><span className="location-code destination">WH–C</span><Select value={toLocation} onChange={(event) => setToLocation(event.target.value)}><option>East Hub / C-04</option><option>West / B-07</option></Select></div>
            </label>
          </div>
          <label className="form-field quantity-field"><Text as="span">Quantity</Text><Input type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} /><span>UNITS</span></label>
          <div className="transfer-summary"><div><Icon name="map" size={18} /><span><b>42 km</b><small>estimated route</small></span></div><div><Icon name="clock" size={18} /><span><b>Today, 14:00</b><small>scheduled dispatch</small></span></div></div>
          {submitted && <div className="success-banner"><Icon name="check" size={17} /> Transfer {submitted.id} scheduled and sent to the warehouse queue.</div>}
          <Button type="submit" className="primary-button full-button" disabled={submitting}>
            {submitting ? "Scheduling…" : "Schedule transfer"} <Icon name="arrowRight" size={16} />
          </Button>
        </form>
        <aside className="network-map panel">
          <div className="panel-header"><div><Text className="panel-eyebrow">Warehouse network</Text><Text as="h2">Transfer route</Text></div><Text className="positive">CAPACITY OK</Text></div>
          <div className="map-visual">
            <div className="map-grid" />
            <div className="node node-a"><span>A</span><div><b>Central Warehouse</b><small>18,492 units · 78%</small></div></div>
            <div className="route-line"><i /><i /><i /><i /><i /></div>
            <div className="node node-c"><span>C</span><div><b>East Hub</b><small>6,241 units · 54%</small></div></div>
          </div>
          <div className="capacity"><div><span>ORIGIN CAPACITY</span><b>78%</b></div><div className="capacity-bar"><span /></div><Text>Moving {quantity} units will have negligible capacity impact.</Text></div>
        </aside>
      </section>
    </div>
  );
}
