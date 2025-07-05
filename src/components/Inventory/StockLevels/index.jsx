"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
} from "react-feather";

export default function StockLevelsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    category: "",
    currentStock: "",
    minStock: "",
    price: "",
  });

  // Sample product data
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "iPhone 15 Pro",
      sku: "IPH15P-001",
      category: "Electronics",
      currentStock: 25,
      minStock: 10,
      price: 999.99,
      lastRestocked: "2024-01-10",
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "Samsung Galaxy S24",
      sku: "SGS24-002",
      category: "Electronics",
      currentStock: 5,
      minStock: 15,
      price: 899.99,
      lastRestocked: "2024-01-08",
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "Nike Air Max 270",
      sku: "NAM270-003",
      category: "Clothing",
      currentStock: 0,
      minStock: 20,
      price: 150.0,
      lastRestocked: "2024-01-05",
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 4,
      name: 'MacBook Pro 16"',
      sku: "MBP16-004",
      category: "Electronics",
      currentStock: 12,
      minStock: 5,
      price: 2499.99,
      lastRestocked: "2024-01-12",
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 5,
      name: "Adidas Ultraboost 22",
      sku: "AUB22-005",
      category: "Clothing",
      currentStock: 8,
      minStock: 25,
      price: 180.0,
      lastRestocked: "2024-01-09",
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 6,
      name: "Sony WH-1000XM5",
      sku: "SWH1000-006",
      category: "Electronics",
      currentStock: 30,
      minStock: 10,
      price: 399.99,
      lastRestocked: "2024-01-11",
      image: "/placeholder.svg?height=40&width=40",
    },
  ]);

  const getStockStatus = (currentStock, minStock) => {
    if (currentStock === 0) return "out-of-stock";
    if (currentStock <= minStock) return "low-stock";
    return "in-stock";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "out-of-stock":
        return "text-red-600 bg-red-50";
      case "low-stock":
        return "text-yellow-600 bg-yellow-50";
      case "in-stock":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "out-of-stock":
        return <XCircle className="h-4 w-4" />;
      case "low-stock":
        return <AlertTriangle className="h-4 w-4" />;
      case "in-stock":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === "all") return matchesSearch;

    const status = getStockStatus(product.currentStock, product.minStock);
    return matchesSearch && status === filterStatus;
  });

  const stockStats = {
    total: products.length,
    inStock: products.filter(
      (p) => getStockStatus(p.currentStock, p.minStock) === "in-stock"
    ).length,
    lowStock: products.filter(
      (p) => getStockStatus(p.currentStock, p.minStock) === "low-stock"
    ).length,
    outOfStock: products.filter(
      (p) => getStockStatus(p.currentStock, p.minStock) === "out-of-stock"
    ).length,
  };

  const handleAddProduct = () => {
    if (newProduct.name.trim() && newProduct.sku.trim()) {
      const product = {
        id: products.length + 1,
        name: newProduct.name,
        sku: newProduct.sku,
        category: newProduct.category,
        currentStock: Number.parseInt(newProduct.currentStock) || 0,
        minStock: Number.parseInt(newProduct.minStock) || 0,
        price: Number.parseFloat(newProduct.price) || 0,
        lastRestocked: new Date().toISOString().split("T")[0],
        image: "/placeholder.svg?height=40&width=40",
      };
      setProducts([...products, product]);
      setNewProduct({
        name: "",
        sku: "",
        category: "",
        currentStock: "",
        minStock: "",
        price: "",
      });
      setIsAddModalOpen(false);
    }
  };

  const handleRestock = () => {
    if (selectedProduct && restockQuantity) {
      const updatedProducts = products.map((product) =>
        product.id === selectedProduct.id
          ? {
              ...product,
              currentStock:
                product.currentStock + Number.parseInt(restockQuantity),
              lastRestocked: new Date().toISOString().split("T")[0],
            }
          : product
      );
      setProducts(updatedProducts);
      setRestockQuantity("");
      setSelectedProduct(null);
      setIsRestockModalOpen(false);
    }
  };

  const handleDeleteProduct = (id) => {
    setProducts(products.filter((product) => product.id !== id));
  };

  const openRestockModal = (product) => {
    setSelectedProduct(product);
    setIsRestockModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Stock Levels</h1>
              <p className="text-gray-600 mt-1">
                Monitor and manage product inventory
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          </div>
        </div>

        {/* Stock Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stockStats.total}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Stock</p>
                <p className="text-2xl font-bold text-green-600">
                  {stockStats.inStock}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stockStats.lowStock}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Out of Stock
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {stockStats.outOfStock}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search products, SKU, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              >
                <option value="all">All Status</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Restocked
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const status = getStockStatus(
                    product.currentStock,
                    product.minStock
                  );
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="h-10 w-10 rounded-lg object-cover mr-3"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <span className="font-medium">
                            {product.currentStock}
                          </span>
                          <span className="text-gray-500">
                            {" "}
                            / {product.minStock} min
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            status
                          )}`}
                        >
                          {getStatusIcon(status)}
                          {status === "out-of-stock"
                            ? "Out of Stock"
                            : status === "low-stock"
                            ? "Low Stock"
                            : "In Stock"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.lastRestocked}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openRestockModal(product)}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                            title="Restock"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                          <button
                            className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by adding your first product"}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                <Plus className="h-4 w-4" />
                Add Your First Product
              </button>
            )}
          </div>
        )}

        {/* Add Product Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Add New Product
                </h2>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={newProduct.sku}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, sku: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Enter SKU"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Enter category"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Stock
                    </label>
                    <input
                      type="number"
                      value={newProduct.currentStock}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          currentStock: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Stock
                    </label>
                    <input
                      type="number"
                      value={newProduct.minStock}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          minStock: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 p-6 border-t border-gray-200">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProduct}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Product
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Restock Modal */}
        {isRestockModalOpen && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Restock Product
                </h2>
                <button
                  onClick={() => setIsRestockModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Product:{" "}
                    <span className="font-medium text-gray-900">
                      {selectedProduct.name}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Current Stock:{" "}
                    <span className="font-medium text-gray-900">
                      {selectedProduct.currentStock}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add Quantity
                  </label>
                  <input
                    type="number"
                    value={restockQuantity}
                    onChange={(e) => setRestockQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Enter quantity to add"
                    min="1"
                  />
                </div>
                {restockQuantity && (
                  <p className="text-sm text-gray-600 mt-2">
                    New stock level:{" "}
                    <span className="font-medium text-green-600">
                      {selectedProduct.currentStock +
                        Number.parseInt(restockQuantity || 0)}
                    </span>
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2 p-6 border-t border-gray-200">
                <button
                  onClick={() => setIsRestockModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestock}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Restock
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
