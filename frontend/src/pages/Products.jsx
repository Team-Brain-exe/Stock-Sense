import { useMemo, useState } from "react";
import Icon from "../components/Icon.jsx";
import { Button, Text } from "../components/ui.jsx";
import ForecastChart from "../components/ForecastChart.jsx";

const initialProducts = [
  {
    id: 1,
    name: "Wireless Keyboard",
    sku: "KB-001",
    category: "Electronics",
    unit: "Pieces",
    stock: 124,
    status: "In Stock",
  },
  {
    id: 2,
    name: "Office Chair",
    sku: "CH-024",
    category: "Furniture",
    unit: "Pieces",
    stock: 18,
    status: "Low Stock",
  },
  {
    id: 3,
    name: "USB-C Cable",
    sku: "UC-102",
    category: "Electronics",
    unit: "Pieces",
    stock: 56,
    status: "In Stock",
  },
  {
    id: 4,
    name: "Laptop Stand",
    sku: "LS-014",
    category: "Accessories",
    unit: "Pieces",
    stock: 8,
    status: "Low Stock",
  },
];

export default function Products() {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "Electronics",
    unit: "Pieces",
    stock: "",
  });

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        product.name.toLowerCase().includes(searchText) ||
        product.sku.toLowerCase().includes(searchText);

      const matchesCategory =
        category === "All" || product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleAddProduct = (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.sku.trim()) {
      return;
    }

    const stock = Number(form.stock) || 0;

    const newProduct = {
      id: Date.now(),
      name: form.name.trim(),
      sku: form.sku.trim().toUpperCase(),
      category: form.category,
      unit: form.unit,
      stock,
      status: stock <= 20 ? "Low Stock" : "In Stock",
    };

    setProducts((current) => [...current, newProduct]);

    setForm({
      name: "",
      sku: "",
      category: "Electronics",
      unit: "Pieces",
      stock: "",
    });

    setShowModal(false);
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <Text className="eyebrow">INVENTORY MASTER</Text>

          <Text as="h1" className="page-title">
            Products
          </Text>

          <Text className="page-subtitle">
            Manage your products, stock levels, and inventory information.
          </Text>
        </div>

        <Button
          className="primary-button"
          onClick={() => setShowModal(true)}
        >
          <Icon name="plus" size={16} />
          Add product
        </Button>
      </header>

      <section className="products-toolbar">
        <div className="products-search">
          <Icon name="search" size={17} />

          <input
            type="text"
            placeholder="Search products or SKU..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="All">All categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Furniture">Furniture</option>
          <option value="Accessories">Accessories</option>
        </select>
      </section>

      <section className="products-panel">
        <div className="products-panel-head">
          <div>
            <Text className="panel-title">Product catalogue</Text>

            <Text className="panel-subtitle">
              {filteredProducts.length} products shown
            </Text>
          </div>
        </div>

        <div className="products-table-wrap">
          <table className="products-table">
            <thead>
              <tr>
                <th>PRODUCT</th>
                <th>SKU</th>
                <th>CATEGORY</th>
                <th>UNIT</th>
                <th>STOCK</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="product-name">
                    {product.name}
                  </td>

                  <td className="product-sku">
                    {product.sku}
                  </td>

                  <td>{product.category}</td>

                  <td>{product.unit}</td>

                  <td>{product.stock}</td>

                  <td>
                    <span
                      className={`stock-status ${
                        product.status === "Low Stock"
                          ? "low"
                          : "available"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="products-empty">
              <Icon name="scan" size={28} />

              <Text as="h3">
                No products found
              </Text>

              <Text>
                Try changing your search or category filter.
              </Text>
            </div>
          )}
        </div>
      </section>
      
      <ForecastChart productId="6ab77612556a7697e69be879" />

      {showModal && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <form
            className="modal-panel"
            onSubmit={handleAddProduct}
          >
            <div className="modal-head">
              <div>
                <Text className="eyebrow">
                  INVENTORY MASTER
                </Text>

                <Text as="h2">
                  Add product
                </Text>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <label className="form-field">
              <span>Product name</span>

              <input
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="e.g. Wireless Mouse"
                required
              />
            </label>

            <div className="form-grid">
              <label className="form-field">
                <span>SKU / Code</span>

                <input
                  name="sku"
                  value={form.sku}
                  onChange={handleFormChange}
                  placeholder="e.g. WM-001"
                  required
                />
              </label>

              <label className="form-field">
                <span>Category</span>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleFormChange}
                >
                  <option value="Electronics">
                    Electronics
                  </option>

                  <option value="Furniture">
                    Furniture
                  </option>

                  <option value="Accessories">
                    Accessories
                  </option>
                </select>
              </label>
            </div>

            <div className="form-grid">
              <label className="form-field">
                <span>Unit of measure</span>

                <select
                  name="unit"
                  value={form.unit}
                  onChange={handleFormChange}
                >
                  <option value="Pieces">Pieces</option>
                  <option value="Boxes">Boxes</option>
                  <option value="Kg">Kg</option>
                  <option value="Litres">Litres</option>
                </select>
              </label>

              <label className="form-field">
                <span>Initial stock</span>

                <input
                  name="stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={handleFormChange}
                  placeholder="Optional"
                />
              </label>
            </div>

            <div className="modal-actions">
              <Button
                type="button"
                className="secondary-button"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="primary-button"
              >
                Add product
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}