const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

// POST /api/adjustments  Body: { sku, location?, countedQuantity }
async function createAdjustment(req, res) {
  try {
    const { sku, location, countedQuantity } = req.body;
    if (!sku || countedQuantity === undefined) {
      return res.status(400).json({ error: 'sku and countedQuantity are required' });
    }

    const product = await Product.findOne({ sku });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const counted = Number(countedQuantity);
    if (Number.isNaN(counted) || counted < 0) {
      return res.status(400).json({ error: 'countedQuantity must be a non-negative number' });
    }

    const recorded = product.stockQty;
    const delta = counted - recorded;

    product.stockQty = counted;
    if (location) product.location = location;
    await product.save();

    const movement = await StockMovement.create({
      product_id: product._id,
      warehouse_id: product.warehouse_id,
      qty_change: delta,
      type: 'adjustment',
    });

    res.status(201).json({
      id: movement._id.toString(),
      product: product.name,
      sku: product.sku,
      location: product.location,
      recorded,
      counted,
      delta,
    });
  } catch (error) {
    console.error('createAdjustment error:', error);
    res.status(400).json({ error: 'Failed to create adjustment' });
  }
}

module.exports = { createAdjustment };