import { useMemo, useState } from "react";
import Icon from "../components/Icon.jsx";
import { Button, Text } from "../components/ui.jsx";

const products = [
  {
    id: 1,
    name: "Wireless Keyboard",
    sku: "KB-001",
    category: "Electronics",
    stock: 124,
    status: "In Stock",
  },
  {
    id: 2,
    name: "Office Chair",
    sku: "CH-024",
    category: "Furniture",
    stock: 18,
    status: "Low Stock",
  },
  {
    id: 3,
    name: "USB-C Cable",
    sku: "UC-102",
    category: "Electronics",
    stock: 56,
    status: "In Stock",
  },
  {
    id: 4,
    name: "Laptop Stand",
    sku: "LS-014",
    category: "Accessories",
    stock: 8,
    status: "Low Stock",
  },
];

export default function Products() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

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

        <Button className="primary-button">
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
                <th>STOCK</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="product-name">{product.name}</td>

                  <td className="product-sku">
                    {product.sku}
                  </td>

                  <td>{product.category}</td>

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
              <Text as="h3">No products found</Text>
              <Text>Try changing your search or category filter.</Text>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}