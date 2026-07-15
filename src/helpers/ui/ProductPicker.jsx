import { useEffect, useRef, useState } from "react";
import { Search, X } from "react-feather";
import { useLazyGetProductsListQuery } from "../../redux/api/productsApi";
import { useClickOutside } from "../../hooks/useClickOutside";

// Debounced product search-and-select used by the stock-movement "record"
// modals (Incoming / Outgoing / Returns) — returns the full product object
// via onChange so callers have `_id`, `quantity`, `price`, etc. on hand.
export default function ProductPicker({
  value,
  onChange,
  placeholder = "Search product by name or SKU...",
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const [triggerSearch, { data, isFetching }] = useLazyGetProductsListQuery();

  useEffect(() => {
    if (!query) return;
    const timer = setTimeout(() => {
      triggerSearch({ name: query, limit: 8 });
      setIsOpen(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, triggerSearch]);

  useClickOutside(containerRef, () => setIsOpen(false));

  const results = data?.data || [];

  if (value) {
    return (
      <div className="flex items-center justify-between gap-2 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {value.name}
          </p>
          <p className="text-xs text-gray-500">
            {value.sku} &middot; {value.quantity} in stock
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-gray-400 hover:text-gray-600 shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query && setIsOpen(true)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
        autoComplete="off"
      />
      {isOpen && query && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-56 overflow-y-auto">
          {isFetching ? (
            <div className="px-3 py-2 text-sm text-gray-500">Searching…</div>
          ) : results.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              No products match "{query}"
            </div>
          ) : (
            results.map((product) => (
              <button
                type="button"
                key={product._id}
                onClick={() => {
                  onChange(product);
                  setQuery("");
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-violet-50 transition-colors"
              >
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-xs text-gray-500">
                  {product.sku} &middot; {product.quantity} in stock
                </p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
