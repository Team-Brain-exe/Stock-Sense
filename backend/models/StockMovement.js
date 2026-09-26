const mongoose = require('mongoose');

// NOTE: this used to carry two parallel field sets — an old productId/quantity
// pair alongside the new product_id/qty_change pair — left over from the
// SQLite -> MongoDB migration. createMovement (movement.controller.js) has
// only ever written the new fields, so the old ones were always empty on any
// document created through the real API. Removed here since nothing reads
// or writes them anymore.
const stockMovementSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },

    warehouse_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },

    // Signed change applied directly to Product.stockQty (see
    // movement.controller.js createMovement). Negative for deliveries and
    // outgoing adjustments, positive for receipts and incoming adjustments.
    // Zero for transfers, which move location rather than total quantity.
    qty_change: {
      type: Number,
      required: true,
    },

    type: {
      type: String,
      enum: ['delivery', 'receipt', 'transfer', 'adjustment'],
      required: true,
    },

    user_id: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StockMovement', stockMovementSchema);