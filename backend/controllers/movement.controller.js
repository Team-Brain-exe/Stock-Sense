const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');

// GET /api/movements
async function getMovements(req, res) {
  try {
    const movements = await StockMovement.find()
      .sort({ createdAt: -1 });

    res.json(movements);
  } catch (error) {
    console.error('getMovements error:', error);
    res.status(500).json({
      error: 'Failed to fetch stock movements',
    });
  }
}

// POST /api/movements
async function createMovement(req, res) {
  try {
    const {
      product_id,
      type,
      qty_change,
      warehouse_id,
      user_id,
    } = req.body;

    if (
      !product_id ||
      !type ||
      qty_change === undefined ||
      !warehouse_id
    ) {
      return res.status(400).json({
        error:
          'product_id, type, qty_change and warehouse_id are required',
      });
    }

    const product = await Product.findById(product_id);

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
      });
    }

    const change = Number(qty_change);

    if (Number.isNaN(change)) {
      return res.status(400).json({
        error: 'qty_change must be a number',
      });
    }

    const newStock = product.stockQty + change;

    if (newStock < 0) {
      return res.status(400).json({
        error: 'Stock cannot go below zero',
      });
    }

    // Update product stock
    product.stockQty = newStock;
    await product.save();

    // Create movement record using the new structure
    const movement = await StockMovement.create({
      product_id,
      type,
      qty_change: change,
      warehouse_id,
      user_id,
    });

    res.status(201).json({
      message: 'Stock movement created successfully',
      movement,
      currentStock: product.stockQty,
    });
  } catch (error) {
    console.error('createMovement error:', error);

    res.status(400).json({
      error: 'Failed to create stock movement',
    });
  }
}

module.exports = {
  getMovements,
  createMovement,
};