import { TrendingUp, TrendingDown } from "react-feather";

export const DELTA_TONE_CLASSES = {
  good: "bg-emerald-50 text-emerald-700",
  bad: "bg-red-50 text-red-700",
  warning: "bg-amber-50 text-amber-700",
  neutral: "bg-gray-100 text-gray-500",
};

export function DeltaPill({ tone = "neutral", icon: Icon, children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${DELTA_TONE_CLASSES[tone]}`}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      {children}
    </span>
  );
}

// percent-change pill — pass `positiveIsGood={false}` for metrics where a
// rise is bad news (e.g. cancellation rate)
export function TrendChip({ percent, positiveIsGood = true, suffix = "vs last week" }) {
  if (percent === null || percent === undefined) {
    return <DeltaPill>No data for last week</DeltaPill>;
  }
  const isPositive = percent >= 0;
  const isGood = positiveIsGood ? isPositive : !isPositive;
  return (
    <DeltaPill
      tone={isGood ? "good" : "bad"}
      icon={isPositive ? TrendingUp : TrendingDown}
    >
      {Math.abs(percent).toFixed(1)}% {suffix}
    </DeltaPill>
  );
}

const GRADIENT_CLASSES = {
  violet: "from-violet-500 to-purple-600",
  green: "from-emerald-500 to-green-600",
  amber: "from-amber-400 to-orange-500",
  pink: "from-pink-500 to-rose-600",
  blue: "from-blue-500 to-indigo-600",
};
const GLOW_CLASSES = {
  violet: "bg-violet-200",
  green: "bg-emerald-200",
  amber: "bg-amber-200",
  pink: "bg-pink-200",
  blue: "bg-blue-200",
};

export default function StatCard({ title, value, icon: Icon, color, footer }) {
  return (
    <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div
        className={`absolute -right-8 -top-8 w-28 h-28 rounded-full ${GLOW_CLASSES[color]} opacity-25 blur-2xl pointer-events-none`}
      />
      <div
        className={`relative w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br ${GRADIENT_CLASSES[color]} shadow-md`}
      >
        <Icon className="w-7 h-7 text-white" />
      </div>
      <p className="relative text-xs font-semibold text-gray-500 uppercase tracking-wide mt-4">
        {title}
      </p>
      <p className="relative text-3xl font-extrabold text-gray-900 mt-1 truncate">
        {value}
      </p>
      {footer && <div className="relative mt-3 flex flex-wrap gap-1.5">{footer}</div>}
    </div>
  );
}
