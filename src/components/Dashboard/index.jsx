import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDate as getBanglaDate } from "bangla-calendar";
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
  Package,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Circle,
  XCircle,
  Plus,
  Tag,
  ShoppingCart,
  RefreshCw,
  ArrowDown,
  ArrowUp,
  Clock,
  Thermometer,
  Calendar,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
} from "react-feather";
import {
  useGetStockLevelsSummaryQuery,
  useGetStockMovementsQuery,
} from "../../redux/api/stockMovementsApi";
import {
  useGetOrderStatsQuery,
  useGetOrdersListQuery,
  useGetSalesTrendQuery,
} from "../../redux/api/ordersApi";
import {
  formatCompactNumber,
  formatCurrency,
  formatRelativeTime,
} from "../../utils/appHelpers";
import AppSpinner from "../../helpers/ui/AppSpinner";

const ORDER_STEPS = [
  { key: "pending", label: "Order Placed", desc: "Order received, awaiting confirmation" },
  { key: "confirmed", label: "Confirmed", desc: "Order confirmed and being prepared" },
  { key: "processing", label: "Processing", desc: "Items are being picked and packed" },
  { key: "shipped", label: "Shipped", desc: "Package has left the warehouse" },
  { key: "delivered", label: "Delivered", desc: "Package delivered to customer" },
];

const MOVEMENT_ICON = {
  incoming: { icon: ArrowUp, color: "text-green-600 bg-green-50" },
  outgoing: { icon: ArrowDown, color: "text-blue-600 bg-blue-50" },
  adjustment: { icon: RefreshCw, color: "text-gray-600 bg-gray-100" },
  return: { icon: RefreshCw, color: "text-orange-600 bg-orange-50" },
  damage: { icon: AlertTriangle, color: "text-red-600 bg-red-50" },
};

const MOVEMENT_LABEL = {
  incoming: "Stock received",
  outgoing: "Stock shipped out",
  adjustment: "Stock adjusted",
  return: "Stock returned",
  damage: "Stock damaged",
};

const PERIOD_TABS = [
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
];

// WMO weather codes -> icon + label + a subtle "forecast" animation
// (https://open-meteo.com/en/docs)
const WEATHER_CODE_MAP = {
  0: { label: "Clear sky", icon: Sun, animation: "animate-[spin_10s_linear_infinite]" },
  1: { label: "Mainly clear", icon: Sun, animation: "animate-[spin_10s_linear_infinite]" },
  2: { label: "Partly cloudy", icon: Cloud, animation: "animate-[bounce_3s_ease-in-out_infinite]" },
  3: { label: "Overcast", icon: Cloud, animation: "animate-pulse" },
  45: { label: "Foggy", icon: Cloud, animation: "animate-pulse" },
  48: { label: "Foggy", icon: Cloud, animation: "animate-pulse" },
  51: { label: "Light drizzle", icon: CloudDrizzle, animation: "animate-bounce" },
  53: { label: "Drizzle", icon: CloudDrizzle, animation: "animate-bounce" },
  55: { label: "Dense drizzle", icon: CloudDrizzle, animation: "animate-bounce" },
  61: { label: "Light rain", icon: CloudRain, animation: "animate-bounce" },
  63: { label: "Rain", icon: CloudRain, animation: "animate-bounce" },
  65: { label: "Heavy rain", icon: CloudRain, animation: "animate-bounce" },
  71: { label: "Light snow", icon: CloudSnow, animation: "animate-bounce" },
  73: { label: "Snow", icon: CloudSnow, animation: "animate-bounce" },
  75: { label: "Heavy snow", icon: CloudSnow, animation: "animate-bounce" },
  80: { label: "Rain showers", icon: CloudRain, animation: "animate-bounce" },
  81: { label: "Rain showers", icon: CloudRain, animation: "animate-bounce" },
  82: { label: "Violent showers", icon: CloudRain, animation: "animate-bounce" },
  95: { label: "Thunderstorm", icon: CloudLightning, animation: "animate-pulse" },
  96: { label: "Thunderstorm", icon: CloudLightning, animation: "animate-pulse" },
  99: { label: "Thunderstorm", icon: CloudLightning, animation: "animate-pulse" },
};

const DHAKA_COORDS = { latitude: 23.8103, longitude: 90.4125 };

// ticks every second so the clock stays live
function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

// fetches current Dhaka weather from Open-Meteo (free, no API key) and
// refreshes every 15 minutes
function useDhakaWeather() {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchWeather = async () => {
      try {
        const params = new URLSearchParams({
          latitude: DHAKA_COORDS.latitude,
          longitude: DHAKA_COORDS.longitude,
          current: "temperature_2m,weather_code",
          timezone: "Asia/Dhaka",
        });
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
        );
        const data = await res.json();
        if (!cancelled) {
          setWeather({
            temperature: data?.current?.temperature_2m,
            weatherCode: data?.current?.weather_code,
          });
        }
      } catch {
        if (!cancelled) setWeather(null);
      }
    };

    fetchWeather();
    const id = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return weather;
}

