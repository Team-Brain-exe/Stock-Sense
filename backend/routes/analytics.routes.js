const express = require('express');
const router = express.Router();
const {
  getProductForecastHistory,
  getWarehouseStockSummary,
} = require('../controllers/analytics.controller');

// GET /api/products/:id/history?days=14
router.get('/products/:id/history', getProductForecastHistory);

// GET /api/warehouses/stock-summary
router.get('/warehouses/stock-summary', getWarehouseStockSummary);

module.exports = router;

// Mount in server.js with:
//   const analyticsRoutes = require('./routes/analytics.routes');
//   app.use('/api', analyticsRoutes);
