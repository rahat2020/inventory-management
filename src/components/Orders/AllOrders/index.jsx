import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Filter,
  Eye,
  Truck,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  DollarSign,
  User,
  MapPin,
  Phone,
  Mail,
  X,
} from "react-feather";
import {
  useLazyGetOrdersListQuery,
  useGetOrderStatsQuery,
  useLazyGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
} from "../../../redux/api/ordersApi";
import { formatCurrency } from "../../../utils/appHelpers";
import toastAlert from "../../../utils/toastAlert";
import AppSpinner from "../../../helpers/ui/AppSpinner";
import { FilterDropdown } from "../../../helpers/ui/FilterDropdown";

const STATUS_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

const ROW_STATUS_OPTIONS = STATUS_OPTIONS.slice(1);

const PAYMENT_OPTIONS = [
  { label: "All Payments", value: "all" },
  { label: "Paid", value: "paid" },
  { label: "Partial", value: "partial" },
  { label: "Unpaid", value: "unpaid" },
];

const DROPDOWN_TRIGGER_CLASSES =
  "bg-white border border-gray-300 text-gray-900 px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500";

const STATUS_STYLES = {
  pending: "text-yellow-600 bg-yellow-50 border-yellow-200",
  confirmed: "text-indigo-600 bg-indigo-50 border-indigo-200",
  processing: "text-blue-600 bg-blue-50 border-blue-200",
  shipped: "text-purple-600 bg-purple-50 border-purple-200",
  delivered: "text-green-600 bg-green-50 border-green-200",
  cancelled: "text-red-600 bg-red-50 border-red-200",
};

const STATUS_ICON = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

const PAYMENT_STYLES = {
  paid: "text-green-600 bg-green-50",
  partial: "text-yellow-600 bg-yellow-50",
  unpaid: "text-red-600 bg-red-50",
};

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "—");

const getErrorMessage = (err, fallback) =>
  err?.data?.message || err?.error || fallback;

