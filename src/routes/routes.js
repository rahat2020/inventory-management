import DashboardPage from "../components/Dashboard";
import CategoryPage from "../components/Inventory/Category";
import ProductsPage from "../components/Inventory/Products";
import StockLevelsPage from "../components/Inventory/StockLevels";

const routes = [
  { path: "/", name: "Home", element: DashboardPage },
  { path: "/dashboard", name: "Dashboard", element: DashboardPage },
  { path: "/products", name: "Products", element: ProductsPage },
  { path: "/categories", name: "Categories", element: CategoryPage },
  { path: "/stock-levels", name: "Stock-levels", element: StockLevelsPage },
];
export default routes;
