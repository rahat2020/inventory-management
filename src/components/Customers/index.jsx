import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Users,
  Mail,
  Phone,
  Briefcase,
  X,
  UserX,
  DollarSign,
} from "react-feather";
import {
  useLazyGetCustomersListQuery,
  useGetCustomerStatsQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} from "../../redux/api/customersApi";
import { formatCurrency } from "../../utils/appHelpers";
import toastAlert from "../../utils/toastAlert";
import AppSpinner from "../../helpers/ui/AppSpinner";
import { FilterDropdown } from "../../helpers/ui/FilterDropdown";

const STATUS_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Blocked", value: "blocked" },
];

const STATUS_BADGE_CLASSES = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-700",
  blocked: "bg-red-100 text-red-800",
};

const DROPDOWN_TRIGGER_CLASSES =
  "bg-white border border-gray-300 text-gray-900 px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  companyName: "",
  addressStreet: "",
  creditLimit: "",
  status: "active",
};

const getErrorMessage = (err, fallback) =>
  err?.data?.message || err?.error || fallback;

export default function CustomersPage() {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [customers, setCustomers] = useState([]);
  const [metaData, setMetaData] = useState({});
  const [page, setPage] = useState(1);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [triggerGetCustomers, { isFetching: isLoading }] =
    useLazyGetCustomersListQuery();
  const { data: stats, isLoading: isLoadingStats } = useGetCustomerStatsQuery();
  const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();
  const [deleteCustomer, { isLoading: isDeleting }] = useDeleteCustomerMutation();

  const statusQueryValue = statusFilter === "all" ? "" : statusFilter;

  const loadFirstPage = useCallback(async () => {
    const res = await triggerGetCustomers({
      search: searchTerm,
      status: statusQueryValue,
      page: 1,
      limit: 10,
    });
    if (res?.data?.success) {
      setCustomers(res.data.customers);
      setMetaData(res.data);
      setPage(1);
    }
  }, [triggerGetCustomers, searchTerm, statusQueryValue]);

  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  const fetchMore = async () => {
    const nextPage = page + 1;
    const res = await triggerGetCustomers({
      search: searchTerm,
      status: statusQueryValue,
      page: nextPage,
      limit: 10,
    });
    if (res?.data?.success) {
      setCustomers((prev) => [...prev, ...res.data.customers]);
      setMetaData(res.data);
      setPage(nextPage);
    }
  };

  const hasMore = metaData?.page < metaData?.pages;

  const openAddModal = () => {
    setEditingCustomer(null);
    setForm(emptyForm);
    setIsFormModalOpen(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setForm({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      companyName: customer.companyName || "",
      addressStreet: customer.address?.street || "",
      creditLimit: String(customer.creditLimit ?? ""),
      status: customer.status || "active",
    });
    setIsFormModalOpen(true);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toastAlert("error", "Name, email, and phone are required.", "top-right");
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      companyName: form.companyName.trim(),
      address: { street: form.addressStreet.trim() },
    };

    try {
      if (editingCustomer) {
        await updateCustomer({
          id: editingCustomer._id,
          ...payload,
          creditLimit: form.creditLimit === "" ? undefined : Number(form.creditLimit),
          status: form.status,
        }).unwrap();
        toastAlert("success", "Customer updated successfully.", "top-right");
      } else {
        await createCustomer(payload).unwrap();
        toastAlert("success", "Customer added successfully.", "top-right");
      }
      setIsFormModalOpen(false);
      setEditingCustomer(null);
      setForm(emptyForm);
      loadFirstPage();
    } catch (err) {
      toastAlert(
        "error",
        getErrorMessage(err, "Something went wrong. Please try again."),
        "top-right",
      );
    }
  };

  const openDeleteModal = (customer) => {
    setSelectedCustomer(customer);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCustomer) return;
    try {
      await deleteCustomer(selectedCustomer._id).unwrap();
      toastAlert("success", `${selectedCustomer.name} deleted.`, "top-right");
      setIsDeleteModalOpen(false);
      setSelectedCustomer(null);
      loadFirstPage();
    } catch (err) {
      toastAlert(
        "error",
        getErrorMessage(err, "Failed to delete customer."),
        "top-right",
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-end">
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            Add Customer
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Customers
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoadingStats ? "…" : stats?.totalCustomers ?? 0}
                </p>
              </div>
              <div className="p-3 bg-violet-100 rounded-full">
                <Users className="h-6 w-6 text-violet-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-500">
                  {isLoadingStats ? "…" : stats?.inactiveCustomers ?? 0}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <UserX className="h-6 w-6 text-gray-500" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {isLoadingStats ? "…" : formatCurrency(stats?.totalRevenue)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoadingStats ? "…" : formatCurrency(stats?.averageSpent)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search + filter */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by name, email, phone, or company..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-48">
              <Filter className="h-4 w-4 text-gray-500 shrink-0" />
              <FilterDropdown
                buttonLabel="All Status"
                options={STATUS_OPTIONS}
                selectedValue={statusFilter}
                onChange={(option) => setStatusFilter(option.value)}
                headerClassName={`${DROPDOWN_TRIGGER_CLASSES} rounded-lg`}
                dropdownMenuSize="180px"
                showFocus
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading && customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12">
                      <AppSpinner />
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                            <Users className="h-4 w-4 text-violet-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {customer.name}
                            </div>
                            {customer.companyName && (
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Briefcase className="h-3 w-3" />
                                {customer.companyName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700 flex items-center gap-1">
                          <Mail className="h-3 w-3 text-gray-400" />
                          {customer.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {customer.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.totalOrders ?? 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(customer.totalSpent)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            STATUS_BADGE_CLASSES[customer.status] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(customer)}
                            className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(customer)}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && customers.length > 0 && hasMore && (
            <div className="flex justify-center py-4 border-t border-gray-100">
              <button
                onClick={fetchMore}
                className="px-4 py-2 text-sm font-medium text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
              >
                Load more
              </button>
            </div>
          )}

          {!isLoading && customers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No customers found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchInput || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first customer"}
              </p>
              {!searchInput && statusFilter === "all" && (
                <button
                  onClick={openAddModal}
                  className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  <Plus className="h-4 w-4" />
                  Add Your First Customer
                </button>
              )}
            </div>
          )}
        </div>

        {/* Add / Edit Modal */}
        {isFormModalOpen && (
          <div className="fixed inset-0 bg-gray-500/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingCustomer ? "Edit Customer" : "Add New Customer"}
                </h2>
                <button
                  onClick={() => setIsFormModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                        placeholder="customer@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="text"
                        value={form.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={form.companyName}
                      onChange={(e) =>
                        handleChange("companyName", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={form.addressStreet}
                      onChange={(e) =>
                        handleChange("addressStreet", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                      placeholder="Optional"
                    />
                  </div>
                  {editingCustomer && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Credit Limit
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={form.creditLimit}
                          onChange={(e) =>
                            handleChange("creditLimit", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={form.status}
                          onChange={(e) =>
                            handleChange("status", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="blocked">Blocked</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 p-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || isUpdating}
                    className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isCreating || isUpdating
                      ? "Saving..."
                      : editingCustomer
                        ? "Save Changes"
                        : "Add Customer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && selectedCustomer && (
          <div className="fixed inset-0 bg-gray-500/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
              <div className="p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mx-auto mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  Delete Customer
                </h2>
                <p className="text-sm text-gray-600 text-center">
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-gray-900">
                    {selectedCustomer.name}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-end gap-2 p-6 border-t border-gray-200">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
