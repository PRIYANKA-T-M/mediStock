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
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Medicine Stock Tracking</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated stock surveillance with dynamic threshold checking and automated alert generation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-xs transition cursor-pointer"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          {canAdjust && (
            <button
              onClick={refreshAlerts}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Sync Alerts</span>
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setFilter('ALL')}
          className={`bg-white p-5 rounded-xl border shadow-xs flex items-center justify-between cursor-pointer transition ${
            filter === 'ALL'
              ? 'border-sky-500 ring-2 ring-sky-100'
              : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div>
            <div className="text-xs font-medium text-slate-500">Tracked Items</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
              {counts.total}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Catalog records</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <Boxes size={18} />
          </div>
        </div>

        <div
          onClick={() => setFilter('OPTIMAL')}
          className={`bg-white p-5 rounded-xl border shadow-xs flex items-center justify-between cursor-pointer transition ${
            filter === 'OPTIMAL'
              ? 'border-emerald-500 ring-2 ring-emerald-100'
              : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div>
            <div className="text-xs font-medium text-slate-500">Optimal Stock</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono tabular-nums">
              {counts.optimal}
            </div>
            <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">Above threshold</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <PackageCheck size={18} />
          </div>
        </div>

        <div
          onClick={() => setFilter('LOW_STOCK')}
          className={`bg-white p-5 rounded-xl border shadow-xs flex items-center justify-between cursor-pointer transition ${
            filter === 'LOW_STOCK'
              ? 'border-amber-500 ring-2 ring-amber-100'
              : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div>
            <div className="text-xs font-medium text-slate-500">Low Stock</div>
            <div className="text-2xl font-bold text-amber-600 mt-1 font-mono tabular-nums">
              {counts.low}
            </div>
            <span className="text-[11px] text-amber-700 font-medium mt-0.5 block">Requires reorder</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <TriangleAlert size={18} />
          </div>
        </div>

        <div
          onClick={() => setFilter('OUT_OF_STOCK')}
          className={`bg-white p-5 rounded-xl border shadow-xs flex items-center justify-between cursor-pointer transition ${
            filter === 'OUT_OF_STOCK'
              ? 'border-rose-500 ring-2 ring-rose-100'
              : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div>
            <div className="text-xs font-medium text-slate-500">Out of Stock</div>
            <div className="text-2xl font-bold text-rose-600 mt-1 font-mono tabular-nums">
              {counts.out}
            </div>
            <span className="text-[11px] text-rose-700 font-medium mt-0.5 block">Immediate PO</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <CircleAlert size={18} />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto">
          {['ALL', 'OPTIMAL', 'LOW_STOCK', 'OUT_OF_STOCK'].map((val) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                filter === val
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {val.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search medicine, batch, supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* STOCK TRACKING TABLE */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/70">
                <th className="py-3 px-3.5">Medicine</th>
                <th className="py-3 px-3.5">Category / Batch</th>
                <th className="py-3 px-3.5">Supplier</th>
                <th className="py-3 px-3.5 text-center">Adjust Stock</th>
                <th className="py-3 px-3.5 text-right">Reorder Level</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5">Expiry Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <Boxes size={24} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">No stock records found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try selecting a different filter.</p>
                  </td>
                </tr>
              ) : (
                visible.map((item) => {
                  const isOut = item.status === 'OUT_OF_STOCK';
                  const isLow = item.status === 'LOW_STOCK';

                  let statusIndicator = (
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Optimal
                    </span>
                  );
                  if (isOut) {
                    statusIndicator = (
                      <span className="inline-flex items-center gap-1.5 text-rose-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Out of Stock
                      </span>
                    );
                  } else if (isLow) {
                    statusIndicator = (
                      <span className="inline-flex items-center gap-1.5 text-amber-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Low Stock
                      </span>
                    );
                  }

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-3.5">
                        <span className="font-semibold text-slate-900 block">{item.medicineName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{item.medicineCode}</span>
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="text-slate-700 block">{item.category || '—'}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{item.batchNumber || 'No batch'}</span>
                      </td>
                      <td className="py-3 px-3.5 text-slate-600">{item.supplierName || '—'}</td>
                      <td className="py-3 px-3.5">
                        {canAdjust ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              disabled={busyId === item.id || item.quantity <= 0}
                              onClick={() => updateQuantity(item, item.quantity - 1)}
                              className="w-6 h-6 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center transition disabled:opacity-30 cursor-pointer"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="font-mono font-bold text-slate-900 w-10 text-center text-xs">
                              {item.quantity}
                            </span>
                            <button
                              disabled={busyId === item.id}
                              onClick={() => updateQuantity(item, item.quantity + 1)}
                              className="w-6 h-6 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center transition disabled:opacity-30 cursor-pointer"
                            >
                              <Plus size={12} />
                            </button>
                            <span className="text-[10px] text-slate-400 ml-1">{item.unit}</span>
                          </div>
                        ) : (
                          <div className="text-center font-mono font-bold text-slate-900">
                            {item.quantity} <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-right text-slate-600">
                        {item.reorderLevel} {item.unit}
                      </td>
                      <td className="py-3 px-3.5">{statusIndicator}</td>
                      <td className="py-3 px-3.5 font-mono text-slate-600">{item.expiryDate || '—'}</td>
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