function WeatherClockBar() {
  const now = useLiveClock();
  const weather = useDhakaWeather();
  const weatherMeta =
    weather?.weatherCode !== undefined
      ? WEATHER_CODE_MAP[weather.weatherCode] || { label: "—", icon: Cloud }
      : null;
  const WeatherIcon = weatherMeta?.icon || Thermometer;

  const timeLabel = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  const englishDateLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const banglaDateLabel = getBanglaDate(now, {
    format: "D MMMM, YYYY",
    calculationMethod: "BD",
  });

  const items = [
    { icon: Clock, text: timeLabel },
    { icon: Calendar, text: banglaDateLabel, lang: "bn" },
    { icon: Calendar, text: englishDateLabel },
  ];

  return (
    <div className="grid grid-cols-12 gap-3">
      {/* Clock + dates — 9/12 */}
      <div className="col-span-12 lg:col-span-9 flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 text-sm text-gray-700"
          >
            <item.icon className="w-4 h-4 text-violet-600 shrink-0" />
            <span lang={item.lang} className="font-medium whitespace-nowrap">
              {item.text}
            </span>
          </div>
        ))}
      </div>

      {/* Weather — 3/12 */}
      <div className="col-span-12 lg:col-span-3 flex items-center justify-between gap-3 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 p-4 shadow-sm text-white">
        <div className={`shrink-0 ${weatherMeta?.animation || ""}`}>
          <WeatherIcon className="w-9 h-9" />
        </div>
        <div className="text-right min-w-0">
          <p className="text-2xl font-bold leading-none whitespace-nowrap">
            {weather?.temperature !== undefined
              ? `${Math.round(weather.temperature)}°C`
              : "--"}
          </p>
          <p className="text-xs text-violet-100 mt-1.5 truncate">
            {weather ? weatherMeta?.label || "—" : "Loading…"} &middot; Dhaka
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, footer }) {
  const gradientClasses = {
    violet: "from-violet-500 to-purple-600",
    green: "from-emerald-500 to-green-600",
    amber: "from-amber-400 to-orange-500",
    pink: "from-pink-500 to-rose-600",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-all duration-200">
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br ${gradientClasses[color]} shadow-md`}
      >
        <Icon className="w-7 h-7 text-white" />
      </div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-4">
        {title}
      </p>
      <p className="text-3xl font-extrabold text-gray-900 mt-1 truncate">
        {value}
      </p>
      {footer && <div className="mt-3 text-xs">{footer}</div>}
    </div>
  );
}

function TrendChip({ percent, positiveIsGood = true }) {
  if (percent === null || percent === undefined) {
    return <span className="text-gray-400">No data for last week</span>;
  }
  const isPositive = percent >= 0;
  const isGood = positiveIsGood ? isPositive : !isPositive;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-1 font-medium ${
        isGood ? "text-green-600" : "text-red-600"
      }`}
    >
      <Icon className="w-3 h-3" />
      {Math.abs(percent).toFixed(1)}% vs last week
    </span>
  );
}

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

