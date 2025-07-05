import { useState } from "react";

const categories = [
  "All",
  "Electronics",
  "Home & Kitchen",
  "Sports",
  "Clothing",
  "Books",
];

const AddProductModal = ({ setIsCreateModalOpen, products, setProducts }) => {
  // Form state for create product modal
  const [isFormCategoryDropdownOpen, setIsFormCategoryDropdownOpen] =
    useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    sku: "",
  });

  // Handle create product form submission
  const handleCreateProduct = (e) => {
    e.preventDefault();

    if (
      !newProduct.name ||
      !newProduct.category ||
      !newProduct.price ||
      !newProduct.stock ||
      !newProduct.sku
    ) {
      alert("Please fill in all fields");
      return;
    }

    const product = {
      id: products.length + 1,
      name: newProduct.name,
      category: newProduct.category,
      price: Number.parseFloat(newProduct.price),
      stock: Number.parseInt(newProduct.stock),
      sku: newProduct.sku,
      status: getProductStatus(Number.parseInt(newProduct.stock)),
    };

    setProducts((prev) => [...prev, product]);
    setNewProduct({
      name: "",
      category: "",
      price: "",
      stock: "",
      sku: "",
    });
    setIsCreateModalOpen(false);
    filterProducts();
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setNewProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle form category change
  const handleFormCategoryChange = (value) => {
    setNewProduct((prev) => ({
      ...prev,
      category: value,
    }));
    setIsFormCategoryDropdownOpen(false);
  };

  return (
    <div className="">
      <form onSubmit={handleCreateProduct}>
        <div className="">
          <div className="mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Create New Product
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Add a new product to your inventory. Fill in all the required
              information.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Product Name
              </label>
              <input
                type="text"
                id="name"
                value={newProduct.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter product name"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <div className="relative mt-1">
                <button
                  type="button"
                  onClick={() =>
                    setIsFormCategoryDropdownOpen(!isFormCategoryDropdownOpen)
                  }
                  className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <span className="block truncate">
                    {newProduct.category || "Select category"}
                  </span>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </button>
                {isFormCategoryDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
                    {categories
                      .filter((cat) => cat !== "All")
                      .map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => handleFormCategoryChange(category)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-gray-100"
                        >
                          {category}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700"
              >
                Price ($)
              </label>
              <input
                type="number"
                id="price"
                step="0.01"
                value={newProduct.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="0.00"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="stock"
                className="block text-sm font-medium text-gray-700"
              >
                Stock Quantity
              </label>
              <input
                type="number"
                id="stock"
                value={newProduct.stock}
                onChange={(e) => handleInputChange("stock", e.target.value)}
                placeholder="0"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="sku"
                className="block text-sm font-medium text-gray-700"
              >
                SKU
              </label>
              <input
                type="text"
                id="sku"
                value={newProduct.sku}
                onChange={(e) => handleInputChange("sku", e.target.value)}
                placeholder="Enter SKU"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProductModal;
