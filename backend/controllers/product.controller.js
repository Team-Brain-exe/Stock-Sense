const Product = require('../models/Product');

// GET /api/products
async function getProducts(req, res) {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error('getProducts error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}

// GET /api/products/:id
async function getProductById(req, res) {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('getProductById error:', error);
    res.status(400).json({ error: 'Invalid product ID' });
  }
}

// GET /api/products/search?q=steel
async function searchProducts(req, res) {
  try {
    const query = req.query.q || '';

    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
      ],
    }).sort({ name: 1 });

    res.json(products);
  } catch (error) {
    console.error('searchProducts error:', error);
    res.status(500).json({ error: 'Failed to search products' });
  }
}

// POST /api/products
async function createProduct(req, res) {
  try {
    const { name, category, stockQty, warehouse_id, sku, reorder_threshold, location } = req.body;

    if (!name || !category || !warehouse_id) {
      return res.status(400).json({
        error: 'name, category and warehouse_id are required',
      });
    }

    const product = await Product.create({
      name,
      category,
      stockQty: stockQty || 0,
      warehouse_id,
      ...(sku !== undefined && { sku }),
      ...(reorder_threshold !== undefined && { reorder_threshold }),
      ...(location !== undefined && { location }),
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('createProduct error:', error);
    res.status(400).json({ error: 'Failed to create product' });
  }
}

// PATCH /api/products/:id
async function updateProduct(req, res) {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('updateProduct error:', error);
    res.status(400).json({ error: 'Failed to update product' });
  }
}

// DELETE /api/products/:id
async function deleteProduct(req, res) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      message: 'Product deleted successfully',
      product,
    });
  } catch (error) {
    console.error('deleteProduct error:', error);
    res.status(400).json({ error: 'Invalid product ID' });
  }
}

module.exports = {
  getProducts,
  getProductById,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};