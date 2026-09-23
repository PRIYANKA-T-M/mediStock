import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Activity, LayoutDashboard, Truck, BellRing, LogOut, ShieldCheck, Boxes } from 'lucide-react';
import authService from '../services/authService';

const AppLayout = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const logout = () => { authService.logout(); navigate('/login', { replace: true }); };

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-brand"><div className="app-brand-icon"><Activity size={22} /></div><div>Medi<span>Stock</span></div></div>
        <div className="role-chip"><ShieldCheck size={15} /> {user?.role}</div>
        <nav className="side-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}><LayoutDashboard size={18} /> Dashboard</NavLink>
          <NavLink to="/suppliers" className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}><Truck size={18} /> Suppliers</NavLink>
          <NavLink to="/stock" className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}><Boxes size={18} /> Stock Tracking</NavLink>
          <NavLink to="/alerts" className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}><BellRing size={18} /> Alerts</NavLink>
        </nav>
        <div className="sidebar-user"><strong>{user?.name}</strong><small>{user?.email}</small><button className="logout-btn" onClick={logout}><LogOut size={16} /> Sign out</button></div>
      </aside>
      <main className="app-main"><Outlet /></main>
    </div>
  );
};

export default AppLayout;
