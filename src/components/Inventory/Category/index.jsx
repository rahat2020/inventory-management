import { useState } from "react";
import { Search, Plus, Edit, Trash2, Package, Eye, X } from "react-feather";

export default function CategoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
  });

  // Sample category data
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: "Electronics",
      description: "Electronic devices and components",
      itemCount: 245,
      color: "#3B82F6",
      lastUpdated: "2024-01-15",
    },
    {
      id: 2,
      name: "Clothing",
      description: "Apparel and fashion items",
      itemCount: 189,
      color: "#10B981",
      lastUpdated: "2024-01-14",
    },
    {
      id: 3,
      name: "Home & Garden",
      description: "Home improvement and gardening supplies",
      itemCount: 156,
      color: "#F59E0B",
      lastUpdated: "2024-01-13",
    },
    {
      id: 4,
      name: "Books",
      description: "Books, magazines, and educational materials",
      itemCount: 98,
      color: "#8B5CF6",
      lastUpdated: "2024-01-12",
    },
    {
      id: 5,
      name: "Sports & Outdoors",
      description: "Sports equipment and outdoor gear",
      itemCount: 134,
      color: "#EF4444",
      lastUpdated: "2024-01-11",
    },
    {
      id: 6,
      name: "Health & Beauty",
      description: "Health products and beauty items",
      itemCount: 87,
      color: "#EC4899",
      lastUpdated: "2024-01-10",
    },
  ]);

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = () => {
    if (newCategory.name.trim()) {
      const category = {
        id: categories.length + 1,
        name: newCategory.name,
        description: newCategory.description,
        itemCount: 0,
        color: newCategory.color,
        lastUpdated: new Date().toISOString().split("T")[0],
      };
      setCategories([...categories, category]);
      setNewCategory({ name: "", description: "", color: "#3B82F6" });
      setIsAddModalOpen(false);
    }
  };

  const handleDeleteCategory = (id) => {
    setCategories(categories.filter((cat) => cat.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
              <p className="text-gray-600 mt-1">
                Manage your inventory categories
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>
                Total Categories: <strong>{categories.length}</strong>
              </span>
              <span>
                Total Items:{" "}
                <strong>
                  {categories.reduce((sum, cat) => sum + cat.itemCount, 0)}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-200"
            >
              {/* Card Header */}
              <div className="p-6 pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {category.name}
                    </h3>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="px-6 pb-6">
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {category.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">
                      {category.itemCount} items
                    </span>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Updated {category.lastUpdated}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                      View Items
                    </button>
                    <button className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                      Add Item
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No categories found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Get started by creating your first category"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                <Plus className="h-4 w-4" />
                Add Your First Category
              </button>
            )}
          </div>
        )}

        {/* Add Category Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Add New Category
                </h2>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Category Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, name: e.target.value })
                    }
                    placeholder="Enter category name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={newCategory.description}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        description: e.target.value,
                      })
                    }
                    placeholder="Enter category description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="color"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="color"
                      value={newCategory.color}
                      onChange={(e) =>
                        setNewCategory({
                          ...newCategory,
                          color: e.target.value,
                        })
                      }
                      className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <span className="text-sm text-gray-600">
                      {newCategory.color}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-2 p-6 border-t border-gray-200">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Category
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
