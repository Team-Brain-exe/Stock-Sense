const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema(
  {
    // New structure
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },

    warehouse_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
    },

    qty_change: {
      type: Number,
    },

    user_id: {
      type: String,
    },

    // Existing database structure
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },

    quantity: {
      type: Number,
    },

    // Common field
    type: {
      type: String,
      enum: ['delivery', 'receipt', 'transfer', 'adjustment'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StockMovement', stockMovementSchema);