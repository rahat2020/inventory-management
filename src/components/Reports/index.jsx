import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Download,
  DollarSign,
  TrendingUp,
  Users,
  Zap,
  Package,
} from "react-feather";
import {
  useGetAnalyticsOverviewQuery,
  useGetRestockForecastQuery,
} from "../../redux/api/analyticsApi";
import { formatCurrency, formatCompactNumber, exportToCsv } from "../../utils/appHelpers";
import AppSpinner from "../../helpers/ui/AppSpinner";

const ORDER_STATUS_COLORS = {
  pending: "bg-yellow-400",
  confirmed: "bg-indigo-400",
  processing: "bg-blue-400",
  shipped: "bg-purple-400",
  delivered: "bg-green-500",
  cancelled: "bg-red-400",
};

const PAYMENT_STATUS_COLORS = {
  paid: "bg-green-500",
  partial: "bg-yellow-400",
  unpaid: "bg-red-400",
};

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "—");

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2">
      <p className="text-base font-semibold text-gray-900">
        {formatCurrency(payload[0].value)}
      </p>
      <p className="text-xs text-gray-500 mt-0.5">{label} &middot; Revenue</p>
    </div>
  );
}

function BreakdownList({ title, data, colorMap, valueKey = "count", totalLabel }) {
  const total = data.reduce((sum, d) => sum + (d[valueKey] || 0), 0);
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {data.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-500">No data yet</div>
      ) : (
        <div className="space-y-3">
          {data.map((item) => {
            const pct = total > 0 ? (item[valueKey] / total) * 100 : 0;
            return (
              <div key={item.status}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700 capitalize">
                    {capitalize(item.status)}
                  </span>
                  <span className="text-gray-500">
                    {item[valueKey]} {totalLabel} &middot; {pct.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      colorMap[item.status] || "bg-gray-400"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  const { data: overview, isLoading: isLoadingOverview } =
    useGetAnalyticsOverviewQuery();
  const { data: forecast, isLoading: isLoadingForecast } =
    useGetRestockForecastQuery();

  const profit = overview?.profitSummary || {};
  const orderStatusBreakdown = overview?.orderStatusBreakdown || [];
  const paymentStatusBreakdown = overview?.paymentStatusBreakdown || [];
  const topProducts = overview?.topProducts || [];
  const topCustomers = overview?.topCustomers || [];
  const categoryPerformance = overview?.categoryPerformance || [];
  const inventoryByCategory = overview?.inventoryByCategory || [];

  const isLoading = isLoadingOverview || isLoadingForecast;

  const handleExportSummary = () => {
    exportToCsv("stockmaster-report-summary", [
      {
        metric: "Total Revenue",
        value: profit.totalRevenue || 0,
      },
      { metric: "Total Cost", value: profit.totalCost || 0 },
      { metric: "Total Profit", value: profit.totalProfit || 0 },
      {
        metric: "Margin %",
        value: (profit.marginPercent || 0).toFixed(2),
      },
      { metric: "Total Customers", value: overview?.totalCustomers || 0 },
      {
        metric: "Products To Reorder",
        value: forecast?.summary?.productsToReorder || 0,
      },
      {
        metric: "Estimated Reorder Cost",
        value: forecast?.summary?.totalEstimatedCost || 0,
      },
    ]);
  };

  const handleExportTopProducts = () => {
    exportToCsv(
      "stockmaster-top-products",
      topProducts.map((p) => ({
        name: p.name,
        sku: p.sku,
        unitsSold: p.unitsSold,
        revenue: p.revenue,
      })),
    );
  };

  const handleExportTopCustomers = () => {
    exportToCsv(
      "stockmaster-top-customers",
      topCustomers.map((c) => ({
        customer: c.customerName,
        email: c.customerEmail,
        orders: c.orders,
        totalSpent: c.totalSpent,
      })),
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-end">
          <button
            onClick={handleExportSummary}
            disabled={isLoading}
            className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            Export Summary (CSV)
          </button>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? "…" : formatCurrency(profit.totalRevenue)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Profit</p>
                <p className="text-2xl font-bold text-violet-600">
                  {isLoading ? "…" : formatCurrency(profit.totalProfit)}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isLoading ? "" : `${(profit.marginPercent || 0).toFixed(1)}% margin`}
                </p>
              </div>
              <div className="p-3 bg-violet-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-violet-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? "…" : overview?.totalCustomers ?? 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Restock Needed
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {isLoading
                    ? "…"
                    : formatCurrency(forecast?.summary?.totalEstimatedCost)}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isLoading
                    ? ""
                    : `${forecast?.summary?.productsToReorder || 0} products`}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Status breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {isLoading ? (
            <>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex justify-center py-16">
                <AppSpinner />
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex justify-center py-16">
                <AppSpinner />
              </div>
            </>
          ) : (
            <>
              <BreakdownList
                title="Orders by Status"
                data={orderStatusBreakdown}
                colorMap={ORDER_STATUS_COLORS}
                totalLabel="orders"
              />
              <BreakdownList
                title="Payments by Status"
                data={paymentStatusBreakdown}
                colorMap={PAYMENT_STATUS_COLORS}
                totalLabel="orders"
              />
            </>
          )}
        </div>

        {/* Category performance */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue by Category
          </h3>
          <div className="h-72">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <AppSpinner />
              </div>
            ) : categoryPerformance.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-500">
                No sales data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryPerformance}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="categoryRevenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2dd4bf" stopOpacity={1} />
                      <stop offset="95%" stopColor="#5eead4" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e5e7eb" vertical={false} strokeWidth={1} />
                  <XAxis
                    dataKey="category"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                    minTickGap={16}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                    tickFormatter={(v) => formatCompactNumber(v)}
                    width={44}
                  />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ fill: "#2dd4bf", fillOpacity: 0.08 }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="url(#categoryRevenueFill)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top products / top customers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Top Products
              </h3>
              <button
                onClick={handleExportTopProducts}
                disabled={isLoading || topProducts.length === 0}
                className="text-xs font-medium text-violet-600 hover:text-violet-700 disabled:opacity-40"
              >
                Export CSV
              </button>
            </div>
            {isLoading ? (
              <div className="py-8 flex justify-center">
                <AppSpinner />
              </div>
            ) : topProducts.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                No sales data yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-400 uppercase tracking-wide">
                      <th className="px-2 pb-2 font-semibold">Product</th>
                      <th className="px-2 pb-2 font-semibold">Units Sold</th>
                      <th className="px-2 pb-2 font-semibold text-right">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {topProducts.map((p) => (
                      <tr key={p.productId || p.sku}>
                        <td className="px-2 py-3">
                          <p className="font-medium text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.sku}</p>
                        </td>
                        <td className="px-2 py-3 text-gray-700">{p.unitsSold}</td>
                        <td className="px-2 py-3 text-right font-medium text-gray-900">
                          {formatCurrency(p.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Top Customers
              </h3>
              <button
                onClick={handleExportTopCustomers}
                disabled={isLoading || topCustomers.length === 0}
                className="text-xs font-medium text-violet-600 hover:text-violet-700 disabled:opacity-40"
              >
                Export CSV
              </button>
            </div>
            {isLoading ? (
              <div className="py-8 flex justify-center">
                <AppSpinner />
              </div>
            ) : topCustomers.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                No orders data yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-400 uppercase tracking-wide">
                      <th className="px-2 pb-2 font-semibold">Customer</th>
                      <th className="px-2 pb-2 font-semibold">Orders</th>
                      <th className="px-2 pb-2 font-semibold text-right">
                        Total Spent
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {topCustomers.map((c, i) => (
                      <tr key={c.customerEmail || i}>
                        <td className="px-2 py-3">
                          <p className="font-medium text-gray-900">
                            {c.customerName || "Unknown customer"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {c.customerEmail}
                          </p>
                        </td>
                        <td className="px-2 py-3 text-gray-700">{c.orders}</td>
                        <td className="px-2 py-3 text-right font-medium text-gray-900">
                          {formatCurrency(c.totalSpent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Inventory value by category */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Inventory Value by Category
          </h3>
          {isLoading ? (
            <div className="py-8 flex justify-center">
              <AppSpinner />
            </div>
          ) : inventoryByCategory.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">
              No inventory data yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 uppercase tracking-wide">
                    <th className="px-2 pb-2 font-semibold">Category</th>
                    <th className="px-2 pb-2 font-semibold">
                      <div className="flex items-center gap-1">
                        <Package className="h-3.5 w-3.5" />
                        Products
                      </div>
                    </th>
                    <th className="px-2 pb-2 font-semibold">Quantity</th>
                    <th className="px-2 pb-2 font-semibold text-right">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {inventoryByCategory.map((c) => (
                    <tr key={c.category}>
                      <td className="px-2 py-3 font-medium text-gray-900">
                        {c.category}
                      </td>
                      <td className="px-2 py-3 text-gray-700">
                        {c.totalProducts}
                      </td>
                      <td className="px-2 py-3 text-gray-700">
                        {c.totalQuantity}
                      </td>
                      <td className="px-2 py-3 text-right font-medium text-gray-900">
                        {formatCurrency(c.totalValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
