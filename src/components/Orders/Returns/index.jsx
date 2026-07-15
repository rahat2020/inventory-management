import { useCallback, useEffect, useState } from "react";
import { Search, RefreshCw, Package, Hash, RotateCcw, Plus, X } from "react-feather";
import {
  useLazyGetReturnsQuery,
  useRecordReturnMutation,
} from "../../../redux/api/stockMovementsApi";
import { formatRelativeTime } from "../../../utils/appHelpers";
import toastAlert from "../../../utils/toastAlert";
import AppSpinner from "../../../helpers/ui/AppSpinner";
import ProductPicker from "../../../helpers/ui/ProductPicker";

const REASON_OPTIONS = [
  "Wrong item",
  "Defective",
  "Changed mind",
  "Damaged in transit",
  "Other",
];

const getErrorMessage = (err, fallback) =>
  err?.data?.message || err?.error || fallback;

export default function ReturnsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [movements, setMovements] = useState([]);
  const [metaData, setMetaData] = useState({});
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState(REASON_OPTIONS[0]);
  const [reference, setReference] = useState("");

  const [triggerGetReturns, { isFetching: isLoading }] =
    useLazyGetReturnsQuery();
  const [recordReturn, { isLoading: isSubmitting }] =
    useRecordReturnMutation();

  const loadFirstPage = useCallback(async () => {
    const res = await triggerGetReturns({ search: searchTerm, page: 1, limit: 10 });
    if (res?.data?.success) {
      setMovements(res.data.movements);
      setMetaData(res.data);
      setPage(1);
    }
  }, [triggerGetReturns, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  const fetchMore = async () => {
    const nextPage = page + 1;
    const res = await triggerGetReturns({
      search: searchTerm,
      page: nextPage,
      limit: 10,
    });
    if (res?.data?.success) {
      setMovements((prev) => [...prev, ...res.data.movements]);
      setMetaData(res.data);
      setPage(nextPage);
    }
  };

  const hasMore = metaData?.page < metaData?.pages;
  const total = metaData?.total || 0;
  const totalQuantity = metaData?.totalQuantity || 0;

  const openModal = () => {
    setSelectedProduct(null);
    setQuantity("");
    setReason(REASON_OPTIONS[0]);
    setReference("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const returnedQuantity = Number(quantity);

    if (!selectedProduct) {
      toastAlert("error", "Select a product first.", "top-right");
      return;
    }
    if (!quantity || returnedQuantity <= 0) {
      toastAlert("error", "Enter a valid quantity.", "top-right");
      return;
    }

    try {
      await recordReturn({
        productId: selectedProduct._id,
        quantity: returnedQuantity,
        reason,
        reference: reference.trim() || undefined,
      }).unwrap();
      toastAlert("success", "Return recorded.", "top-right");
      setIsModalOpen(false);
      loadFirstPage();
    } catch (err) {
      toastAlert(
        "error",
        getErrorMessage(err, "Failed to record return."),
        "top-right",
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header action */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            Record Return
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Returns
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading && total === 0 ? "…" : total}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <RefreshCw className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Units Returned
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading && total === 0 ? "…" : totalQuantity}
                </p>
              </div>
              <div className="p-3 bg-violet-100 rounded-full">
                <Package className="h-6 w-6 text-violet-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors"
            />
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
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Returned
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading && movements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12">
                      <AppSpinner />
                    </td>
                  </tr>
                ) : (
                  movements.map((movement) => (
                    <tr key={movement._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-orange-50">
                            <RotateCcw className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {movement.productName}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              {movement.sku}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          +{movement.quantity} units
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {movement.reason || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {movement.reference || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatRelativeTime(movement.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && movements.length > 0 && hasMore && (
            <div className="flex justify-center py-4 border-t border-gray-100">
              <button
                onClick={fetchMore}
                className="px-4 py-2 text-sm font-medium text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
              >
                Load more
              </button>
            </div>
          )}

          {!isLoading && movements.length === 0 && (
            <div className="text-center py-12">
              <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No returns yet
              </h3>
              <p className="text-gray-600 mb-4">
                {searchInput
                  ? "Try adjusting your search"
                  : "Customer returns will show up here and go back into stock."}
              </p>
              {!searchInput && (
                <button
                  onClick={openModal}
                  className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  <Plus className="h-4 w-4" />
                  Record Return
                </button>
              )}
            </div>
          )}
        </div>

        {/* Record Return Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-500/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Record Return
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product
                    </label>
                    <ProductPicker
                      value={selectedProduct}
                      onChange={setSelectedProduct}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity Returned
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason
                    </label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                    >
                      {REASON_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reference / Order Number
                    </label>
                    <input
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                      placeholder="e.g. ORD-1042 (optional)"
                    />
                  </div>
                  {selectedProduct && quantity && Number(quantity) > 0 && (
                    <p className="text-sm text-gray-600">
                      New stock level:{" "}
                      <span className="font-medium text-green-600">
                        {selectedProduct.quantity + Number(quantity)}
                      </span>
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-2 p-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Saving..." : "Record Return"}
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
