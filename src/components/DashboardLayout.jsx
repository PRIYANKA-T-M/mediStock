import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Activity,
  LayoutDashboard,
  Pill,
  Boxes,
  Truck,
  BellRing,
  LogOut,
  ShieldCheck,
  Calendar,
  FileBarChart2,
  ShoppingCart,
  Menu,
  X,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import NotificationBell from './notifications/NotificationBell';
import NotificationPopup from './notifications/NotificationPopup';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Determine dashboard link according to role
  const getDashboardPath = () => {
    if (user?.role === 'ADMIN') return '/admin';
    if (user?.role === 'PHARMACIST') return '/pharmacist';
    return '/staff';
  };

  const navItems = [
    {
      to: getDashboardPath(),
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'PHARMACIST', 'STAFF'],
      exact: true,
    },
    {
      to: '/medicines',
      label: 'Medicines',
      icon: Pill,
      roles: ['ADMIN', 'PHARMACIST', 'STAFF'],
    },
    {
      to: '/inventory',
      label: 'Inventory',
      icon: Boxes,
      roles: ['ADMIN', 'PHARMACIST', 'STAFF'],
    },
    {
      to: '/stock',
      label: 'Stock Tracking',
      icon: Activity,
      roles: ['ADMIN', 'PHARMACIST', 'STAFF'],
    },
    {
      to: '/expiry-analytics',
      label: 'Expiry Analytics',
      icon: Calendar,
      roles: ['ADMIN', 'PHARMACIST'],
    },
    {
      to: '/suppliers',
      label: 'Suppliers',
      icon: Truck,
      roles: ['ADMIN', 'PHARMACIST', 'STAFF'],
    },
    {
      to: '/purchases',
      label: 'Purchases',
      icon: ShoppingCart,
      roles: ['ADMIN', 'PHARMACIST'],
    },
    {
      to: '/alerts',
      label: 'Alerts',
      icon: BellRing,
      roles: ['ADMIN', 'PHARMACIST', 'STAFF'],
    },
    {
      to: '/reports',
      label: 'Reports',
      icon: FileBarChart2,
      roles: ['ADMIN', 'PHARMACIST'],
    },
  ];

  const allowedNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role || 'STAFF')
  );

  // Friendly title based on current path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Admin Control Center';
    if (path === '/pharmacist') return 'Pharmacist Workspace';
    if (path === '/staff') return 'Staff Operational Dashboard';
    if (path === '/dashboard') return 'Inventory Overview';
    if (path === '/medicines') return 'Medicine Catalog';
    if (path === '/add-medicine') return 'Add New Medicine';
    if (path === '/edit-medicine') return 'Modify Medicine Details';
    if (path === '/inventory') return 'Inventory Management';
    if (path === '/stock') return 'Real-Time Stock Tracking';
    if (path === '/expiry-analytics') return 'Expiry & Expiration Tracking';
    if (path === '/suppliers') return 'Supplier Network Management';
    if (path === '/purchases') return 'Purchase Orders & Stock Intake';
    if (path === '/alerts') return 'System Alerts & Notifications';
    if (path === '/reports') return 'Inventory & Audit Reports';
    return 'MediStock Healthcare';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800 antialiased">
      <NotificationPopup />

      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between bg-slate-900 text-white px-4 py-3 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center text-white shadow-md">
            <Activity size={18} />
          </div>
          <span className="font-extrabold text-base tracking-tight">
            Medi<span className="text-sky-400">Stock</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:min-h-screen ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <Activity size={20} />
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-tight text-white">
                Medi<span className="text-sky-400">Stock</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Healthcare Logistics</p>
            </div>
          </div>
        </div>

        {/* User Role Badge */}
        <div className="px-5 pt-4 pb-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-sky-300 text-xs font-semibold">
            <ShieldCheck size={14} className="text-sky-400" />
            <span>ROLE: {user?.role || 'STAFF'}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {allowedNavItems.map((item) => {
            const Icon = item.icon;
            const isDashboard = item.to.includes('admin') || item.to.includes('pharmacist') || item.to.includes('staff');
            const isActive = isDashboard
              ? location.pathname === item.to || location.pathname === '/dashboard'
              : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-sky-400' : 'text-slate-400'} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-600 to-cyan-500 text-white font-bold text-sm flex items-center justify-center shadow-inner">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-white truncate">{user?.name || 'Authorized User'}</div>
              <div className="text-xs text-slate-400 truncate">{user?.email || 'user@medistock.com'}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 transition-all"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* TOP BAR */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{getPageTitle()}</h1>
            <p className="text-xs text-slate-500">MediStock Clinical Pharmacy & Supply Chain</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Online • Pharmacy DB Synchronized</span>
            </div>

            <NotificationBell />

            <div className="h-6 w-px bg-slate-200" />

            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center border border-sky-200">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-left">
                <span className="block text-xs font-bold text-slate-800 leading-none">{user?.name}</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">{user?.role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
