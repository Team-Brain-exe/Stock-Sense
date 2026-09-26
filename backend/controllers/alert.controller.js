const Product = require('../models/Product');

async function getAlerts(req, res) {
  try {
    const lowStockProducts = await Product.find({
      $expr: { $lt: ['$stockQty', '$reorder_threshold'] },
    });

    const alerts = lowStockProducts.map((product) => ({
      id: `low-stock-${product._id.toString()}`,
      product: product.name,
      sku: product.sku,
      location: product.location,
      stock: product.stockQty,
      threshold: product.reorder_threshold,
    }));

    res.json({ alerts });
  } catch (error) {
    console.error('getAlerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
}

module.exports = { getAlerts };
