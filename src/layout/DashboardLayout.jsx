import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
import AppFooter from "../components/AppFooter/AppFooter";

const DashboardLayout = () => {
  return (
    <>
      <div className="h-screen flex flex-col relative">
        {/* <HeadTitleUpdater /> */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="md:w-1/6">
            <Sidebar />
          </div>
          {/* Main Scrollable Content */}
          <main className="w-6/6 overflow-auto overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
