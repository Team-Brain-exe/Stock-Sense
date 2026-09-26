/**
 * Live end-to-end check for the two analytics endpoints, run against the
 * REAL server (server.js) instead of the standalone test harness.
 *
 * Unlike scripts/test-analytics-local.js, this does NOT spin up its own
 * Express app. It assumes:
 *   1. Your real server is already running (node server.js / npm start)
 *   2. MONGO_URI points at the same database the server is using
 *
 * There's currently no POST route for Warehouse, so this script creates
 * the warehouse directly via the Mongoose model, then uses the real
 * POST /api/products and POST /api/movements endpoints for everything else
 * — so the movements are created exactly the way a real client would.
 *
 * Usage:
 *   1. Terminal A: MONGO_URI=<your uri> node server.js
 *   2. Terminal B: MONGO_URI=<same uri> SERVER_URL=http://localhost:5000 \
 *        node scripts/verify-analytics-live.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Warehouse = require('../models/Warehouse');
const StockMovement = require('../models/StockMovement');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/stocksense_test';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to', MONGO_URI);

  // 1. Create a warehouse directly (no API route for this yet)
  const warehouse = await Warehouse.create({ name: 'Verify Warehouse', location: 'Bengaluru' });
  console.log('Created warehouse', warehouse._id.toString());

  // 2. Create a product through the real API
  const productRes = await fetch(`${SERVER_URL}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Verify Steel Rods',
      category: 'Steel',
      stockQty: 200,
      warehouse_id: warehouse._id.toString(),
    }),
  });
  if (!productRes.ok) {
    throw new Error(`Product create failed: ${productRes.status} ${await productRes.text()}`);
  }
  const product = await productRes.json();
  console.log('Created product', product._id, 'starting stockQty:', product.stockQty);

  // 3. Create delivery movements over the last several days through the
  //    real movements API — qty_change must be negative for deliveries,
  //    per how createMovement subtracts it from stockQty.
  const dailyQty = [5, 8, 3, 0, 12, 6, 4]; // last 7 days, index 0 = 6 days ago
  let expectedStock = product.stockQty;

  for (let i = 0; i < dailyQty.length; i++) {
    const qty = dailyQty[i];
    if (qty === 0) continue; // no movement that day

    const movRes = await fetch(`${SERVER_URL}/api/movements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: product._id,
        type: 'delivery',
        qty_change: -qty,
        warehouse_id: warehouse._id.toString(),
        user_id: 'verify-script',
      }),
    });
    if (!movRes.ok) {
      throw new Error(`Movement create failed: ${movRes.status} ${await movRes.text()}`);
    }
    expectedStock -= qty;
  }
  console.log('Expected stockQty after deliveries:', expectedStock);
  console.log('Daily delivered quantities (oldest to newest, 0 = no movement):', dailyQty);

  // NOTE: every movement above lands with today's createdAt (the API has no
  // backdating option), so it only proves the write -> read path works, not
  // day-by-day bucketing. To check bucketing accuracy you'd need to insert
  // StockMovement docs directly with explicit createdAt dates, the way
  // test-analytics-local.js does.

  // 3b. DEBUG: read back the raw saved documents directly, bypassing the
  //     API, so we can see exactly what field names/values actually landed
  //     in the database.
  const rawDocs = await StockMovement.find({ type: 'delivery' })
    .sort({ createdAt: -1 })
    .limit(dailyQty.filter((q) => q > 0).length)
    .lean();
  console.log('\nDEBUG: raw StockMovement docs just written:');
  console.log(JSON.stringify(rawDocs, null, 2));

  // 4. Hit the real forecast-history endpoint
  const historyRes = await fetch(`${SERVER_URL}/api/products/${product._id}/history?days=7`);
  const history = await historyRes.json();
  console.log('\nGET /api/products/:id/history?days=7 ->');
  console.log(JSON.stringify(history, null, 2));

  const totalQtyOut = (history.days || []).reduce((sum, d) => sum + d.qtyOut, 0);
  const expectedTotal = dailyQty.reduce((a, b) => a + b, 0);
  console.log(`\nSanity check: total qtyOut across days = ${totalQtyOut}, expected = ${expectedTotal}`);
  console.log(totalQtyOut === expectedTotal ? 'PASS: totals match' : 'FAIL: totals do not match');

  // 5. Hit the real warehouse stock-summary endpoint
  const summaryRes = await fetch(`${SERVER_URL}/api/warehouses/stock-summary`);
  const summary = await summaryRes.json();
  console.log('\nGET /api/warehouses/stock-summary ->');
  console.log(JSON.stringify(summary, null, 2));

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});