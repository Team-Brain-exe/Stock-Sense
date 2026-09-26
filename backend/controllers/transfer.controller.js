const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

async function createTransfer(req, res) {
  try {
    const { product, from, to, quantity } = req.body;
    if (!product || !from || !to || !quantity) {
      return res.status(400).json({ error: 'product, from, to and quantity are required' });
    }

    const productDoc = await Product.findOne({ sku: product });
    if (!productDoc) return res.status(404).json({ error: 'Product not found' });

    productDoc.location = to;
    await productDoc.save();

    const movement = await StockMovement.create({
      product_id: productDoc._id,
      warehouse_id: productDoc.warehouse_id,
      qty_change: 0,
      type: 'transfer',
    });

    res.status(201).json({
      id: movement._id.toString(),
      product,
      from,
      to,
      quantity: Number(quantity),
      status: 'Scheduled',
    });
  } catch (error) {
    console.error('createTransfer error:', error);
    res.status(400).json({ error: 'Failed to create transfer' });
  }
}

module.exports = { createTransfer };
