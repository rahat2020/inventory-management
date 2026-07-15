import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Package,
  AlertTriangle,
  XCircle,
  DollarSign,
  RefreshCw,
  Zap,
  X,
} from "react-feather";
import { useLazyGetProductsListQuery } from "../../../redux/api/productsApi";
import {
  useGetStockLevelsSummaryQuery,
  useRestockProductMutation,
} from "../../../redux/api/stockMovementsApi";
import { useGetRestockForecastQuery } from "../../../redux/api/analyticsApi";
import { getStatusBadgeClasses, formatCurrency } from "../../../utils/appHelpers";
import toastAlert from "../../../utils/toastAlert";
import AppSpinner from "../../../helpers/ui/AppSpinner";

const TABS = [
  { key: "low-stock", label: "Low Stock" },
  { key: "out-of-stock", label: "Out of Stock" },
];

const STATUS_LABELS = {
  "low-stock": "Low Stock",
  "out-of-stock": "Out of Stock",
};

const getErrorMessage = (err, fallback) =>
  err?.data?.message || err?.error || fallback;

export default function LowStockPage() {
  const [activeTab, setActiveTab] = useState("low-stock");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [products, setProducts] = useState([]);
  const [metaData, setMetaData] = useState({});
  const [page, setPage] = useState(1);

  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState("");
  const [restockReference, setRestockReference] = useState("");

  const [triggerGetProducts, { isFetching: isLoadingProducts }] =
    useLazyGetProductsListQuery();
  const {
    data: summary,
    isLoading: isLoadingSummary,
    refetch: refetchSummary,
  } = useGetStockLevelsSummaryQuery();
  const { data: forecast } = useGetRestockForecastQuery();
  const [restockProduct, { isLoading: isRestocking }] =
    useRestockProductMutation();

  const forecastMap = new Map(
    (forecast?.items || []).map((item) => [String(item.productId), item]),
  );

  const stats = summary?.summary || {};
  const details = summary?.details || {};
  const valueAtRisk =
    [...(details.lowStockItems || []), ...(details.outOfStockItems || [])].reduce(
      (sum, p) => sum + (p.quantity || 0) * (p.price || 0),
      0,
    );

  const loadFirstPage = useCallback(async () => {
    const res = await triggerGetProducts({
      name: searchTerm,
      status: activeTab,
      page: 1,
      limit: 10,
    });
    if (res?.data?.success) {
      setProducts(res.data.data);
      setMetaData(res.data);
      setPage(1);
    }
  }, [triggerGetProducts, searchTerm, activeTab]);

  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  const fetchMoreProducts = async () => {
    const nextPage = page + 1;
    const res = await triggerGetProducts({
      name: searchTerm,
      status: activeTab,
      page: nextPage,
      limit: 10,
    });
    if (res?.data?.success) {
      setProducts((prev) => [...prev, ...res.data.data]);
      setMetaData(res.data);
      setPage(nextPage);
    }
  };

  const hasMore = metaData?.page < metaData?.totalPages;

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
      loadFirstPage();
      refetchSummary();
    } catch (err) {
      toastAlert(
        "error",
        getErrorMessage(err, "Failed to restock product."),
        "top-right",
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {isLoadingSummary ? "…" : stats.lowStock ?? 0}
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
                  {isLoadingSummary ? "…" : stats.outOfStock ?? 0}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Value at Risk
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoadingSummary ? "…" : formatCurrency(valueAtRisk)}
                </p>
              </div>
              <div className="p-3 bg-violet-100 rounded-full">
                <DollarSign className="h-6 w-6 text-violet-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Urgent Reorders
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {forecast ? forecast.summary.urgentCount : "…"}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs + search */}
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
            <div className="inline-flex rounded-lg border border-gray-200 p-1 self-start">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.key
                      ? "bg-violet-600 text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
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
                    Forecast
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoadingProducts && products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12">
                      <AppSpinner />
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const forecastItem = forecastMap.get(String(product._id));
                    return (
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
                          <span className={getStatusBadgeClasses(product.status)}>
                            {STATUS_LABELS[product.status] || product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {forecastItem ? (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                forecastItem.urgent
                                  ? "bg-red-50 text-red-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {forecastItem.daysUntilStockout !== null
                                ? `${forecastItem.daysUntilStockout}d left`
                                : "Reorder now"}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => openRestockModal(product)}
                            className="inline-flex items-center gap-1.5 text-violet-600 hover:text-white hover:bg-violet-600 border border-violet-200 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Restock
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

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

          {!isLoadingProducts && products.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nothing here
              </h3>
              <p className="text-gray-600">
                {searchInput
                  ? "Try adjusting your search"
                  : activeTab === "low-stock"
                    ? "No products are running low right now."
                    : "No products are out of stock right now."}
              </p>
            </div>
          )}
        </div>

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
      </div>
    </div>
  );
}
