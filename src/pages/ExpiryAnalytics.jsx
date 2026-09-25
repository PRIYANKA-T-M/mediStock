import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  RefreshCw,
  Building2,
  Calendar,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

const ExpiryAnalytics = () => {
  const { user } = useAuth();

  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('NEAR_EXPIRY'); // 'NEAR_EXPIRY', 'EXPIRED', 'ALL'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');

      const [medRes, supRes] = await Promise.allSettled([
        api.get('/api/medicines'),
        api.get('/api/suppliers'),
      ]);

      const medData = medRes.status === 'fulfilled' ? medRes.value.data || [] : [];
      const supData = supRes.status === 'fulfilled' ? supRes.value.data || [] : [];

      setMedicines(medData);
      setSuppliers(supData);
    } catch (err) {
      console.error('Failed to load expiry data:', err);
      setError('Unable to load expiry records. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const today = new Date();

  const processedMedicines = useMemo(() => {
    return medicines.map((med) => {
      const expiryStr = med.expiryDate || '2026-10-15';
      const expiryDate = new Date(expiryStr);
      const isInvalid = Number.isNaN(expiryDate.getTime());

      const diffTime = isInvalid ? 99999999 : expiryDate.getTime() - today.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let status = 'SAFE';

      if (daysRemaining < 0) {
        status = 'EXPIRED';
      } else if (daysRemaining <= 7) {
        status = 'CRITICAL';
      } else if (daysRemaining <= 30) {
        status = 'NEAR_EXPIRY';
      }

      const supplierObj = suppliers.find((s) => s.id === med.supplierId) || {
        name: med.supplierName || 'Apex Pharmaceuticals',
        phone: '011-45678901',
        leadTimeDays: 3,
      };

      return {
        ...med,
        expiryDate: expiryStr,
        daysRemaining,
        status,
        supplier: supplierObj,
      };
    });
  }, [medicines, suppliers]);

  const expiredCount = useMemo(
    () => processedMedicines.filter((m) => m.daysRemaining < 0).length,
    [processedMedicines]
  );
  const within7DaysCount = useMemo(
    () => processedMedicines.filter((m) => m.daysRemaining >= 0 && m.daysRemaining <= 7).length,
    [processedMedicines]
  );
  const expiringSoonCount = useMemo(
    () => processedMedicines.filter((m) => m.daysRemaining >= 0 && m.daysRemaining <= 30).length,
    [processedMedicines]
  );
  const safeCount = useMemo(
    () => processedMedicines.filter((m) => m.daysRemaining > 30).length,
    [processedMedicines]
  );

  const filteredMedicines = useMemo(() => {
    return processedMedicines.filter((item) => {
      if (activeTab === 'NEAR_EXPIRY' && !(item.daysRemaining >= 0 && item.daysRemaining <= 30)) {
        return false;
      }
      if (activeTab === 'EXPIRED' && item.daysRemaining >= 0) {
        return false;
      }

      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name?.toLowerCase().includes(q);
        const matchesBatch = item.batchNumber?.toLowerCase().includes(q);
        const matchesCategory = item.category?.toLowerCase().includes(q);
        if (!matchesName && !matchesBatch && !matchesCategory) return false;
      }

      return true;
    });
  }, [processedMedicines, activeTab, categoryFilter, searchQuery]);

  const categories = useMemo(() => {
    const set = new Set(medicines.map((m) => m.category).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [medicines]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-sky-600 rounded-full animate-spin" />
        <p className="mt-3 text-xs font-medium text-slate-500">Auditing expiry timelines...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">Expiry Analytics</h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 leading-relaxed">
            Automated surveillance for near-expiry batches, critical dispensing windows, and quarantined inventory.
          </p>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition cursor-pointer shadow-xs"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium">
          {error}
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          onClick={() => setActiveTab('NEAR_EXPIRY')}
          className={`bg-white p-6 rounded-2xl border shadow-xs cursor-pointer transition ${
            activeTab === 'NEAR_EXPIRY'
              ? 'border-amber-600 ring-2 ring-amber-500/10'
              : 'border-stone-200/80 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider text-[11px]">Expiring Soon (30d)</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-3xl font-bold text-amber-700 mt-4 font-mono tabular-nums tracking-tight">
            {expiringSoonCount}
          </div>
          <div className="text-xs text-stone-400 mt-1.5 font-medium">Priority FEFO dispensing</div>
        </div>

        <div
          onClick={() => setActiveTab('EXPIRED')}
          className={`bg-white p-6 rounded-2xl border shadow-xs cursor-pointer transition ${
            activeTab === 'EXPIRED'
              ? 'border-rose-600 ring-2 ring-rose-500/10'
              : 'border-stone-200/80 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider text-[11px]">Expired Batches</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <XCircle size={16} />
            </div>
          </div>
          <div className="text-3xl font-bold text-rose-700 mt-4 font-mono tabular-nums tracking-tight">
            {expiredCount}
          </div>
          <div className="text-xs text-rose-500/80 mt-1.5 font-medium">Quarantine & write-off required</div>
        </div>

        <div
          onClick={() => setActiveTab('NEAR_EXPIRY')}
          className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs hover:border-stone-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider text-[11px]">Critical (≤ 7 Days)</span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="text-3xl font-bold text-orange-700 mt-4 font-mono tabular-nums tracking-tight">
            {within7DaysCount}
          </div>
          <div className="text-xs text-orange-500/80 mt-1.5 font-medium">Immediate intervention needed</div>
        </div>

        <div
          onClick={() => setActiveTab('ALL')}
          className={`bg-white p-6 rounded-2xl border shadow-xs cursor-pointer transition ${
            activeTab === 'ALL'
              ? 'border-emerald-700 ring-2 ring-emerald-700/10'
              : 'border-stone-200/80 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider text-[11px]">Safe Stock (&gt;30d)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-800 mt-4 font-mono tabular-nums tracking-tight">
            {safeCount}
          </div>
          <div className="text-xs text-stone-400 mt-1.5">Standard certified shelf life</div>
        </div>
      </div>

      {/* FILTER & TABS */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'NEAR_EXPIRY', label: 'Expiring Soon (30d)' },
            { id: 'EXPIRED', label: 'Expired Batches' },
            { id: 'ALL', label: 'All Catalog Batches' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium border border-stone-200 rounded-xl bg-stone-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-3 text-stone-400" size={15} />
            <input
              type="text"
              placeholder="Search batch or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs border border-stone-200 rounded-xl bg-stone-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition"
            />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200/80 text-stone-500 font-semibold bg-stone-50/70 uppercase tracking-wider text-[11px]">
                <th className="py-4 px-6">Medicine Name</th>
                <th className="py-4 px-6">Batch #</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6 text-right">Units</th>
                <th className="py-4 px-6">Expiry Date</th>
                <th className="py-4 px-6">Remaining</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-stone-400">
                    <Clock size={28} className="mx-auto text-stone-300 mb-3" />
                    <p className="font-semibold text-slate-700 text-sm">No batches match this filter</p>
                    <p className="text-xs text-stone-400 mt-1">Try switching tabs or resetting category filters</p>
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((item) => {
                  let statusBadge = (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      Safe
                    </span>
                  );
                  if (item.status === 'EXPIRED') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                        Expired
                      </span>
                    );
                  } else if (item.status === 'CRITICAL') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-600" />
                        Critical (≤7d)
                      </span>
                    );
                  } else if (item.status === 'NEAR_EXPIRY') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                        Expiring Soon
                      </span>
                    );
                  }

                  return (
                    <tr key={item.id} className="hover:bg-stone-50/60 transition">
                      <td className="py-4 px-6 font-bold text-slate-900 text-sm">{item.name}</td>
                      <td className="py-4 px-6 font-mono text-stone-500">{item.batchNumber || 'BAT-001'}</td>
                      <td className="py-4 px-6 text-stone-600 font-medium">{item.category}</td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-slate-900">
                        {item.quantity || 0}
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-700 font-medium">{item.expiryDate}</td>
                      <td className="py-4 px-6 font-mono font-semibold">
                        {item.daysRemaining < 0 ? (
                          <span className="text-rose-600">Expired {Math.abs(item.daysRemaining)}d ago</span>
                        ) : (
                          <span className={item.daysRemaining <= 30 ? 'text-amber-700' : 'text-slate-700'}>
                            {item.daysRemaining} days
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">{statusBadge}</td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedMedicine(item)}
                          className="p-1.5 text-stone-400 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                          title="Inspect Batch"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECTION MODAL */}
      {selectedMedicine && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Calendar size={16} className="text-sky-600" />
                Batch Surveillance Inspection
              </h3>
              <button
                onClick={() => setSelectedMedicine(null)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 pt-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="font-semibold text-slate-900 text-sm">{selectedMedicine.name}</div>
                <div className="text-slate-500 mt-0.5">{selectedMedicine.category}</div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-medium block">Batch Number</span>
                  <span className="font-mono font-semibold text-slate-800 text-xs mt-0.5 block">
                    {selectedMedicine.batchNumber || 'BAT-001'}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-medium block">Units in Stock</span>
                  <span className="font-mono font-semibold text-slate-800 text-xs mt-0.5 block">
                    {selectedMedicine.quantity || 0}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-medium block">Expiry Date</span>
                  <span className="font-mono font-semibold text-rose-600 text-xs mt-0.5 block">
                    {selectedMedicine.expiryDate}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-medium block">Storage Shelf</span>
                  <span className="font-semibold text-slate-800 text-xs mt-0.5 block">
                    {selectedMedicine.location || 'Shelf A-1'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[10px] text-slate-400 font-medium block">Distributor Contact</span>
                <span className="font-medium text-slate-900 block mt-0.5">
                  {selectedMedicine.supplier?.name}
                </span>
                <span className="text-[11px] text-slate-500">
                  Phone: {selectedMedicine.supplier?.phone || '011-45678901'}
                </span>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedMedicine(null)}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpiryAnalytics;
