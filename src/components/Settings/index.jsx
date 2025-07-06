import { useState } from "react";
import {
  Bell,
  Users,
  Shield,
  Database,
  Globe,
  Download,
  Upload,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Archive,
  Package,
} from "react-feather";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [showApiKey, setShowApiKey] = useState(false);
  const [settings, setSettings] = useState({
    // General Settings
    companyName: "Inventory Pro",
    companyAddress: "123 Business St, City, State 12345",
    companyPhone: "+1 (555) 123-4567",
    companyEmail: "contact@inventoryPro.com",
    currency: "USD",
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",

    // Inventory Settings
    lowStockThreshold: 10,
    autoReorder: true,
    reorderQuantity: 50,
    skuPrefix: "INV",
    skuFormat: "auto",
    trackExpiry: true,
    allowNegativeStock: false,

    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    lowStockAlerts: true,
    orderAlerts: true,
    deliveryAlerts: true,
    weeklyReports: true,

    // User Management
    requireApproval: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,

    // Integration Settings
    apiKey: "sk_live_1234567890abcdef",
    webhookUrl: "https://api.example.com/webhook",
    enableApi: true,

    // Backup Settings
    autoBackup: true,
    backupFrequency: "daily",
    retentionPeriod: 30,

    // Security Settings
    twoFactorAuth: false,
    passwordExpiry: 90,
    minPasswordLength: 8,

    // Appearance Settings
    theme: "light",
    compactMode: false,
    showTutorials: true,
  });

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Save settings logic here
    console.log("Saving settings:", settings);
    alert("Settings saved successfully!");
  };

  const handleReset = () => {
    // Reset to default settings
    if (confirm("Are you sure you want to reset all settings to default?")) {
      // Reset logic here
      console.log("Resetting settings");
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: Archive },
    { id: "inventory", label: "Inventory", icon: Database },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "users", label: "Users", icon: Users },
    { id: "integrations", label: "Integrations", icon: Globe },
    { id: "backup", label: "Backup", icon: Download },
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Package },
  ];

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between">
      <div>
        <label className="text-sm font-medium text-gray-900">{label}</label>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? "bg-blue-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Company Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) =>
                      updateSetting("companyName", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={settings.companyPhone}
                    onChange={(e) =>
                      updateSetting("companyPhone", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    value={settings.companyAddress}
                    onChange={(e) =>
                      updateSetting("companyAddress", e.target.value)
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={settings.companyEmail}
                    onChange={(e) =>
                      updateSetting("companyEmail", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Regional Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) => updateSetting("currency", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timezone
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => updateSetting("timezone", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Format
                  </label>
                  <select
                    value={settings.dateFormat}
                    onChange={(e) =>
                      updateSetting("dateFormat", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case "inventory":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Stock Management
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    value={settings.lowStockThreshold}
                    onChange={(e) =>
                      updateSetting(
                        "lowStockThreshold",
                        Number.parseInt(e.target.value)
                      )
                    }
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Alert when stock falls below this number
                  </p>
                </div>

                <ToggleSwitch
                  checked={settings.autoReorder}
                  onChange={(value) => updateSetting("autoReorder", value)}
                  label="Auto Reorder"
                  description="Automatically create purchase orders when stock is low"
                />

                {settings.autoReorder && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reorder Quantity
                    </label>
                    <input
                      type="number"
                      value={settings.reorderQuantity}
                      onChange={(e) =>
                        updateSetting(
                          "reorderQuantity",
                          Number.parseInt(e.target.value)
                        )
                      }
                      className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                )}

                <ToggleSwitch
                  checked={settings.trackExpiry}
                  onChange={(value) => updateSetting("trackExpiry", value)}
                  label="Track Expiry Dates"
                  description="Monitor product expiration dates"
                />

                <ToggleSwitch
                  checked={settings.allowNegativeStock}
                  onChange={(value) =>
                    updateSetting("allowNegativeStock", value)
                  }
                  label="Allow Negative Stock"
                  description="Allow stock levels to go below zero"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                SKU Configuration
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU Prefix
                  </label>
                  <input
                    type="text"
                    value={settings.skuPrefix}
                    onChange={(e) => updateSetting("skuPrefix", e.target.value)}
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU Format
                  </label>
                  <select
                    value={settings.skuFormat}
                    onChange={(e) => updateSetting("skuFormat", e.target.value)}
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="auto">Auto Generate</option>
                    <option value="manual">Manual Entry</option>
                    <option value="category">Category Based</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Notification Channels
              </h3>
              <div className="space-y-4">
                <ToggleSwitch
                  checked={settings.emailNotifications}
                  onChange={(value) =>
                    updateSetting("emailNotifications", value)
                  }
                  label="Email Notifications"
                  description="Receive notifications via email"
                />

                <ToggleSwitch
                  checked={settings.smsNotifications}
                  onChange={(value) => updateSetting("smsNotifications", value)}
                  label="SMS Notifications"
                  description="Receive notifications via SMS"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Alert Types
              </h3>
              <div className="space-y-4">
                <ToggleSwitch
                  checked={settings.lowStockAlerts}
                  onChange={(value) => updateSetting("lowStockAlerts", value)}
                  label="Low Stock Alerts"
                  description="Get notified when products are running low"
                />

                <ToggleSwitch
                  checked={settings.orderAlerts}
                  onChange={(value) => updateSetting("orderAlerts", value)}
                  label="Order Alerts"
                  description="Get notified about new orders and status changes"
                />

                <ToggleSwitch
                  checked={settings.deliveryAlerts}
                  onChange={(value) => updateSetting("deliveryAlerts", value)}
                  label="Delivery Alerts"
                  description="Get notified about delivery updates"
                />

                <ToggleSwitch
                  checked={settings.weeklyReports}
                  onChange={(value) => updateSetting("weeklyReports", value)}
                  label="Weekly Reports"
                  description="Receive weekly inventory summary reports"
                />
              </div>
            </div>
          </div>
        );

      case "users":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                User Management
              </h3>
              <div className="space-y-4">
                <ToggleSwitch
                  checked={settings.requireApproval}
                  onChange={(value) => updateSetting("requireApproval", value)}
                  label="Require Admin Approval"
                  description="New users need admin approval before accessing the system"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) =>
                      updateSetting(
                        "sessionTimeout",
                        Number.parseInt(e.target.value)
                      )
                    }
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Login Attempts
                  </label>
                  <input
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) =>
                      updateSetting(
                        "maxLoginAttempts",
                        Number.parseInt(e.target.value)
                      )
                    }
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "integrations":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                API Configuration
              </h3>
              <div className="space-y-4">
                <ToggleSwitch
                  checked={settings.enableApi}
                  onChange={(value) => updateSetting("enableApi", value)}
                  label="Enable API Access"
                  description="Allow external applications to access your inventory data"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={settings.apiKey}
                      onChange={(e) => updateSetting("apiKey", e.target.value)}
                      className="w-full pr-10 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Webhook URL
                  </label>
                  <input
                    type="url"
                    value={settings.webhookUrl}
                    onChange={(e) =>
                      updateSetting("webhookUrl", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="https://api.example.com/webhook"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "backup":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Backup Settings
              </h3>
              <div className="space-y-4">
                <ToggleSwitch
                  checked={settings.autoBackup}
                  onChange={(value) => updateSetting("autoBackup", value)}
                  label="Automatic Backup"
                  description="Automatically backup your data at regular intervals"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Backup Frequency
                  </label>
                  <select
                    value={settings.backupFrequency}
                    onChange={(e) =>
                      updateSetting("backupFrequency", e.target.value)
                    }
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Retention Period (days)
                  </label>
                  <input
                    type="number"
                    value={settings.retentionPeriod}
                    onChange={(e) =>
                      updateSetting(
                        "retentionPeriod",
                        Number.parseInt(e.target.value)
                      )
                    }
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Manual Backup
              </h3>
              <div className="flex gap-4">
                <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  <Download className="h-4 w-4" />
                  Create Backup
                </button>
                <button className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  <Upload className="h-4 w-4" />
                  Restore Backup
                </button>
              </div>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Authentication
              </h3>
              <div className="space-y-4">
                <ToggleSwitch
                  checked={settings.twoFactorAuth}
                  onChange={(value) => updateSetting("twoFactorAuth", value)}
                  label="Two-Factor Authentication"
                  description="Require 2FA for all user accounts"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password Expiry (days)
                  </label>
                  <input
                    type="number"
                    value={settings.passwordExpiry}
                    onChange={(e) =>
                      updateSetting(
                        "passwordExpiry",
                        Number.parseInt(e.target.value)
                      )
                    }
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Password Length
                  </label>
                  <input
                    type="number"
                    value={settings.minPasswordLength}
                    onChange={(e) =>
                      updateSetting(
                        "minPasswordLength",
                        Number.parseInt(e.target.value)
                      )
                    }
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "appearance":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Theme Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Theme
                  </label>
                  <select
                    value={settings.theme}
                    onChange={(e) => updateSetting("theme", e.target.value)}
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                </div>

                <ToggleSwitch
                  checked={settings.compactMode}
                  onChange={(value) => updateSetting("compactMode", value)}
                  label="Compact Mode"
                  description="Use a more compact layout to fit more content"
                />

                <ToggleSwitch
                  checked={settings.showTutorials}
                  onChange={(value) => updateSetting("showTutorials", value)}
                  label="Show Tutorials"
                  description="Display helpful tutorials and tips"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-1">
                Configure your inventory management system
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <nav className="bg-white rounded-lg border border-gray-200 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
