export const movements = [
  { id: "MOV-240418-092", time: "09:41:52", product: "Ridgeway Safety Gloves", sku: "PPE-4402", type: "Delivery", from: "WH-A / A-04", to: "Nova Build Co.", qty: -48, status: "Done", user: "AM" },
  { id: "MOV-240418-091", time: "09:36:04", product: "M8 Hex Bolt Â· Zinc", sku: "HDW-1088", type: "Receipt", from: "Apex Industrial", to: "WH-A / C-12", qty: 1200, status: "Done", user: "JR" },
  { id: "MOV-240418-090", time: "09:28:17", product: "Copper Pipe 22mm", sku: "PLB-2210", type: "Transfer", from: "WH-B / B-07", to: "WH-A / D-02", qty: 64, status: "Done", user: "SK" },
  { id: "MOV-240418-089", time: "09:14:33", product: "ProSeal Adhesive 5L", sku: "CHM-5014", type: "Adjustment", from: "WH-A / Q-01", to: "WH-A / Q-01", qty: -3, status: "Done", user: "AM" },
  { id: "MOV-240418-088", time: "08:59:21", product: "Steel Channel 41Ã—41", sku: "MTL-4141", type: "Delivery", from: "WH-C / R-08", to: "Atlas Engineering", qty: -24, status: "Done", user: "KL" },
  { id: "MOV-240418-087", time: "08:47:02", product: "Nitrile Coated Gloves", sku: "PPE-3210", type: "Receipt", from: "Safeguard Supply", to: "WH-B / A-02", qty: 300, status: "Done", user: "JR" },
  { id: "MOV-240418-086", time: "08:31:49", product: "Circuit Breaker 32A", sku: "ELC-3208", type: "Transfer", from: "WH-A / E-11", to: "WH-C / C-04", qty: 18, status: "Ready", user: "SK" },
];

export const deliveriesSeed = [
  { id: "DEL-1048", customer: "Nova Build Co.", items: 4, units: 86, warehouse: "Central Warehouse", eta: "Today, 10:30", status: "Ready", progress: 2 },
  { id: "DEL-1047", customer: "Atlas Engineering", items: 2, units: 24, warehouse: "West Distribution", eta: "Today, 11:15", status: "Packing", progress: 1 },
  { id: "DEL-1046", customer: "Meridian Works", items: 7, units: 142, warehouse: "Central Warehouse", eta: "Today, 13:00", status: "Waiting", progress: 0 },
  { id: "DEL-1045", customer: "Northstar Retail", items: 3, units: 60, warehouse: "East Hub", eta: "Tomorrow, 08:00", status: "Draft", progress: 0 },
];

export const productOptions = [
  { name: "Ridgeway Safety Gloves", sku: "PPE-4402", stock: 32, threshold: 24 },
  { name: "M8 Hex Bolt Â· Zinc", sku: "HDW-1088", stock: 2480, threshold: 500 },
  { name: "Copper Pipe 22mm", sku: "PLB-2210", stock: 118, threshold: 40 },
  { name: "Circuit Breaker 32A", sku: "ELC-3208", stock: 42, threshold: 20 },
];