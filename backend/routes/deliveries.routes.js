const express = require('express');
const {
  getDeliveries,
  createDelivery,
  advanceDelivery,
} = require('../controllers/delivery.controller');

const router = express.Router();

// GET /api/deliveries
router.get('/', getDeliveries);

// POST /api/deliveries
router.post('/', createDelivery);

// PATCH /api/deliveries/:id/advance
router.patch('/:id/advance', advanceDelivery);

module.exports = router;
