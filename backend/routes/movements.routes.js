const express = require('express');

const {
  getMovements,
  createMovement,
} = require('../controllers/movement.controller');

const router = express.Router();

// GET /api/movements
router.get('/', getMovements);

// POST /api/movements
router.post('/', createMovement);

module.exports = router;