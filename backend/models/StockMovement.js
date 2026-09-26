const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    type: {
      type: String,
      enum: ['delivery', 'receipt', 'transfer', 'adjustment'],
      required: true,
    },
    quantity: { type: Number, required: true },
  },
  { timestamps: true } // gives us createdAt, used by the forecast history aggregation
);

module.exports = mongoose.model('StockMovement', stockMovementSchema);
