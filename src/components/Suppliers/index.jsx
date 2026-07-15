import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Truck,
  Star,
  Mail,
  Phone,
  User,
  X,
  UserX,
  DollarSign,
} from "react-feather";
import {
  useLazyGetSuppliersListQuery,
  useGetSupplierStatsQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} from "../../redux/api/suppliersApi";
import { formatCurrency } from "../../utils/appHelpers";
import toastAlert from "../../utils/toastAlert";
import AppSpinner from "../../helpers/ui/AppSpinner";
import { FilterDropdown } from "../../helpers/ui/FilterDropdown";

const STATUS_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Suspended", value: "suspended" },
];

const STATUS_BADGE_CLASSES = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-700",
  suspended: "bg-red-100 text-red-800",
};

const DROPDOWN_TRIGGER_CLASSES =
  "bg-white border border-gray-300 text-gray-900 px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  contactPerson: "",
  addressStreet: "",
  paymentTerms: "",
  rating: 3,
  status: "active",
};

const getErrorMessage = (err, fallback) =>
  err?.data?.message || err?.error || fallback;

function StarRating({ value }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3.5 w-3.5 ${
            n <= Math.round(value || 0)
              ? "text-amber-400 fill-amber-400"
              : "text-gray-200 fill-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function SuppliersPage() {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [suppliers, setSuppliers] = useState([]);
  const [metaData, setMetaData] = useState({});
  const [page, setPage] = useState(1);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [triggerGetSuppliers, { isFetching: isLoading }] =
    useLazyGetSuppliersListQuery();
  const { data: stats, isLoading: isLoadingStats } = useGetSupplierStatsQuery();
  const [createSupplier, { isLoading: isCreating }] = useCreateSupplierMutation();
  const [updateSupplier, { isLoading: isUpdating }] = useUpdateSupplierMutation();
  const [deleteSupplier, { isLoading: isDeleting }] = useDeleteSupplierMutation();

  const statusQueryValue = statusFilter === "all" ? "" : statusFilter;

  const loadFirstPage = useCallback(async () => {
    const res = await triggerGetSuppliers({
      search: searchTerm,
      status: statusQueryValue,
      page: 1,
      limit: 10,
    });
    if (res?.data?.success) {
      setSuppliers(res.data.suppliers);
      setMetaData(res.data);
      setPage(1);
    }
  }, [triggerGetSuppliers, searchTerm, statusQueryValue]);

  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  const fetchMore = async () => {
    const nextPage = page + 1;
    const res = await triggerGetSuppliers({
      search: searchTerm,
      status: statusQueryValue,
      page: nextPage,
      limit: 10,
    });
    if (res?.data?.success) {
      setSuppliers((prev) => [...prev, ...res.data.suppliers]);
      setMetaData(res.data);
      setPage(nextPage);
    }
  };

  const hasMore = metaData?.page < metaData?.pages;

  const openAddModal = () => {
    setEditingSupplier(null);
    setForm(emptyForm);
    setIsFormModalOpen(true);
  };

  const openEditModal = (supplier) => {
    setEditingSupplier(supplier);
    setForm({
      name: supplier.name || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      contactPerson: supplier.contactPerson || "",
      addressStreet: supplier.address?.street || "",
      paymentTerms: supplier.paymentTerms || "",
      rating: supplier.rating || 3,
      status: supplier.status || "active",
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
      contactPerson: form.contactPerson.trim(),
      address: { street: form.addressStreet.trim() },
      paymentTerms: form.paymentTerms.trim(),
    };

    try {
      if (editingSupplier) {
        await updateSupplier({
          id: editingSupplier._id,
          ...payload,
          rating: Number(form.rating),
          status: form.status,
        }).unwrap();
        toastAlert("success", "Supplier updated successfully.", "top-right");
      } else {
        await createSupplier(payload).unwrap();
        toastAlert("success", "Supplier added successfully.", "top-right");
      }
      setIsFormModalOpen(false);
      setEditingSupplier(null);
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

  const openDeleteModal = (supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSupplier) return;
    try {
      await deleteSupplier(selectedSupplier._id).unwrap();
      toastAlert("success", `${selectedSupplier.name} deleted.`, "top-right");
      setIsDeleteModalOpen(false);
      setSelectedSupplier(null);
      loadFirstPage();
    } catch (err) {
      toastAlert(
        "error",
        getErrorMessage(err, "Failed to delete supplier."),
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
            Add Supplier
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Suppliers
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoadingStats ? "…" : stats?.totalSuppliers ?? 0}
                </p>
              </div>
              <div className="p-3 bg-violet-100 rounded-full">
                <Truck className="h-6 w-6 text-violet-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-500">
                  {isLoadingStats ? "…" : stats?.inactiveSuppliers ?? 0}
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
                  Total Purchased
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {isLoadingStats ? "…" : formatCurrency(stats?.totalPurchased)}
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
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-amber-500">
                  {isLoadingStats ? "…" : (stats?.averageRating || 0).toFixed(1)}
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-full">
                <Star className="h-6 w-6 text-amber-500" />
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
                placeholder="Search by name, email, or phone..."
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
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purchased
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
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
                {isLoading && suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12">
                      <AppSpinner />
                    </td>
                  </tr>
                ) : (
                  suppliers.map((supplier) => (
                    <tr key={supplier._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                            <Truck className="h-4 w-4 text-violet-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {supplier.name}
                            </div>
                            {supplier.contactPerson && (
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {supplier.contactPerson}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700 flex items-center gap-1">
                          <Mail className="h-3 w-3 text-gray-400" />
                          {supplier.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {supplier.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {supplier.totalOrders ?? 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(supplier.totalPurchased)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StarRating value={supplier.rating} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            STATUS_BADGE_CLASSES[supplier.status] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {supplier.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(supplier)}
                            className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(supplier)}
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

          {!isLoading && suppliers.length > 0 && hasMore && (
            <div className="flex justify-center py-4 border-t border-gray-100">
              <button
                onClick={fetchMore}
                className="px-4 py-2 text-sm font-medium text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
              >
                Load more
              </button>
            </div>
          )}

          {!isLoading && suppliers.length === 0 && (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No suppliers found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchInput || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first supplier"}
              </p>
              {!searchInput && statusFilter === "all" && (
                <button
                  onClick={openAddModal}
                  className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  <Plus className="h-4 w-4" />
                  Add Your First Supplier
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
                  {editingSupplier ? "Edit Supplier" : "Add New Supplier"}
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
                      Supplier Name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                      placeholder="Enter supplier name"
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
                        placeholder="supplier@example.com"
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
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={form.contactPerson}
                      onChange={(e) =>
                        handleChange("contactPerson", e.target.value)
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Terms
                    </label>
                    <input
                      type="text"
                      value={form.paymentTerms}
                      onChange={(e) =>
                        handleChange("paymentTerms", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                      placeholder="e.g. Net 30 (optional)"
                    />
                  </div>
                  {editingSupplier && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rating
                        </label>
                        <select
                          value={form.rating}
                          onChange={(e) =>
                            handleChange("rating", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                        >
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>
                              {n} star{n > 1 ? "s" : ""}
                            </option>
                          ))}
                        </select>
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
                          <option value="suspended">Suspended</option>
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
                      : editingSupplier
                        ? "Save Changes"
                        : "Add Supplier"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && selectedSupplier && (
          <div className="fixed inset-0 bg-gray-500/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
              <div className="p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mx-auto mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  Delete Supplier
                </h2>
                <p className="text-sm text-gray-600 text-center">
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-gray-900">
                    {selectedSupplier.name}
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
