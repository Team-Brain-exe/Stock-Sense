import { useEffect, useState } from "react";

export default function WarehouseHeatmap() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStockSummary = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/warehouses/stock-summary"
        );

        if (!response.ok) {
          throw new Error("Failed to load warehouse stock.");
        }

        const data = await response.json();

        setWarehouses(data.warehouses || []);
      } catch (err) {
        console.error(err);
        setError("Could not load warehouse stock data.");
      } finally {
        setLoading(false);
      }
    };

    loadStockSummary();
  }, []);

  const categories = [
    ...new Set(
      warehouses.flatMap((warehouse) =>
        warehouse.categories.map(
          (item) => item.category
        )
      )
    ),
  ];

  const getStock = (warehouse, category) => {
    const item = warehouse.categories.find(
      (entry) => entry.category === category
    );

    return item ? item.stockQty : 0;
  };

  const maxStock = Math.max(
    1,
    ...warehouses.flatMap((warehouse) =>
      warehouse.categories.map(
        (item) => item.stockQty
      )
    )
  );

  const getIntensity = (stock) => {
    if (stock === 0) return 0;

    return Math.max(
      0.15,
      stock / maxStock
    );
  };

  if (loading) {
    return (
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="panel-eyebrow">
              WAREHOUSE STOCK
            </p>

            <h2>Stock heatmap</h2>
          </div>
        </div>

        <div className="products-empty">
          <p>Loading warehouse stock...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="panel-eyebrow">
              WAREHOUSE STOCK
            </p>

            <h2>Stock heatmap</h2>
          </div>
        </div>

        <div className="products-empty">
          <h3>Unable to load data</h3>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  if (warehouses.length === 0) {
    return (
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="panel-eyebrow">
              WAREHOUSE STOCK
            </p>

            <h2>Stock heatmap</h2>
          </div>
        </div>

        <div className="products-empty">
          <h3>No warehouse data</h3>
          <p>
            No warehouse stock information is available.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="panel-eyebrow">
            WAREHOUSE STOCK
          </p>

          <h2>Stock heatmap</h2>

          <p>
            Stock levels across warehouses and categories.
          </p>
        </div>
      </div>

      <div
        style={{
          overflowX: "auto",
          marginTop: "20px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `180px repeat(${categories.length}, minmax(120px, 1fr))`,
            gap: "8px",
            minWidth: "600px",
          }}
        >
          {/* Header */}

          <div
            style={{
              fontWeight: 600,
              padding: "12px",
            }}
          >
            Warehouse
          </div>

          {categories.map((category) => (
            <div
              key={category}
              style={{
                fontWeight: 600,
                padding: "12px",
                textAlign: "center",
              }}
            >
              {category}
            </div>
          ))}

          {/* Warehouse rows */}

          {warehouses.map((warehouse) => (
            <div key={warehouse.warehouseId} style={{ display: "contents" }}>
              <div
                style={{
                  padding: "16px 12px",
                  fontWeight: 600,
                }}
              >
                {warehouse.name}
              </div>

              {categories.map((category) => {
                const stock = getStock(
                  warehouse,
                  category
                );

                const intensity =
                  getIntensity(stock);

                return (
                  <div
                    key={`${warehouse.warehouseId}-${category}`}
                    title={`${warehouse.name} — ${category}: ${stock} units`}
                    style={{
                      padding: "16px 12px",
                      textAlign: "center",
                      borderRadius: "8px",
                      backgroundColor: `rgba(37, 99, 235, ${intensity})`,
                      color:
                        intensity > 0.55
                          ? "white"
                          : "inherit",
                      fontWeight: 600,
                    }}
                  >
                    {stock}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginTop: "18px",
          fontSize: "12px",
        }}
      >
        <span>Low</span>

        <span
          style={{
            width: "20px",
            height: "12px",
            borderRadius: "3px",
            backgroundColor: "rgba(37, 99, 235, 0.15)",
          }}
        />

        <span
          style={{
            width: "20px",
            height: "12px",
            borderRadius: "3px",
            backgroundColor: "rgba(37, 99, 235, 0.5)",
          }}
        />

        <span
          style={{
            width: "20px",
            height: "12px",
            borderRadius: "3px",
            backgroundColor: "rgba(37, 99, 235, 1)",
          }}
        />

        <span>High</span>
      </div>
    </section>
  );
}