import { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  MessageCircle,
  Search,
  Settings,
  User,
  XCircle,
} from "react-feather";
import { useGetStockLevelsSummaryQuery } from "../../redux/api/stockMovementsApi";
import { useClickOutside } from "../../hooks/useClickOutside";
import routes from "../../routes/routes";

function usePageMeta() {
  const { pathname } = useLocation();
  return useMemo(() => {
    const match = routes.find((route) => route.path === pathname);
    return {
      title: match?.title || "StockMaster",
      subtitle: match?.subtitle || "",
    };
  }, [pathname]);
}

function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  useClickOutside(menuRef, () => setOpen(false));
  const navigate = useNavigate();
  const { data } = useGetStockLevelsSummaryQuery();

  const lowStockItems = data?.details?.lowStockItems || [];
  const outOfStockItems = data?.details?.outOfStockItems || [];
  const alertCount = lowStockItems.length + outOfStockItems.length;

  const goToStockLevels = () => {
    setOpen(false);
    navigate("/stock-levels");
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        aria-label="Stock alerts"
      >
        <Bell className="w-5 h-5" />
        {alertCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold">
            {alertCount > 9 ? "9+" : alertCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">
              Stock alerts
            </p>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {alertCount === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-500 text-center">
                No stock alerts right now
              </p>
            ) : (
              <>
                {outOfStockItems.slice(0, 5).map((product) => (
                  <button
                    key={product._id}
                    onClick={goToStockLevels}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                      <XCircle className="w-4 h-4" />
                    </span>
                    <span className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-red-600">Out of stock</p>
                    </span>
                  </button>
                ))}
                {lowStockItems.slice(0, 5).map((product) => (
                  <button
                    key={product._id}
                    onClick={goToStockLevels}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </span>
                    <span className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-amber-600">
                        {product.quantity} left &middot; Low stock
                      </p>
                    </span>
                  </button>
                ))}
              </>
            )}
          </div>
          <button
            onClick={goToStockLevels}
            className="w-full px-4 py-2.5 text-xs font-medium text-violet-600 hover:bg-violet-50 transition-colors text-center border-t border-gray-100"
          >
            View all stock levels
          </button>
        </div>
      )}
    </div>
  );
}

function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  useClickOutside(menuRef, () => setOpen(false));
  const navigate = useNavigate();

  const goTo = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center p-1 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Account menu"
      >
        <span className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white shrink-0">
          <User className="w-4 h-4" />
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden py-1">
          <button
            onClick={() => goTo("/settings")}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button
            onClick={() => goTo("/ai-chat")}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
          >
            <MessageCircle className="w-4 h-4" />
            AI Chat
          </button>
        </div>
      )}
    </div>
  );
}

export default function Topbar() {
  const { title, subtitle } = usePageMeta();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200 px-6 py-4 shrink-0">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products, orders..."
              className="w-64 pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-colors"
            />
          </div>
          <NotificationsMenu />
          <div className="w-px h-6 bg-gray-200" />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
