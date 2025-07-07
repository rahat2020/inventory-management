import { useEffect, useState } from "react";
import AppModal from "../../../helpers/ui/AppModal";
import AddProductModal from "./modals/AddProductModal";
import AppDataTable from "../../../helpers/ui/AppDataTable";
import { productLists } from "../../../data/productLists";
import {
  useCreateProductMutation,
  useLazyGetProductsListQuery,
} from "../../../redux/api/productsApi";
import InfiniteScroll from "react-infinite-scroll-component";
import { size } from "lodash";
import { getStatusBadgeClasses, truncateText } from "../../../utils/appHelpers";

// Sample product data
const initialProducts = [
  {
    id: 1,
    name: "Wireless Headphones",
    category: "Electronics",
    price: 99.99,
    stock: 25,
    sku: "WH-001",
    status: "In Stock",
  },
  {
    id: 2,
    name: "Coffee Mug",
    category: "Home & Kitchen",
    price: 12.99,
    stock: 0,
    sku: "CM-002",
    status: "Out of Stock",
  },
  {
    id: 3,
    name: "Running Shoes",
    category: "Sports",
    price: 79.99,
    stock: 15,
    sku: "RS-003",
    status: "In Stock",
  },
  {
    id: 4,
    name: "Desk Lamp",
    category: "Home & Kitchen",
    price: 34.99,
    stock: 8,
    sku: "DL-004",
    status: "Low Stock",
  },
  {
    id: 5,
    name: "Smartphone Case",
    category: "Electronics",
    price: 19.99,
    stock: 50,
    sku: "SC-005",
    status: "In Stock",
  },
  {
    id: 6,
    name: "Yoga Mat",
    category: "Sports",
    price: 29.99,
    stock: 3,
    sku: "YM-006",
    status: "Low Stock",
  },
];

const categories = [
  "All",
  "Electronics",
  "Home & Kitchen",
  "Sports",
  "Clothing",
  "Books",
];

