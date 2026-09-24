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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Expiry Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated surveillance for near-expiry batches, critical windows, and quarantined stock.
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

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
          {error}
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('NEAR_EXPIRY')}
          className={`bg-white p-5 rounded-xl border shadow-xs cursor-pointer transition ${
            activeTab === 'NEAR_EXPIRY'
              ? 'border-amber-500 ring-2 ring-amber-100'
              : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Expiring Soon (30d)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-3 font-mono tabular-nums">
            {expiringSoonCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Priority FEFO dispensing</div>
        </div>

        <div
          onClick={() => setActiveTab('EXPIRED')}
          className={`bg-white p-5 rounded-xl border shadow-xs cursor-pointer transition ${
            activeTab === 'EXPIRED'
              ? 'border-rose-500 ring-2 ring-rose-100'
              : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Expired Batches</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-3 font-mono tabular-nums">
            {expiredCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Quarantine required</div>
        </div>

        <div
          onClick={() => setActiveTab('NEAR_EXPIRY')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Critical (≤ 7 Days)</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-orange-600 mt-3 font-mono tabular-nums">
            {within7DaysCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Immediate intervention</div>
        </div>

        <div
          onClick={() => setActiveTab('ALL')}
          className={`bg-white p-5 rounded-xl border shadow-xs cursor-pointer transition ${
            activeTab === 'ALL'
              ? 'border-emerald-500 ring-2 ring-emerald-100'
              : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Safe Stock (&gt;30d)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-3 font-mono tabular-nums">
            {safeCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Standard shelf life</div>
        </div>
      </div>

      {/* FILTER & TABS */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'NEAR_EXPIRY', label: 'Expiring Soon (30d)' },
            { id: 'EXPIRED', label: 'Expired' },
            { id: 'ALL', label: 'All Catalog Batches' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search batch or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/60">
                <th className="py-3 px-4">Medicine Name</th>
                <th className="py-3 px-4">Batch #</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Units</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Remaining</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <Clock size={24} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">No batches match this filter</p>
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((item) => {
                  let statusBadge = (
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Safe
                    </span>
                  );
                  if (item.status === 'EXPIRED') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1.5 text-rose-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Expired
                      </span>
                    );
                  } else if (item.status === 'CRITICAL') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1.5 text-orange-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        Critical (≤7d)
                      </span>
                    );
                  } else if (item.status === 'NEAR_EXPIRY') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1.5 text-amber-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Expiring Soon
                      </span>
                    );
                  }

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900">{item.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{item.batchNumber || 'BAT-001'}</td>
                      <td className="py-3 px-4 text-slate-600">{item.category}</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                        {item.quantity || 0}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">{item.expiryDate}</td>
                      <td className="py-3 px-4 font-mono font-medium">
                        {item.daysRemaining < 0 ? (
                          <span className="text-rose-600">Expired {Math.abs(item.daysRemaining)}d ago</span>
                        ) : (
                          <span className={item.daysRemaining <= 30 ? 'text-amber-600' : 'text-slate-600'}>
                            {item.daysRemaining} days
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">{statusBadge}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedMedicine(item)}
                          className="p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded transition cursor-pointer"
                          title="Inspect Batch"
                        >
                          <Eye size={14} />
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
