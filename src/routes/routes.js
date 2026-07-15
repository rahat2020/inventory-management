import DashboardPage from "../components/Dashboard";
import AnalyticsPage from "../components/Analytics";
import CategoryPage from "../components/Inventory/Category";
import ProductsPage from "../components/Inventory/Products";
import StockLevelsPage from "../components/Inventory/StockLevels";
import LowStockPage from "../components/Inventory/LowStock";
import AllOrdersPage from "../components/Orders/AllOrders";
import IncomingPage from "../components/Orders/Incoming";
import OutgoingPage from "../components/Orders/Outgoing";
import ReturnsPage from "../components/Orders/Returns";
import SuppliersPage from "../components/Suppliers";
import CustomersPage from "../components/Customers";
import ReportsPage from "../components/Reports";
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
  {
    path: "/low-stock",
    name: "Low-Stock",
    element: LowStockPage,
    title: "Low Stock Alerts",
    subtitle: "Products that need restocking soon",
  },

  // orders
  {
    path: "/all-orders",
    name: "All-Orders",
    element: AllOrdersPage,
    title: "All Orders",
    subtitle: "Manage and track customer orders",
  },
  {
    path: "/incoming",
    name: "Incoming",
    element: IncomingPage,
    title: "Incoming Stock",
    subtitle: "Track restocks and received shipments",
  },
  {
    path: "/outgoing",
    name: "Outgoing",
    element: OutgoingPage,
    title: "Outgoing Stock",
    subtitle: "Track shipped, sold, and written-off stock",
  },
  {
    path: "/returns",
    name: "Returns",
    element: ReturnsPage,
    title: "Returns",
    subtitle: "Track customer returns coming back into stock",
  },

  // management
  {
    path: "/suppliers",
    name: "Suppliers",
    element: SuppliersPage,
    title: "Suppliers",
    subtitle: "Manage your supplier directory",
  },
  {
    path: "/customers",
    name: "Customers",
    element: CustomersPage,
    title: "Customers",
    subtitle: "Manage your customer directory",
  },
  {
    path: "/reports",
    name: "Reports",
    element: ReportsPage,
    title: "Reports",
    subtitle: "Revenue, profit, and performance insights",
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

