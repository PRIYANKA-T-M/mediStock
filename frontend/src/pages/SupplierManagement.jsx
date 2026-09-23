import { useMemo, useState } from "react";
import {
  Building2,
  Eye,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  Truck,
  UserRound,
  X,
} from "lucide-react";

const initialSuppliers = [
  {
    id: 1,
    supplierName: "Medico Distributors",
    companyName: "Medico Healthcare Pvt. Ltd.",
    contactPerson: "Rahul Sharma",
    phone: "+91 98765 43210",
    email: "contact@medicohealthcare.com",
    address: "Industrial Area",
    city: "Dehradun",
    state: "Uttarakhand",
    pincode: "248001",
    gstNumber: "05ABCDE1234F1Z5",
    status: "Active",
    notes: "Regular medicine supplier",
  },
  {
    id: 2,
    supplierName: "HealthPlus Supplies",
    companyName: "HealthPlus Pharma",
    contactPerson: "Anita Verma",
    phone: "+91 91234 56789",
    email: "sales@healthpluspharma.com",
    address: "Sector 18",
    city: "Noida",
    state: "Uttar Pradesh",
    pincode: "201301",
    gstNumber: "09FGHIJ5678K1Z2",
    status: "Active",
    notes: "Tablets and capsules",
  },
];

const emptySupplier = {
  supplierName: "",
  companyName: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  gstNumber: "",
  status: "Active",
  notes: "",
};

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptySupplier);

  const filteredSuppliers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return suppliers.filter((supplier) => {
      const matchesSearch =
        !query ||
        supplier.supplierName.toLowerCase().includes(query) ||
        supplier.companyName.toLowerCase().includes(query) ||
        supplier.contactPerson.toLowerCase().includes(query) ||
        supplier.city.toLowerCase().includes(query);

      const matchesStatus =
        !statusFilter || supplier.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [suppliers, search, statusFilter]);

  const activeCount = suppliers.filter((item) => item.status === "Active").length;
  const inactiveCount = suppliers.filter((item) => item.status === "Inactive").length;

  const openAdd = () => {
    setEditingId(null);
    setForm(emptySupplier);
    setShowForm(true);
  };

  const openEdit = (supplier) => {
    setEditingId(supplier.id);
    setForm({ ...supplier });
    setShowForm(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.supplierName.trim() || !form.companyName.trim() || !form.contactPerson.trim()) {
      return;
    }

    if (editingId) {
      setSuppliers((previous) =>
        previous.map((supplier) =>
          supplier.id === editingId ? { ...form, id: editingId } : supplier
        )
      );
    } else {
      setSuppliers((previous) => [
        ...previous,
        { ...form, id: Date.now() },
      ]);
    }

    setShowForm(false);
    setEditingId(null);
    setForm(emptySupplier);
  };

  const handleDelete = (id) => {
    setSuppliers((previous) => previous.filter((supplier) => supplier.id !== id));
    if (selectedSupplier?.id === id) {
      setSelectedSupplier(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
            MEDISTOCK MODULE
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Supplier Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage supplier records, contact details and vendor status.
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Supplier
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <Truck size={21} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Suppliers</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{suppliers.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <Building2 size={21} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Active Suppliers</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{activeCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <UserRound size={21} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Inactive Suppliers</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{inactiveCount}</p>
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search supplier, company, contact person or city..."
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-[1100px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Supplier</th>
                <th className="px-5 py-4 font-semibold">Contact Person</th>
                <th className="px-5 py-4 font-semibold">Contact</th>
                <th className="px-5 py-4 font-semibold">Location</th>
                <th className="px-5 py-4 font-semibold">GST Number</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center text-slate-500">
                    No suppliers found.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{supplier.supplierName}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{supplier.companyName}</p>
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {supplier.contactPerson}
                    </td>

                    <td className="px-5 py-4">
                      <p className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Phone size={14} />
                        {supplier.phone}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                        <Mail size={14} />
                        {supplier.email}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="flex items-center gap-1.5 text-slate-600">
                        <MapPin size={14} />
                        {supplier.city}, {supplier.state}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">{supplier.pincode}</p>
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-slate-600">
                      {supplier.gstNumber || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          supplier.status === "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {supplier.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          title="View"
                          onClick={() => setSelectedSupplier(supplier)}
                          className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => openEdit(supplier)}
                          className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          onClick={() => handleDelete(supplier.id)}
                          className="grid h-9 w-9 place-items-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl md:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingId ? "Edit Supplier" : "Add Supplier"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter supplier and contact information.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {[
                  ["supplierName", "Supplier Name"],
                  ["companyName", "Company Name"],
                  ["contactPerson", "Contact Person"],
                  ["phone", "Phone Number"],
                  ["email", "Email"],
                  ["address", "Address"],
                  ["city", "City"],
                  ["state", "State"],
                  ["pincode", "Pincode"],
                  ["gstNumber", "GST Number"],
                ].map(([name, label]) => (
                  <label key={name} className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                      {label}
                    </span>
                    <input
                      type={name === "email" ? "email" : name === "phone" || name === "pincode" ? "tel" : "text"}
                      name={name}
                      value={form[name]}
                      onChange={handleChange}
                      required={["supplierName", "companyName", "contactPerson", "phone", "email"].includes(name)}
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">Status</span>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">Notes</span>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows="3"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>

              <div className="flex flex-col justify-end gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  {editingId ? "Update Supplier" : "Save Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedSupplier && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl md:p-8">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
                  SUPPLIER DETAILS
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {selectedSupplier.supplierName}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSupplier(null)}
                className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Object.entries(selectedSupplier)
                .filter(([key]) => key !== "id")
                .map(([key, value]) => (
                  <div key={key} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium capitalize text-slate-500">
                      {key.replace(/([A-Z])/g, " $1")}
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold text-slate-900">
                      {value || "—"}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManagement;
