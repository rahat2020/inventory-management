import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  X,
} from "react-feather";
import {
  useLazyGetProductsListQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "../../../redux/api/productsApi";
import {
  useGetStockLevelsSummaryQuery,
  useRestockProductMutation,
} from "../../../redux/api/stockMovementsApi";
import { useGetFilterCategoriesQuery } from "../../../redux/api/categoriesApi";
import { getStatusBadgeClasses } from "../../../utils/appHelpers";
import { unitsData } from "../../../data";
import toastAlert from "../../../utils/toastAlert";
import AppSpinner from "../../../helpers/ui/AppSpinner";
import { FilterDropdown } from "../../../helpers/ui/FilterDropdown";

const STATUS_FILTER_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "In Stock", value: "in-stock" },
  { label: "Low Stock", value: "low-stock" },
  { label: "Out of Stock", value: "out-of-stock" },
];

const DROPDOWN_TRIGGER_CLASSES =
  "bg-white border border-gray-300 text-gray-900 px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500";

const emptyForm = {
  name: "",
  sku: "",
  category: "",
  quantity: "",
  price: "",
  cost: "",
  unit: "pcs",
  warehouse: "",
  supplierName: "",
};

const STATUS_LABELS = {
  "in-stock": "In Stock",
  "low-stock": "Low Stock",
  "out-of-stock": "Out of Stock",
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

const getErrorMessage = (err, fallback) =>
  err?.data?.message || err?.error || fallback;

export default function StockLevelsPage() {
  // search / filter
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // list state (manual page state + lazy query, matching Products/index.jsx)
  const [products, setProducts] = useState([]);
  const [metaData, setMetaData] = useState({});
  const [page, setPage] = useState(1);

  // modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // forms
  const [productForm, setProductForm] = useState(emptyForm);
  const [restockQuantity, setRestockQuantity] = useState("");
  const [restockReference, setRestockReference] = useState("");

  // data
  const [triggerGetProducts, { isFetching: isLoadingProducts }] =
    useLazyGetProductsListQuery();
  const {
    data: summary,
    isLoading: isLoadingSummary,
    refetch: refetchSummary,
  } = useGetStockLevelsSummaryQuery();
  const { data: categoryOptions } = useGetFilterCategoriesQuery();

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [restockProduct, { isLoading: isRestocking }] =
    useRestockProductMutation();

  const statusQueryValue = filterStatus === "all" ? "" : filterStatus;

  const loadFirstPage = useCallback(async () => {
    const res = await triggerGetProducts({
      name: searchTerm,
      status: statusQueryValue,
      page: 1,
      limit: 10,
    });
    if (res?.data?.success) {
      setProducts(res.data.data);
      setMetaData(res.data);
      setPage(1);
    }
  }, [triggerGetProducts, searchTerm, statusQueryValue]);

  // debounce free-text search
  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // (re)load whenever the debounced search or status filter changes
  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  const fetchMoreProducts = async () => {
    const nextPage = page + 1;
    const res = await triggerGetProducts({
      name: searchTerm,
      status: statusQueryValue,
      page: nextPage,
      limit: 10,
    });
    if (res?.data?.success) {
      setProducts((prev) => [...prev, ...res.data.data]);
      setMetaData(res.data);
      setPage(nextPage);
    }
  };

  const refreshAfterMutation = () => {
    loadFirstPage();
    refetchSummary();
  };

  const stats = summary?.summary || {
    totalProducts: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
  };

  const hasMore = metaData?.page < metaData?.totalPages;

  // ----- form modal (add / edit) -----
  const openAddModal = () => {
    setEditingProduct(null);
    setProductForm(emptyForm);
    setIsFormModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || "",
      sku: product.sku || "",
      category: product.category || "",
      quantity: String(product.quantity ?? ""),
      price: String(product.price ?? ""),
      cost: String(product.cost ?? ""),
      unit: product.unit || "pcs",
      warehouse: product.warehouse || "",
      supplierName: product.supplier?.name || "",
    });
    setIsFormModalOpen(true);
  };

  const handleFormChange = (field, value) => {
    setProductForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();

    if (
      !productForm.name.trim() ||
      !productForm.sku.trim() ||
      !productForm.category.trim() ||
      productForm.quantity === "" ||
      productForm.price === "" ||
      productForm.cost === ""
    ) {
      toastAlert("error", "Please fill in all required fields.", "top-right");
      return;
    }

    const payload = {
      name: productForm.name.trim(),
      sku: productForm.sku.trim(),
      category: productForm.category.trim(),
      quantity: Number(productForm.quantity),
      price: Number(productForm.price),
      cost: Number(productForm.cost),
      unit: productForm.unit || "pcs",
      warehouse: productForm.warehouse.trim(),
      supplier: { name: productForm.supplierName.trim() },
    };

    try {
      if (editingProduct) {
        await updateProduct({ id: editingProduct._id, ...payload }).unwrap();
        toastAlert("success", "Product updated successfully.", "top-right");
      } else {
        await createProduct(payload).unwrap();
        toastAlert("success", "Product added successfully.", "top-right");
      }
      setIsFormModalOpen(false);
      setEditingProduct(null);
      setProductForm(emptyForm);
      refreshAfterMutation();
    } catch (err) {
      toastAlert(
        "error",
        getErrorMessage(err, "Something went wrong. Please try again."),
        "top-right",
      );
    }
  };

  // ----- restock modal -----
  const openRestockModal = (product) => {
    setSelectedProduct(product);
    setRestockQuantity("");
    setRestockReference("");
    setIsRestockModalOpen(true);
  };

  const handleRestock = async (e) => {
    e.preventDefault();
    const addedQuantity = Number(restockQuantity);

    if (!selectedProduct || !restockQuantity || addedQuantity <= 0) {
      toastAlert("error", "Enter a valid quantity to add.", "top-right");
      return;
    }

    try {
      await restockProduct({
        productId: selectedProduct._id,
        quantity: addedQuantity,
        reference: restockReference.trim() || undefined,
      }).unwrap();
      toastAlert(
        "success",
        `${selectedProduct.name} restocked successfully.`,
        "top-right",
      );
      setIsRestockModalOpen(false);
      setSelectedProduct(null);
      setRestockQuantity("");
      setRestockReference("");
      refreshAfterMutation();
    } catch (err) {
      toastAlert(
        "error",
        getErrorMessage(err, "Failed to restock product."),
        "top-right",
      );
    }
  };

  // ----- delete modal -----
  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    try {
      await deleteProduct(selectedProduct._id).unwrap();
      toastAlert("success", `${selectedProduct.name} deleted.`, "top-right");
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
      refreshAfterMutation();
    } catch (err) {
      toastAlert(
        "error",
        getErrorMessage(err, "Failed to delete product."),
        "top-right",
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header actions */}
        <div className="mb-8 flex justify-end">
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>

        {/* Stock Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoadingSummary ? "…" : stats.totalProducts}
                </p>
              </div>
              <div className="p-3 bg-violet-100 rounded-full">
                <Package className="h-6 w-6 text-violet-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Stock</p>
                <p className="text-2xl font-bold text-green-600">
                  {isLoadingSummary ? "…" : stats.inStock}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {isLoadingSummary ? "…" : stats.lowStock}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Out of Stock
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {isLoadingSummary ? "…" : stats.outOfStock}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search products, SKU, or category..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-48">
              <Filter className="h-4 w-4 text-gray-500 shrink-0" />
              <FilterDropdown
                buttonLabel="All Status"
                options={STATUS_FILTER_OPTIONS}
                selectedValue={filterStatus}
                onChange={(option) => setFilterStatus(option.value)}
                headerClassName={`${DROPDOWN_TRIGGER_CLASSES} rounded-lg`}
                dropdownMenuSize="180px"
                showFocus
              />
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoadingProducts && products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12">
                      <AppSpinner />
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={product.image?.[0] || "/placeholder.svg"}
                            alt={product.name}
                            className="h-10 w-10 rounded-lg object-cover mr-3 bg-gray-100"
                          />
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
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
                            {product.quantity}
                          </span>
                          <span className="text-gray-500"> units</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 ${getStatusBadgeClasses(
                            product.status,
                          )}`}
                        >
                          {getStatusIcon(product.status)}
                          {STATUS_LABELS[product.status] || product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${Number(product.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.updatedAt
                          ? new Date(product.updatedAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openRestockModal(product)}
                            className="text-violet-600 hover:text-violet-900 p-1 hover:bg-violet-50 rounded transition-colors"
                            title="Restock"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(product)}
                            className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(product)}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Load more */}
          {!isLoadingProducts && products.length > 0 && hasMore && (
            <div className="flex justify-center py-4 border-t border-gray-100">
              <button
                onClick={fetchMoreProducts}
                className="px-4 py-2 text-sm font-medium text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
              >
                Load more
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoadingProducts && products.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchInput || filterStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first product"}
              </p>
              {!searchInput && filterStatus === "all" && (
                <button
                  onClick={openAddModal}
                  className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  <Plus className="h-4 w-4" />
                  Add Your First Product
                </button>
              )}
            </div>
          )}
        </div>

        {/* Add / Edit Product Modal */}
        {isFormModalOpen && (
          <div className="fixed inset-0 bg-gray-500/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  onClick={() => setIsFormModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmitProduct}>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => handleFormChange("name", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                      placeholder="Enter product name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={productForm.sku}
                        onChange={(e) =>
                          handleFormChange("sku", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                        placeholder="Enter SKU"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        list="category-options"
                        value={productForm.category}
                        onChange={(e) =>
                          handleFormChange("category", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                        placeholder="Enter category"
                      />
                      <datalist id="category-options">
                        {categoryOptions?.map((cat) => (
                          <option key={cat.value} value={cat.label} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={productForm.quantity}
                        onChange={(e) =>
                          handleFormChange("quantity", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit
                      </label>
                      <FilterDropdown
                        buttonLabel="Unit"
                        options={unitsData}
                        selectedValue={productForm.unit}
                        onChange={(option) =>
                          handleFormChange("unit", option.value)
                        }
                        headerClassName={`${DROPDOWN_TRIGGER_CLASSES} rounded-md`}
                        dropdownMenuSize="180px"
                        showFocus
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={productForm.price}
                        onChange={(e) =>
                          handleFormChange("price", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cost
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={productForm.cost}
                        onChange={(e) =>
                          handleFormChange("cost", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Warehouse
                      </label>
                      <input
                        type="text"
                        value={productForm.warehouse}
                        onChange={(e) =>
                          handleFormChange("warehouse", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Supplier
                      </label>
                      <input
                        type="text"
                        value={productForm.supplierName}
                        onChange={(e) =>
                          handleFormChange("supplierName", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 p-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || isUpdating}
                    className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isCreating || isUpdating
                      ? "Saving..."
                      : editingProduct
                        ? "Save Changes"
                        : "Add Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Restock Modal */}
        {isRestockModalOpen && selectedProduct && (
          <div className="fixed inset-0 bg-gray-500/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Restock Product
                </h2>
                <button
                  onClick={() => setIsRestockModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleRestock}>
                <div className="p-6">
                  <div className="mb-4 bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">
                      Product:{" "}
                      <span className="font-medium text-gray-900">
                        {selectedProduct.name}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Current Stock:{" "}
                      <span className="font-medium text-gray-900">
                        {selectedProduct.quantity}
                      </span>
                    </p>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity to Add
                    </label>
                    <input
                      type="number"
                      value={restockQuantity}
                      onChange={(e) => setRestockQuantity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                      placeholder="Enter quantity to add"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reference / Note
                    </label>
                    <input
                      type="text"
                      value={restockReference}
                      onChange={(e) => setRestockReference(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                      placeholder="e.g. PO-1042 (optional)"
                    />
                  </div>
                  {restockQuantity && Number(restockQuantity) > 0 && (
                    <p className="text-sm text-gray-600 mt-3">
                      New stock level:{" "}
                      <span className="font-medium text-green-600">
                        {selectedProduct.quantity + Number(restockQuantity)}
                      </span>
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-2 p-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsRestockModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isRestocking}
                    className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isRestocking ? "Restocking..." : "Restock"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && selectedProduct && (
          <div className="fixed inset-0 bg-gray-500/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
              <div className="p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mx-auto mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  Delete Product
                </h2>
                <p className="text-sm text-gray-600 text-center">
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-gray-900">
                    {selectedProduct.name}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-end gap-2 p-6 border-t border-gray-200">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