export default function DashboardPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("weekly");

  const { data: stockSummary, isLoading: isLoadingStock } =
    useGetStockLevelsSummaryQuery();
  const { data: orderStats, isLoading: isLoadingOrderStats } =
    useGetOrderStatsQuery();
  const { data: salesTrend, isFetching: isLoadingTrend } =
    useGetSalesTrendQuery(period);
  const { data: recentMovements, isLoading: isLoadingMovements } =
    useGetStockMovementsQuery({ limit: 5 });
  const { data: latestOrders, isLoading: isLoadingLatestOrder } =
    useGetOrdersListQuery({ limit: 1 });

  const summary = stockSummary?.summary || {};
  const stats = orderStats || {};
  const latestOrder = latestOrders?.orders?.[0];

  const chartData = useMemo(() => salesTrend?.points || [], [salesTrend]);

  const currentStepIndex = latestOrder
    ? ORDER_STEPS.findIndex((s) => s.key === latestOrder.status)
    : -1;
  const isCancelled = latestOrder?.status === "cancelled";

  return (
    <div className="min-h-screen p-6 space-y-6 bg-gradient-to-br from-violet-50 via-white to-white">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Overview of your inventory and order performance
        </p>
      </div>

      <WeatherClockBar />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={isLoadingStock ? "…" : summary.totalProducts ?? 0}
          icon={Package}
          color="violet"
          footer={
            <span className="text-gray-500">
              {summary.productsAddedThisWeek > 0
                ? `+${summary.productsAddedThisWeek} added this week`
                : "No new products this week"}
            </span>
          }
        />
        <StatCard
          title="Total Stock Value"
          value={isLoadingStock ? "…" : formatCurrency(summary.totalValue)}
          icon={DollarSign}
          color="green"
          footer={
            <span className="text-gray-500">
              {summary.unitsRestockedThisWeek > 0
                ? `+${summary.unitsRestockedThisWeek} units restocked this week`
                : "No restocks this week"}
            </span>
          }
        />
        <StatCard
          title="Low Stock Items"
          value={isLoadingStock ? "…" : summary.lowStock ?? 0}
          icon={AlertTriangle}
          color="amber"
          footer={<span className="text-amber-700">Attention needed</span>}
        />
        <StatCard
          title="Total Revenue"
          value={isLoadingOrderStats ? "…" : formatCurrency(stats.totalAmount)}
          icon={TrendingUp}
          color="pink"
          footer={
            <TrendChip percent={stats.trends?.revenueChangePercent} />
          }
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Revenue Trend
              </h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(salesTrend?.totalRevenue || 0)}
              </p>
              <div className="text-xs mt-1">
                <TrendChip percent={stats.trends?.revenueChangePercent} />
              </div>
            </div>
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
          </div>

          <div className="mt-6 h-72">
            {isLoadingTrend ? (
              <div className="h-full flex items-center justify-center">
                <AppSpinner />
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-500">
                No order data yet for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2dd4bf" stopOpacity={1} />
                      <stop offset="95%" stopColor="#5eead4" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="#e5e7eb"
                    vertical={false}
                    strokeWidth={1}
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                    minTickGap={24}
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
                    fill="url(#revenueFill)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Order Tracking */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Latest Order
            </h3>
            <button
              onClick={() => navigate("/all-orders")}
              className="text-xs font-medium text-violet-600 hover:text-violet-700"
            >
              View all
            </button>
          </div>

          {isLoadingLatestOrder ? (
            <div className="py-8 flex justify-center">
              <AppSpinner />
            </div>
          ) : !latestOrder ? (
            <div className="py-8 text-center text-sm text-gray-500">
              No orders yet
            </div>
          ) : (
            <>
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium text-gray-900">
                  {latestOrder.orderNumber}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {latestOrder.customerName || "Unknown customer"} &middot;{" "}
                  {formatCurrency(latestOrder.totalAmount)}
                </p>
              </div>

              {isCancelled ? (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg p-3 text-sm font-medium">
                  <XCircle className="w-4 h-4" />
                  This order was cancelled
                </div>
              ) : (
                <div className="space-y-4">
                  {ORDER_STEPS.map((step, index) => {
                    const isDone = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    return (
                      <div key={step.key} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          {isDone ? (
                            <CheckCircle
                              className={`w-5 h-5 ${
                                isCurrent ? "text-violet-600" : "text-green-500"
                              }`}
                            />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-300" />
                          )}
                          {index < ORDER_STEPS.length - 1 && (
                            <div
                              className={`w-px h-6 mt-1 ${
                                index < currentStepIndex
                                  ? "bg-green-400"
                                  : "bg-gray-200"
                              }`}
                            />
                          )}
                        </div>
                        <div className="min-w-0 -mt-0.5">
                          <p
                            className={`text-sm font-medium ${
                              isDone ? "text-gray-900" : "text-gray-400"
                            }`}
                          >
                            {step.label}
                          </p>
                          <p
                            className={`text-xs ${
                              isDone ? "text-gray-500" : "text-gray-400"
                            }`}
                          >
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          {isLoadingMovements ? (
            <div className="py-8 flex justify-center">
              <AppSpinner />
            </div>
          ) : !recentMovements?.movements?.length ? (
            <div
              className="rounded-lg py-10 text-center text-sm text-gray-500"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, #f3f4f6 0, #f3f4f6 1px, transparent 1px, transparent 12px)",
              }}
            >
              No stock movements yet
            </div>
          ) : (
            <div className="space-y-4">
              {recentMovements.movements.map((movement) => {
                const meta =
                  MOVEMENT_ICON[movement.movementType] ||
                  MOVEMENT_ICON.adjustment;
                const Icon = meta.icon;
                return (
                  <div
                    key={movement._id}
                    className="flex items-start gap-3"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${meta.color}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {MOVEMENT_LABEL[movement.movementType] ||
                          "Stock movement"}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {movement.productName} &middot; {movement.quantity}{" "}
                        units
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatRelativeTime(movement.createdAt)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/stock-levels")}
              className="w-full flex items-center space-x-3 p-3 rounded-md hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-md flex items-center justify-center bg-violet-100">
                <Plus className="w-5 h-5 text-violet-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">
                Add New Product
              </span>
            </button>
            <button
              onClick={() => navigate("/categories")}
              className="w-full flex items-center space-x-3 p-3 rounded-md hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-md flex items-center justify-center bg-green-100">
                <Tag className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">
                Manage Categories
              </span>
            </button>
            <button
              onClick={() => navigate("/all-orders")}
              className="w-full flex items-center space-x-3 p-3 rounded-md hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-md flex items-center justify-center bg-pink-100">
                <ShoppingCart className="w-5 h-5 text-pink-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">
                View All Orders
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
