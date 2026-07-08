# inventory-management (package name: inventory-react)

Vite + React 19 SPA dashboard for inventory management, with a floating and
full-page AI chat assistant. Talks to the API in `../server`.

## Run

```
npm install
npm run dev        # vite dev server, default http://localhost:5173
npm run build
npm run lint
```

Requires `../server` running (default `http://localhost:5000`) and
`VITE_API_BASE_URL` set in `.env` (currently
`http://localhost:5000/api/v1`). Vite only exposes `VITE_*`-prefixed env
vars to the client (`src/config/api.js` reads `import.meta.env.VITE_API_BASE_URL`).

## Stack

- React 19, React Router 7 (`BrowserRouter`, routes rendered inside a
  `DashboardLayout` via nested `<Route>` + `<Outlet>`)
- Redux Toolkit + RTK Query for server state, `redux-persist` for local
  persistence (`src/redux/store.js`)
- Tailwind CSS v4 (via `@tailwindcss/vite` plugin, no `tailwind.config.js` —
  v4 is CSS-first, see `src/index.css`)
- `@ai-sdk/react` (`useChat`) for the streaming chat UI
- `react-feather` for icons, `react-infinite-scroll-component` for
  infinite-scroll tables, `nprogress` for route-change loading bar,
  `react-error-boundary` per-route

## Structure

- `src/App.jsx` — top-level `<Routes>`. Every route is wrapped in its own
  `<ErrorBoundary FallbackComponent={FallbackErrorUI}>` so one page crashing
  doesn't take down the shell. NProgress start/done fires on every location
  change.
- `src/routes/routes.js` — the single source of truth for pages: `{ path,
  name, element }[]`, consumed by `App.jsx`. Add new pages here, not as
  scattered `<Route>` JSX.
- `src/layout/DashboardLayout.jsx` — persistent chrome: `Sidebar` +
  scrollable `<Outlet/>` + `FloatingChat` (chat widget is global, mounted
  once here — don't re-mount it inside individual pages).
- `src/components/<Feature>/index.jsx` — one folder per page/feature
  (`Dashboard`, `Inventory/Products`, `Inventory/Category`,
  `Inventory/StockLevels`, `Orders/AllOrders`, `Settings`, `Chat`). Modals
  for a feature live in a `modals/` subfolder next to it (see
  `Inventory/Products/modals/AddProductModal.jsx`).
- `src/helpers/ui/` — shared presentational primitives: `AppButton`,
  `AppInput`, `AppModal`, `AppDropdown`, `AppDataTable`, `AppSpinner`,
  `Loader`, `FallbackErrorUI`. Reach for these before writing new raw
  `<table>`/`<input>` markup.
- `src/redux/api/*Api.js` — one RTK Query slice per resource
  (`productsApi`, `categoriesApi`, `invoicesApi`). Each must be registered
  in `src/redux/store.js` (`reducerPath` in `reducer`, `.middleware` in the
  `concat()` chain) or its queries silently no-op.
- `src/redux/app/appSlice.js` — misc persisted UI state (modal props,
  filters, sidebar path, active tabs) — a grab-bag slice, not per-domain.
- `src/hooks/` — `useClickOutside`, `useMediaQuery`, `useInfinitePagination`.
- `src/utils/appHelpers.js` — `getStatusBadgeClasses` (in-stock/low-stock/
  out-of-stock → Tailwind classes), `truncateText`, `formatShortTime`, etc.
- `src/utils/toastAlert.js` — toast helper, use instead of `alert()` for new
  code (existing `Products/index.jsx` still uses `alert()` in a couple of
  validation paths — legacy, don't copy that pattern).

## AI chat

Two entry points into the same backend (`POST /api/chat`, streaming):
- `src/components/Chat/FloatingChat.jsx` — global widget mounted in
  `DashboardLayout`, always available.
- `src/components/Chat/ChatPage.jsx` — full page at `/ai-chat`.
Both use `@ai-sdk/react`'s `useChat` hook; shared parsing/formatting logic
is in `src/components/Chat/chatUtils.js`. The backend tool set
(`checkInventory`, `updateStock`, `checkOrders`, `checkStockLevels`,
`generateReport`, `seedDemoInventory`, etc.) is documented in
`../server/CLAUDE.md`.

## RTK Query pattern

```js
export const xApi = createApi({
  reducerPath: "xApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ["x"],
  endpoints: (builder) => ({
    getXList: builder.query({ query: (params) => `/endpoint?...`, providesTags: ["x"] }),
    createX: builder.mutation({ query: (data) => ({ url: "/endpoint", method: "POST", body: data }), invalidatesTags: ["x"] }),
  }),
});
export const { useGetXListQuery, useCreateXMutation } = xApi;
```
List pages tend to use `useLazyGetXListQuery` + manual `page` state +
`react-infinite-scroll-component` rather than a normal `useQuery`, so they
can append pages into local state (see `Products/index.jsx`
`fetchMoreProducts`). Follow that pattern for new paginated tables rather
than introducing a different pagination approach.

## Known gotchas (don't "fix" without checking first)

- `src/hooks/useInfinitePagination.js` imports
  `useLazyGetPaginatedFactoryDataQuery` from `../redux/api/companyApi`,
  which **does not exist** in this project (leftover from a different
  codebase this was scaffolded from). The hook is effectively dead/broken;
  the pages that actually paginate (`Products`) do it inline instead, per
  the pattern above. Don't import this hook as-is.
- `components/Inventory/Products/index.jsx` still has a large block of
  hardcoded `initialProducts` demo data and client-side filtering
  (`filterProducts`) that's now superseded by server-side `name`/`status`
  query params via `useLazyGetProductsListQuery` — the `useState(() => {...},
  [deps])` "effect" on line ~142 is actually a bug (should be `useEffect`,
  `useState` ignores the second argument entirely), so client-side
  filtering silently never re-runs. Server-side filtering is what's
  actually wired up and working; treat the local filter state as legacy.
- Product `status` values are lowercase-hyphenated (`in-stock`,
  `low-stock`, `out-of-stock`) matching the Mongoose enum — UI copy shows
  Title Case ("In Stock") but state/filter values must stay in the raw
  enum form to match API responses.

## Conventions when adding a page

1. Add the page component under `src/components/<Feature>/index.jsx`.
2. Register it in `src/routes/routes.js`.
3. Add a sidebar entry in `src/components/sidebar/Sidebar.jsx`
   (`navigationData`) if it should be user-navigable — many placeholder
   entries already exist there with `href: "#"` for not-yet-built pages.
4. If it needs server data, add/extend an RTK Query API slice in
   `src/redux/api/` and register it in `src/redux/store.js`.
5. Reuse `src/helpers/ui/*` components and `src/utils/appHelpers.js`
   formatters instead of re-implementing badges/tables/modals.
