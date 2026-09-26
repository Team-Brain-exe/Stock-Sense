// NOTE: dashboard.routes.js / dashboard.controller.js are NOT in the
// original file structure doc — no one was assigned this file. Built to
// match the exact contract documented at the top of Dashboard.jsx. Flag
// this addition to the team since it's a new file, not a stub being filled.

const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const DeliveryOrder = require('../models/DeliveryOrder');

async function getDashboardSummary(req, res) {
  try {
    const products = await Product.find();
    const totalStock = products.reduce((sum, p) => sum + p.stockQty, 0);
    const lowStock = products.filter((p) => p.stockQty < p.reorder_threshold);

    const pendingDeliveries = await DeliveryOrder.countDocuments({ status: { $ne: 'Done' } });

    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const transfersScheduled = await StockMovement.countDocuments({
      type: 'transfer',
      createdAt: { $gte: since24h },
    });
    const receiptsRecent = await StockMovement.countDocuments({
      type: 'receipt',
      createdAt: { $gte: since24h },
    });

    const kpis = [
      {
        label: 'Total products in stock',
        value: totalStock.toLocaleString(),
        icon: 'package',
        colorState: 'positive',
        delta: '',
        detail: `${products.length} SKUs`,
      },
      {
        label: 'Low / out of stock',
        value: String(lowStock.length).padStart(2, '0'),
        icon: 'alert',
        colorState: lowStock.length > 0 ? 'danger' : 'positive',
        delta: `${lowStock.filter((p) => p.stockQty === 0).length} critical`,
        detail: `${lowStock.length} below threshold`,
      },
      {
        label: 'Pending receipts (24h)',
        value: String(receiptsRecent).padStart(2, '0'),
        icon: 'receipt',
        colorState: 'warning',
        delta: '',
        detail: 'last 24 hours',
      },
      {
        label: 'Pending deliveries',
        value: String(pendingDeliveries).padStart(2, '0'),
        icon: 'truck',
        colorState: 'neutral',
        delta: '',
        detail: 'not yet Done',
      },
      {
        label: 'Transfers scheduled (24h)',
        value: String(transfersScheduled).padStart(2, '0'),
        icon: 'arrows',
        colorState: 'positive',
        delta: '',
        detail: 'last 24 hours',
      },
    ];

    const criticalStock = lowStock
      .sort((a, b) => (a.stockQty - a.reorder_threshold) - (b.stockQty - b.reorder_threshold))
      .slice(0, 6)
      .map((p) => ({
        sku: p.sku,
        name: p.name,
        stock: p.stockQty,
        threshold: p.reorder_threshold,
        fill: `${Math.min(100, Math.round((p.stockQty / Math.max(p.reorder_threshold, 1)) * 100))}%`,
      }));

    const movements24h = await StockMovement.find({ createdAt: { $gte: since24h } });
    const bars = new Array(24).fill(0);
    const now = Date.now();
    movements24h.forEach((m) => {
      const hoursAgo = Math.floor((now - new Date(m.createdAt).getTime()) / (60 * 60 * 1000));
      const bucket = 23 - hoursAgo;
      if (bucket >= 0 && bucket < 24) bars[bucket] += Math.abs(m.qty_change);
    });
    const maxBar = Math.max(...bars, 1);
    const barsPct = bars.map((v) => Math.round((v / maxBar) * 100));
    const throughputTotal = bars.reduce((sum, v) => sum + v, 0);

    res.json({
      kpis,
      criticalStock,
      throughput: { total: throughputTotal.toLocaleString(), deltaLabel: '' },
      bars: barsPct,
    });
  } catch (error) {
    console.error('getDashboardSummary error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
}

module.exports = { getDashboardSummary };
