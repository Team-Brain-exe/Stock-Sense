require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Warehouse = require('../models/Warehouse');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const DeliveryOrder = require('../models/DeliveryOrder');

const CATEGORIES = ['Steel', 'Furniture', 'Electronics'];

const PRODUCT_NAMES = {
  Steel: ['Steel Rods', 'Steel Sheets 2mm', 'Angle Brackets', 'Steel Beams', 'Rebar Coils'],
  Furniture: ['Office Chair', 'Standing Desk', 'Filing Cabinet', 'Conference Table', 'Bookshelf'],
  Electronics: ['Contactor 24V DC', 'Circuit Breaker', 'LED Panel', 'Power Supply Unit', 'Wiring Harness'],
};

async function seed() {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    Warehouse.deleteMany({}),
    Product.deleteMany({}),
    StockMovement.deleteMany({}),
    DeliveryOrder.deleteMany({}),
  ]);

  console.log('Creating warehouses...');
  const warehouses = await Warehouse.insertMany([
    { name: 'Central Warehouse', location: 'Bengaluru' },
    { name: 'East Hub', location: 'Chennai' },
    { name: 'West Warehouse', location: 'Mumbai' },
  ]);

  console.log('Creating products...');
  const products = [];
  let skuCounter = 1000;

  for (const category of CATEGORIES) {
    for (const name of PRODUCT_NAMES[category]) {
      for (const warehouse of warehouses) {
        if (Math.random() < 0.4) continue;

        skuCounter += 1;
        const stockQty = Math.floor(Math.random() * 400) + 5;
        const reorder_threshold = Math.floor(Math.random() * 30) + 10;

        products.push({
          name,
          category,
          sku: `${category.slice(0, 3).toUpperCase()}-${skuCounter}`,
          stockQty,
          reorder_threshold,
          warehouse_id: warehouse._id,
          location: `${warehouse.name.split(' ')[0]} / A-0${Math.floor(Math.random() * 9) + 1}`,
        });
      }
    }
  }

  const createdProducts = await Product.insertMany(products);
  console.log(`Created ${createdProducts.length} products.`);

  console.log('Creating ~2 weeks of movement history...');
  const movements = [];
  const types = ['delivery', 'receipt', 'transfer', 'adjustment'];

  for (const product of createdProducts) {
    const numMovements = Math.floor(Math.random() * 10) + 5;

    for (let i = 0; i < numMovements; i++) {
      const daysAgo = Math.floor(Math.random() * 14);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);
      createdAt.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

      const type = types[Math.floor(Math.random() * types.length)];
      let qty_change;
      if (type === 'delivery') qty_change = -(Math.floor(Math.random() * 15) + 1);
      else if (type === 'receipt') qty_change = Math.floor(Math.random() * 20) + 1;
      else if (type === 'transfer') qty_change = 0;
      else qty_change = Math.floor(Math.random() * 10) - 5;

      movements.push({
        product_id: product._id,
        warehouse_id: product.warehouse_id,
        type,
        qty_change,
        createdAt,
      });
    }
  }

  await StockMovement.insertMany(movements);
  console.log(`Created ${movements.length} stock movements.`);

  console.log('Creating sample delivery orders...');
  const sampleProduct = createdProducts[0];
  await DeliveryOrder.insertMany([
    {
      customer: 'Axiom Field Services',
      product: sampleProduct.sku,
      quantity: 12,
      warehouse: warehouses[0].name,
      items: 1,
      units: 12,
      eta: 'Today, 15:30',
      status: 'Waiting',
      progress: 0,
    },
    {
      customer: 'Northline Traders',
      product: createdProducts[1].sku,
      quantity: 8,
      warehouse: warehouses[1].name,
      items: 1,
      units: 8,
      eta: 'Today, 17:00',
      status: 'Packing',
      progress: 1,
    },
  ]);

  console.log('--- Seed complete ---');
  console.log(`Warehouses: ${warehouses.length}`);
  console.log(`Products: ${createdProducts.length}`);
  console.log(`Movements: ${movements.length}`);
  console.log('---------------------');

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
