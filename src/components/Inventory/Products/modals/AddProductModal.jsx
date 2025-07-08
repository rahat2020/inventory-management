import { useState } from "react";
import AppInput from "../../../../helpers/ui/AppInput";
import AppDropdown from "../../../../helpers/ui/AppDropdown";
import {
  useGetFilterCategoriesQuery,
  useLazyGetAllCategoriesQuery,
} from "../../../../redux/api/categoriesApi";

const AddProductModal = ({ setIsCreateModalOpen, products, setProducts }) => {
  // redux states
  const { data, isLoading } = useLazyGetAllCategoriesQuery();
  const { data: categoryFilterData, isLoading: isCategoryLoading } =
    useGetFilterCategoriesQuery();
  console.log("data", data);
  console.log("categoryFilterData", categoryFilterData);
  // states
  const [isFormCategoryDropdownOpen, setIsFormCategoryDropdownOpen] =
    useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    description: "",
    category: "",
    quantity: "",
    price: "",
    cost: "",
    unit: "",
    images: [],
    supplier: {
      name: "",
      contact: "",
    },
    status: "",
    warehouse: "",
    expiryDate: "",
    createdBy: "",
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
      <div className="grid md:grid-cols-2 gap-2">
        <div className="col-span-1">
          <AppInput
            type="text"
            id="product-name"
            name="product-name"
            label="product name"
            maxLength={300}
            value={newProduct?.name}
            inputClsName="w-full text-base rounded-md px-4 py-1.5 border border-gray-300"
            placeholderClsName="top-3.5 text-gray-500"
            onChange={(e) => handleInputChange("name", e.target.value)}
          />
        </div>
        <div className="col-span-1">
          <AppInput
            type="sku"
            id="sku"
            name="sku"
            label="sku"
            maxLength={200}
            value={newProduct?.sku}
            inputClsName="w-full text-base rounded-md px-4 py-1.5 border border-gray-300"
            placeholderClsName="top-3.5 text-gray-500"
            onChange={(e) => handleInputChange("sku", e.target.value)}
          />
        </div>
        <div className="col-span-1">
          <AppDropdown
            dropdownType="selector"
            placeholder="CATEGORY"
            showSearch
            items={categoryFilterData}
            value={newProduct?.category}
            callback={(data) => handleInputChange("category", data)}
          />
        </div>
        <div className="col-span-1">
          <AppInput
            type="quantity"
            id="quantity"
            name="quantity"
            label="quantity"
            maxLength={200}
            value={newProduct?.quantity}
            inputClsName="w-full text-base rounded-md px-4 py-1.5 border border-gray-300"
            placeholderClsName="top-3.5 text-gray-500"
            onChange={(e) => handleInputChange("quantity", e.target.value)}
          />
        </div>
        <div className="col-span-1">
          <AppInput
            type="quantity"
            id="quantity"
            name="quantity"
            label="quantity"
            maxLength={200}
            value={newProduct?.quantity}
            inputClsName="w-full text-base rounded-md px-4 py-1.5 border border-gray-300"
            placeholderClsName="top-3.5 text-gray-500"
            onChange={(e) => handleInputChange("quantity", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
