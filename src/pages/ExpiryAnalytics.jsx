import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  ArrowRight,
  Eye,
  RefreshCw,
  Building2,
  Boxes,
  ShieldAlert,
  Calendar,
  Layers
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

      const medData = medRes.status === 'fulfilled' ? (medRes.value.data || []) : [];
      const supData = supRes.status === 'fulfilled' ? (supRes.value.data || []) : [];

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

  // Process medicines into expiry items with days remaining calculation
  const processedMedicines = useMemo(() => {
    return medicines.map((med) => {
      // Fallback expiry dates for demonstration if not set
      const expiryStr = med.expiryDate || '2026-10-15';
      const expiryDate = new Date(expiryStr);
      const isInvalid = Number.isNaN(expiryDate.getTime());
      
      const diffTime = isInvalid ? 99999999 : expiryDate.getTime() - today.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let status = 'SAFE';
      let statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';

      if (daysRemaining < 0) {
        status = 'EXPIRED';
        statusColor = 'bg-rose-50 text-rose-700 border-rose-200';
      } else if (daysRemaining <= 7) {
        status = 'CRITICAL';
        statusColor = 'bg-red-50 text-red-700 border-red-200';
      } else if (daysRemaining <= 30) {
        status = 'NEAR_EXPIRY';
        statusColor = 'bg-amber-50 text-amber-700 border-amber-200';
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
        statusColor,
        supplier: supplierObj,
      };
    });
  }, [medicines, suppliers]);

  // Metric counts
  const expiringSoonCount = processedMedicines.filter((m) => m.daysRemaining >= 0 && m.daysRemaining <= 30).length;
  const expiredCount = processedMedicines.filter((m) => m.daysRemaining < 0).length;
  const within7DaysCount = processedMedicines.filter((m) => m.daysRemaining >= 0 && m.daysRemaining <= 7).length;
  const safeCount = processedMedicines.filter((m) => m.daysRemaining > 30).length;

  // Filtered by Tab & Search
  const filteredMedicines = useMemo(() => {
    return processedMedicines.filter((med) => {
      // Tab check
      let matchesTab = true;
      if (activeTab === 'NEAR_EXPIRY') {
        matchesTab = med.daysRemaining >= 0 && med.daysRemaining <= 30;
      } else if (activeTab === 'EXPIRED') {
        matchesTab = med.daysRemaining < 0;
      }

      // Search check
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        med.name?.toLowerCase().includes(query) ||
        med.batchNumber?.toLowerCase().includes(query) ||
        med.category?.toLowerCase().includes(query);

      // Category check
      const matchesCategory = categoryFilter === 'ALL' || med.category === categoryFilter;

      return matchesTab && matchesSearch && matchesCategory;
    });
  }, [processedMedicines, activeTab, searchQuery, categoryFilter]);

  const categories = useMemo(() => {
    const set = new Set(medicines.map((m) => m.category).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [medicines]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-sky-600 rounded-full animate-spin" />
        <p className="mt-4 text-sm font-semibold text-slate-500">Auditing Medicine Expiration Timelines...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Calendar size={14} className="text-rose-600" />
            Milestone 3 Expiry Surveillance
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Expiry Analytics & Tracking
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Automated timeline tracking for near-expiry batches, critical 7-day warnings, and quarantined expired stock.
          </p>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-xs transition"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          <span>Refresh Audit</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* KPI SUMMARY CARDS (Milestone 3 Spec: Expiring Soon, Expired, Within 7 Days, Safe) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Expiring Soon */}
        <div
          onClick={() => setActiveTab('NEAR_EXPIRY')}
          className={`bg-white p-5 rounded-2xl border shadow-xs flex items-center justify-between cursor-pointer transition ${
            activeTab === 'NEAR_EXPIRY' ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expiring Soon (30d)</p>
            <h3 className="text-3xl font-extrabold text-amber-600 mt-1">{expiringSoonCount}</h3>
            <span className="text-[11px] font-semibold text-amber-700 mt-1 block">Priority dispensing</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock size={24} />
          </div>
        </div>

        {/* Expired */}
        <div
          onClick={() => setActiveTab('EXPIRED')}
          className={`bg-white p-5 rounded-2xl border shadow-xs flex items-center justify-between cursor-pointer transition ${
            activeTab === 'EXPIRED' ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expired Medicines</p>
            <h3 className="text-3xl font-extrabold text-rose-600 mt-1">{expiredCount}</h3>
            <span className="text-[11px] font-semibold text-rose-700 mt-1 block">Immediate quarantine</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <XCircle size={24} />
          </div>
        </div>

        {/* Within 7 Days */}
        <div
          onClick={() => setActiveTab('NEAR_EXPIRY')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-red-300 transition"
        >
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Within 7 Days</p>
            <h3 className="text-3xl font-extrabold text-red-600 mt-1">{within7DaysCount}</h3>
            <span className="text-[11px] font-semibold text-red-700 mt-1 block">Critical urgency</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
        </div>

        {/* Safe */}
        <div
          onClick={() => setActiveTab('ALL')}
          className={`bg-white p-5 rounded-2xl border shadow-xs flex items-center justify-between cursor-pointer transition ${
            activeTab === 'ALL' ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Safe Catalog (&gt;30d)</p>
            <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">{safeCount}</h3>
            <span className="text-[11px] font-semibold text-emerald-700 mt-1 block">Standard rotation</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
        </div>
      </div>

      {/* FILTER & TAB TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('NEAR_EXPIRY')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'NEAR_EXPIRY'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Near Expiry ({expiringSoonCount})
          </button>
          <button
            onClick={() => setActiveTab('EXPIRED')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'EXPIRED'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Expired ({expiredCount})
          </button>
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'ALL'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Batches ({processedMedicines.length})
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-3">
          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          {/* Search Input */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search medicine or batch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

      {/* EXPIRY TABLE (Milestone 3 Spec: Medicine, Batch, Expiry Date, Days Remaining, Stock, Status, Action) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold bg-slate-50/50">
                <th className="py-3.5 px-4">Medicine Name</th>
                <th className="py-3.5 px-4">Batch Number</th>
                <th className="py-3.5 px-4">Expiry Date</th>
                <th className="py-3.5 px-4">Days Remaining</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4">Risk Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
                    <p className="font-semibold text-slate-700">No medicines found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {activeTab === 'EXPIRED'
                        ? 'No expired batches detected in current inventory!'
                        : 'No medicines nearing expiration under current criteria.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((med) => {
                  return (
                    <tr key={med.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{med.name}</span>
                        <span className="text-[11px] text-slate-400">{med.category || 'Pharmaceutical'}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                        {med.batchNumber || 'BAT-DEFAULT'}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {med.expiryDate}
                      </td>
                      <td className="py-3.5 px-4">
                        {med.daysRemaining < 0 ? (
                          <span className="font-bold text-rose-600">Expired {Math.abs(med.daysRemaining)}d ago</span>
                        ) : med.daysRemaining <= 7 ? (
                          <span className="font-extrabold text-red-600 flex items-center gap-1">
                            <AlertTriangle size={13} /> {med.daysRemaining} days left
                          </span>
                        ) : med.daysRemaining <= 30 ? (
                          <span className="font-bold text-amber-600">{med.daysRemaining} days left</span>
                        ) : (
                          <span className="font-semibold text-slate-600">{med.daysRemaining} days</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {med.quantity || 0} units
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${med.statusColor}`}>
                          {med.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedMedicine(med)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs border border-sky-200 transition"
                        >
                          <Eye size={13} />
                          <span>View Details</span>
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

      {/* VIEW MEDICINE DETAILS MODAL (Milestone 3 Spec: Medicine details, batch, current stock, expiry date, supplier) */}
      {selectedMedicine && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CalendarAlert size={20} className="text-rose-600" />
                Batch Expiry & Disposal Audit
              </h3>
              <button
                onClick={() => setSelectedMedicine(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 pt-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900">{selectedMedicine.name}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${selectedMedicine.statusColor}`}>
                    {selectedMedicine.status}
                  </span>
                </div>
                <p className="text-slate-500 mt-1">Category: {selectedMedicine.category || 'General Medicine'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">Batch Number</span>
                  <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
                    {selectedMedicine.batchNumber || 'BAT-DEFAULT'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">Current Stock</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                    {selectedMedicine.quantity || 0} units
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">Expiry Date</span>
                  <span className="font-bold text-rose-600 text-sm mt-0.5 block">
                    {selectedMedicine.expiryDate}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">Days Remaining</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                    {selectedMedicine.daysRemaining < 0
                      ? `EXPIRED (${Math.abs(selectedMedicine.daysRemaining)}d)`
                      : `${selectedMedicine.daysRemaining} days`}
                  </span>
                </div>
              </div>

              {/* Supplier Information */}
              <div className="p-3.5 bg-sky-50/70 border border-sky-100 rounded-xl">
                <div className="flex items-center gap-1.5 font-bold text-sky-900 mb-1">
                  <Building2 size={15} />
                  <span>Procuring Supplier Information</span>
                </div>
                <div className="space-y-1 text-sky-800">
                  <p><strong>Supplier:</strong> {selectedMedicine.supplier?.name || 'Apex Pharmaceuticals'}</p>
                  <p><strong>Contact:</strong> {selectedMedicine.supplier?.phone || '011-45678901'}</p>
                  <p><strong>Lead Time:</strong> {selectedMedicine.supplier?.leadTimeDays || 3} days</p>
                </div>
              </div>

              {/* Protocol Recommendation */}
              <div className="p-3 rounded-xl bg-slate-100 text-slate-700">
                <strong>Standard Protocol: </strong>
                {selectedMedicine.daysRemaining < 0
                  ? 'Isolate this batch from active dispensing. Initiate medical waste disposal audit or supplier return credit request.'
                  : selectedMedicine.daysRemaining <= 7
                  ? 'Mark for expedited First-Expiry-First-Out (FEFO) dispensing immediately.'
                  : 'Maintain standard climate-controlled storage and ongoing surveillance.'}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedMedicine(null)}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition shadow-sm"
                >
                  Close Inspection
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
