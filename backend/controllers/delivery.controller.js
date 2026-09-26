const DeliveryOrder = require('../models/DeliveryOrder');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

const STATUSES = ['Waiting', 'Packing', 'Ready', 'Done'];

function serialize(delivery) {
  return {
    id: delivery._id.toString(),
    customer: delivery.customer,
    product: delivery.product,
    items: delivery.items,
    units: delivery.units,
    warehouse: delivery.warehouse,
    eta: delivery.eta,
    status: delivery.status,
    progress: delivery.progress,
  };
}

async function getDeliveries(req, res) {
  try {
    const deliveries = await DeliveryOrder.find().sort({ createdAt: -1 });
    res.json(deliveries.map(serialize));
  } catch (error) {
    console.error('getDeliveries error:', error);
    res.status(500).json({ error: 'Failed to fetch deliveries' });
  }
}

async function createDelivery(req, res) {
  try {
    const { customer, product, quantity, warehouse } = req.body;
    if (!customer || !product || !quantity || !warehouse) {
      return res.status(400).json({ error: 'customer, product, quantity and warehouse are required' });
    }
    const delivery = await DeliveryOrder.create({
      customer,
      product,
      quantity: Number(quantity),
      warehouse,
      units: Number(quantity),
      items: 1,
      eta: 'Today, 15:30',
      status: 'Waiting',
      progress: 0,
    });
    res.status(201).json(serialize(delivery));
  } catch (error) {
    console.error('createDelivery error:', error);
    res.status(400).json({ error: 'Failed to create delivery' });
  }
}

async function advanceDelivery(req, res) {
  try {
    const delivery = await DeliveryOrder.findById(req.params.id);
    if (!delivery) return res.status(404).json({ error: 'Delivery not found' });
    if (delivery.progress >= 3) return res.json(serialize(delivery));

    const nextProgress = delivery.progress + 1;
    delivery.progress = nextProgress;
    delivery.status = STATUSES[nextProgress];

    let extra = {};

    if (nextProgress === 3) {
      const product = await Product.findOne({ sku: delivery.product });
      if (product) {
        const change = -Number(delivery.quantity);
        const newStock = product.stockQty + change;
        if (newStock < 0) return res.status(400).json({ error: 'Stock cannot go below zero' });

        product.stockQty = newStock;
        await product.save();

        await StockMovement.create({
          product_id: product._id,
          warehouse_id: product.warehouse_id,
          qty_change: change,
          type: 'delivery',
        });

        extra = {
          productName: product.name,
          productSku: product.sku,
          location: product.location,
          remainingStock: product.stockQty,
          threshold: product.reorder_threshold,
        };
      } else {
        console.warn(`advanceDelivery: no product found with sku="${delivery.product}"`);
      }
    }

    await delivery.save();
    res.json({ ...serialize(delivery), ...extra });
  } catch (error) {
    console.error('advanceDelivery error:', error);
    res.status(400).json({ error: 'Failed to advance delivery' });
  }
}

module.exports = { getDeliveries, createDelivery, advanceDelivery };
