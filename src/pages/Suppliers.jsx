import React, { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Edit2,
  Plus,
  Search,
  Star,
  Trash2,
  Truck,
  X,
  AlertTriangle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import supplierService from '../services/supplierService';
import authService from '../services/authService';

const emptyForm = {
  name: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  gstNumber: '',
  licenseNumber: '',
  status: 'ACTIVE',
  rating: '',
  leadTimeDays: '',
};

const Suppliers = () => {
  const user = authService.getCurrentUser();
  const canWrite = ['ADMIN', 'PHARMACIST'].includes(user?.role);
  const canDelete = user?.role === 'ADMIN';

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const data = await supplierService.getAll();
      setItems(data || []);
    } catch (err) {
      setError(authService.handleError(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(
      (s) =>
        !q ||
        [s.name, s.contactPerson, s.email, s.phone, s.city, s.state, s.gstNumber]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [items, search]);

  const activeCount = useMemo(() => items.filter((s) => s.status === 'ACTIVE').length, [items]);
  const avgRating = items.length
    ? (items.reduce((sum, s) => sum + Number(s.rating || 0), 0) / items.length).toFixed(1)
    : '4.5';
  const avgLead = items.length
    ? Math.round(items.reduce((sum, s) => sum + Number(s.leadTimeDays || 0), 0) / items.length)
    : 3;

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setMessage('');
  };

  const openEdit = (s) => {
    setEditingId(s.id);
    setForm({
      name: s.name || '',
      contactPerson: s.contactPerson || '',
      email: s.email || '',
      phone: s.phone || '',
      address: s.address || '',
      city: s.city || '',
      state: s.state || '',
      pincode: s.pincode || '',
      gstNumber: s.gstNumber || '',
      licenseNumber: s.licenseNumber || '',
      status: s.status || 'ACTIVE',
      rating: s.rating ?? '',
      leadTimeDays: s.leadTimeDays ?? '',
    });
    setShowForm(true);
    setMessage('');
  };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const payload = {
        ...form,
        rating: form.rating ? Number(form.rating) : null,
        leadTimeDays: form.leadTimeDays ? Number(form.leadTimeDays) : null,
      };

      if (editingId) {
        await supplierService.update(editingId, payload);
        setMessage('Supplier updated successfully.');
      } else {
        await supplierService.create(payload);
        setMessage('Supplier registered successfully.');
      }
      setShowForm(false);
      await load();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(authService.handleError(err));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setError('');
      await supplierService.remove(deleteTarget.id);
      setMessage('Supplier deleted successfully.');
      setDeleteTarget(null);
      await load();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(authService.handleError(err));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-sky-600 rounded-full animate-spin" />
        <p className="mt-3 text-xs font-medium text-slate-500">Loading suppliers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">Suppliers Directory</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 tracking-wide leading-relaxed">
            Manage authorized pharmaceutical distributors, performance ratings, and fulfillment SLAs with clinical oversight.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-slate-700 text-xs font-semibold tracking-wide transition cursor-pointer shadow-xs"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          {canWrite && (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4d6b5e] hover:bg-[#415d51] text-white text-xs font-semibold shadow-xs transition cursor-pointer tracking-wide"
            >
              <Plus size={15} />
              <span>Add Supplier</span>
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 leading-relaxed">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs leading-relaxed">
          {error}
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Suppliers</span>
            <div className="w-8 h-8 rounded-xl bg-[#eef3f0] text-[#4d6b5e] flex items-center justify-center">
              <Building2 size={16} />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-5 font-mono tabular-nums tracking-tight">
            {items.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 tracking-wide">Authorized distributors</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Network</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-600 mt-5 font-mono tabular-nums tracking-tight">
            {activeCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 tracking-wide">Available for orders</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Average Rating</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star size={16} />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-5 font-mono tabular-nums tracking-tight">
            ★ {avgRating}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 tracking-wide">Distributor quality score</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Avg Lead Time</span>
            <div className="w-8 h-8 rounded-xl bg-[#eef3f0] text-[#4d6b5e] flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-5 font-mono tabular-nums tracking-tight">
            {avgLead} days
          </div>
          <div className="text-[11px] text-slate-400 mt-1 tracking-wide">Delivery SLA</div>
        </div>
      </div>

      {/* SUPPLIERS TABLE */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-stone-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Distributor Accounts</h3>
            <p className="text-xs text-stone-500 mt-0.5">Showing {filtered.length} verified vendors and pharmaceutical partners</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-3 text-stone-400" size={15} />
            <input
              type="text"
              placeholder="Search vendor, city, contact..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs border border-stone-200 rounded-xl bg-stone-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200/80 text-stone-500 font-semibold bg-stone-50/70 uppercase tracking-wider text-[11px]">
                <th className="py-4 px-6">Supplier Name</th>
                <th className="py-4 px-6">Contact Person</th>
                <th className="py-4 px-6">Location</th>
                <th className="py-4 px-6 text-center">Rating</th>
                <th className="py-4 px-6 text-center">Lead Time</th>
                <th className="py-4 px-6">Status</th>
                {(canWrite || canDelete) && <th className="py-4 px-6 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-stone-400">
                    <Truck size={28} className="mx-auto text-stone-300 mb-3" />
                    <p className="font-semibold text-slate-700 text-sm">No suppliers found</p>
                    <p className="text-xs text-stone-400 mt-1">Try refining your search query</p>
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-stone-50/60 transition">
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-900 block text-sm">{s.name}</span>
                      <span className="text-[11px] text-stone-400 font-mono mt-0.5 block">
                        GST: {s.gstNumber || 'Unregistered'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-slate-800 font-medium block text-xs">{s.contactPerson || '—'}</span>
                      <span className="text-[11px] text-stone-500 mt-0.5 block">{s.phone || s.email || '—'}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-normal">
                      {[s.city, s.state].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="py-4 px-6 text-center font-mono font-semibold text-amber-700">
                      {s.rating ? `★ ${s.rating}` : '—'}
                    </td>
                    <td className="py-4 px-6 text-center font-mono text-slate-700 font-medium">
                      {s.leadTimeDays ? `${s.leadTimeDays}d` : '—'}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          s.status === 'ACTIVE' 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                            : 'bg-stone-100 text-stone-600 border border-stone-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            s.status === 'ACTIVE' ? 'bg-emerald-600' : 'bg-stone-400'
                          }`}
                        />
                        {s.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {(canWrite || canDelete) && (
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canWrite && (
                            <button
                              onClick={() => openEdit(s)}
                              className="p-1.5 text-stone-400 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                              title="Edit Supplier"
                            >
                              <Edit2 size={14} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => setDeleteTarget(s)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Delete Supplier"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Building2 size={16} className="text-sky-600" />
                {editingId ? 'Edit Supplier' : 'Register New Supplier'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={save} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-700 mb-1">Company / Vendor Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Contact Person</label>
                  <input
                    value={form.contactPerson}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">GST Number</label>
                  <input
                    value={form.gstNumber}
                    onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">City</label>
                  <input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">State</label>
                  <input
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Rating (1 to 5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Lead Time (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.leadTimeDays}
                    onChange={(e) => setForm({ ...form, leadTimeDays: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-xs transition cursor-pointer"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IN-APP DELETE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Delete Supplier?</h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Are you sure you want to remove <strong>{deleteTarget.name}</strong> from the vendor directory?
            </p>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
