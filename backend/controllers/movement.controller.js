const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');

// Maps Ledger.jsx's documentType filter values to the lowercase `type`
// stored on StockMovement. "Internal" means Transfer per Transfers.jsx.
function mapDocumentType(documentType) {
  if (!documentType) return null;
  if (documentType === 'Internal') return 'transfer';
  return documentType.replace(/s$/, '').toLowerCase();
}

function serializeRow(m, productsById) {
  const product = productsById.get(String(m.product_id));
  const typeLabel = m.type.charAt(0).toUpperCase() + m.type.slice(1);
  return {
    id: m._id.toString(),
    time: new Date(m.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    product: product ? product.name : 'Unknown product',
    sku: product ? product.sku : '',
    type: typeLabel,
    from: m.type === 'transfer' ? (product ? product.location : '') : '',
    to: '',
    qty: m.qty_change,
    status: 'Posted',
    user: m.user_id || 'system',
  };
}

// GET /api/movements?documentType=&status=&warehouse=&category=&limit=
// -> { rows, stats: { net, transactions, inbound, outbound }, page, totalPages }
async function getMovements(req, res) {
  try {
    const { documentType, warehouse, category, limit } = req.query;

    const query = {};
    const mappedType = mapDocumentType(documentType);
    if (mappedType) query.type = mappedType;
    if (warehouse) query.warehouse_id = warehouse;

    let movements = await StockMovement.find(query).sort({ createdAt: -1 });

    const productIds = [...new Set(movements.map((m) => String(m.product_id)))];
    const products = await Product.find({ _id: { $in: productIds } });
    const productsById = new Map(products.map((p) => [String(p._id), p]));

    if (category) {
      movements = movements.filter((m) => {
        const product = productsById.get(String(m.product_id));
        return product && product.category === category;
      });
    }

    const allMovements = await StockMovement.find();
    const inbound = allMovements.filter((m) => m.qty_change > 0).reduce((s, m) => s + m.qty_change, 0);
    const outbound = allMovements.filter((m) => m.qty_change < 0).reduce((s, m) => s + Math.abs(m.qty_change), 0);
    const net = inbound - outbound;

    const limited = limit ? movements.slice(0, parseInt(limit, 10)) : movements;

    res.json({
      rows: limited.map((m) => serializeRow(m, productsById)),
      stats: {
        net: `${net >= 0 ? '+' : ''}${net.toLocaleString()}`,
        transactions: allMovements.length,
        inbound: inbound.toLocaleString(),
        outbound: outbound.toLocaleString(),
      },
      page: 1,
      totalPages: 1,
    });
  } catch (error) {
    console.error('getMovements error:', error);
    res.status(500).json({ error: 'Failed to fetch stock movements' });
  }
}

// POST /api/movements  (unchanged from Darwin's original)
async function createMovement(req, res) {
  try {
    const { product_id, type, qty_change, warehouse_id, user_id } = req.body;

    if (!product_id || !type || qty_change === undefined || !warehouse_id) {
      return res.status(400).json({ error: 'product_id, type, qty_change and warehouse_id are required' });
    }

    const product = await Product.findById(product_id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const change = Number(qty_change);
    if (Number.isNaN(change)) return res.status(400).json({ error: 'qty_change must be a number' });

    const newStock = product.stockQty + change;
    if (newStock < 0) return res.status(400).json({ error: 'Stock cannot go below zero' });

    product.stockQty = newStock;
    await product.save();

    const movement = await StockMovement.create({ product_id, type, qty_change: change, warehouse_id, user_id });

    res.status(201).json({ message: 'Stock movement created successfully', movement, currentStock: product.stockQty });
  } catch (error) {
    console.error('createMovement error:', error);
    res.status(400).json({ error: 'Failed to create stock movement' });
  }
}

module.exports = { getMovements, createMovement };
