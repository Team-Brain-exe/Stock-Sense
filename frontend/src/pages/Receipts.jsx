import { useState } from "react";
import Icon from "../components/Icon.jsx";
import BarcodeScanner from "../components/BarcodeScanner.jsx";
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

export default function Receipts() {
  const [supplier, setSupplier] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [receiptItems, setReceiptItems] = useState([]);
  const [message, setMessage] = useState("");

  // Barcode scanner result
  const handleBarcodeScan = (code) => {
    const scannedCode = code.trim().toLowerCase();

    const product = products.find(
      (item) => item.sku.toLowerCase() === scannedCode
    );

    if (!product) {
      setMessage(`No product found for barcode/SKU: ${code}`);
      return;
    }

    setProductId(String(product.id));
    setMessage(`${product.name} selected.`);
  };

  // Add selected product to receipt
  const addProduct = () => {
    if (!productId || !quantity || Number(quantity) <= 0) {
      setMessage("Select a product and enter a valid quantity.");
      return;
    }

    const product = products.find(
      (item) => item.id === Number(productId)
    );

    if (!product) {
      setMessage("Product not found.");
      return;
    }

    const existingItem = receiptItems.find(
      (item) => item.id === product.id
    );

    if (existingItem) {
      setReceiptItems((current) =>
        current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + Number(quantity),
              }
            : item
        )
      );
    } else {
      setReceiptItems((current) => [
        ...current,
        {
          ...product,
          quantity: Number(quantity),
        },
      ]);
    }

    setProductId("");
    setQuantity("");
    setMessage("");
  };

  // Remove product from receipt
  const removeProduct = (id) => {
    setReceiptItems((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  // Confirm receipt
  const confirmReceipt = () => {
    if (!supplier.trim()) {
      setMessage("Enter a supplier name.");
      return;
    }

    if (receiptItems.length === 0) {
      setMessage("Add at least one product.");
      return;
    }

    setMessage(
      `Receipt confirmed. ${receiptItems.length} product${
        receiptItems.length > 1 ? "s" : ""
      } added to stock.`
    );

    setSupplier("");
    setProductId("");
    setQuantity("");
    setReceiptItems([]);
  };

  const totalUnits = receiptItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <Text className="eyebrow">INBOUND OPERATIONS</Text>

          <Text as="h1" className="page-title">
            Receipts
          </Text>

          <Text className="page-subtitle">
            Receive incoming inventory and add products to available stock.
          </Text>
        </div>

        <Button
          className="primary-button"
          onClick={confirmReceipt}
        >
          <Icon name="check" size={16} />
          Confirm receipt
        </Button>
      </header>

      {message && (
        <div className="success-banner">
          <Icon name="check" size={16} />
          {message}
        </div>
      )}

      <div className="split-layout">
        {/* LEFT SIDE */}
        <section className="panel transfer-form">
          <div className="panel-header">
            <div>
              <Text className="panel-eyebrow">
                RECEIPT DETAILS
              </Text>

              <Text as="h2">
                New receipt
              </Text>
            </div>
          </div>

          {/* Supplier */}
          <label className="form-field">
            <span>Supplier</span>

            <input
              type="text"
              placeholder="Enter supplier name"
              value={supplier}
              onChange={(event) =>
                setSupplier(event.target.value)
              }
            />
          </label>

          {/* Product + Quantity */}
          <div className="form-grid">
            <label className="form-field">
              <span>Product</span>

              <select
                value={productId}
                onChange={(event) =>
                  setProductId(event.target.value)
                }
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
              <span>Quantity</span>

              <input
                type="number"
                min="1"
                placeholder="0"
                value={quantity}
                onChange={(event) =>
                  setQuantity(event.target.value)
                }
              />
            </label>
          </div>

          <Button
            type="button"
            className="secondary-button full-button"
            onClick={addProduct}
          >
            <Icon name="plus" size={15} />
            Add product to receipt
          </Button>

          {/* BARCODE SCANNER */}
          <div style={{ marginTop: "20px" }}>
            <BarcodeScanner onScan={handleBarcodeScan} />
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className="panel process-panel">
          <div className="process-top">
            <Text className="panel-eyebrow">
              RECEIPT PREVIEW
            </Text>

            <Text as="h2">
              Incoming stock
            </Text>

            <Text>
              Review the products before confirming the receipt.
            </Text>
          </div>

          <div className="process-steps">
            {/* Step 1 */}
            <div className="process-step complete">
              <span>01</span>

              <div>
                <b>Supplier</b>

                <small>
                  {supplier || "Waiting for supplier"}
                </small>
              </div>
            </div>

            {/* Step 2 */}
            <div
              className={`process-step ${
                receiptItems.length > 0
                  ? "complete"
                  : ""
              }`}
            >
              <span>02</span>

              <div>
                <b>Products</b>

                <small>
                  {receiptItems.length > 0
                    ? `${receiptItems.length} product${
                        receiptItems.length > 1
                          ? "s"
                          : ""
                      } added`
                    : "No products added"}
                </small>
              </div>
            </div>

            {/* Step 3 */}
            <div className="process-step">
              <span>03</span>

              <div>
                <b>Stock update</b>

                <small>
                  Confirm receipt to increase stock
                </small>
              </div>
            </div>
          </div>

          {/* Metrics */}
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

              <b>
                {receiptItems.length > 0
                  ? "READY"
                  : "DRAFT"}
              </b>
            </div>
          </div>
        </section>
      </div>

      {/* RECEIPT ITEMS */}
      <section
        className="panel activity-panel"
        style={{ marginTop: "16px" }}
      >
        <div className="panel-header">
          <div>
            <Text className="panel-eyebrow">
              RECEIPT ITEMS
            </Text>

            <Text as="h2">
              Products being received
            </Text>
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
            <div
              className="table-row"
              key={item.id}
            >
              <span className="mono">
                {item.sku}
              </span>

              <span>
                <b>{item.name}</b>
              </span>

              <span>
                {item.stock}
              </span>

              <span className="positive mono">
                +{item.quantity}
              </span>

              <span>
                <Button
                  className="secondary-button"
                  onClick={() =>
                    removeProduct(item.id)
                  }
                >
                  Remove
                </Button>
              </span>
            </div>
          ))}

          {receiptItems.length === 0 && (
            <div className="products-empty">
              <Icon name="inbox" size={28} />

              <Text as="h3">
                No products added
              </Text>

              <Text>
                Select a product and quantity above.
              </Text>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}