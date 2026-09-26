import { useEffect, useState } from "react";
import Icon from "../components/Icon.jsx";
import BarcodeScanner from "../components/BarcodeScanner.jsx";
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

export default function Receipts() {
  const [products, setProducts] = useState(fallbackProducts);
  const [supplier, setSupplier] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [receiptItems, setReceiptItems] = useState([]);
  const [message, setMessage] = useState("");
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

  const handleBarcodeScan = (code) => {
    const scannedCode = code.trim().toLowerCase();
    const product = products.find((item) => item.sku.toLowerCase() === scannedCode);
    if (!product) {
      setMessage(`No product found for barcode/SKU: ${code}`);
      return;
    }
    setProductId(String(product.id));
    setMessage(`${product.name} selected.`);
  };

  const addProduct = () => {
    if (!productId || !quantity || Number(quantity) <= 0) {
      setMessage("Select a product and enter a valid quantity.");
      return;
    }
    const product = products.find((item) => String(item.id) === String(productId));
    if (!product) {
      setMessage("Product not found.");
      return;
    }
    const existingItem = receiptItems.find((item) => item.id === product.id);
    if (existingItem) {
      setReceiptItems((current) =>
        current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + Number(quantity) } : item
        )
      );
    } else {
      setReceiptItems((current) => [...current, { ...product, quantity: Number(quantity) }]);
    }
    setProductId("");
    setQuantity("");
    setMessage("");
  };

  const removeProduct = (id) => {
    setReceiptItems((current) => current.filter((item) => item.id !== id));
  };

  const confirmReceipt = async () => {
    if (!supplier.trim()) {
      setMessage("Enter a supplier name.");
      return;
    }
    if (receiptItems.length === 0) {
      setMessage("Add at least one product.");
      return;
    }

    setSubmitting(true);
    const result = await apiPost(
      "/receipts",
      {
        supplier,
        items: receiptItems.map((item) => ({ sku: item.sku, quantity: item.quantity })),
      },
      null
    );
    setSubmitting(false);

    if (result) {
      setMessage(
        `Receipt confirmed. ${receiptItems.length} product${
          receiptItems.length > 1 ? "s" : ""
        } added to stock.`
      );
    } else {
      setMessage("Receipt saved locally — backend not reachable, stock wasn't updated on the server.");
    }

    setSupplier("");
    setProductId("");
    setQuantity("");
    setReceiptItems([]);
  };

  const totalUnits = receiptItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <Text className="eyebrow">INBOUND OPERATIONS</Text>
          <Text as="h1" className="page-title">Receipts</Text>
          <Text className="page-subtitle">
            Receive incoming inventory and add products to available stock.
          </Text>
        </div>
        <Button className="primary-button" onClick={confirmReceipt} disabled={submitting}>
          <Icon name="check" size={16} />
          {submitting ? "Confirming…" : "Confirm receipt"}
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
              <Text className="panel-eyebrow">RECEIPT DETAILS</Text>
              <Text as="h2">New receipt</Text>
            </div>
          </div>

          <label className="form-field">
            <span>Supplier</span>
            <input
              type="text"
              placeholder="Enter supplier name"
              value={supplier}
              onChange={(event) => setSupplier(event.target.value)}
            />
          </label>

          <div className="form-grid">
            <label className="form-field">
              <span>Product</span>
              <select value={productId} onChange={(event) => setProductId(event.target.value)}>
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} — {product.sku}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Quantity</span>
              <input
                type="number"
                min="1"
                placeholder="0"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </label>
          </div>

          <Button type="button" className="secondary-button full-button" onClick={addProduct}>
            <Icon name="plus" size={15} />
            Add product to receipt
          </Button>

          <div style={{ marginTop: "20px" }}>
            <BarcodeScanner onScan={handleBarcodeScan} />
          </div>
        </section>

        <section className="panel process-panel">
          <div className="process-top">
            <Text className="panel-eyebrow">RECEIPT PREVIEW</Text>
            <Text as="h2">Incoming stock</Text>
            <Text>Review the products before confirming the receipt.</Text>
          </div>

          <div className="process-steps">
            <div className="process-step complete">
              <span>01</span>
              <div>
                <b>Supplier</b>
                <small>{supplier || "Waiting for supplier"}</small>
              </div>
            </div>
            <div className={`process-step ${receiptItems.length > 0 ? "complete" : ""}`}>
              <span>02</span>
              <div>
                <b>Products</b>
                <small>
                  {receiptItems.length > 0
                    ? `${receiptItems.length} product${receiptItems.length > 1 ? "s" : ""} added`
                    : "No products added"}
                </small>
              </div>
            </div>
            <div className="process-step">
              <span>03</span>
              <div>
                <b>Stock update</b>
                <small>Confirm receipt to increase stock</small>
              </div>
            </div>
          </div>

          <div className="order-metrics">
            <div>
              <p>PRODUCTS</p>
              <b>{receiptItems.length}</b>
            </div>
            <div>
              <p>UNITS</p>
              <b>{totalUnits}</b>
            </div>
            <div>
              <p>STATUS</p>
              <b>{receiptItems.length > 0 ? "READY" : "DRAFT"}</b>
            </div>
          </div>
        </section>
      </div>

      <section className="panel activity-panel" style={{ marginTop: "16px" }}>
        <div className="panel-header">
          <div>
            <Text className="panel-eyebrow">RECEIPT ITEMS</Text>
            <Text as="h2">Products being received</Text>
          </div>
        </div>

        <div className="movement-table">
          <div className="table-row table-head">
            <span>SKU</span>
            <span>PRODUCT</span>
            <span>AVAILABLE STOCK</span>
            <span>RECEIVING</span>
            <span></span>
          </div>

          {receiptItems.map((item) => (
            <div className="table-row" key={item.id}>
              <span className="mono">{item.sku}</span>
              <span><b>{item.name}</b></span>
              <span>{item.stock}</span>
              <span className="positive mono">+{item.quantity}</span>
              <span>
                <Button className="secondary-button" onClick={() => removeProduct(item.id)}>
                  Remove
                </Button>
              </span>
            </div>
          ))}

          {receiptItems.length === 0 && (
            <div className="products-empty">
              <Icon name="inbox" size={28} />
              <Text as="h3">No products added</Text>
              <Text>Select a product and quantity above.</Text>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}