const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const Warehouse = require('../models/Warehouse');

// GET /api/products/:id/history?days=14
function getProductForecastHistory(req, res) {
  const days = parseInt(req.query.days, 10) || 14;
  const { id } = req.params;

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  StockMovement.aggregate([
    {
      $match: {
        product_id: new (require('mongoose').Types.ObjectId)(id),
        type: 'delivery',
        createdAt: { $gte: since },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        qtyOut: { $sum: { $abs: '$qty_change' } },
      },
    },
  ])
    .then((rows) => {
      const byDate = new Map(rows.map((r) => [r._id, r.qtyOut]));
      const daysArr = [];
      const cursor = new Date(since);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      while (cursor <= today) {
        const dateStr = cursor.toISOString().slice(0, 10);
        daysArr.push({ date: dateStr, qtyOut: byDate.get(dateStr) || 0 });
        cursor.setDate(cursor.getDate() + 1);
      }
      res.json({ productId: id, days: daysArr });
    })
    .catch((err) => {
      console.error('getProductForecastHistory error:', err);
      res.status(500).json({ error: 'Failed to fetch forecast history' });
    });
}

// GET /api/warehouses/stock-summary
async function getWarehouseStockSummary(req, res) {
  try {
    const warehouses = await Warehouse.find();
    const products = await Product.find();

    const result = warehouses.map((w) => {
      const wProducts = products.filter((p) => String(p.warehouse_id) === String(w._id));
      const byCategory = {};
      wProducts.forEach((p) => {
        byCategory[p.category] = (byCategory[p.category] || 0) + p.stockQty;
      });
      return {
        warehouseId: w._id.toString(),
        name: w.name,
        categories: Object.entries(byCategory).map(([category, stockQty]) => ({ category, stockQty })),
      };
    });

    res.json({ warehouses: result });
  } catch (error) {
    console.error('getWarehouseStockSummary error:', error);
    res.status(500).json({ error: 'Failed to fetch warehouse stock summary' });
  }
}

module.exports = { getProductForecastHistory, getWarehouseStockSummary };
