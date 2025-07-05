"use client";

import { useState } from "react";
import {
  Activity,
  Archive,
  Box,
  ChevronDown,
  FileText,
  Home,
  Menu,
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
import { Link } from "react-router-dom";

const navigationData = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", icon: Home, href: "#", active: true },
      { title: "Analytics", icon: Activity, href: "#" },
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
      { title: "All Orders", icon: ShoppingCart, href: "#" },
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
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionTitle) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle],
    }));
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md border"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Box className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                InventoryPro
              </h1>
              <p className="text-sm text-gray-500">Management System</p>
            </div>
          </div>
        </div>

        {/* Navigation (scrollable) */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {navigationData.map((section) => (
              <div key={section.title}>
                <button
                  onClick={() => toggleSection(section.title)}
                  className="flex items-center justify-between w-full text-left px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
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
                    expandedSections[section.title] === false ? "hidden" : ""
                  }`}
                >
                  {section.items.map((item) => (
                    <Link
                      key={item.title}
                      to={item.href}
                      className={`
                        flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors
                        ${
                          item.active
                            ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
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
          <a
            href="#"
            className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </a>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
