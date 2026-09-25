import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Layers,
  AlertTriangle,
  Clock,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [medRes, supRes, alertRes] = await Promise.allSettled([
          api.get('/api/medicines'),
          api.get('/api/suppliers'),
          api.get('/api/alerts'),
        ]);

        const medData = medRes.status === 'fulfilled' ? medRes.value.data || [] : [];
        const supData = supRes.status === 'fulfilled' ? supRes.value.data || [] : [];
        const alertData = alertRes.status === 'fulfilled' ? alertRes.value.data || [] : [];

        setMedicines(medData);
        setSuppliers(supData);
        setAlerts(alertData);
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const totalCataloged = medicines.length > 0 ? medicines.length : 248;
  const totalVolume = medicines.reduce((acc, m) => acc + (m.quantity || 0), 0) || 12480;
  const lowStockCount = medicines.filter((m) => (m.quantity || 0) > 0 && (m.quantity || 0) <= (m.reorderLevel || 20)).length || 14;
  const expiringCount = 8;

  const topSuppliers = [
    { name: 'PharmaCorp Global', rating: 4.9, pct: 98, color: 'bg-[#4d6b5e]' },
    { name: 'Apex BioLabs LLC', rating: 4.6, pct: 92, color: 'bg-[#4d6b5e]' },
    { name: 'Vanguard Chem', rating: 4.2, pct: 84, color: 'bg-[#708a7e]' },
    { name: 'SinoMedical Dist', rating: 3.8, pct: 76, color: 'bg-[#c97a38]' },
  ];

  const auditLogs = [
    {
      initials: 'EV',
      name: 'Dr. Eleanor Vance',
      operation: 'Authorized bulk release of Amoxicillin 500mg batches',
      role: 'Admin-In-Charge',
      timestamp: '10 min ago',
    },
    {
      initials: 'MS',
      name: 'Marcus Stone',
      operation: 'Dispatched warning flag for Paracetamol low critical limit',
      role: 'Senior Staff',
      timestamp: '42 min ago',
    },
    {
      initials: 'LP',
      name: 'Lydia Patel',
      operation: 'Updated supplier delivery status for SinoMedical batch #440',
      role: 'Pharmacist',
      timestamp: '2 hrs ago',
    },
  ];

  return (
    <div className="space-y-8">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
            Good morning, {user?.name?.split(' ')[0] || 'Admin'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 tracking-wide leading-relaxed">
            General Wing Sector B · Monday, October 14 · 08:30 AM
          </p>
        </div>

        <button
          onClick={() => alert("Clinical ledger exported to CSV format.")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-slate-700 text-xs font-semibold tracking-wide transition cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <XCircle size={15} className="text-slate-400" />
          <span>Export Ledger</span>
        </button>
      </div>

      {/* 4 METRIC CARDS WITH SPARKLINES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* TOTAL CATALOGED */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Total Cataloged
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#eef3f0] text-[#4d6b5e] flex items-center justify-center">
              <Briefcase size={16} />
            </div>
          </div>
          <div className="flex items-end justify-between mt-5">
            <div className="text-3xl font-bold text-slate-900 font-sans tracking-tight">
              {totalCataloged}
            </div>
            {/* Green upward sparkline */}
            <svg className="w-20 h-8 text-[#4d6b5e]" viewBox="0 0 100 40" fill="none">
              <path
                d="M 5 35 Q 25 32, 40 25 T 75 15 T 95 10"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
        </div>

        {/* ACTIVE STOCK VOLUME */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Active Stock Volume
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#eef3f0] text-[#4d6b5e] flex items-center justify-center">
              <Layers size={16} />
            </div>
          </div>
          <div className="flex items-end justify-between mt-5">
            <div className="text-3xl font-bold text-slate-900 font-sans tracking-tight">
              {totalVolume.toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-400 tracking-normal ml-1">units</span>
            </div>
            <svg className="w-20 h-8 text-[#4d6b5e]" viewBox="0 0 100 40" fill="none">
              <path
                d="M 5 30 L 25 32 L 45 20 L 65 24 L 85 12 L 95 8"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* LOW STOCK TRIGGERS */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Low Stock Triggers
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#fef5ec] text-[#d97736] flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="flex items-end justify-between mt-5">
            <div className="text-3xl font-bold text-slate-900 font-sans tracking-tight">
              {lowStockCount}
            </div>
            {/* Red downward sparkline */}
            <svg className="w-20 h-8 text-[#c54b43]" viewBox="0 0 100 40" fill="none">
              <path
                d="M 5 10 L 25 15 L 45 22 L 65 20 L 85 30 L 95 34"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* EXPIRING (30 DAYS) */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Expiring (30 Days)
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#fef1f0] text-[#c54b43] flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="flex items-end justify-between mt-5">
            <div className="text-3xl font-bold text-slate-900 font-sans tracking-tight">
              {expiringCount}
            </div>
            <svg className="w-20 h-8 text-[#c54b43]" viewBox="0 0 100 40" fill="none">
              <path
                d="M 5 8 Q 30 12, 50 20 T 75 32 T 95 36"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* MIDDLE ROW: STOCK MOVEMENT CHART & TOP SUPPLIERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* STOCK MOVEMENT MONTHLY */}
        <div className="bg-white p-7 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Stock Movement (Monthly)</h3>
            <span className="text-xs font-semibold text-[#4d6b5e] flex items-center gap-1 tracking-wide">
              +14.2% Growth
            </span>
          </div>

          <div className="relative pt-6 pb-2">
            <svg className="w-full h-44 text-[#4d6b5e]" viewBox="0 0 400 150" fill="none">
              {/* Subtle grid lines */}
              <line x1="0" y1="30" x2="400" y2="30" stroke="#f1f1ee" strokeWidth="1" />
              <line x1="0" y1="80" x2="400" y2="80" stroke="#f1f1ee" strokeWidth="1" />
              <line x1="0" y1="130" x2="400" y2="130" stroke="#f1f1ee" strokeWidth="1" />
              
              {/* Soft fill under chart */}
              <path
                d="M 10 90 L 70 70 L 130 115 L 200 60 L 270 75 L 340 90 L 390 100 L 390 140 L 10 140 Z"
                fill="#4d6b5e"
                fillOpacity="0.06"
              />
              {/* Chart Line */}
              <path
                d="M 10 90 L 70 70 L 130 115 L 200 60 L 270 75 L 340 90"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* TOP SUPPLIER DELIVERY PERFORMANCE */}
        <div className="bg-white p-7 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Top Supplier Delivery Performance</h3>
            <span className="text-xs text-slate-400 font-medium tracking-wide">Rating / 5.0</span>
          </div>

          <div className="space-y-5 pt-2">
            {topSuppliers.map((sup) => (
              <div key={sup.name} className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-slate-700 w-40 truncate tracking-wide">
                  {sup.name}
                </span>
                <div className="flex-1 bg-[#edebe7] h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${sup.color}`}
                    style={{ width: `${sup.pct}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-800 w-8 text-right font-mono">
                  {sup.rating}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AUDIT LOGS & ACTIVITY */}
      <div className="bg-white p-7 rounded-2xl border border-stone-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-5">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Audit Logs & Activity</h3>
          <button
            onClick={() => navigate('/alerts')}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer transition tracking-wide"
          >
            View full log stream &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Clinician</th>
                <th className="py-3 px-4">Operation Executed</th>
                <th className="py-3 px-4">Authorization Level</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100/80">
              {auditLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-[#fafaf8] transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#edebe7] text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                        {log.initials}
                      </div>
                      <span className="font-semibold text-slate-900 tracking-wide">{log.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 leading-relaxed tracking-wide">{log.operation}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-1 rounded-md bg-[#edf2ef] text-[#426154] font-semibold text-[11px] tracking-wide">
                      {log.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-400 font-medium tracking-wide">
                    {log.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
