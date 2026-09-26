/**
 * Standalone local test harness for the analytics endpoints.
 * Doesn't touch server.js or seed/seed.js (not your files) — just spins up
 * a minimal Express app with sample data so you can verify your two
 * endpoints work before the real server/seed scripts are ready.
 *
 * Usage:
 *   1. npm install express mongoose dotenv   (if not already installed)
 *   2. Set MONGO_URI in a .env file, or edit the fallback below
 *   3. node scripts/test-analytics-local.js
 *   4. curl http://localhost:4000/api/warehouses/stock-summary
 *      curl http://localhost:4000/api/products/<printed-id>/history?days=14
 */

require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');

const Product = require('../backend/models/Product');
const Warehouse = require('../backend/models/Warehouse');
const StockMovement = require('../backend/models/StockMovement');
const analyticsRoutes = require('../backend/routes/analytics.routes');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/stocksense_test';

async function seedSampleData() {
  await Warehouse.deleteMany({});
  await Product.deleteMany({});
  await StockMovement.deleteMany({});

  const warehouse = await Warehouse.create({ name: 'Main Warehouse', location: 'Bengaluru' });

  const steel = await Product.create({
    name: 'Steel Rods',
    category: 'Steel',
    stockQty: 340,
    warehouse_id: warehouse._id,
  });

  const furniture = await Product.create({
    name: 'Office Chair',
    category: 'Furniture',
    stockQty: 120,
    warehouse_id: warehouse._id,
  });

  // Backdated stock movements over the last 14 days for the forecast endpoint
  const movements = [];
  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    movements.push({
      productId: steel._id,
      type: 'delivery',
      quantity: Math.floor(Math.random() * 15) + 1,
      createdAt: date,
    });
  }
  // insertMany with explicit createdAt requires timestamps:false override, so set directly
  for (const m of movements) {
    const doc = new StockMovement(m);
    doc.createdAt = m.createdAt;
    await doc.save();
  }

  console.log('--- Seeded sample data ---');
  console.log('Warehouse ID:', warehouse._id.toString());
  console.log('Steel Product ID:', steel._id.toString());
  console.log('Furniture Product ID:', furniture._id.toString());
  console.log('Try: GET /api/products/' + steel._id.toString() + '/history?days=14');
  console.log('--------------------------');
}

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to', MONGO_URI);

  await seedSampleData();

  const app = express();
  app.use('/api', analyticsRoutes);

  const PORT = process.env.TEST_PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Test server running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Test harness failed:', err);
  process.exit(1);
});
