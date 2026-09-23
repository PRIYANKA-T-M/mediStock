import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pill,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Boxes
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

const MedicineDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = ['ADMIN', 'PHARMACIST'].includes(user?.role);
  const canDelete = user?.role === 'ADMIN';

  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSupplier, setSelectedSupplier] = useState('ALL');
  const [selectedStockStatus, setSelectedStockStatus] = useState('ALL');

  // Modals
  const [deleteModalItem, setDeleteModalItem] = useState(null);
  const [viewModalItem, setViewModalItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');

      const [medRes, supRes] = await Promise.allSettled([
        api.get('/api/medicines'),
        api.get('/api/suppliers')
      ]);

      if (medRes.status === 'fulfilled') {
        setMedicines(medRes.value.data || []);
      }
      if (supRes.status === 'fulfilled') {
        setSuppliers(supRes.value.data || []);
      }
    } catch (err) {
      console.error('Failed to load medicines:', err);
      setError('Unable to load medicine inventory. Click refresh to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteMedicine = async () => {
    if (!deleteModalItem) return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/medicines/${deleteModalItem.id}`);
      setMedicines(prev => prev.filter(m => m.id !== deleteModalItem.id));
      setSuccessMsg(`Medicine "${deleteModalItem.name}" deleted successfully.`);
      setDeleteModalItem(null);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to delete medicine:', err);
      setError('Failed to delete medicine. Please verify permissions.');
    } finally {
      setIsDeleting(false);
    }
  };

  const categories = useMemo(() => {
    const list = Array.from(new Set(medicines.map(m => m.category).filter(Boolean)));
    return ['ALL', ...list];
  }, [medicines]);

  const supplierNames = useMemo(() => {
    const list = Array.from(new Set(suppliers.map(s => s.name).filter(Boolean)));
    return ['ALL', ...list];
  }, [suppliers]);

  const getStockStatus = (medicine) => {
    const qty = medicine.quantity || 0;
    const reorder = medicine.reorderLevel !== undefined ? medicine.reorderLevel : 20;
    if (qty === 0) return 'OUT_OF_STOCK';
    if (qty <= reorder) return 'LOW_STOCK';
    return 'AVAILABLE';
  };

  const filteredMedicines = useMemo(() => {
    return medicines.filter((m) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        m.name?.toLowerCase().includes(q) ||
        m.category?.toLowerCase().includes(q) ||
        m.batchNumber?.toLowerCase().includes(q);

      const matchesCategory = selectedCategory === 'ALL' || m.category === selectedCategory;
      const supName = suppliers.find(s => s.id === m.supplierId)?.name || m.supplierName || '';
      const matchesSupplier = selectedSupplier === 'ALL' || supName === selectedSupplier;

      const status = getStockStatus(m);
      const matchesStock = selectedStockStatus === 'ALL' || status === selectedStockStatus;

      return matchesSearch && matchesCategory && matchesSupplier && matchesStock;
    });
  }, [medicines, suppliers, searchQuery, selectedCategory, selectedSupplier, selectedStockStatus]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-sky-600 rounded-full animate-spin" />
        <p className="mt-4 text-sm font-semibold text-slate-500">Loading Medicine Catalog...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Pill size={14} className="text-sky-600" />
            Milestone 2 &amp; 3 Medicine Catalog
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Medicines Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Search, filter, view and manage clinical pharmaceuticals, batch identifiers, unit prices and reorder levels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-xs transition"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          {canManage && (
            <button
              onClick={() => navigate('/add-medicine')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold shadow-md shadow-sky-600/20 transition"
            >
              <Plus size={16} />
              <span>Add Medicine</span>
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* SEARCH AND MULTI-FILTER TOOLBAR */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search medicines or batches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'ALL' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Supplier Filter */}
          <div>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {supplierNames.map((s) => (
                <option key={s} value={s}>
                  {s === 'ALL' ? 'All Suppliers' : s}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div>
            <select
              value={selectedStockStatus}
              onChange={(e) => setSelectedStockStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="ALL">All Stock Statuses</option>
              <option value="AVAILABLE">Available (In Stock)</option>
              <option value="LOW_STOCK">Low Stock Warning</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>Showing <strong>{filteredMedicines.length}</strong> of {medicines.length} total medicine records</span>
          {(searchQuery || selectedCategory !== 'ALL' || selectedSupplier !== 'ALL' || selectedStockStatus !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setSelectedSupplier('ALL');
                setSelectedStockStatus('ALL');
              }}
              className="text-sky-600 font-bold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* MEDICINE TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold bg-slate-50/50">
                <th className="py-3.5 px-4">Medicine</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4">Batch Number</th>
                <th className="py-3.5 px-4">Stock Qty</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Expiry Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    <Pill size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">No medicines matched your criteria</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try refining your search keyword or clearing active filters.</p>
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((med) => {
                  const supName = suppliers.find(s => s.id === med.supplierId)?.name || med.supplierName || 'Apex Pharmaceuticals';
                  const status = getStockStatus(med);

                  let statusBadge = (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Available
                    </span>
                  );
                  if (status === 'OUT_OF_STOCK') {
                    statusBadge = (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        Out of Stock
                      </span>
                    );
                  } else if (status === 'LOW_STOCK') {
                    statusBadge = (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Low Stock
                      </span>
                    );
                  }

                  return (
                    <tr key={med.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{med.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">SKU-{med.id}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {med.category || 'Pharmaceutical'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {supName}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-600">
                        {med.batchNumber || 'BAT-001'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {med.quantity || 0} units
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        ₹{(med.price || 15).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {med.expiryDate || '2026-12-31'}
                      </td>
                      <td className="py-3.5 px-4">
                        {statusBadge}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewModalItem({ ...med, supplierName: supName })}
                            title="View Details"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition"
                          >
                            <Eye size={15} />
                          </button>
                          {canManage && (
                            <button
                              onClick={() => navigate('/edit-medicine', { state: { medicine: med } })}
                              title="Edit Medicine"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition"
                            >
                              <Edit2 size={15} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => setDeleteModalItem(med)}
                              title="Delete Medicine"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW MODAL */}
      {viewModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Pill size={18} className="text-sky-600" />
                Medicine Inspection
              </h3>
              <button
                onClick={() => setViewModalItem(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 pt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Trade Name</span>
                <span className="text-sm font-extrabold text-slate-900">{viewModalItem.name}</span>
                <span className="text-slate-500 block mt-0.5">{viewModalItem.category}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Batch Number</span>
                  <span className="font-mono font-bold text-slate-800 text-xs mt-0.5 block">{viewModalItem.batchNumber || 'BAT-001'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Stock</span>
                  <span className="font-bold text-slate-800 text-xs mt-0.5 block">{viewModalItem.quantity || 0} units</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Unit Price</span>
                  <span className="font-bold text-emerald-600 text-xs mt-0.5 block">₹{(viewModalItem.price || 15).toFixed(2)}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Expiry Date</span>
                  <span className="font-bold text-rose-600 text-xs mt-0.5 block">{viewModalItem.expiryDate || '2026-12-31'}</span>
                </div>
              </div>

              <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-xl text-sky-900">
                <span className="text-[10px] font-bold uppercase tracking-wider block text-sky-600">Supplying Vendor</span>
                <span className="font-bold text-xs mt-0.5 block">{viewModalItem.supplierName}</span>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setViewModalItem(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL (Milestone 2 Requirement: Confirm modal before DELETE /api/medicines/{id}) */}
      {deleteModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-rose-200 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle size={24} />
            </div>

            <h3 className="text-base font-extrabold text-slate-900 text-center">Delete Medicine Record?</h3>
            <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900">"{deleteModalItem.name}"</strong>?
              This will remove the item from the pharmacy catalog and disable associated stock tracking.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteModalItem(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteMedicine}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineDashboard;
