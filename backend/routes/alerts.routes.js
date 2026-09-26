const express = require('express');
const { getAlerts } = require('../controllers/alert.controller');

const router = express.Router();

// GET /api/alerts
router.get('/', getAlerts);

module.exports = router;
