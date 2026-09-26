require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');

const app = express();

app.use(express.json());

// Connect to MongoDB
connectDB();

// Product routes
const productRoutes = require('./routes/products.routes');

app.use('/api/products', productRoutes);

// Movement routes
const movementRoutes = require('./routes/movements.routes');

app.use('/api/movements', movementRoutes);

// Analytics routes (forecast history, warehouse stock summary)
const analyticsRoutes = require('./routes/analytics.routes');

app.use('/api', analyticsRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});