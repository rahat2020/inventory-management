import { Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import routes from "./routes/routes";
import DashboardLayout from "./layout/DashboardLayout";
import NotFound from "./components/NotFound";
import FallbackErrorUI from "./helpers/ui/FallbackErrorUI";
import { ErrorBoundary } from "react-error-boundary";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false }); // like nextjs-toploader

const handleRouteError = (error, info) => {
  console.error("Route Error Caught:", error);
  console.error("Error Info:", info);
};

function App() {
  const location = useLocation();

  useEffect(() => {
    NProgress.start();
    NProgress.done();
  }, [location]);

  return (
    <Suspense
      fallback={
        <div className="pt-3 text-center">
          {/* <AppSpinner /> */}
          <p>loading</p>
        </div>
      }
    >
      <Routes>
        {/* <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} /> */}
        <Route path="/" element={<DashboardLayout />}>
          {routes.map((route, idx) =>
            route.element ? (
              <Route
                key={idx}
                path={route.path}
                element={
                  <ErrorBoundary
                    FallbackComponent={FallbackErrorUI}
                    onError={handleRouteError}
                  >
                    <route.element />
                  </ErrorBoundary>
                }
              />
            ) : null
          )}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
