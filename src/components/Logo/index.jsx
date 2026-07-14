// Brand mark — inline SVG so it stays crisp at any size (sidebar, collapsed
// sidebar, topbar, future auth screens) instead of a fixed-resolution image.
// Mirrors public/logo.svg (used for the favicon) — keep both in sync if the
// brand mark changes; the favicon can't reuse this component since it's
// rendered outside the React tree by the browser chrome.
export default function Logo({ size = 40, className = "" }) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      role="img"
      aria-label="StockMaster"
      className={`shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id="stockmaster-logo-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#c026d3" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#stockmaster-logo-gradient)" />
      <g
        transform="translate(9.5, 9.5) scale(0.85)"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </g>
    </svg>
  );
}
