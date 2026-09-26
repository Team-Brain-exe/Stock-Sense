const express = require('express');
const { getDashboardSummary } = require('../controllers/dashboard.controller');

const router = express.Router();

// GET /api/dashboard/summary
router.get('/summary', getDashboardSummary);

module.exports = router;
