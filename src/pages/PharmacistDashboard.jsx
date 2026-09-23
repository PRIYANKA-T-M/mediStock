import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock,
  Package,
  Plus,
  RefreshCw,
  ShoppingCart,
  Truck,
  XCircle,
  FileBarChart2,
  Calendar,
  ShieldAlert,
  SlidersHorizontal
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

const PharmacistDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');

      const [medRes, supRes, alertRes] = await Promise.allSettled([
        api.get('/api/medicines'),
        api.get('/api/suppliers'),
        api.get('/api/alerts'),
      ]);

      if (medRes.status === 'fulfilled') {
        setMedicines(medRes.value.data || []);
      }
      if (supRes.status === 'fulfilled') {
        setSuppliers(supRes.value.data || []);
      }
      if (alertRes.status === 'fulfilled') {
        setAlerts(alertRes.value.data || []);
      }
    } catch (err) {
      console.error('Pharmacist dashboard error:', err);
      setError('Unable to synchronize live clinical metrics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Inventory & Stock Calculations
  const stockMetrics = useMemo(() => {
    const total = medicines.length;
    const lowStock = medicines.filter(
      (m) => (m.quantity || 0) > 0 && (m.quantity || 0) <= (m.reorderLevel || 20)
    );
    const outOfStock = medicines.filter((m) => (m.quantity || 0) === 0);
    const available = total - lowStock.length - outOfStock.length;

    return { total, lowStock, outOfStock, available };
  }, [medicines]);

  // Expiry Calculations
  const expiryMetrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const expired = [];
    const expiringSoon = [];

    medicines.forEach((med) => {
      if (!med.expiryDate) return;
      const expDate = new Date(med.expiryDate);
      if (isNaN(expDate.getTime())) return;

      if (expDate < today) {
        expired.push(med);
      } else if (expDate <= thirtyDaysFromNow) {
        expiringSoon.push(med);
      }
    });

    return { expired, expiringSoon };
  }, [medicines]);

  // Active Unresolved Alerts
  const activeAlerts = useMemo(() => {
    return alerts.filter((a) => a.status === 'ACTIVE' || a.status === 'ACKNOWLEDGED');
  }, [alerts]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-sky-600 rounded-full animate-spin" />
        <p className="mt-4 text-sm font-semibold text-slate-500">Loading Clinical Pharmacy Console...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-xs font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            Milestone 3 Clinical Dispensing Center
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pharmacist Workspace
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time dispensing surveillance, critical stock thresholds, batch expiry trackers, and automated purchase ordering.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-xs transition"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => navigate('/add-medicine')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold shadow-md shadow-sky-600/20 transition"
          >
            <Plus size={16} />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* PRIMARY MILESTONE 3 KPI WIDGETS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Low Stock Alert */}
        <div
          onClick={() => navigate('/alerts')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Warning</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition">
              <AlertTriangle size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2">
            {stockMetrics.lowStock.length + stockMetrics.outOfStock.length}
          </h3>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-amber-700 font-semibold">{stockMetrics.outOfStock.length} out of stock</span>
            <span className="text-sky-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition">
              View Alerts <ArrowRight size={12} />
            </span>
          </div>
        </div>

        {/* 2. Expiry Alerts */}
        <div
          onClick={() => navigate('/expiry-analytics')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-rose-400 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expiry Surveillance</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition">
              <Calendar size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2">
            {expiryMetrics.expiringSoon.length + expiryMetrics.expired.length}
          </h3>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-rose-700 font-semibold">{expiryMetrics.expired.length} expired batches</span>
            <span className="text-sky-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition">
              Audit Batches <ArrowRight size={12} />
            </span>
          </div>
        </div>

        {/* 3. Active Suppliers */}
        <div
          onClick={() => navigate('/suppliers')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-sky-400 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Suppliers Network</span>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition">
              <Truck size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2">
            {suppliers.filter((s) => s.status === 'ACTIVE').length}
          </h3>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">{suppliers.length} registered vendors</span>
            <span className="text-sky-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition">
              Suppliers <ArrowRight size={12} />
            </span>
          </div>
        </div>

        {/* 4. Active POs & Procurement */}
        <div
          onClick={() => navigate('/purchases')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Purchase Orders</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
              <ShoppingCart size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2">
            Procurement
          </h3>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-emerald-700 font-semibold">Auto-Restock POs</span>
            <span className="text-sky-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition">
              Manage POs <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </div>

      {/* QUICK WORKFLOW NAVIGATION PANELS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <button
          onClick={() => navigate('/inventory')}
          className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs text-left transition flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Boxes size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-xs">Adjust Stock</h4>
            <p className="text-[11px] text-slate-500">Update stock logs &amp; audits</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/purchases')}
          className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs text-left transition flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShoppingCart size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-xs">Create PO Order</h4>
            <p className="text-[11px] text-slate-500">Issue purchase requisitions</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/alerts')}
          className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs text-left transition flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-xs">System Alerts ({activeAlerts.length})</h4>
            <p className="text-[11px] text-slate-500">Acknowledge &amp; resolve issues</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/reports')}
          className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs text-left transition flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <FileBarChart2 size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-xs">Export Reports</h4>
            <p className="text-[11px] text-slate-500">CSV, PDF &amp; audit statements</p>
          </div>
        </button>
      </div>

      {/* TWO COLUMN CLINICAL SURVEILLANCE GRIDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Low Stock Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              <h3 className="font-bold text-slate-900 text-sm">Low &amp; Depleted Stock Batches</h3>
            </div>
            <button
              onClick={() => navigate('/stock')}
              className="text-xs text-sky-600 font-bold hover:underline"
            >
              Live Tracker →
            </button>
          </div>

          <div className="space-y-2.5">
            {[...stockMetrics.outOfStock, ...stockMetrics.lowStock].slice(0, 5).map((med) => (
              <div
                key={med.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900">{med.name}</h4>
                  <span className="text-[11px] text-slate-400">Batch: {med.batchNumber || 'BAT-001'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span
                      className={`font-extrabold text-xs block ${
                        med.quantity === 0 ? 'text-rose-600' : 'text-amber-600'
                      }`}
                    >
                      {med.quantity || 0} units left
                    </span>
                    <span className="text-[10px] text-slate-400">Reorder at {med.reorderLevel || 20}</span>
                  </div>
                  <button
                    onClick={() => navigate('/purchases', { state: { prefillMedicineId: med.id } })}
                    className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] transition shadow-xs"
                  >
                    Restock
                  </button>
                </div>
              </div>
            ))}

            {[...stockMetrics.outOfStock, ...stockMetrics.lowStock].length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs">
                <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-2" />
                All pharmacy medicines are at optimal stock levels.
              </div>
            )}
          </div>
        </div>

        {/* Near Expiry & Quarantined Batches */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-rose-500" />
              <h3 className="font-bold text-slate-900 text-sm">Near Expiry &amp; Quarantine Watch</h3>
            </div>
            <button
              onClick={() => navigate('/expiry-analytics')}
              className="text-xs text-sky-600 font-bold hover:underline"
            >
              Full Analysis →
            </button>
          </div>

          <div className="space-y-2.5">
            {[...expiryMetrics.expired, ...expiryMetrics.expiringSoon].slice(0, 5).map((med) => (
              <div
                key={med.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900">{med.name}</h4>
                  <span className="text-[11px] text-slate-400">Batch {med.batchNumber || 'BAT-001'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-bold text-rose-600 block text-xs">{med.expiryDate}</span>
                    <span className="text-[10px] text-slate-400">{med.quantity || 0} units</span>
                  </div>
                  <button
                    onClick={() => navigate('/expiry-analytics')}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] border border-rose-200 transition"
                  >
                    Quarantine
                  </button>
                </div>
              </div>
            ))}

            {[...expiryMetrics.expired, ...expiryMetrics.expiringSoon].length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs">
                <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-2" />
                No medicines are currently expired or expiring within 30 days.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacistDashboard;
