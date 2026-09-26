const mongoose = require('mongoose');

// Matches the fields Deliveries.jsx reads directly off each delivery object:
// id, customer, items, units, warehouse, eta, status, progress, product (sku).
const deliveryOrderSchema = new mongoose.Schema(
  {
    customer: { type: String, required: true },
    product: { type: String, required: true }, // product SKU, matches Deliveries.jsx's `product` field
    quantity: { type: Number, required: true },
    warehouse: { type: String, required: true }, // warehouse display name, as the frontend sends it
    items: { type: Number, default: 1 },
    units: { type: Number, required: true },
    eta: { type: String, default: 'Pending schedule' },
    status: {
      type: String,
      enum: ['Waiting', 'Packing', 'Ready', 'Done'],
      default: 'Waiting',
    },
    progress: { type: Number, default: 0, min: 0, max: 3 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DeliveryOrder', deliveryOrderSchema);
