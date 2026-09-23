import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes,
  Pill,
  Search,
  BellRing,
  AlertTriangle,
  Clock,
  ArrowRight,
  Shield,
  Activity,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [medicines, setMedicines] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');

      const [medRes, alertRes] = await Promise.allSettled([
        api.get('/api/medicines'),
        api.get('/api/alerts')
      ]);

      const medData = medRes.status === 'fulfilled' ? (medRes.value.data || []) : [];
      const alertData = alertRes.status === 'fulfilled' ? (alertRes.value.data || []) : [];

      setMedicines(medData);
      setAlerts(alertData);
    } catch (err) {
      console.error('Failed to load staff dashboard:', err);
      setError('Unable to load current operational data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAcknowledgeAlert = async (id) => {
    try {
      await api.patch(`/api/alerts/${id}/acknowledge`);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a));
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const filteredMedicines = medicines.filter(m =>
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.batchNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockMeds = medicines.filter(m => (m.quantity || 0) <= 20);
  const openAlerts = alerts.filter(a => a.status === 'OPEN');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-sky-600 rounded-full animate-spin" />
        <p className="mt-4 text-sm font-semibold text-slate-500">Loading Operational Workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Shield size={14} className="text-teal-600" />
            Operational Staff Portal
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hello, {user?.name || 'Staff Member'} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Check live inventory availability, shelf stock, dispensing logs, and operational alerts.
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
          <button
            onClick={() => navigate('/stock')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-sm transition"
          >
            <Activity size={16} />
            <span>Record Dispense</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/inventory')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-sky-300 transition"
        >
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Medicines</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{medicines.length}</h3>
            <span className="text-[11px] font-semibold text-sky-600 mt-1 block">In Active Catalog</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Pill size={24} />
          </div>
        </div>

        <div
          onClick={() => navigate('/inventory')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-300 transition"
        >
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Stock</p>
            <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">
              {medicines.filter(m => (m.quantity || 0) > 20).length}
            </h3>
            <span className="text-[11px] font-semibold text-emerald-700 mt-1 block">Optimal for dispensing</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Boxes size={24} />
          </div>
        </div>

        <div
          onClick={() => navigate('/alerts')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-300 transition"
        >
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Notice</p>
            <h3 className="text-3xl font-extrabold text-amber-600 mt-1">{lowStockMeds.length}</h3>
            <span className="text-[11px] font-semibold text-amber-700 mt-1 block">Notify pharmacist</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
        </div>

        <div
          onClick={() => navigate('/alerts')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-rose-300 transition"
        >
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open Alerts</p>
            <h3 className="text-3xl font-extrabold text-rose-600 mt-1">{openAlerts.length}</h3>
            <span className="text-[11px] font-semibold text-rose-700 mt-1 block">Requires staff attention</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <BellRing size={24} />
          </div>
        </div>
      </div>

      {/* QUICK MEDICINE SEARCH & SHELF LOOKUP */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Today's Medicine Stock Lookup</h2>
            <p className="text-xs text-slate-500">Quickly find items by name, category or batch before dispensing</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={17} />
            <input
              type="text"
              placeholder="Search medicine or batch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-3 px-4">Medicine</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Batch #</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMedicines.slice(0, 8).map((med) => {
                const qty = med.quantity || 0;
                let statusBadge = (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    In Stock
                  </span>
                );
                if (qty === 0) {
                  statusBadge = (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      Out of Stock
                    </span>
                  );
                } else if (qty <= 20) {
                  statusBadge = (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Low Stock
                    </span>
                  );
                }

                return (
                  <tr key={med.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">{med.name}</td>
                    <td className="py-3 px-4 text-slate-600">{med.category || 'Pharmaceutical'}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{med.batchNumber || 'BAT-001'}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{qty} units</td>
                    <td className="py-3 px-4">{statusBadge}</td>
                    <td className="py-3 px-4 text-slate-600">{med.expiryDate || '2026-12-31'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => navigate('/inventory')}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            <span>View Complete Inventory Table</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* OPERATIONAL ALERTS & RECENT DISPENSE ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Operational Alerts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Operational Alerts</h2>
              <p className="text-xs text-slate-500">Active alerts requiring acknowledgement</p>
            </div>
            <button
              onClick={() => navigate('/alerts')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {openAlerts.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No open alerts at this time.</p>
            ) : (
              openAlerts.slice(0, 4).map((alert) => (
                <div key={alert.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 block truncate">{alert.title}</span>
                    <span className="text-[11px] text-slate-500 line-clamp-1">{alert.message}</span>
                  </div>
                  <button
                    onClick={() => handleAcknowledgeAlert(alert.id)}
                    className="shrink-0 text-xs font-semibold text-sky-600 hover:text-sky-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg transition"
                  >
                    Mark Seen
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Stock Activities */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Stock Activity</h2>
              <p className="text-xs text-slate-500">Dispensing and shelf movement records</p>
            </div>
            <button
              onClick={() => navigate('/stock')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              Stock Tracker <ArrowRight size={14} />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { action: 'Dispensed 10 units Paracetamol 500mg', user: 'Staff Team', time: '15 mins ago', badge: '-10' },
              { action: 'Dispensed 5 units Cetirizine 10mg', user: 'Staff Team', time: '40 mins ago', badge: '-5' },
              { action: 'Restock verification Amoxicillin 500mg', user: 'Pharmacist', time: '1 hour ago', badge: '+50' },
              { action: 'Shelf audit completed for Section B', user: 'Staff Team', time: '2 hours ago', badge: 'AUDIT' },
            ].map((log, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                <div>
                  <span className="font-semibold text-slate-800 block">{log.action}</span>
                  <span className="text-[10px] text-slate-400">{log.user} • {log.time}</span>
                </div>
                <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                  {log.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
