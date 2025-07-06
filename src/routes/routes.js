import DashboardPage from "../components/Dashboard";
import CategoryPage from "../components/Inventory/Category";
import ProductsPage from "../components/Inventory/Products";
import StockLevelsPage from "../components/Inventory/StockLevels";
import AllOrdersPage from "../components/Orders/AllOrders";
import SettingsPage from "../components/Settings";

const routes = [
  { path: "/", name: "Home", element: DashboardPage },
  { path: "/dashboard", name: "Dashboard", element: DashboardPage },
  { path: "/products", name: "Products", element: ProductsPage },
  { path: "/categories", name: "Categories", element: CategoryPage },
  { path: "/stock-levels", name: "Stock-levels", element: StockLevelsPage },

  // orders
  { path: "/all-orders", name: "All-Orders", element: AllOrdersPage },
  // settings
  { path: "/settings", name: "Settings", element: SettingsPage },
];
export default routes;
