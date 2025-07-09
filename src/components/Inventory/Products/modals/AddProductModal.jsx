import { useState } from "react";
import AppInput from "../../../../helpers/ui/AppInput";
import AppDropdown from "../../../../helpers/ui/AppDropdown";
import {
  useGetFilterCategoriesQuery,
  useLazyGetAllCategoriesQuery,
} from "../../../../redux/api/categoriesApi";
import {
  productStatusData,
  suppliersData,
  unitsData,
  wareHouseData,
} from "../../../../data";

const AddProductModal = ({ setIsCreateModalOpen, products, setProducts }) => {
  // redux states
  const { data, isLoading } = useLazyGetAllCategoriesQuery();
  const { data: categoryFilterData, isLoading: isCategoryLoading } =
    useGetFilterCategoriesQuery();

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

  const prepareSuppliersData = suppliersData?.map((sup) => ({
    value: sup?.id,
    label: sup?.supplier_name,
    contact_num: sup?.contact_person,
  }));

  const preparedWareHouseData = wareHouseData?.map((wh) => ({
    value: wh?.id,
    label: wh?.warehouse_name,
  }));

  // Handle form input changes
  const handleInputChange = (field, data) => {
    const isSelectedObjectData = ["unit"].includes(field);

    setNewProduct((prev) => ({
      ...prev,
      [field]: isSelectedObjectData ? data?.value : data,
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
            type="number"
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
            type="price"
            id="price"
            name="price"
            label="$ price"
            maxLength={200}
            value={newProduct?.price}
            inputClsName="w-full text-base rounded-md px-4 py-1.5 border border-gray-300"
            placeholderClsName="top-3.5 text-gray-500"
            onChange={(e) => handleInputChange("price", e.target.value)}
          />
        </div>
        <div className="col-span-1">
          <AppInput
            type="number"
            id="cost"
            name="cost"
            label="$ cost"
            maxLength={200}
            value={newProduct?.cost}
            inputClsName="w-full text-base rounded-md px-4 py-1.5 border border-gray-300"
            placeholderClsName="top-3.5 text-gray-500"
            onChange={(e) => handleInputChange("cost", e.target.value)}
          />
        </div>
        <div className="col-span-1">
          <AppDropdown
            dropdownType="selector"
            placeholder="SUPPLIER"
            showSearch
            items={prepareSuppliersData}
            value={newProduct?.supplier}
            callback={(data) => handleInputChange("supplier", data)}
          />
        </div>
        <div className="col-span-1">
          <AppDropdown
            dropdownType="selector"
            placeholder="UNITSS"
            showSearch
            items={unitsData}
            value={newProduct?.unit}
            callback={(data) => handleInputChange("unit", data)}
          />
        </div>
        <div className="col-span-1">
          <AppDropdown
            dropdownType="selector"
            placeholder="UNITSS"
            showSearch
            items={unitsData}
            value={newProduct?.unit}
            callback={(data) => handleInputChange("unit", data)}
          />
        </div>
        <div className="col-span-1">
          <AppDropdown
            dropdownType="selector"
            placeholder="STATUS"
            showSearch
            items={productStatusData}
            value={newProduct?.status}
            callback={(data) => handleInputChange("status", data)}
          />
        </div>
        <div className="col-span-1">
          <AppDropdown
            dropdownType="selector"
            placeholder="WAREHOUSE"
            showSearch
            items={preparedWareHouseData}
            value={newProduct?.warehouse}
            callback={(data) => handleInputChange("warehouse", data)}
          />
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
