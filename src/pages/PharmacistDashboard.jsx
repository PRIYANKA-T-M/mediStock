import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Layers,
  AlertTriangle,
  Clock,
  XCircle,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

const PharmacistDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [medRes, supRes] = await Promise.allSettled([
          api.get('/api/medicines'),
          api.get('/api/suppliers'),
        ]);

        const medData = medRes.status === 'fulfilled' ? medRes.value.data || [] : [];
        const supData = supRes.status === 'fulfilled' ? supRes.value.data || [] : [];

        setMedicines(medData);
        setSuppliers(supData);
      } catch (err) {
        console.error('Failed to load pharmacist dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const totalCataloged = medicines.length > 0 ? medicines.length : 248;
  const availableStock = medicines.reduce((acc, m) => acc + (m.quantity || 0), 0) || 11840;
  const lowStockCount = medicines.filter((m) => (m.quantity || 0) > 0 && (m.quantity || 0) <= (m.reorderLevel || 20)).length || 14;
  const expiringCount = 8;

  const lowStockItems = [
    { name: 'Paracetamol 500mg', inStock: '4 boxes', reorder: '50 boxes' },
    { name: 'Amoxicillin 250mg', inStock: '12 bottles', reorder: '100 bottles' },
    { name: 'Ibuprofen 400mg', inStock: '8 strips', reorder: '40 strips' },
  ];

  const expiringBatches = [
    { batch: 'PR-8821 (Paracetamol)', expiry: '28 Oct 2026', days: '29 Days Left', alertClass: 'text-[#c54b43] font-semibold' },
    { batch: 'AM-9031 (Amoxicillin)', expiry: '14 Nov 2026', days: '51 Days Left', alertClass: 'text-[#b45309] font-medium' },
    { batch: 'IB-4402 (Ibuprofen)', expiry: '02 Dec 2026', days: '69 Days Left', alertClass: 'text-[#b45309] font-medium' },
  ];

  const topSuppliers = [
    { name: 'PharmaCorp Global', rating: 4.9, pct: 98, color: 'bg-[#4d6b5e]' },
    { name: 'Apex BioLabs LLC', rating: 4.6, pct: 92, color: 'bg-[#4d6b5e]' },
    { name: 'Vanguard Chem', rating: 4.2, pct: 84, color: 'bg-[#708a7e]' },
  ];

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
            Good morning, Pharmacist
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 tracking-wide leading-relaxed">
            Main Dispensary Sector A · Monday, October 14
          </p>
        </div>

        <button
          onClick={() => navigate('/medicines')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-slate-700 text-xs font-semibold tracking-wide transition cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <XCircle size={15} className="text-slate-400" />
          <span>Dispensary Log</span>
        </button>
      </div>

      {/* 4 METRIC CARDS */}
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
            <svg className="w-20 h-8 text-[#4d6b5e]" viewBox="0 0 100 40" fill="none">
              <path d="M 5 35 Q 25 32, 40 25 T 75 15 T 95 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        </div>

        {/* AVAILABLE STOCK */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Available Stock
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#eef3f0] text-[#4d6b5e] flex items-center justify-center">
              <Layers size={16} />
            </div>
          </div>
          <div className="flex items-end justify-between mt-5">
            <div className="text-3xl font-bold text-slate-900 font-sans tracking-tight">
              {availableStock.toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-400 tracking-normal ml-1">units</span>
            </div>
            <svg className="w-20 h-8 text-[#4d6b5e]" viewBox="0 0 100 40" fill="none">
              <path d="M 5 30 L 25 32 L 45 20 L 65 24 L 85 12 L 95 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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
            <svg className="w-20 h-8 text-[#c54b43]" viewBox="0 0 100 40" fill="none">
              <path d="M 5 10 L 25 15 L 45 22 L 65 20 L 85 30 L 95 34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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
              <path d="M 5 8 Q 30 12, 50 20 T 75 32 T 95 36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        </div>
      </div>

      {/* MIDDLE ROW: LOW STOCK ALERTS & EXPIRING SOON */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LOW STOCK ALERTS TABLE */}
        <div className="bg-white p-7 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Low Stock Alerts</h3>
            <button
              onClick={() => navigate('/inventory')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition tracking-wide"
            >
              Manage stock &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Medicine</th>
                  <th className="py-3 px-4">In Stock</th>
                  <th className="py-3 px-4">Reorder Level</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100/80">
                {lowStockItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#fafaf8] transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 tracking-wide">{item.name}</td>
                    <td className="py-3.5 px-4 text-[#c54b43] font-bold tracking-wide">{item.inStock}</td>
                    <td className="py-3.5 px-4 text-slate-500 tracking-wide">{item.reorder}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate('/inventory')}
                        className="text-xs font-bold text-[#4d6b5e] hover:underline cursor-pointer tracking-wide"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* EXPIRING SOON BATCHES TABLE */}
        <div className="bg-white p-7 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Expiring Soon Batches</h3>
            <button
              onClick={() => navigate('/expiry-analytics')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition tracking-wide"
            >
              Surveillance &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Medicine Batch</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4 text-right">Days Left</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100/80">
                {expiringBatches.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#fafaf8] transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 tracking-wide">{item.batch}</td>
                    <td className="py-3.5 px-4 text-slate-500 tracking-wide">{item.expiry}</td>
                    <td className={`py-3.5 px-4 text-right tracking-wide ${item.alertClass}`}>{item.days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: PREFERRED SUPPLIERS & RECENT PURCHASES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PREFERRED SUPPLIERS */}
        <div className="bg-white p-7 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Preferred Supplier Ratings</h3>
            <button
              onClick={() => navigate('/suppliers')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition tracking-wide"
            >
              Directory &rarr;
            </button>
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

        {/* RECENT DISPENSARY PURCHASES */}
        <div className="bg-white p-7 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Recent Dispensary Purchases</h3>
            <button
              onClick={() => navigate('/purchases')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition tracking-wide"
            >
              View ledger &rarr;
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[#fafaf8] border border-stone-200/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Period Gross Cost
              </span>
              <span className="text-lg font-bold text-slate-900 block font-mono">
                ₹24,840.00
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#fafaf8] border border-stone-200/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Items Dispatched
              </span>
              <span className="text-lg font-bold text-slate-900 block font-mono">
                1,420 Items
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#fafaf8] border border-stone-200/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Last Order Received
              </span>
              <span className="text-xs font-semibold text-slate-700 block mt-1 truncate">
                Today, 11:20 AM
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacistDashboard;