export default function ProductsPage() {
  // states
  const [products, setProducts] = useState([]);
  const [metaData, setMetaData] = useState({});
  console.log("products", products);
  console.log("metaData", metaData);
  const [filteredProducts, setFilteredProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isFormCategoryDropdownOpen, setIsFormCategoryDropdownOpen] =
    useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");

  // Form state for create product modal
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    sku: "",
  });

  // redux apis
  const [triggerGetProducts, { isLoading }] = useLazyGetProductsListQuery();
  const [productMutation, { isLoading: isLoadingCreateProduct }] =
    useCreateProductMutation();

  // Filter products based on search term, category, and status
  const filterProducts = () => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Filter by status
    if (selectedStatus !== "All") {
      filtered = filtered.filter(
        (product) => product.status === selectedStatus
      );
    }

    setFilteredProducts(filtered);
  };

  // Apply filters whenever dependencies change
  useState(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, selectedStatus, products]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    filterProducts();
  };

  // Handle category filter change
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setIsCategoryDropdownOpen(false);
    filterProducts();
  };

  // Handle status filter change
  const handleStatusChange = (value) => {
    setSelectedStatus(value);
    setIsStatusDropdownOpen(false);
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

  // Determine product status based on stock
  const getProductStatus = (stock) => {
    if (stock === 0) return "Out of Stock";
    if (stock <= 5) return "Low Stock";
    return "In Stock";
  };

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
      id: products?.length + 1,
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

  const fetchMoreProducts = async () => {
    console.log("fetchMoreProducts");
    setPage((prev) => prev + 1);
    const res = await triggerGetProducts({ name, status, page, limit: 10 });
    if (size(res?.data) < 10 || size(res?.data) === 0) {
      setHasMore(false);
    }

    console.log("fetchMoreProducts", res?.data);

    if (res?.data) {
      setProducts((prev) => [...prev, ...res?.data?.data]);
      setMetaData((prev) => ({ ...prev, ...res?.data }));
      // setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    const loadFirstPage = async () => {
      setPage(1);
      setProducts([]);
      setHasMore(true);
      const res = await triggerGetProducts({
        name,
        status,
        page: 1,
        limit: 10,
      });
      console.log("res.data", res?.data);
      if (size(res?.data) > 10) {
        console.log("true");
        setHasMore(false);
      }
      if (size(res?.data) < 10 || size(res?.data) === 0) setHasMore(false);
      if (res?.data) {
        setProducts(res?.data?.data);
        setMetaData((prev) => ({ ...prev, ...res?.data }));
      }
    };

    loadFirstPage();
  }, [name, status]);

  const columns = [
    {
      header: (
        <p className="whitespace-nowrap uppercase text-start text-xs">
          product
        </p>
      ),
      key: "product",
      width: "300px",
      isShow: true,
      render: (data) => (
        <div className="flex justify-start items-start">
          <p className="text-start text-xs font-medium uppercase">
            {truncateText(data?.name || "", 30)}
          </p>
        </div>
      ),
    },
    {
      header: (
        <p className="whitespace-nowrap uppercase text-center text-xs">
          category
        </p>
      ),
      key: "category",
      width: "300px",
      isShow: true,
      render: (data) => (
        <div className="flex justify-center items-start whitespace-nowrap">
          <p className="text-center text-xs font-medium uppercase">
            {data?.category}
          </p>
        </div>
      ),
    },
    {
      header: (
        <p className="whitespace-nowrap uppercase text-center text-xs">sku</p>
      ),
      key: "quantity",
      width: "110px",
      isShow: true,
      render: (data) => (
        <div className="flex justify-center items-start whitespace-nowrap">
          <p className="text-start text-xs font-medium uppercase">
            {data?.sku}
          </p>
        </div>
      ),
    },
    {
      header: (
        <p className="whitespace-nowrap uppercase text-center text-xs">price</p>
      ),
      key: "price",
      isShow: true,
      render: (data) => (
        <div className="flex justify-center items-start whitespace-nowrap">
          <p className="text-start text-xs font-medium uppercase">
            {data?.price}
          </p>
        </div>
      ),
    },
    {
      header: (
        <p className="whitespace-nowrap uppercase text-center text-xs">stock</p>
      ),
      key: "stock",
      isShow: true,
      render: (data) => (
        <div className="flex justify-center items-start whitespace-nowrap">
          <p className="text-start text-xs font-medium uppercase">
            {data?.quantity}
          </p>
        </div>
      ),
    },
    {
      header: (
        <p className="whitespace-nowrap uppercase text-center text-xs">
          status
        </p>
      ),
      key: "status",
      isShow: true,
      render: (data) => (
        <div className="flex justify-center items-start whitespace-nowrap">
          <p
            className={`${getStatusBadgeClasses(
              data.status
            )} text-start text-xs font-medium uppercase`}
          >
            {data?.status}
          </p>
        </div>
      ),
    },
    {
      header: (
        <p className="whitespace-nowrap uppercase text-end text-xs">actions</p>
      ),
      key: "actions",
      width: "130px",
      isShow: true,
      render: () => (
        <div className="flex justify-end items-start whitespace-nowrap">
          <button className="text-blue-600 hover:text-blue-900 p-1">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button className="text-red-600 hover:text-red-900 p-1">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="">
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Product Inventory
              </h1>
              <p className="text-gray-600">
                Manage your product inventory and stock levels
              </p>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Product
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Products
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Stock</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products &&
                      products?.filter((p) => p?.status === "in-stock")?.length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products?.filter((p) => p?.status === "low-stock").length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <svg
                    className="h-6 w-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Out of Stock
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products &&
                      products?.filter((p) => p?.status === "out-of-stock")
                        ?.length}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search products or SKU..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Category Dropdown */}
              <div className="relative">
                <button
                  onClick={() =>
                    setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                  }
                  className="w-full sm:w-48 bg-white border border-gray-300 rounded-md px-3 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <span className="block truncate">{selectedCategory}</span>
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
                {isCategoryDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleCategoryChange(category)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-gray-100"
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className="w-full sm:w-48 bg-white border border-gray-300 rounded-md px-3 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <span className="block truncate">
                    {selectedStatus === "All" ? "All Status" : selectedStatus}
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
                {isStatusDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
                    {["All", "In Stock", "Low Stock", "Out of Stock"].map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(status)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-gray-100"
                        >
                          {status === "All" ? "All Status" : status}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Products ({size(products)})
                {/* Products ({filteredProducts.length}) */}
              </h3>
              <p className="text-sm text-gray-600">
                A list of all products in your inventory
              </p>
            </div>

            {/* <AppDataTable
              columns={columns}
              data={products}
              height="md:h-[calc(100vh-10.6rem)] h-[calc(100vh-13rem)]"
              options={{
                isInitialLoading: isLoading,
                hasMoreData: metaData?.page < metaData?.totalPages,
                loadMoreData: fetchMoreProducts,
                loadingData: isLoading,
              }}
              width="w-full"
            /> */}

            <AppDataTable
              columns={columns}
              data={products}
              // rowKey="sku"
              isBodyScrollable={true}
              bodyMaxHeight="30rem"
              isDataLoading={isLoading}
              multiHeaderClasses="px-4 py-1 bg-[#155DFC] text-white text-sm"
              tableBodyClasses="py-2 px-1"
              rowStyles={(index) => (index % 2 === 0 ? "" : "bg-gray-50")}
              options={{
                loadMoreData: fetchMoreProducts,
                hasMoreData: metaData?.page < metaData?.totalPages,
                loadingData: isLoading,
              }}
            />
          </div>
        </div>
      </div>
      <AppModal
        isModalOpen={isCreateModalOpen}
        setIsModalOpen={setIsCreateModalOpen}
        title="ADD PRODUCT"
        cancelLabel="CANCEL"
        showSaveBtn
        modalSize="max-w-lg"
        onConfirm={() => handleCreateProduct()}
        onCancel={() => setIsCreateModalOpen(false)}
      >
        <div className="">
          <AddProductModal
            setIsCreateModalOpen={setIsCreateModalOpen}
            products={products}
            setProducts={setProducts}
          />
        </div>
      </AppModal>
    </div>
  );
}
