import React, { useState, useEffect, useMemo } from 'react';
import {
  Boxes,
  RefreshCw,
  Search,
  CheckCircle2,
  SlidersHorizontal,
  Plus,
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
  const [reason, setReason] = useState('Stock intake received');
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
  const lowStockCount = medicines.filter(
    (m) => (m.quantity || 0) > 0 && (m.quantity || 0) <= (m.reorderLevel || 20)
  ).length;
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
      setModalError(
        `Cannot reduce by ${qty} units. Current stock is only ${selectedMed.quantity || 0}.`
      );
      return;
    }

    setIsUpdating(true);
    try {
      await api.patch(`/api/inventory/${selectedMed.id}/stock`, {
        quantity: qty,
        operation,
        reason,
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
    } catch (err) {
      console.warn('Backend patch failed, trying stock quantity PUT:', err);
      try {
        await api.put(`/api/stocks/quantity`, {
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

        setSuccessMsg(`Successfully updated stock for ${selectedMed.name}.`);
        setSelectedMed(null);
        setTimeout(() => setSuccessMsg(''), 4000);
      } catch (fallbackErr) {
        setModalError(
          fallbackErr.response?.data?.message || 'Failed to update stock. Try again.'
        );
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredMedicines = useMemo(() => {
    return medicines.filter((m) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.name?.toLowerCase().includes(q) ||
        m.batchNumber?.toLowerCase().includes(q) ||
        m.category?.toLowerCase().includes(q);

      const qty = m.quantity || 0;
      const reorder = m.reorderLevel || 20;

      let matchesStatus = true;
      if (statusFilter === 'OUT_OF_STOCK') matchesStatus = qty === 0;
      else if (statusFilter === 'LOW_STOCK') matchesStatus = qty > 0 && qty <= reorder;
      else if (statusFilter === 'AVAILABLE') matchesStatus = qty > reorder;

      return matchesSearch && matchesStatus;
    });
  }, [medicines, searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-sky-600 rounded-full animate-spin" />
        <p className="mt-3 text-xs font-medium text-slate-500">Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Inventory Stock Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit inventory levels, reconcile discrepancies, and record stock intake.
          </p>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium transition cursor-pointer shadow-xs"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
          {error}
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          onClick={() => setStatusFilter('ALL')}
          className={`bg-white p-6 rounded-2xl border shadow-xs cursor-pointer transition ${
            statusFilter === 'ALL'
              ? 'border-[#4d6b5e] ring-2 ring-[#4d6b5e]/20'
              : 'border-stone-200/80 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Items</span>
            <div className="w-8 h-8 rounded-xl bg-[#eef3f0] text-[#4d6b5e] flex items-center justify-center">
              <Boxes size={16} />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-5 font-mono tabular-nums tracking-tight">
            {totalItems}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 tracking-wide">Catalog items tracked</div>
        </div>

        <div
          onClick={() => setStatusFilter('AVAILABLE')}
          className={`bg-white p-6 rounded-2xl border shadow-xs cursor-pointer transition ${
            statusFilter === 'AVAILABLE'
              ? 'border-emerald-600 ring-2 ring-emerald-100'
              : 'border-stone-200/80 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Available Stock</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-600 mt-5 font-mono tabular-nums tracking-tight">
            {availableCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 tracking-wide">Above reorder threshold</div>
        </div>

        <div
          onClick={() => setStatusFilter('LOW_STOCK')}
          className={`bg-white p-6 rounded-2xl border shadow-xs cursor-pointer transition ${
            statusFilter === 'LOW_STOCK'
              ? 'border-amber-500 ring-2 ring-amber-100'
              : 'border-stone-200/80 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Low Stock</span>
            <div className="w-8 h-8 rounded-xl bg-[#fef5ec] text-[#d97736] flex items-center justify-center">
              <SlidersHorizontal size={16} />
            </div>
          </div>
          <div className="text-3xl font-bold text-amber-600 mt-5 font-mono tabular-nums tracking-tight">
            {lowStockCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 tracking-wide">Below safety margin</div>
        </div>

        <div
          onClick={() => setStatusFilter('OUT_OF_STOCK')}
          className={`bg-white p-6 rounded-2xl border shadow-xs cursor-pointer transition ${
            statusFilter === 'OUT_OF_STOCK'
              ? 'border-rose-500 ring-2 ring-rose-100'
              : 'border-stone-200/80 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Out of Stock</span>
            <div className="w-8 h-8 rounded-xl bg-[#fef1f0] text-[#c54b43] flex items-center justify-center">
              <Boxes size={16} />
            </div>
          </div>
          <div className="text-3xl font-bold text-rose-600 mt-5 font-mono tabular-nums tracking-tight">
            {outOfStockCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 tracking-wide">Immediate action needed</div>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 bg-[#fafaf8] p-1.5 rounded-xl border border-stone-200 self-start sm:self-auto overflow-x-auto">
          {['ALL', 'AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK'].map((val) => (
            <button
              key={val}
              onClick={() => setStatusFilter(val)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition cursor-pointer ${
                statusFilter === val
                  ? 'bg-[#4d6b5e] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-stone-200/50'
              }`}
            >
              {val === 'ALL' ? 'All Items' : val.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search medicine or batch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 h-10 text-xs border border-stone-200 rounded-xl bg-[#fafaf8] focus:bg-white focus:outline-none focus:border-stone-400 tracking-wide transition"
          />
        </div>
      </div>

      {/* INVENTORY TABLE */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-100 text-slate-400 font-bold uppercase tracking-wider bg-[#fafaf8]">
                <th className="py-3.5 px-5">Medicine</th>
                <th className="py-3.5 px-5">Category</th>
                <th className="py-3.5 px-5">Batch Number</th>
                <th className="py-3.5 px-5 text-right">In Stock</th>
                <th className="py-3.5 px-5 text-right">Reorder Threshold</th>
                <th className="py-3.5 px-5">Status</th>
                {canUpdateStock && <th className="py-3.5 px-5 text-right">Adjust Stock</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100/80">
              {filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan={canUpdateStock ? 7 : 6} className="py-14 text-center text-slate-400 font-medium">
                    <Boxes size={28} className="mx-auto text-slate-300 mb-2.5" />
                    <p className="font-semibold text-slate-700">No inventory items match filter</p>
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((m) => {
                  const qty = m.quantity || 0;
                  const reorder = m.reorderLevel || 20;

                  let statusBadge = (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#edf6f1] text-[#1d523b] font-semibold text-[11px] tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      In Stock
                    </span>
                  );
                  if (qty === 0) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#fdf2f1] text-[#8e2b24] font-semibold text-[11px] tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Out of Stock
                      </span>
                    );
                  } else if (qty <= reorder) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#fef7ee] text-[#b45309] font-semibold text-[11px] tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Low Stock
                      </span>
                    );
                  }

                  return (
                    <tr key={m.id} className="hover:bg-[#fafaf8] transition">
                      <td className="py-4 px-5 font-bold text-slate-900 tracking-wide text-sm">{m.name}</td>
                      <td className="py-4 px-5 text-slate-600 tracking-wide">{m.category}</td>
                      <td className="py-4 px-5 text-slate-600 font-mono tracking-wider text-xs">{m.batchNumber || 'BAT-001'}</td>
                      <td className="py-4 px-5 text-right font-bold text-slate-900 font-mono text-sm">
                        {Number(qty).toLocaleString()}
                      </td>
                      <td className="py-4 px-5 text-right text-slate-500 font-mono text-xs">{reorder}</td>
                      <td className="py-4 px-5">{statusBadge}</td>
                      {canUpdateStock && (
                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => handleOpenModal(m)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-stone-200 text-slate-700 bg-white hover:bg-stone-50 transition cursor-pointer shadow-xs tracking-wide"
                          >
                            <SlidersHorizontal size={13} className="text-slate-400" />
                            <span>Adjust</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADJUST STOCK MODAL */}
      {selectedMed && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-sky-600" />
                Adjust Stock: {selectedMed.name}
              </h3>
              <button
                onClick={() => setSelectedMed(null)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleUpdateStock} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Adjustment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOperation('ADD')}
                    className={`py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                      operation === 'ADD'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    + Add Intake
                  </button>
                  <button
                    type="button"
                    onClick={() => setOperation('REDUCE')}
                    className={`py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                      operation === 'REDUCE'
                        ? 'bg-rose-50 border-rose-500 text-rose-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    - Reduce / Dispense
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Quantity (Units)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustmentQuantity}
                  onChange={(e) => setAdjustmentQuantity(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Current stock: {selectedMed.quantity || 0} units
                </span>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Reason / Note</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Shipment received, shelf breakage, dispensing"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMed(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold transition shadow-xs cursor-pointer"
                >
                  {isUpdating ? 'Saving...' : 'Confirm'}
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
