import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ForecastChart({ productId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!productId) {
      setHistory([]);
      setLoading(false);
      return;
    }

    const loadHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/products/${productId}/history?days=14`
        );

        if (!response.ok) {
          throw new Error("Failed to load product history.");
        }

        const data = await response.json();

        setHistory(data.days || []);
      } catch (err) {
        console.error(err);
        setError("Could not load forecast data.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [productId]);

  const chartData = useMemo(() => {
    if (history.length === 0) return [];

    const values = history.map((item) => Number(item.qtyOut) || 0);

    const averageChange =
      values.length > 1
        ? (values[values.length - 1] - values[0]) /
          (values.length - 1)
        : 0;

    return history.map((item, index) => ({
      date: item.date.slice(5),
      outgoing: Number(item.qtyOut) || 0,
      forecast:
        Math.max(
          0,
          values[values.length - 1] +
            averageChange * (index - (values.length - 1))
        ),
    }));
  }, [history]);

  if (!productId) {
    return (
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="panel-eyebrow">DEMAND FORECAST</p>
            <h2>Outgoing stock</h2>
          </div>
        </div>

        <div className="products-empty">
          <h3>Select a product</h3>
          <p>
            Select a product to view its 14-day outgoing stock history.
          </p>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="panel-eyebrow">DEMAND FORECAST</p>
            <h2>Outgoing stock</h2>
          </div>
        </div>

        <div className="products-empty">
          <p>Loading forecast data...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="panel-eyebrow">DEMAND FORECAST</p>
            <h2>Outgoing stock</h2>
          </div>
        </div>

        <div className="products-empty">
          <h3>Unable to load forecast</h3>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  if (chartData.length === 0) {
    return (
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="panel-eyebrow">DEMAND FORECAST</p>
            <h2>Outgoing stock</h2>
          </div>
        </div>

        <div className="products-empty">
          <h3>No history available</h3>
          <p>No outgoing stock data is available for this product.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="panel-eyebrow">DEMAND FORECAST</p>
          <h2>Outgoing stock</h2>
          <p>14-day stock movement with a simple trend projection.</p>
        </div>
      </div>

      <div style={{ width: "100%", height: 320, marginTop: "20px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 10,
              right: 20,
              left: 0,
              bottom: 10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="date" />

            <YAxis allowDecimals={false} />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="outgoing"
              name="Outgoing stock"
              strokeWidth={2}
              dot={{ r: 3 }}
            />

            <Line
              type="monotone"
              dataKey="forecast"
              name="Trend"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}