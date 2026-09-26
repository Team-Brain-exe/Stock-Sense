import { useEffect, useState } from "react";
import Icon from "../components/Icon.jsx";
import { Button, Text } from "../components/ui.jsx";
import { apiGet, apiPost } from "../api/client";

// Fallback products used only if GET /api/products isn't reachable, so the
// page still demos even if the backend is down.
const fallbackProducts = [
  { id: 1, name: "Wireless Keyboard", sku: "KB-001", stock: 124 },
  { id: 2, name: "Office Chair", sku: "CH-024", stock: 18 },
  { id: 3, name: "USB-C Cable", sku: "UC-102", stock: 56 },
  { id: 4, name: "Laptop Stand", sku: "LS-014", stock: 8 },
];

const locations = [
  "US-East Warehouse",
  "US-West Warehouse",
  "Central Warehouse",
];

export default function Adjustments() {
  const [products, setProducts] = useState(fallbackProducts);
  const [productId, setProductId] = useState("");
  const [location, setLocation] = useState("");
  const [countedQuantity, setCountedQuantity] = useState("");
  const [message, setMessage] = useState("");
  const [adjustmentLog, setAdjustmentLog] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiGet("/products", null).then((rows) => {
      if (cancelled || !rows) return;
      // Backend Product docs use _id/stockQty; normalize to what this page expects.
      setProducts(
        rows.map((p) => ({
          id: p._id,
          name: p.name,
          sku: p.sku,
          stock: p.stockQty,
        }))
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedProduct = products.find(
    (product) => String(product.id) === String(productId)
  );

  const currentStock = selectedProduct ? selectedProduct.stock : 0;

  const delta =
    countedQuantity === "" ? 0 : Number(countedQuantity) - currentStock;

  const confirmAdjustment = async () => {
    if (!productId) {
      setMessage("Select a product.");
      return;
    }

    if (!location) {
      setMessage("Select a location.");
      return;
    }

    if (countedQuantity === "" || Number(countedQuantity) < 0) {
      setMessage("Enter a valid counted quantity.");
      return;
    }

    setSubmitting(true);
    const result = await apiPost(
      "/adjustments",
      {
        sku: selectedProduct.sku,
        location,
        countedQuantity: Number(countedQuantity),
      },
      null
    );
    setSubmitting(false);

    const newAdjustment = result
      ? {
          id: result.id,
          product: result.product,
          sku: result.sku,
          location: result.location,
          recorded: result.recorded,
          counted: result.counted,
          delta: result.delta,
        }
      : {
          id: Date.now(),
          product: selectedProduct.name,
          sku: selectedProduct.sku,
          location,
          recorded: currentStock,
          counted: Number(countedQuantity),
          delta,
        };

    setAdjustmentLog((current) => [newAdjustment, ...current]);

    if (result) {
      // Reflect the new stock immediately so the "current recorded stock"
      // field is correct if the same product is picked again.
      setProducts((current) =>
        current.map((item) =>
          item.sku === result.sku ? { ...item, stock: result.counted } : item
        )
      );
      setMessage(
        `Adjustment confirmed for ${newAdjustment.product}. Stock changed by ${
          newAdjustment.delta > 0 ? "+" : ""
        }${newAdjustment.delta} units.`
      );
    } else {
      setMessage(
        `Adjustment saved locally — backend not reachable, stock wasn't updated on the server.`
      );
    }

    setProductId("");
    setLocation("");
    setCountedQuantity("");
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <Text className="eyebrow">
            STOCK CONTROL
          </Text>

          <Text as="h1" className="page-title">
            Adjustments
          </Text>

          <Text className="page-subtitle">
            Reconcile physical stock counts with recorded inventory.
          </Text>
        </div>

        <Button
          className="primary-button"
          onClick={confirmAdjustment}
          disabled={submitting}
        >
          <Icon name="check" size={16} />
          {submitting ? "Confirming…" : "Confirm adjustment"}
        </Button>
      </header>

      {message && (
        <div className="success-banner">
          <Icon name="check" size={16} />
          {message}
        </div>
      )}

      <div className="split-layout">
        <section className="panel transfer-form">
          <div className="panel-header">
            <div>
              <Text className="panel-eyebrow">
                ADJUSTMENT DETAILS
              </Text>

              <Text as="h2">
                New adjustment
              </Text>
            </div>
          </div>

          <label className="form-field">
            <span>Product</span>

            <select
              value={productId}
              onChange={(event) => {
                setProductId(event.target.value);
                setMessage("");
              }}
            >
              <option value="">
                Select product
              </option>

              {products.map((product) => (
                <option
                  key={product.id}
                  value={product.id}
                >
                  {product.name} — {product.sku}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Location</span>

            <select
              value={location}
              onChange={(event) => {
                setLocation(event.target.value);
                setMessage("");
              }}
            >
              <option value="">
                Select location
              </option>

              {locations.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <div className="adjustment-stock">
            <span>Current recorded stock</span>

            <strong>
              {selectedProduct
                ? `${currentStock} units`
                : "—"}
            </strong>
          </div>

          <label className="form-field">
            <span>Counted quantity</span>

            <input
              type="number"
              min="0"
              placeholder="Enter physical count"
              value={countedQuantity}
              onChange={(event) => {
                setCountedQuantity(event.target.value);
                setMessage("");
              }}
            />
          </label>

          <div className="adjustment-delta">
            <span>Stock difference</span>

            <strong
              className={
                delta > 0
                  ? "positive"
                  : delta < 0
                  ? "negative"
                  : ""
              }
            >
              {countedQuantity === ""
                ? "—"
                : `${delta > 0 ? "+" : ""}${delta} units`}
            </strong>
          </div>
        </section>

        <section className="panel process-panel">
          <div className="process-top">
            <Text className="panel-eyebrow">
              ADJUSTMENT PREVIEW
            </Text>

            <Text as="h2">
              Stock reconciliation
            </Text>

            <Text>
              Review the difference before confirming the adjustment.
            </Text>
          </div>

          <div className="process-steps">
            <div
              className={`process-step ${
                productId ? "complete" : ""
              }`}
            >
              <span>01</span>

              <div>
                <b>Product</b>

                <small>
                  {selectedProduct
                    ? selectedProduct.name
                    : "No product selected"}
                </small>
              </div>
            </div>

            <div
              className={`process-step ${
                location ? "complete" : ""
              }`}
            >
              <span>02</span>

              <div>
                <b>Location</b>

                <small>
                  {location || "No location selected"}
                </small>
              </div>
            </div>

            <div
              className={`process-step ${
                countedQuantity !== ""
                  ? "complete"
                  : ""
              }`}
            >
              <span>03</span>

              <div>
                <b>Stock count</b>

                <small>
                  {countedQuantity !== ""
                    ? `${countedQuantity} units counted`
                    : "Waiting for count"}
                </small>
              </div>
            </div>
          </div>

          <div className="order-metrics">
            <div>
              <p>RECORDED</p>

              <b>
                {selectedProduct
                  ? currentStock
                  : 0}
              </b>
            </div>

            <div>
              <p>COUNTED</p>

              <b>
                {countedQuantity === ""
                  ? 0
                  : countedQuantity}
              </b>
            </div>

            <div>
              <p>DELTA</p>

              <b
                className={
                  delta > 0
                    ? "positive"
                    : delta < 0
                    ? "negative"
                    : ""
                }
              >
                {countedQuantity === ""
                  ? 0
                  : `${delta > 0 ? "+" : ""}${delta}`}
              </b>
            </div>
          </div>
        </section>
      </div>

      <section
        className="panel activity-panel"
        style={{ marginTop: "16px" }}
      >
        <div className="panel-header">
          <div>
            <Text className="panel-eyebrow">
              ADJUSTMENT LOG
            </Text>

            <Text as="h2">
              Inventory corrections
            </Text>
          </div>
        </div>

        {adjustmentLog.length === 0 ? (
          <div className="products-empty">
            <Icon name="sliders" size={28} />

            <Text as="h3">
              No adjustments yet
            </Text>

            <Text>
              Confirm an adjustment above and it will appear here.
            </Text>
          </div>
        ) : (
          <div className="movement-table">
            <div className="table-row table-head">
              <span>SKU</span>
              <span>PRODUCT</span>
              <span>LOCATION</span>
              <span>COUNTED</span>
              <span>DELTA</span>
            </div>

            {adjustmentLog.map((item) => (
              <div
                className="table-row"
                key={item.id}
              >
                <span className="mono">
                  {item.sku}
                </span>

                <span>
                  <b>{item.product}</b>
                </span>

                <span>
                  {item.location}
                </span>

                <span>
                  {item.counted}
                </span>

                <span
                  className={
                    item.delta > 0
                      ? "positive mono"
                      : item.delta < 0
                      ? "negative mono"
                      : "mono"
                  }
                >
                  {item.delta > 0 ? "+" : ""}
                  {item.delta}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}