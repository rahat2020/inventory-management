"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Activity,
  Archive,
  Box,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  Menu,
  MessageCircle,
  Package,
  Settings,
  ShoppingCart,
  Tag,
  TrendingDown,
  TrendingUp,
  Truck,
  Users,
  X,
} from "react-feather";
import { Link, useLocation } from "react-router-dom";

const navigationData = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", icon: Home, href: "/" },
      { title: "AI Chat", icon: MessageCircle, href: "/ai-chat" },
      { title: "Analytics", icon: Activity, href: "/analytics" },
    ],
  },
  {
    title: "Inventory",
    items: [
      { title: "Products", icon: Package, href: "/products" },
      { title: "Categories", icon: Tag, href: "/categories" },
      { title: "Stock Levels", icon: Archive, href: "/stock-levels" },
      { title: "Low Stock", icon: Package, href: "#", badge: "23" },
    ],
  },
  {
    title: "Orders",
    items: [
      { title: "All Orders", icon: ShoppingCart, href: "/all-orders" },
      { title: "Incoming", icon: TrendingUp, href: "#", badge: "12" },
      { title: "Outgoing", icon: Truck, href: "#" },
      { title: "Returns", icon: TrendingDown, href: "#" },
    ],
  },
  {
    title: "Management",
    items: [
      { title: "Suppliers", icon: Truck, href: "#" },
      { title: "Customers", icon: Users, href: "#" },
      { title: "Reports", icon: FileText, href: "#" },
    ],
  },
];

const Sidebar = () => {
  // hooks
  const location = useLocation();

  // states
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [hoveredNav, setHoveredNav] = useState(null);

  useEffect(() => {
    setHoveredNav(null);
  }, [isCollapsed]);

  const handleNavMouseEnter = (item) => (e) => {
    if (!isCollapsed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredNav({
      title: item.title,
      badge: item.badge,
      top: rect.top + rect.height / 2,
      left: rect.right + 12,
    });
  };

  const handleNavMouseLeave = () => setHoveredNav(null);

  const toggleSection = (sectionTitle) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle],
    }));
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Mobile menu button */}
      <button
        role="button"
        tabIndex={0}
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50
          transform transition-all duration-300 ease-in-out
          lg:translate-x-0 lg:relative lg:z-auto lg:flex-shrink-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${isCollapsed ? "lg:w-20" : "lg:w-64"}
          flex flex-col
        `}
      >
        {/* Collapse toggle (desktop only) */}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex items-center justify-center absolute -right-3 top-8 w-6 h-6 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 z-20"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div
            className={`flex items-center ${
              isCollapsed ? "lg:justify-center" : "space-x-3"
            }`}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              <Box className="w-6 h-6 text-white" />
            </div>
            <div className={isCollapsed ? "lg:hidden" : ""}>
              <h1 className="text-lg font-semibold text-gray-900">
                InventoryPro
              </h1>
              <p className="text-sm text-gray-500">Management System</p>
            </div>
          </div>
        </div>

        {/* Navigation (scrollable) */}
        <nav className="flex-1 overflow-y-auto overflow-x-visible p-4">
          <div className="space-y-6">
            {navigationData.map((section) => (
              <div key={section.title}>
                <button
                  onClick={() => toggleSection(section.title)}
                  className={`flex items-center justify-between w-full text-left px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors ${
                    isCollapsed ? "lg:hidden" : ""
                  }`}
                >
                  {section.title}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      expandedSections[section.title] ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`mt-2 space-y-1 transition-all duration-200 ${
                    !isCollapsed && expandedSections[section.title] === false
                      ? "hidden"
                      : ""
                  }`}
                >
                  {section.items.map((item) => (
                    <Link
                      key={item.title}
                      to={item.href}
                      onMouseEnter={handleNavMouseEnter(item)}
                      onMouseLeave={handleNavMouseLeave}
                      className={`
                        flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors
                        ${isCollapsed ? "lg:justify-center" : ""}
                        ${
                          location?.pathname === item?.href
                            ? "bg-violet-50 text-violet-700 border-r-2 border-violet-600"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        }
                      `}
                    >
                      <div
                        className={`flex items-center ${
                          isCollapsed ? "" : "space-x-3"
                        }`}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className={isCollapsed ? "lg:hidden" : ""}>
                          {item.title}
                        </span>
                      </div>
                      {item.badge && (
                        <span
                          className={`bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full ${
                            isCollapsed ? "lg:hidden" : ""
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <Link
            to="/settings"
            onMouseEnter={handleNavMouseEnter({ title: "Settings" })}
            onMouseLeave={handleNavMouseLeave}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors ${
              isCollapsed ? "lg:justify-center" : "space-x-3"
            }`}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span className={isCollapsed ? "lg:hidden" : ""}>Settings</span>
          </Link>
        </div>
      </div>

      {hoveredNav &&
        createPortal(
          <div
            className="pointer-events-none fixed hidden lg:flex items-center whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white shadow-lg z-[9999]"
            style={{
              top: hoveredNav.top,
              left: hoveredNav.left,
              transform: "translateY(-50%)",
            }}
          >
            {hoveredNav.title}
            {hoveredNav.badge && (
              <span className="ml-1.5 rounded-full bg-red-500 px-1.5 text-[10px]">
                {hoveredNav.badge}
              </span>
            )}
          </div>,
          document.body
        )}
    </>
  );
};

export default Sidebar;
