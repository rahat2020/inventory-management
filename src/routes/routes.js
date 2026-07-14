import DashboardPage from "../components/Dashboard";
import AnalyticsPage from "../components/Analytics";
import CategoryPage from "../components/Inventory/Category";
import ProductsPage from "../components/Inventory/Products";
import StockLevelsPage from "../components/Inventory/StockLevels";
import AllOrdersPage from "../components/Orders/AllOrders";
import SettingsPage from "../components/Settings";
import ChatPage from "../components/Chat/ChatPage";

const routes = [
  {
    path: "/",
    name: "Home",
    element: DashboardPage,
    title: "Dashboard",
    subtitle: "Overview of your inventory and order performance",
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    element: DashboardPage,
    title: "Dashboard",
    subtitle: "Overview of your inventory and order performance",
  },
  {
    path: "/analytics",
    name: "Analytics",
    element: AnalyticsPage,
    title: "Analytics",
    subtitle: "Sales, margin, and category performance insights",
  },
  {
    path: "/products",
    name: "Products",
    element: ProductsPage,
    title: "Product Inventory",
    subtitle: "Manage your product inventory and stock levels",
  },
  {
    path: "/categories",
    name: "Categories",
    element: CategoryPage,
    title: "Categories",
    subtitle: "Manage your inventory categories",
  },
  {
    path: "/stock-levels",
    name: "Stock-levels",
    element: StockLevelsPage,
    title: "Stock Levels",
    subtitle: "Monitor and manage product inventory",
  },

  // orders
  {
    path: "/all-orders",
    name: "All-Orders",
    element: AllOrdersPage,
    title: "All Orders",
    subtitle: "Manage and track customer orders",
  },
  // AI Chat
  { path: "/ai-chat", name: "AI Chat", element: ChatPage },
  // settings
  {
    path: "/settings",
    name: "Settings",
    element: SettingsPage,
    title: "Settings",
    subtitle: "Configure your inventory management system",
  },
];
export default routes;

