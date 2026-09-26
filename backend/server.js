require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');

const app = express();

app.use(express.json());

connectDB();

const productRoutes = require('./routes/products.routes');
app.use('/api/products', productRoutes);

const movementRoutes = require('./routes/movements.routes');
app.use('/api/movements', movementRoutes);

const analyticsRoutes = require('./routes/analytics.routes');
app.use('/api', analyticsRoutes);

const deliveriesRoutes = require('./routes/deliveries.routes');
app.use('/api/deliveries', deliveriesRoutes);

const transfersRoutes = require('./routes/transfers.routes');
app.use('/api/transfers', transfersRoutes);

const receiptsRoutes = require('./routes/receipts.routes');
app.use('/api/receipts', receiptsRoutes);

const adjustmentsRoutes = require('./routes/adjustments.routes');
app.use('/api/adjustments', adjustmentsRoutes);

const alertsRoutes = require('./routes/alerts.routes');
app.use('/api/alerts', alertsRoutes);

const dashboardRoutes = require('./routes/dashboard.routes');
app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
