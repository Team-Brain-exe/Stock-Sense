const express = require('express');
const { createAdjustment } = require('../controllers/adjustment.controller');

const router = express.Router();

// POST /api/adjustments
router.post('/', createAdjustment);

module.exports = router;