export default function AllOrdersPage() {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const [orders, setOrders] = useState([]);
  const [metaData, setMetaData] = useState({});
  const [page, setPage] = useState(1);

  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const [triggerGetOrders, { isFetching: isLoadingOrders }] =
    useLazyGetOrdersListQuery();
  const { data: orderStats, isLoading: isLoadingStats } =
    useGetOrderStatsQuery();
  const [triggerGetOrder, { data: orderDetails, isFetching: isLoadingDetails }] =
    useLazyGetOrderByIdQuery();
  const [updateOrderStatus, { isLoading: isUpdatingStatus }] =
    useUpdateOrderStatusMutation();

  const statusQueryValue = statusFilter === "all" ? "" : statusFilter;
  const paymentQueryValue = paymentFilter === "all" ? "" : paymentFilter;

  const loadFirstPage = useCallback(async () => {
    const res = await triggerGetOrders({
      search: searchTerm,
      status: statusQueryValue,
      paymentStatus: paymentQueryValue,
      page: 1,
      limit: 10,
    });
    if (res?.data?.success) {
      setOrders(res.data.orders);
      setMetaData(res.data);
      setPage(1);
    }
  }, [triggerGetOrders, searchTerm, statusQueryValue, paymentQueryValue]);

  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  const fetchMoreOrders = async () => {
    const nextPage = page + 1;
    const res = await triggerGetOrders({
      search: searchTerm,
      status: statusQueryValue,
      paymentStatus: paymentQueryValue,
      page: nextPage,
      limit: 10,
    });
    if (res?.data?.success) {
      setOrders((prev) => [...prev, ...res.data.orders]);
      setMetaData(res.data);
      setPage(nextPage);
    }
  };

  const hasMore = metaData?.page < metaData?.pages;
  const stats = orderStats || {};

  const openOrderDetails = (order) => {
    setSelectedOrderId(order._id);
    setIsOrderDetailsOpen(true);
    triggerGetOrder(order._id);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const previous = orders;
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)),
    );
    try {
      await updateOrderStatus({ orderId, status: newStatus }).unwrap();
      toastAlert("success", "Order status updated.", "top-right");
    } catch (err) {
      setOrders(previous);
      toastAlert(
        "error",
        getErrorMessage(err, "Failed to update order status."),
        "top-right",
      );
    }
  };

  const statCards = [
    {
      label: "Total Orders",
      value: stats.totalOrders ?? 0,
      icon: Package,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Pending",
      value: stats.pendingOrders ?? 0,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "Processing",
      value: stats.processingOrders ?? 0,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Shipped",
      value: stats.shippedOrders ?? 0,
      icon: Truck,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Delivered",
      value: stats.deliveredOrders ?? 0,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Cancelled",
      value: stats.cancelledOrders ?? 0,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Revenue",
      value: formatCurrency(stats.totalAmount || 0),
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Order Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">
                    {card.label}
                  </p>
                  <p className={`text-xl font-bold mt-0.5 ${card.color}`}>
                    {isLoadingStats ? "…" : card.value}
                  </p>
                </div>
                <div className={`p-2 rounded-full shrink-0 ${card.bg}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search orders, customers, or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 w-44">
                <Filter className="h-4 w-4 text-gray-500 shrink-0" />
                <FilterDropdown
                  buttonLabel="All Status"
                  options={STATUS_OPTIONS}
                  selectedValue={statusFilter}
                  onChange={(option) => setStatusFilter(option.value)}
                  headerClassName={`${DROPDOWN_TRIGGER_CLASSES} rounded-lg`}
                  dropdownMenuSize="180px"
                  showFocus
                />
              </div>
              <div className="w-44">
                <FilterDropdown
                  buttonLabel="All Payments"
                  options={PAYMENT_OPTIONS}
                  selectedValue={paymentFilter}
                  onChange={(option) => setPaymentFilter(option.value)}
                  headerClassName={`${DROPDOWN_TRIGGER_CLASSES} rounded-lg`}
                  dropdownMenuSize="180px"
                  showFocus
                />
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoadingOrders && orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12">
                      <AppSpinner />
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const StatusIcon = STATUS_ICON[order.status] || AlertCircle;
                    return (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.orderNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.customerName || "Unknown customer"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.customerEmail || "—"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              STATUS_STYLES[order.status] ||
                              "text-gray-600 bg-gray-50 border-gray-200"
                            }`}
                          >
                            <StatusIcon className="h-3.5 w-3.5" />
                            {capitalize(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              PAYMENT_STYLES[order.paymentStatus] ||
                              "text-gray-600 bg-gray-50"
                            }`}
                          >
                            {capitalize(order.paymentStatus)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.totalItems ?? "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openOrderDetails(order)}
                              className="text-violet-600 hover:text-violet-900 p-1 hover:bg-violet-50 rounded transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <select
                              value={order.status}
                              disabled={isUpdatingStatus}
                              onChange={(e) =>
                                handleStatusChange(order._id, e.target.value)
                              }
                              className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none disabled:opacity-60"
                            >
                              {ROW_STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!isLoadingOrders && orders.length > 0 && hasMore && (
            <div className="flex justify-center py-4 border-t border-gray-100">
              <button
                onClick={fetchMoreOrders}
                className="px-4 py-2 text-sm font-medium text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
              >
                Load more
              </button>
            </div>
          )}

          {!isLoadingOrders && orders.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No orders found
              </h3>
              <p className="text-gray-600">
                {searchInput || statusFilter !== "all" || paymentFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "No orders have been placed yet"}
              </p>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {isOrderDetailsOpen && selectedOrderId && (
          <div className="fixed inset-0 bg-gray-500/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Order Details {orderDetails ? `— ${orderDetails.orderNumber}` : ""}
                </h2>
                <button
                  onClick={() => setIsOrderDetailsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {isLoadingDetails || !orderDetails ? (
                <div className="py-16 flex justify-center">
                  <AppSpinner />
                </div>
              ) : (
                <>
                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${
                          STATUS_STYLES[orderDetails.status] ||
                          "text-gray-600 bg-gray-50 border-gray-200"
                        }`}
                      >
                        {capitalize(orderDetails.status)}
                      </span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          PAYMENT_STYLES[orderDetails.paymentStatus] ||
                          "text-gray-600 bg-gray-50"
                        }`}
                      >
                        {capitalize(orderDetails.paymentStatus)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          Customer Information
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-900">
                              {orderDetails.customerName || "Unknown customer"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-900">
                              {orderDetails.customerEmail || "—"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-900">
                              {orderDetails.customerPhone || "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          Shipping Address
                        </h3>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                          <span className="text-sm text-gray-900">
                            {orderDetails.shippingAddress || "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">
                        Order Items
                      </h3>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Item
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Qty
                              </th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                Price
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {(orderDetails.items || []).map((item, index) => (
                              <tr key={index}>
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {item.productName}
                                  <span className="text-gray-400"> · {item.sku}</span>
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {item.quantity}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900 text-right">
                                  {formatCurrency(item.price * item.quantity)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-gray-900">
                          {formatCurrency(orderDetails.subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Tax</span>
                        <span className="text-gray-900">
                          {formatCurrency(orderDetails.tax)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Shipping</span>
                        <span className="text-gray-900">
                          {formatCurrency(orderDetails.shippingCost)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-base font-medium text-gray-900">
                          Total
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(orderDetails.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 p-6 border-t border-gray-200">
                    <button
                      onClick={() => setIsOrderDetailsOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
