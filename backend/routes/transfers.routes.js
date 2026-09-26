const express = require('express');
const { createTransfer } = require('../controllers/transfer.controller');

const router = express.Router();

// POST /api/transfers
router.post('/', createTransfer);

module.exports = router;
