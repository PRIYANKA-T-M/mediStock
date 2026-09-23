import React, { useState, useEffect, useMemo } from 'react';
import {
  Boxes,
  Plus,
  Minus,
  RefreshCw,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  PackagePlus,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

const Inventory = () => {
  const { user } = useAuth();
  const canUpdateStock = ['ADMIN', 'PHARMACIST'].includes(user?.role);

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, AVAILABLE, LOW_STOCK, OUT_OF_STOCK

  // Stock Update Modal State
  const [selectedMed, setSelectedMed] = useState(null);
  const [operation, setOperation] = useState('ADD'); // ADD or REDUCE
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(10);
  const [reason, setReason] = useState('Purchase restock order received');
  const [isUpdating, setIsUpdating] = useState(false);
  const [modalError, setModalError] = useState('');

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');

      const res = await api.get('/api/medicines');
      setMedicines(res.data || []);
    } catch (err) {
      console.error('Failed to load inventory:', err);
      setError('Unable to load inventory data. Please refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalItems = medicines.length;
  const outOfStockCount = medicines.filter((m) => (m.quantity || 0) === 0).length;
  const lowStockCount = medicines.filter((m) => (m.quantity || 0) > 0 && (m.quantity || 0) <= (m.reorderLevel || 20)).length;
  const availableCount = totalItems - outOfStockCount - lowStockCount;

  const handleOpenModal = (med) => {
    setSelectedMed(med);
    setOperation('ADD');
    setAdjustmentQuantity(10);
    setReason('Stock intake received');
    setModalError('');
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!selectedMed) return;
    setModalError('');

    const qty = Number(adjustmentQuantity);
    if (isNaN(qty) || qty <= 0) {
      setModalError('Please enter a valid positive quantity.');
      return;
    }

    if (operation === 'REDUCE' && qty > (selectedMed.quantity || 0)) {
      setModalError(`Cannot reduce by ${qty} units. Current stock is only ${selectedMed.quantity || 0}.`);
      return;
    }

    setIsUpdating(true);
    try {
      // Send patch to inventory endpoint
      await api.patch(`/api/inventory/${selectedMed.id}/stock`, {
        quantity: qty,
        operation,
        reason,
      });

      // Update local state
      const delta = operation === 'ADD' ? qty : -qty;
      setMedicines((prev) =>
        prev.map((m) =>
          m.id === selectedMed.id
            ? { ...m, quantity: Math.max(0, (m.quantity || 0) + delta) }
            : m
        )
      );

      setSuccessMsg(
        `Successfully ${operation === 'ADD' ? 'added' : 'reduced'} ${qty} units for ${selectedMed.name}.`
      );
      setSelectedMed(null);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to update stock:', err);
      // Fallback via stock quantity update
      try {
        await api.put('/api/stocks/quantity', {
          medicineId: selectedMed.id,
          quantity: qty,
          operation,
        });
        const delta = operation === 'ADD' ? qty : -qty;
        setMedicines((prev) =>
          prev.map((m) =>
            m.id === selectedMed.id
              ? { ...m, quantity: Math.max(0, (m.quantity || 0) + delta) }
              : m
          )
        );
        setSuccessMsg(`Successfully adjusted stock for ${selectedMed.name}.`);
        setSelectedMed(null);
        setTimeout(() => setSuccessMsg(''), 4000);
      } catch (e2) {
        setModalError('Could not update inventory stock. Please try again.');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredMedicines = useMemo(() => {
    return medicines.filter((m) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        m.name?.toLowerCase().includes(q) ||
        m.category?.toLowerCase().includes(q) ||
        m.batchNumber?.toLowerCase().includes(q);

      const qty = m.quantity || 0;
      const reorder = m.reorderLevel || 20;

      let status = 'AVAILABLE';
      if (qty === 0) status = 'OUT_OF_STOCK';
      else if (qty <= reorder) status = 'LOW_STOCK';

      const matchesStatus = statusFilter === 'ALL' || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [medicines, searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-sky-600 rounded-full animate-spin" />
        <p className="mt-4 text-sm font-semibold text-slate-500">Loading Central Inventory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Boxes size={14} className="text-sky-600" />
            Central Pharmaceutical Stock
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Inventory Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time stock audits, reorder thresholds, inventory adjustments and auto-replenishment notifications.
          </p>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-xs transition"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          <span>Refresh Inventory</span>
        </button>
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

      {/* KPI METRIC CARDS (Milestone 2/3 Spec: Total Items, Available, Low Stock, Out of Stock) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Items */}
        <div
          onClick={() => setStatusFilter('ALL')}
          className={`bg-white p-5 rounded-2xl border shadow-xs flex items-center justify-between cursor-pointer transition ${
            statusFilter === 'ALL' ? 'border-sky-400 ring-2 ring-sky-100' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Items</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{totalItems}</h3>
            <span className="text-[11px] font-semibold text-slate-500 mt-1 block">Full pharmaceutical catalog</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Boxes size={24} />
          </div>
        </div>

        {/* Available */}
        <div
          onClick={() => setStatusFilter('AVAILABLE')}
          className={`bg-white p-5 rounded-2xl border shadow-xs flex items-center justify-between cursor-pointer transition ${
            statusFilter === 'AVAILABLE' ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Stock</p>
            <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">{availableCount}</h3>
            <span className="text-[11px] font-semibold text-emerald-700 mt-1 block">Optimal dispensing level</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
        </div>

        {/* Low Stock */}
        <div
          onClick={() => setStatusFilter('LOW_STOCK')}
          className={`bg-white p-5 rounded-2xl border shadow-xs flex items-center justify-between cursor-pointer transition ${
            statusFilter === 'LOW_STOCK' ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock</p>
            <h3 className="text-3xl font-extrabold text-amber-600 mt-1">{lowStockCount}</h3>
            <span className="text-[11px] font-semibold text-amber-700 mt-1 block">Below reorder threshold</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
        </div>

        {/* Out of Stock */}
        <div
          onClick={() => setStatusFilter('OUT_OF_STOCK')}
          className={`bg-white p-5 rounded-2xl border shadow-xs flex items-center justify-between cursor-pointer transition ${
            statusFilter === 'OUT_OF_STOCK' ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Out of Stock</p>
            <h3 className="text-3xl font-extrabold text-rose-600 mt-1">{outOfStockCount}</h3>
            <span className="text-[11px] font-semibold text-rose-700 mt-1 block">Requires urgent purchase</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <XCircle size={24} />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'ALL', label: `All (${totalItems})` },
            { id: 'AVAILABLE', label: `Available (${availableCount})` },
            { id: 'LOW_STOCK', label: `Low Stock (${lowStockCount})` },
            { id: 'OUT_OF_STOCK', label: `Out of Stock (${outOfStockCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search inventory items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* INVENTORY TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold bg-slate-50/50">
                <th className="py-3.5 px-4">Medicine Item</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Batch #</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4">Reorder Level</th>
                <th className="py-3.5 px-4">Unit Price</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <Boxes size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">No inventory items found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try resetting search filters or adding new medicine stock.</p>
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((med) => {
                  const qty = med.quantity || 0;
                  const reorder = med.reorderLevel || 20;

                  let statusBadge = (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Optimal
                    </span>
                  );
                  if (qty === 0) {
                    statusBadge = (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        Out of Stock
                      </span>
                    );
                  } else if (qty <= reorder) {
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
                        <span className="text-[10px] text-slate-400">SKU-{med.id}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {med.category || 'Pharmaceutical'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-600">
                        {med.batchNumber || 'BAT-001'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 text-sm">{qty}</span>
                        <span className="text-[11px] text-slate-500 ml-1">units</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-semibold">
                        {reorder} units
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        ₹{(med.price || 15).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        {statusBadge}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {canUpdateStock ? (
                          <button
                            onClick={() => handleOpenModal(med)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs border border-sky-200 transition"
                          >
                            <SlidersHorizontal size={13} />
                            <span>Update Stock</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Read Only</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STOCK UPDATE MODAL (Milestone 2 PRD requirement: Add / Reduce Stock, Quantity, Reason) */}
      {selectedMed && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-sky-600" />
                Adjust Medicine Stock
              </h3>
              <button
                onClick={() => setSelectedMed(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateStock} className="space-y-4 pt-4 text-xs">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-semibold">
                  {modalError}
                </div>
              )}

              {/* Medicine Overview Card */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-sm font-bold text-slate-900 block">{selectedMed.name}</span>
                <div className="flex items-center justify-between mt-1 text-slate-500">
                  <span>Batch: <strong className="text-slate-700 font-mono">{selectedMed.batchNumber}</strong></span>
                  <span>Current Stock: <strong className="text-slate-900 text-sm">{selectedMed.quantity || 0} units</strong></span>
                </div>
              </div>

              {/* Operation Selector: Add Stock vs Reduce Stock */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Adjustment Operation
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOperation('ADD')}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition ${
                      operation === 'ADD'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Plus size={14} />
                    <span>Add Stock</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOperation('REDUCE')}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition ${
                      operation === 'REDUCE'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Minus size={14} />
                    <span>Reduce Stock</span>
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Quantity ({operation === 'ADD' ? 'To Ingest' : 'To Dispense / Remove'})
                </label>
                <input
                  type="number"
                  min="1"
                  value={adjustmentQuantity}
                  onChange={(e) => setAdjustmentQuantity(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Audit Reason / Order Ref
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="Purchase restock order received">Purchase restock order received</option>
                  <option value="Routine patient dispensing">Routine patient dispensing</option>
                  <option value="Damaged or expired batch quarantined">Damaged or expired batch quarantined</option>
                  <option value="Physical count inventory audit adjustment">Physical count inventory audit adjustment</option>
                  <option value="Supplier return or exchange">Supplier return or exchange</option>
                </select>
              </div>

              {/* Preview */}
              <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl flex items-center justify-between">
                <span className="font-semibold text-sky-800">New Resulting Stock:</span>
                <span className="font-extrabold text-sm text-sky-900">
                  {operation === 'ADD'
                    ? (selectedMed.quantity || 0) + Number(adjustmentQuantity || 0)
                    : Math.max(0, (selectedMed.quantity || 0) - Number(adjustmentQuantity || 0))}{' '}
                  units
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedMed(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-sm transition disabled:opacity-50"
                >
                  {isUpdating ? 'Updating Stock...' : 'Confirm Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
