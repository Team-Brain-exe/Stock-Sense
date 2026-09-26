// NOTE: Receipts.jsx has no API calls yet (local state only). Sensible
// design following movement.controller.js's convention; flag to Harisha
// that the page needs wiring to actually call this.

const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

// POST /api/receipts  Body: { supplier, items: [{ sku, quantity }] }
async function createReceipt(req, res) {
  try {
    const { supplier, items } = req.body;
    if (!supplier || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'supplier and a non-empty items array are required' });
    }

    const results = [];
    for (const item of items) {
      const product = await Product.findOne({ sku: item.sku });
      if (!product) return res.status(404).json({ error: `Product not found for sku ${item.sku}` });

      const change = Number(item.quantity);
      if (Number.isNaN(change) || change <= 0) {
        return res.status(400).json({ error: `Invalid quantity for sku ${item.sku}` });
      }

      product.stockQty += change;
      await product.save();

      const movement = await StockMovement.create({
        product_id: product._id,
        warehouse_id: product.warehouse_id,
        qty_change: change,
        type: 'receipt',
      });

      results.push({
        sku: product.sku,
        name: product.name,
        quantityReceived: change,
        newStock: product.stockQty,
        movementId: movement._id.toString(),
      });
    }

    res.status(201).json({
      id: `RCT-${Date.now()}`,
      supplier,
      items: results,
      totalUnits: results.reduce((sum, r) => sum + r.quantityReceived, 0),
      status: 'Confirmed',
    });
  } catch (error) {
    console.error('createReceipt error:', error);
    res.status(400).json({ error: 'Failed to create receipt' });
  }
}

module.exports = { createReceipt };
