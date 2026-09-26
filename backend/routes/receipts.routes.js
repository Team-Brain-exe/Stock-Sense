const express = require('express');
const { createReceipt } = require('../controllers/receipt.controller');

const router = express.Router();

// POST /api/receipts
router.post('/', createReceipt);

module.exports = router;
