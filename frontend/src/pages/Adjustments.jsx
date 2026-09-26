import { useState } from "react";
import Icon from "../components/Icon.jsx";
import { Button, Text } from "../components/ui.jsx";

const products = [
  {
    id: 1,
    name: "Wireless Keyboard",
    sku: "KB-001",
    stock: 124,
  },
  {
    id: 2,
    name: "Office Chair",
    sku: "CH-024",
    stock: 18,
  },
  {
    id: 3,
    name: "USB-C Cable",
    sku: "UC-102",
    stock: 56,
  },
  {
    id: 4,
    name: "Laptop Stand",
    sku: "LS-014",
    stock: 8,
  },
];

const locations = [
  "US-East Warehouse",
  "US-West Warehouse",
  "Central Warehouse",
];

export default function Adjustments() {
  const [productId, setProductId] = useState("");
  const [location, setLocation] = useState("");
  const [countedQuantity, setCountedQuantity] = useState("");
  const [message, setMessage] = useState("");
  const [adjustmentLog, setAdjustmentLog] = useState([]);

  const selectedProduct = products.find(
    (product) => product.id === Number(productId)
  );

  const currentStock = selectedProduct
    ? selectedProduct.stock
    : 0;

  const delta =
    countedQuantity === ""
      ? 0
      : Number(countedQuantity) - currentStock;

  const confirmAdjustment = () => {
    if (!productId) {
      setMessage("Select a product.");
      return;
    }

    if (!location) {
      setMessage("Select a location.");
      return;
    }

    if (
      countedQuantity === "" ||
      Number(countedQuantity) < 0
    ) {
      setMessage("Enter a valid counted quantity.");
      return;
    }

    const newAdjustment = {
      id: Date.now(),
      product: selectedProduct.name,
      sku: selectedProduct.sku,
      location: location,
      recorded: currentStock,
      counted: Number(countedQuantity),
      delta: delta,
    };

    setAdjustmentLog((current) => [
      newAdjustment,
      ...current,
    ]);

    setMessage(
      `Adjustment confirmed for ${selectedProduct.name}. Stock changed by ${
        delta > 0 ? "+" : ""
      }${delta} units.`
    );

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
        >
          <Icon name="check" size={16} />
          Confirm adjustment
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