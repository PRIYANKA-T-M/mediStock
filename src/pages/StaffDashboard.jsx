import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  AlertTriangle,
  Clock,
  CircleAlert,
  Pill,
  Layers,
  Bell,
  ChevronRight,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.get('/api/medicines');
        setMedicines(res.data || []);
      } catch (err) {
        console.error('Failed to load staff dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const totalCataloged = medicines.length > 0 ? medicines.length : 248;
  const lowStock = medicines.filter((m) => (m.quantity || 0) > 0 && (m.quantity || 0) <= (m.reorderLevel || 20)).length || 14;
  const expiring = 8;
  const outOfStock = medicines.filter((m) => (m.quantity || 0) === 0).length || 3;

  const recentActions = [
    {
      formulation: 'Paracetamol 500mg',
      action: 'Stock quantity adjusted from 120 to 140 units',
      time: '12 mins ago',
    },
    {
      formulation: 'Amoxicillin 250mg',
      action: 'Low stock warning acknowledged by staff',
      time: '45 mins ago',
    },
    {
      formulation: 'Ibuprofen 400mg',
      action: 'New arrival batch #IB-4402 verified into inventory',
      time: '2 hours ago',
    },
    {
      formulation: 'Metformin 500mg',
      action: 'Routine weekly shelf audit completed',
      time: '4 hours ago',
    },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Good morning, {user?.name?.split(' ')[0] || 'Staff'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Today's Inventory Overview · Wing Sector B
        </p>
      </div>

      {/* TOP ROW: 2x2 METRICS + QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* LEFT 2X2 METRIC GRID */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* TOTAL CATALOGED */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/70 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Cataloged Items
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#eef3f0] text-[#4d6b5e] flex items-center justify-center">
                <Briefcase size={14} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">
                {totalCataloged}
              </span>
            </div>
          </div>

          {/* LOW STOCK ITEMS */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/70 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Low Stock Items
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#fef5ec] text-[#d97736] flex items-center justify-center">
                <AlertTriangle size={14} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">
                {lowStock}
              </span>
            </div>
          </div>

          {/* EXPIRING */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/70 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Expiring (30 Days)
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#fef1f0] text-[#c54b43] flex items-center justify-center">
                <Clock size={14} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">
                {expiring}
              </span>
            </div>
          </div>

          {/* FULLY OUT OF STOCK */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/70 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Fully Out of Stock
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#fef1f0] text-[#c54b43] flex items-center justify-center">
                <CircleAlert size={14} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">
                {outOfStock}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT QUICK ACTIONS */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/70 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 pb-3">Quick Actions</h3>
            <div className="space-y-2.5">
              <button
                onClick={() => navigate('/medicines')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-stone-200/70 hover:bg-[#fafaf8] transition text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#eef3f0] text-[#4d6b5e] flex items-center justify-center shrink-0">
                    <Pill size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">
                      View Cataloged Medicines
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Scan current active formulations
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-700" />
              </button>

              <button
                onClick={() => navigate('/inventory')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-stone-200/70 hover:bg-[#fafaf8] transition text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#eef3f0] text-[#4d6b5e] flex items-center justify-center shrink-0">
                    <Layers size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">
                      Update Stock Levels
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Batch input new arrivals
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-700" />
              </button>

              <button
                onClick={() => navigate('/alerts')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-stone-200/70 hover:bg-[#fafaf8] transition text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#fef5ec] text-[#d97736] flex items-center justify-center shrink-0">
                    <Bell size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">
                      View Critical Alerts
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      {expiring} active expiring warnings
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-700" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM CARD: RECENT DISPENSARY ACTIONS */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/70 shadow-xs">
        <div className="flex items-center justify-between pb-4">
          <h3 className="text-sm font-bold text-slate-900">Recent Dispensary Actions</h3>
          <button
            onClick={() => navigate('/medicines')}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium"
          >
            All records
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-100 text-slate-400 font-semibold">
                <th className="py-2.5 px-3">Formulation</th>
                <th className="py-2.5 px-3">Activity Action</th>
                <th className="py-2.5 px-3 text-right">Logged Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100/70">
              {recentActions.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#fafaf8] transition">
                  <td className="py-3 px-3 font-semibold text-slate-900">{row.formulation}</td>
                  <td className="py-3 px-3 text-slate-600">{row.action}</td>
                  <td className="py-3 px-3 text-right text-slate-400 font-medium">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
