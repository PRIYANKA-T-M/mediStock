import React, { useEffect, useMemo, useState } from 'react';
import {
  Boxes,
  PackageCheck,
  RefreshCw,
  Search,
  TriangleAlert,
  CircleAlert,
  CheckCircle2,
  Minus,
  Plus,
} from 'lucide-react';
import authService from '../services/authService';
import stockService from '../services/stockService';

const StockTracking = () => {
  const user = authService.getCurrentUser();
  const canAdjust = ['ADMIN', 'PHARMACIST'].includes(user?.role);
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const data = await stockService.getAll();
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

  const counts = useMemo(
    () => ({
      total: items.length,
      optimal: items.filter((i) => i.status === 'OPTIMAL').length,
      low: items.filter((i) => i.status === 'LOW_STOCK').length,
      out: items.filter((i) => i.status === 'OUT_OF_STOCK').length,
    }),
    [items]
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((item) => filter === 'ALL' || item.status === filter)
      .filter(
        (item) =>
          !q ||
          [item.medicineName, item.medicineCode, item.category, item.batchNumber, item.supplierName]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(q))
      );
  }, [items, filter, search]);

  const updateQuantity = async (item, quantity) => {
    if (!canAdjust || quantity < 0) return;
    setBusyId(item.id);
    setError('');
    setMessage('');
    try {
      const updated = await stockService.updateQuantity(item.id, quantity);
      setItems((current) => current.map((row) => (row.id === item.id ? updated : row)));
      setMessage(`${updated.medicineName} stock set to ${updated.quantity} ${updated.unit}.`);
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(authService.handleError(err));
    } finally {
      setBusyId(null);
    }
  };

  const refreshAlerts = async () => {
    setError('');
    setMessage('');
    try {
      await stockService.refreshAlerts();
      await load(true);
      setMessage('All medicine stock levels verified and system alerts synchronized.');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(authService.handleError(err));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-3 border-slate-200 border-t-sky-600 rounded-full animate-spin" />
        <p className="mt-3 text-xs font-semibold text-slate-500">Loading Stock Surveillance...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">Medicine Stock Tracking</h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 leading-relaxed">
            Automated stock surveillance with dynamic threshold checking and automated alert generation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh Stock</span>
          </button>
          {canAdjust && (
            <button
              onClick={refreshAlerts}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Sync Alerts</span>
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-medium leading-relaxed">
          <CheckCircle2 size={18} className="text-emerald-700 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium">
          {error}
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          onClick={() => setFilter('ALL')}
          className={`bg-white p-6 rounded-2xl border shadow-xs flex items-center justify-between cursor-pointer transition ${
            filter === 'ALL'
              ? 'border-emerald-700 ring-2 ring-emerald-700/10'
              : 'border-stone-200/80 hover:border-stone-300'
          }`}
        >
          <div>
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider text-[11px]">Tracked Items</div>
            <div className="text-3xl font-bold text-slate-900 mt-2 font-mono tabular-nums tracking-tight">
              {counts.total}
            </div>
            <span className="text-xs text-stone-400 mt-1 block">Catalog active records</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
            <Boxes size={20} />
          </div>
        </div>

        <div
          onClick={() => setFilter('OPTIMAL')}
          className={`bg-white p-6 rounded-2xl border shadow-xs flex items-center justify-between cursor-pointer transition ${
            filter === 'OPTIMAL'
              ? 'border-emerald-700 ring-2 ring-emerald-700/10'
              : 'border-stone-200/80 hover:border-stone-300'
          }`}
        >
          <div>
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider text-[11px]">Optimal Stock</div>
            <div className="text-3xl font-bold text-emerald-800 mt-2 font-mono tabular-nums tracking-tight">
              {counts.optimal}
            </div>
            <span className="text-xs text-emerald-700 font-medium mt-1 block">Above safety buffer</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <PackageCheck size={20} />
          </div>
        </div>

        <div
          onClick={() => setFilter('LOW_STOCK')}
          className={`bg-white p-6 rounded-2xl border shadow-xs flex items-center justify-between cursor-pointer transition ${
            filter === 'LOW_STOCK'
              ? 'border-amber-600 ring-2 ring-amber-500/10'
              : 'border-stone-200/80 hover:border-stone-300'
          }`}
        >
          <div>
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider text-[11px]">Low Stock</div>
            <div className="text-3xl font-bold text-amber-700 mt-2 font-mono tabular-nums tracking-tight">
              {counts.low}
            </div>
            <span className="text-xs text-amber-700 font-medium mt-1 block">Requires supplier reorder</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <TriangleAlert size={20} />
          </div>
        </div>

        <div
          onClick={() => setFilter('OUT_OF_STOCK')}
          className={`bg-white p-6 rounded-2xl border shadow-xs flex items-center justify-between cursor-pointer transition ${
            filter === 'OUT_OF_STOCK'
              ? 'border-rose-600 ring-2 ring-rose-500/10'
              : 'border-stone-200/80 hover:border-stone-300'
          }`}
        >
          <div>
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider text-[11px]">Out of Stock</div>
            <div className="text-3xl font-bold text-rose-700 mt-2 font-mono tabular-nums tracking-tight">
              {counts.out}
            </div>
            <span className="text-xs text-rose-500/80 font-medium mt-1 block">Immediate PO critical</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
            <CircleAlert size={20} />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {['ALL', 'OPTIMAL', 'LOW_STOCK', 'OUT_OF_STOCK'].map((val) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                filter === val
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {val.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-3 text-stone-400" size={15} />
          <input
            type="text"
            placeholder="Search medicine, batch, supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs border border-stone-200 rounded-xl bg-stone-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition"
          />
        </div>
      </div>

      {/* STOCK TRACKING TABLE */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200/80 text-stone-500 font-semibold bg-stone-50/70 uppercase tracking-wider text-[11px]">
                <th className="py-4 px-6">Medicine Name</th>
                <th className="py-4 px-6">Category / Batch</th>
                <th className="py-4 px-6">Supplier</th>
                <th className="py-4 px-6 text-center">Adjust Units</th>
                <th className="py-4 px-6 text-right">Reorder Threshold</th>
                <th className="py-4 px-6">Stock Status</th>
                <th className="py-4 px-6">Expiry Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {visible.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-stone-400">
                    <Boxes size={28} className="mx-auto text-stone-300 mb-3" />
                    <p className="font-semibold text-slate-700 text-sm">No stock records found</p>
                    <p className="text-xs text-stone-400 mt-1">Try switching filters or adjusting your query</p>
                  </td>
                </tr>
              ) : (
                visible.map((item) => {
                  const isOut = item.status === 'OUT_OF_STOCK';
                  const isLow = item.status === 'LOW_STOCK';

                  let statusIndicator = (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      Optimal
                    </span>
                  );
                  if (isOut) {
                    statusIndicator = (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                        Out of Stock
                      </span>
                    );
                  } else if (isLow) {
                    statusIndicator = (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                        Low Stock
                      </span>
                    );
                  }

                  return (
                    <tr key={item.id} className="hover:bg-stone-50/60 transition">
                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-900 block text-sm">{item.medicineName}</span>
                        <span className="text-[11px] text-stone-400 font-mono mt-0.5 block">{item.medicineCode}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-slate-800 font-medium block">{item.category || '—'}</span>
                        <span className="text-[11px] text-stone-400 font-mono mt-0.5 block">{item.batchNumber || 'No batch'}</span>
                      </td>
                      <td className="py-4 px-6 text-stone-600 font-normal">{item.supplierName || '—'}</td>
                      <td className="py-4 px-6">
                        {canAdjust ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              disabled={busyId === item.id || item.quantity <= 0}
                              onClick={() => updateQuantity(item, item.quantity - 1)}
                              className="w-7 h-7 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-slate-700 flex items-center justify-center transition disabled:opacity-30 cursor-pointer shadow-xs"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="font-mono font-bold text-slate-900 w-12 text-center text-sm">
                              {item.quantity}
                            </span>
                            <button
                              disabled={busyId === item.id}
                              onClick={() => updateQuantity(item, item.quantity + 1)}
                              className="w-7 h-7 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-slate-700 flex items-center justify-center transition disabled:opacity-30 cursor-pointer shadow-xs"
                            >
                              <Plus size={13} />
                            </button>
                            <span className="text-xs text-stone-400 font-mono">{item.unit}</span>
                          </div>
                        ) : (
                          <div className="text-center font-mono font-bold text-slate-900 text-sm">
                            {item.quantity} <span className="text-xs text-stone-400 font-normal">{item.unit}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 font-mono text-right text-slate-700 font-medium">
                        {item.reorderLevel} {item.unit}
                      </td>
                      <td className="py-4 px-6">{statusIndicator}</td>
                      <td className="py-4 px-6 font-mono text-stone-600 font-medium">{item.expiryDate || '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockTracking;
