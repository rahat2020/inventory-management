const DashboardPage = () => {
  const stats = [
    { title: "Total Products", value: "1,234", change: "+12%", color: "blue" },
    {
      title: "Low Stock Items",
      value: "23",
      change: "Attention needed",
      color: "red",
    },
    {
      title: "Pending Orders",
      value: "45",
      change: "+7 today",
      color: "yellow",
    },
    { title: "Total Value", value: "$125,430", change: "+8%", color: "green" },
  ];

  const recentActivity = [
    {
      type: "success",
      title: "Stock replenished",
      desc: "iPhone 15 Pro - 50 units added",
      time: "2 min ago",
    },
    {
      type: "info",
      title: "Order fulfilled",
      desc: "Order #12345 - 5 items shipped",
      time: "15 min ago",
    },
    {
      type: "warning",
      title: "Low stock alert",
      desc: "MacBook Air M2 - Only 3 units left",
      time: "1 hour ago",
    },
  ];

  const quickActions = [
    { title: "Add New Product", icon: "+", color: "blue" },
    { title: "Update Stock", icon: "↑", color: "green" },
    { title: "Generate Report", icon: "📊", color: "purple" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
              </div>
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  stat.color === "blue"
                    ? "bg-blue-100"
                    : stat.color === "red"
                    ? "bg-red-100"
                    : stat.color === "yellow"
                    ? "bg-yellow-100"
                    : "bg-green-100"
                }`}
              >
                <span
                  className={`text-lg font-bold ${
                    stat.color === "blue"
                      ? "text-blue-600"
                      : stat.color === "red"
                      ? "text-red-600"
                      : stat.color === "yellow"
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {stat.value.charAt(0)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === "success"
                      ? "bg-green-500"
                      : activity.type === "info"
                      ? "bg-blue-500"
                      : "bg-orange-500"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-500">{activity.desc}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="w-full flex items-center space-x-3 p-3 rounded-md hover:bg-gray-50 transition-colors text-left"
              >
                <div
                  className={`w-10 h-10 rounded-md flex items-center justify-center ${
                    action.color === "blue"
                      ? "bg-blue-100"
                      : action.color === "green"
                      ? "bg-green-100"
                      : "bg-purple-100"
                  }`}
                >
                  <span
                    className={`text-lg ${
                      action.color === "blue"
                        ? "text-blue-600"
                        : action.color === "green"
                        ? "text-green-600"
                        : "text-purple-600"
                    }`}
                  >
                    {action.icon}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {action.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;
