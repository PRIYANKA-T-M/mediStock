import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Pill,
  Boxes,
  Truck,
  Bell,
  FileText,
  Clock,
  Plus,
  Menu,
  X,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import NotificationPopup from './notifications/NotificationPopup';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const getDashboardPath = () => {
    if (user?.role === 'ADMIN') return '/admin';
    if (user?.role === 'PHARMACIST') return '/pharmacist';
    return '/staff';
  };

  // Determine user initials
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Map roles to clinical titles shown in the reference UI
  const getRoleDisplayName = (role) => {
    if (role === 'ADMIN') return 'CLINICAL ADMIN';
    if (role === 'PHARMACIST') return 'PHARMACIST';
    return 'DISPENSARY STAFF';
  };

  const navItems = [
    {
      to: getDashboardPath(),
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'PHARMACIST', 'STAFF'],
      isDashboard: true,
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
      to: '/suppliers',
      label: 'Suppliers',
      icon: Truck,
      roles: ['ADMIN', 'PHARMACIST', 'STAFF'],
    },
    {
      to: '/expiry-analytics',
      label: 'Expiry & Analytics',
      icon: Clock,
      roles: ['ADMIN', 'PHARMACIST'],
    },
    {
      to: '/alerts',
      label: 'Alerts',
      icon: Bell,
      roles: ['ADMIN', 'PHARMACIST', 'STAFF'],
    },
    {
      to: '/reports',
      label: 'Reports',
      icon: FileText,
      roles: ['ADMIN', 'PHARMACIST'],
    },
  ];

  const visibleNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role || 'STAFF')
  );

  return (
    <div className="min-h-screen bg-[#fafaf8] flex flex-col md:flex-row text-slate-800 font-sans antialiased selection:bg-[#4d6b5e] selection:text-white">
      <NotificationPopup />

      {/* MOBILE TOPBAR */}
      <div className="md:hidden flex items-center justify-between bg-[#111c24] text-white px-4 py-3 sticky top-0 z-40 border-b border-[#1b2732]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#4e6b5d] text-white flex items-center justify-center text-xs font-bold">
            <Plus size={14} strokeWidth={3} />
          </div>
          <span className="font-bold text-sm tracking-wider text-white">MEDISTOCK</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1a2834] transition cursor-pointer"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* SIDEBAR (Dark navy/slate #111c24) */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-60 bg-[#111c24] text-slate-300 flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:min-h-screen ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col">
          {/* LOGO */}
          <div className="h-18 px-5 flex items-center gap-2.5">
            <div className="w-5.5 h-5.5 rounded-full bg-[#4e6b5d] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              <Plus size={13} strokeWidth={3} />
            </div>
            <span className="font-bold text-sm tracking-wider text-white font-mono">MEDISTOCK</span>
          </div>

          {/* NAVIGATION LINKS */}
          <nav className="px-3 py-2 space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isDashboardActive =
                item.isDashboard &&
                (location.pathname === '/admin' ||
                  location.pathname === '/pharmacist' ||
                  location.pathname === '/staff' ||
                  location.pathname === '/dashboard');

              const isDirectActive =
                !item.isDashboard &&
                (location.pathname === item.to ||
                  (item.to === '/medicines' &&
                    (location.pathname === '/add-medicine' ||
                      location.pathname === '/edit-medicine')) ||
                  (item.to !== '/dashboard' && location.pathname.startsWith(`${item.to}/`)));

              const isActive = isDashboardActive || isDirectActive;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-[#1b2832] text-white shadow-xs font-semibold'
                      : 'text-[#8a9ba8] hover:text-white hover:bg-[#15232d]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={16}
                      className={isActive ? 'text-white' : 'text-[#7d909f] group-hover:text-slate-200'}
                    />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <div className="w-1 h-4 bg-[#567a6d] rounded-full" />}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM USER PROFILE CARD */}
        <div className="p-3 border-t border-[#182530] relative">
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-[#182631] cursor-pointer transition group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-white text-[#111c24] font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {getInitials(user?.name)}
              </div>
              <div className="min-w-0 text-left">
                <div className="text-xs font-semibold text-white truncate leading-tight">
                  {user?.name || 'Dr. Eleanor Vance'}
                </div>
                <div className="text-[10px] text-[#718f99] font-bold tracking-wider uppercase mt-0.5">
                  {getRoleDisplayName(user?.role)}
                </div>
              </div>
            </div>
            <ChevronDown size={14} className="text-slate-400 group-hover:text-white shrink-0 ml-1" />
          </div>

          {/* Quick Sign Out Dropup */}
          {showUserMenu && (
            <div className="absolute bottom-16 left-3 right-3 bg-[#172530] border border-[#223544] rounded-xl p-2 shadow-xl z-50 text-xs">
              <div className="px-2 py-1.5 text-slate-400 text-[11px] border-b border-[#223544]">
                Signed in as <strong className="text-white block truncate">{user?.email}</strong>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-2 py-2 mt-1 rounded-lg text-rose-300 hover:text-white hover:bg-rose-900/40 transition cursor-pointer font-medium"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* CONTENT CANVAS */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-5 sm:p-7 md:p-8 max-w-7xl w-full mx-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
