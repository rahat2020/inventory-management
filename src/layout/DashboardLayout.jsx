import { Outlet, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../components/sidebar/Sidebar";
import AppFooter from "../components/AppFooter/AppFooter";
import FloatingChat from "../components/Chat/FloatingChat";
import Topbar from "../components/Topbar";

const DashboardLayout = () => {
  const { pathname } = useLocation();
  // AI Chat renders its own dedicated header — the shared topbar would duplicate it
  const showTopbar = pathname !== "/ai-chat";

  return (
    <>
      <div className="h-screen flex flex-col relative">
        {/* <HeadTitleUpdater /> */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <Sidebar />
          {/* Main column: topbar + scrollable content */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
            {showTopbar && <Topbar />}
            <main className="flex-1 overflow-auto overflow-x-hidden relative">
              <Outlet />
            </main>
          </div>
        </div>

        {/* Floating Chatbot */}
        <FloatingChat />
      </div>
      <ToastContainer />
    </>
  );
};

export default DashboardLayout;
