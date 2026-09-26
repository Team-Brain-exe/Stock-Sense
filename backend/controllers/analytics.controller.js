const mongoose = require('mongoose');
const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');

/**
 * GET /api/products/:id/history?days=14
 * Returns daily outgoing stock quantity for a product over the last N days.
 *
 * Response shape:
 * {
 *   "productId": "123",
 *   "days": [
 *     { "date": "2026-09-13", "qtyOut": 12 },
 *     ...
 *   ]
 * }
 */
async function getProductForecastHistory(req, res) {
  try {
    const { id } = req.params;
    const days = parseInt(req.query.days, 10) || 14;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid product id' });
    }

    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - (days - 1));

    const results = await StockMovement.aggregate([
      {
        $match: {
          productId: new mongoose.Types.ObjectId(id),
          type: 'delivery',
          createdAt: { $gte: since },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          qtyOut: { $sum: '$quantity' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Build a lookup so we can fill in zero-days with no movements
    const byDate = new Map(results.map((r) => [r._id, r.qtyOut]));

    const daysArr = [];
    const cursor = new Date(since);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    while (cursor <= today) {
      const dateStr = cursor.toISOString().slice(0, 10);
      daysArr.push({
        date: dateStr,
        qtyOut: byDate.get(dateStr) || 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    return res.json({
      productId: id,
      days: daysArr,
    });
  } catch (err) {
    console.error('getProductForecastHistory error:', err);
    return res.status(500).json({ error: 'Failed to fetch forecast history' });
  }
}

/**
 * GET /api/warehouses/stock-summary
 * Returns stock levels per warehouse per category.
 *
 * Response shape:
 * {
 *   "warehouses": [
 *     {
 *       "warehouseId": "1",
 *       "name": "Main Warehouse",
 *       "categories": [
 *         { "category": "Steel", "stockQty": 340 },
 *         ...
 *       ]
 *     }
 *   ]
 * }
 */
async function getWarehouseStockSummary(req, res) {
  try {
    const results = await Product.aggregate([
      {
        $group: {
          _id: { warehouseId: '$warehouse_id', category: '$category' },
          stockQty: { $sum: '$stockQty' },
        },
      },
      {
        $lookup: {
          from: 'warehouses',
          localField: '_id.warehouseId',
          foreignField: '_id',
          as: 'warehouse',
        },
      },
      {
        $unwind: { path: '$warehouse', preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: '$_id.warehouseId',
          name: { $first: '$warehouse.name' },
          categories: {
            $push: {
              category: '$_id.category',
              stockQty: '$stockQty',
            },
          },
        },
      },
      { $sort: { name: 1 } },
    ]);

    const warehouses = results.map((w) => ({
      warehouseId: String(w._id),
      name: w.name || 'Unknown Warehouse',
      categories: w.categories,
    }));

    return res.json({ warehouses });
  } catch (err) {
    console.error('getWarehouseStockSummary error:', err);
    return res.status(500).json({ error: 'Failed to fetch warehouse stock summary' });
  }
}

module.exports = {
  getProductForecastHistory,
  getWarehouseStockSummary,
};
