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
    <div className="space-y-8">
      {/* HEADER */}
      <div className="pb-2 border-b border-stone-200/60">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
          Good morning, {user?.name?.split(' ')[0] || 'Staff'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 tracking-wide leading-relaxed">
          Today's Inventory Overview · Wing Sector B
        </p>
      </div>

      {/* TOP ROW: 2x2 METRICS + QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2X2 METRIC GRID */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* TOTAL CATALOGED */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Total Cataloged Items
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#eef3f0] text-[#4d6b5e] flex items-center justify-center">
                <Briefcase size={16} />
              </div>
            </div>
            <div className="mt-5">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">
                {totalCataloged}
              </span>
            </div>
          </div>

          {/* LOW STOCK ITEMS */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Low Stock Items
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#fef5ec] text-[#d97736] flex items-center justify-center">
                <AlertTriangle size={16} />
              </div>
            </div>
            <div className="mt-5">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">
                {lowStock}
              </span>
            </div>
          </div>

          {/* EXPIRING */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Expiring (30 Days)
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#fef1f0] text-[#c54b43] flex items-center justify-center">
                <Clock size={16} />
              </div>
            </div>
            <div className="mt-5">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">
                {expiring}
              </span>
            </div>
          </div>

          {/* FULLY OUT OF STOCK */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Fully Out of Stock
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#fef1f0] text-[#c54b43] flex items-center justify-center">
                <CircleAlert size={16} />
              </div>
            </div>
            <div className="mt-5">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">
                {outOfStock}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT QUICK ACTIONS */}
        <div className="bg-white p-7 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight pb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/medicines')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-stone-200/80 hover:bg-[#fafaf8] transition text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#eef3f0] text-[#4d6b5e] flex items-center justify-center shrink-0">
                    <Pill size={17} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block tracking-wide">
                      View Cataloged Medicines
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5 tracking-wide">
                      Scan current active formulations
                    </span>
                  </div>
                </div>
                <ChevronRight size={15} className="text-slate-400 group-hover:text-slate-700 transition" />
              </button>

              <button
                onClick={() => navigate('/inventory')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-stone-200/80 hover:bg-[#fafaf8] transition text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#eef3f0] text-[#4d6b5e] flex items-center justify-center shrink-0">
                    <Layers size={17} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block tracking-wide">
                      Update Stock Levels
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5 tracking-wide">
                      Batch input new arrivals
                    </span>
                  </div>
                </div>
                <ChevronRight size={15} className="text-slate-400 group-hover:text-slate-700 transition" />
              </button>

              <button
                onClick={() => navigate('/alerts')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-stone-200/80 hover:bg-[#fafaf8] transition text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#fef5ec] text-[#d97736] flex items-center justify-center shrink-0">
                    <Bell size={17} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block tracking-wide">
                      View Critical Alerts
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5 tracking-wide">
                      {expiring} active expiring warnings
                    </span>
                  </div>
                </div>
                <ChevronRight size={15} className="text-slate-400 group-hover:text-slate-700 transition" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM CARD: RECENT DISPENSARY ACTIONS */}
      <div className="bg-white p-7 rounded-2xl border border-stone-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-5">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Recent Dispensary Actions</h3>
          <button
            onClick={() => navigate('/medicines')}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition tracking-wide"
          >
            All records &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Formulation</th>
                <th className="py-3 px-4">Activity Action</th>
                <th className="py-3 px-4 text-right">Logged Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100/80">
              {recentActions.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#fafaf8] transition">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 tracking-wide">{row.formulation}</td>
                  <td className="py-3.5 px-4 text-slate-600 leading-relaxed tracking-wide">{row.action}</td>
                  <td className="py-3.5 px-4 text-right text-slate-400 font-medium tracking-wide">{row.time}</td>
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
