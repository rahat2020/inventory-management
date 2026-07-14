import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  DollarSign,
  CreditCard,
  ShoppingCart,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Award,
} from "react-feather";
import { useGetAnalyticsOverviewQuery } from "../../redux/api/analyticsApi";
import {
  useGetOrderStatsQuery,
  useGetSalesTrendQuery,
} from "../../redux/api/ordersApi";
import { formatCompactNumber, formatCurrency } from "../../utils/appHelpers";
import AppSpinner from "../../helpers/ui/AppSpinner";
import StatCard, { DeltaPill, TrendChip } from "../../helpers/ui/StatCard";

const PERIOD_TABS = [
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
];

const ORDER_STATUS_META = {
  pending: { label: "Pending", dot: "bg-gray-400" },
  confirmed: { label: "Confirmed", dot: "bg-blue-500" },
  processing: { label: "Processing", dot: "bg-amber-500" },
  shipped: { label: "Shipped", dot: "bg-violet-500" },
  delivered: { label: "Delivered", dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", dot: "bg-red-500" },
};

const PAYMENT_STATUS_META = {
  paid: { label: "Paid", icon: CheckCircle, tone: "text-emerald-600 bg-emerald-50" },
  partial: { label: "Partial", icon: Clock, tone: "text-amber-600 bg-amber-50" },
  unpaid: { label: "Unpaid", icon: XCircle, tone: "text-red-600 bg-red-50" },
};

const BAR_HUE_CLASSES = {
  violet: "bg-violet-500",
  green: "bg-emerald-500",
  pink: "bg-pink-500",
  blue: "bg-blue-500",
};

function SectionCard({ title, subtitle, children, action }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ children }) {
  return (
    <div className="py-10 text-center text-sm text-gray-500">{children}</div>
  );
}

// ranked-list row with a proportional magnitude bar — used for category
// performance, inventory value, top products, and top customers
function RankedBarRow({ label, sublabel, valueLabel, value, max, hue }) {
  const pct = max > 0 ? Math.max((value / max) * 100, 4) : 0;
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm mb-1">
        <div className="min-w-0">
          <p className="font-medium text-gray-900 truncate">{label}</p>
          {sublabel && (
            <p className="text-xs text-gray-500 truncate">{sublabel}</p>
          )}
        </div>
        <p className="font-semibold text-gray-900 shrink-0">{valueLabel}</p>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full ${BAR_HUE_CLASSES[hue]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2">
      <p className="text-sm font-semibold text-gray-900">
        {formatCurrency(payload[0].value)}
      </p>
      <p className="text-xs text-gray-500 mt-0.5">{label} &middot; Revenue</p>
    </div>
  );
}

function OrdersTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2">
      <p className="text-sm font-semibold text-gray-900">
        {payload[0].value} order{payload[0].value === 1 ? "" : "s"}
      </p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("weekly");

  const { data: analytics, isLoading: isLoadingAnalytics } =
    useGetAnalyticsOverviewQuery();
  const { data: orderStats, isLoading: isLoadingOrderStats } =
    useGetOrderStatsQuery();
  const { data: salesTrend, isFetching: isLoadingTrend } =
    useGetSalesTrendQuery(period);

  const chartData = useMemo(() => salesTrend?.points || [], [salesTrend]);

  const profit = analytics?.profitSummary || {};
  const orderStatusBreakdown = analytics?.orderStatusBreakdown || [];
  const paymentStatusBreakdown = analytics?.paymentStatusBreakdown || [];
  const categoryPerformance = analytics?.categoryPerformance || [];
  const inventoryByCategory = analytics?.inventoryByCategory || [];
  const topProducts = analytics?.topProducts || [];
  const topCustomers = analytics?.topCustomers || [];

  const totalOrdersForStatus = orderStatusBreakdown.reduce(
    (sum, s) => sum + s.count,
    0,
  );
  const maxCategoryRevenue = Math.max(
    0,
    ...categoryPerformance.map((c) => c.revenue),
  );
  const maxInventoryValue = Math.max(
    0,
    ...inventoryByCategory.map((c) => c.totalValue),
  );
  const maxProductRevenue = Math.max(0, ...topProducts.map((p) => p.revenue));
  const maxCustomerSpend = Math.max(
    0,
    ...topCustomers.map((c) => c.totalSpent),
  );

  return (
    <div className="min-h-screen p-6 space-y-6 bg-gradient-to-br from-violet-50 via-white to-white">
      {/* Stat tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Gross Profit"
          value={isLoadingAnalytics ? "…" : formatCurrency(profit.totalProfit)}
          icon={DollarSign}
          color="green"
          footer={
            !isLoadingAnalytics && (
              <DeltaPill tone={profit.marginPercent >= 30 ? "good" : "warning"}>
                {(profit.marginPercent || 0).toFixed(1)}% margin
              </DeltaPill>
            )
          }
        />
        <StatCard
          title="Avg Order Value"
          value={
            isLoadingOrderStats
              ? "…"
              : formatCurrency(orderStats?.averageOrderValue)
          }
          icon={CreditCard}
          color="violet"
          footer={
            !isLoadingOrderStats && (
              <DeltaPill>
                {(orderStats?.averageItems || 0).toFixed(1)} items / order
              </DeltaPill>
            )
          }
        />
        <StatCard
          title="Total Orders"
          value={isLoadingOrderStats ? "…" : orderStats?.totalOrders ?? 0}
          icon={ShoppingCart}
          color="pink"
          footer={
            !isLoadingOrderStats && (
              <TrendChip percent={orderStats?.trends?.ordersChangePercent} />
            )
          }
        />
        <StatCard
          title="Total Customers"
          value={isLoadingAnalytics ? "…" : analytics?.totalCustomers ?? 0}
          icon={Users}
          color="blue"
          footer={
            !isLoadingAnalytics && (
              <DeltaPill>{topCustomers.length} shown below</DeltaPill>
            )
          }
        />
      </div>

      {/* Sales performance — revenue + order volume, same period, separate axes */}
      <SectionCard
        title="Sales Performance"
        subtitle="Revenue and order volume over time"
        action={
          <div className="inline-flex rounded-lg border border-gray-200 p-1 self-start">
            {PERIOD_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setPeriod(tab.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  period === tab.key
                    ? "bg-violet-600 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Revenue
            </p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">
              {formatCurrency(salesTrend?.totalRevenue || 0)}
            </p>
            <div className="h-48 mt-3">
              {isLoadingTrend ? (
                <div className="h-full flex items-center justify-center">
                  <AppSpinner />
                </div>
              ) : chartData.length === 0 ? (
                <EmptyState>No order data yet</EmptyState>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="analyticsRevenueFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2dd4bf" stopOpacity={1} />
                        <stop offset="95%" stopColor="#5eead4" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#e5e7eb" vertical={false} strokeWidth={1} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      minTickGap={24}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      tickFormatter={(v) => formatCompactNumber(v)}
                      width={40}
                    />
                    <Tooltip
                      content={<RevenueTooltip />}
                      cursor={{ fill: "#2dd4bf", fillOpacity: 0.08 }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="url(#analyticsRevenueFill)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Orders
            </p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">
              {chartData.reduce((sum, p) => sum + (p.orders || 0), 0)}
            </p>
            <div className="h-48 mt-3">
              {isLoadingTrend ? (
                <div className="h-full flex items-center justify-center">
                  <AppSpinner />
                </div>
              ) : chartData.length === 0 ? (
                <EmptyState>No order data yet</EmptyState>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid stroke="#e5e7eb" vertical={false} strokeWidth={1} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      minTickGap={24}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      allowDecimals={false}
                      width={28}
                    />
                    <Tooltip content={<OrdersTooltip />} cursor={{ stroke: "#a78bfa", strokeWidth: 1 }} />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#8b5cf6"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: "#8b5cf6", strokeWidth: 0 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Order status + payment status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Order Status Mix" subtitle="Share of all orders by current status">
          {isLoadingAnalytics ? (
            <div className="py-8 flex justify-center">
              <AppSpinner />
            </div>
          ) : orderStatusBreakdown.length === 0 ? (
            <EmptyState>No orders yet</EmptyState>
          ) : (
            <div className="space-y-3">
              {orderStatusBreakdown.map((s) => {
                const meta = ORDER_STATUS_META[s.status] || {
                  label: s.status,
                  dot: "bg-gray-400",
                };
                const pct =
                  totalOrdersForStatus > 0
                    ? (s.count / totalOrdersForStatus) * 100
                    : 0;
                return (
                  <div key={s.status}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="inline-flex items-center gap-2 font-medium text-gray-900">
                        <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>
                      <span className="text-gray-500">
                        {s.count} &middot; {pct.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${meta.dot}`}
                        style={{ width: `${Math.max(pct, 3)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Payment Status" subtitle="Orders by payment collection state">
          {isLoadingAnalytics ? (
            <div className="py-8 flex justify-center">
              <AppSpinner />
            </div>
          ) : paymentStatusBreakdown.length === 0 ? (
            <EmptyState>No orders yet</EmptyState>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {["paid", "partial", "unpaid"].map((key) => {
                const entry = paymentStatusBreakdown.find(
                  (p) => p.status === key,
                );
                const meta = PAYMENT_STATUS_META[key];
                const Icon = meta.icon;
                return (
                  <div
                    key={key}
                    className="rounded-lg border border-gray-100 p-3"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${meta.tone}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-2">
                      {meta.label}
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {entry?.count || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(entry?.amount || 0)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Category performance vs current inventory value */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title="Category Performance"
          subtitle="Revenue sold by category (all time)"
        >
          {isLoadingAnalytics ? (
            <div className="py-8 flex justify-center">
              <AppSpinner />
            </div>
          ) : categoryPerformance.length === 0 ? (
            <EmptyState>No sales data yet</EmptyState>
          ) : (
            <div className="space-y-4">
              {categoryPerformance.map((c) => (
                <RankedBarRow
                  key={c.category}
                  label={c.category}
                  sublabel={`${c.unitsSold} units sold`}
                  valueLabel={formatCurrency(c.revenue)}
                  value={c.revenue}
                  max={maxCategoryRevenue}
                  hue="violet"
                />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Inventory Value by Category"
          subtitle="What's currently sitting in stock"
        >
          {isLoadingAnalytics ? (
            <div className="py-8 flex justify-center">
              <AppSpinner />
            </div>
          ) : inventoryByCategory.length === 0 ? (
            <EmptyState>No products yet</EmptyState>
          ) : (
            <div className="space-y-4">
              {inventoryByCategory.map((c) => (
                <RankedBarRow
                  key={c.category}
                  label={c.category}
                  sublabel={`${c.totalProducts} products · ${c.totalQuantity} units`}
                  valueLabel={formatCurrency(c.totalValue)}
                  value={c.totalValue}
                  max={maxInventoryValue}
                  hue="green"
                />
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Top products + top customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title="Top Products"
          subtitle="Best sellers by revenue"
          action={<Award className="w-5 h-5 text-pink-500" />}
        >
          {isLoadingAnalytics ? (
            <div className="py-8 flex justify-center">
              <AppSpinner />
            </div>
          ) : topProducts.length === 0 ? (
            <EmptyState>No sales data yet</EmptyState>
          ) : (
            <div className="space-y-4">
              {topProducts.map((p) => (
                <RankedBarRow
                  key={p.productId || p.sku}
                  label={p.name}
                  sublabel={`SKU ${p.sku} · ${p.unitsSold} units`}
                  valueLabel={formatCurrency(p.revenue)}
                  value={p.revenue}
                  max={maxProductRevenue}
                  hue="pink"
                />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Top Customers"
          subtitle="Highest lifetime spend"
          action={<Users className="w-5 h-5 text-blue-500" />}
        >
          {isLoadingAnalytics ? (
            <div className="py-8 flex justify-center">
              <AppSpinner />
            </div>
          ) : topCustomers.length === 0 ? (
            <EmptyState>No customers yet</EmptyState>
          ) : (
            <div className="space-y-4">
              {topCustomers.map((c) => (
                <RankedBarRow
                  key={c.customerEmail || c.customerName}
                  label={c.customerName}
                  sublabel={`${c.orders} order${c.orders === 1 ? "" : "s"}${
                    c.customerEmail ? ` · ${c.customerEmail}` : ""
                  }`}
                  valueLabel={formatCurrency(c.totalSpent)}
                  value={c.totalSpent}
                  max={maxCustomerSpend}
                  hue="blue"
                />
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
