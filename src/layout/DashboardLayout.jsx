import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../components/sidebar/Sidebar";
import AppFooter from "../components/AppFooter/AppFooter";
import FloatingChat from "../components/Chat/FloatingChat";

const DashboardLayout = () => {
  return (
    <>
      <div className="h-screen flex flex-col relative">
        {/* <HeadTitleUpdater /> */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <Sidebar />
          {/* Main Scrollable Content */}
          <main className="flex-1 min-w-0 overflow-auto overflow-x-hidden relative">
            <Outlet />
          </main>
        </div>

        {/* Floating Chatbot */}
        <FloatingChat />
      </div>
      <ToastContainer />
    </>
  );
};

export default DashboardLayout;
