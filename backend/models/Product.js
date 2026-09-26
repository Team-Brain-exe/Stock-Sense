const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    stockQty: { type: Number, required: true, default: 0 },
    warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
