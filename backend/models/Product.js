const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    stockQty: { type: Number, required: true, default: 0 },
    warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    // sparse so existing/older products without a sku don't collide on the
    // unique index — only enforced unique once a sku is actually set.
    sku: { type: String, unique: true, sparse: true },
    // Used by the low-stock alert check: stockQty < reorder_threshold.
    reorder_threshold: { type: Number, required: true, default: 10 },
    // Free-text bay/zone label (e.g. "Central / A-04"). Transfers move this
    // field rather than changing warehouse_id or total stock.
    location: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);