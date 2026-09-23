import React, { useEffect, useMemo, useState } from 'react';
import { BellRing, Boxes, Building2, CircleAlert, PackageCheck, ShieldCheck, TriangleAlert, AlertCircle, CheckCircle2 } from 'lucide-react';
import dashboardService from '../services/dashboardService';
import authService from '../services/authService';
import MetricCard from '../components/MetricCard';

const Dashboard = () => {
  const user = authService.getCurrentUser();

  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardService.getSummary().then(setSummary).catch((err) => setError(authService.handleError(err)));
  }, []);

  // Stock Distribution Data for Donut Chart
  const stockDistribution = useMemo(() => {
    const total = summary?.totalMedicineItems || 0;
    if (!total) return { optimalPct: 0, lowPct: 0, outPct: 0 };

    const optimal = summary?.optimalStockItems || 0;
    const low = summary?.lowStockItems || 0;
    const out = summary?.outOfStockItems || 0;

    const optimalPct = Math.round((optimal / total) * 100);
    const lowPct = Math.round((low / total) * 100);
    const outPct = 100 - (optimalPct + lowPct);

    return { optimalPct, lowPct, outPct };
  }, [summary]);

  // Alert Breakdown Data for Bar Chart
  const alertStats = useMemo(() => {
    const open = summary?.openAlerts || 0;
    const critical = summary?.criticalActiveAlerts || 0;
    const acknowledged = summary?.acknowledgedAlerts || 0;
    const maxVal = Math.max(open, critical, acknowledged, 1);

    return { open, critical, acknowledged, maxVal };
  }, [summary]);

  return (
      <div className="page-wrap">
        <div className="page-header">
          <div>
            <p className="eyebrow">Supplier + Alerts operations</p>
            <h1>Welcome, {user?.name}   </h1> <h1>                  ROLE :{user?.role} </h1>


            <p>PostgreSQL-backed supplier operations, medicine stock signals, and alert response in one role-protected workspace.</p>
          </div>
          <div className="page-badge"><ShieldCheck size={17} /> {user?.role} · JWT protected</div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Visual Banners / Critical Operational Alerts */}
        <div className="alerts-banner-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {(summary?.outOfStockItems || 0) > 0 && (
              <div style={{ padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #ef4444', backgroundColor: '#fef2f2', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <CircleAlert className="text-red-500" size={24} style={{ color: '#ef4444' }} />
                <div>
                  <strong style={{ color: '#991b1b' }}>Out-of-Stock Emergency</strong>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#7f1d1d' }}>{summary?.outOfStockItems} medicine item(s) are completely depleted.</p>
                </div>
              </div>
          )}

          {(summary?.lowStockItems || 0) > 0 && (
              <div style={{ padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #f59e0b', backgroundColor: '#fffbe3', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <TriangleAlert className="text-amber-500" size={24} style={{ color: '#f59e0b' }} />
                <div>
                  <strong style={{ color: '#b45309' }}>Reorder Threshold Warning</strong>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#78350f' }}>{summary?.lowStockItems} medicine item(s) require replenishment.</p>
                </div>
              </div>
          )}

          <div style={{ padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #10b981', backgroundColor: '#ecfdf5', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <CheckCircle2 className="text-emerald-500" size={24} style={{ color: '#10b981' }} />
            <div>
              <strong style={{ color: '#047857' }}>Supplier Network</strong>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#065f46' }}>{summary?.activeSuppliers ?? 0} out of {summary?.totalSuppliers ?? 0} suppliers currently active.</p>
            </div>
          </div>
        </div>

        <div className="metric-grid">
          <MetricCard title="Total Suppliers" value={summary?.totalSuppliers ?? '—'} icon={Building2} tone="blue" subtitle={`${summary?.activeSuppliers ?? '—'} active`} />
          <MetricCard title="Medicine Items" value={summary?.totalMedicineItems ?? '—'} icon={Boxes} tone="emerald" subtitle={`${summary?.optimalStockItems ?? '—'} optimal`} />
          <MetricCard title="Low Stock" value={summary?.lowStockItems ?? '—'} icon={TriangleAlert} tone="amber" subtitle="Needs replenishment" />
          <MetricCard title="Out of Stock" value={summary?.outOfStockItems ?? '—'} icon={CircleAlert} tone="red" subtitle="Immediate action" />
        </div>

        {/* Analytics & Graphs Section */}
        <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem', marginTop: '1.5rem' }}>

          {/* Inventory Distribution Donut Chart */}
          <div className="content-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600 }}>Stock Level Distribution</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
              <div
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: summary?.totalMedicineItems
                        ? `conic-gradient(
                      #10b981 0% ${stockDistribution.optimalPct}%, 
                      #f59e0b ${stockDistribution.optimalPct}% ${stockDistribution.optimalPct + stockDistribution.lowPct}%, 
                      #ef4444 ${stockDistribution.optimalPct + stockDistribution.lowPct}% 100%
                    )`
                        : '#e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
              >
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem', color: '#374151' }}>
                  {stockDistribution.optimalPct}%
                </div>
              </div>
              <div style={{ fontSize: '0.875rem' }}>
                <p style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '2px' }}></span> Optimal: <strong>{summary?.optimalStockItems ?? 0}</strong>
                </p>
                <p style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '2px' }}></span> Low Stock: <strong>{summary?.lowStockItems ?? 0}</strong>
                </p>
                <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '2px' }}></span> Out of Stock: <strong>{summary?.outOfStockItems ?? 0}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* System Alert Status Bar Chart */}
          <div className="content-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600 }}>System Alerts Summary</h3>
            <div style={{ display: 'flex', height: '110px', alignItems: 'flex-end', gap: '1.5rem', paddingBottom: '0.5rem' }}>

              {/* Open Alerts Bar */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '2px' }}>{alertStats.open}</span>
                <div style={{ width: '100%', height: `${Math.max((alertStats.open / alertStats.maxVal) * 100, 6)}%`, backgroundColor: '#f59e0b', borderRadius: '4px 4px 0 0', transition: 'height 0.3s' }} />
                <span style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '4px' }}>Open</span>
              </div>

              {/* Critical Alerts Bar */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '2px' }}>{alertStats.critical}</span>
                <div style={{ width: '100%', height: `${Math.max((alertStats.critical / alertStats.maxVal) * 100, 6)}%`, backgroundColor: '#ef4444', borderRadius: '4px 4px 0 0', transition: 'height 0.3s' }} />
                <span style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '4px' }}>Critical</span>
              </div>

              {/* Acknowledged Bar */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '2px' }}>{alertStats.acknowledged}</span>
                <div style={{ width: '100%', height: `${Math.max((alertStats.acknowledged / alertStats.maxVal) * 100, 6)}%`, backgroundColor: '#3b82f6', borderRadius: '4px 4px 0 0', transition: 'height 0.3s' }} />
                <span style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '4px' }}>Acknowledged</span>
              </div>

            </div>
          </div>

        </div>

        {/* Dashboard KPI Grid Panels */}
        <div className="dashboard-grid">
          <div className="content-card dashboard-panel">
            <div className="panel-icon warning"><BellRing size={21} /></div>
            <div><span>Open alerts</span><strong>{summary?.openAlerts ?? '—'}</strong><small>{summary?.acknowledgedAlerts ?? '—'} acknowledged</small></div>
          </div>
          <div className="content-card dashboard-panel">
            <div className="panel-icon critical"><CircleAlert size={21} /></div>
            <div><span>Critical active alerts</span><strong>{summary?.criticalActiveAlerts ?? '—'}</strong><small>Out-of-stock and critical operational events</small></div>
          </div>
          <div className="content-card dashboard-panel">
            <div className="panel-icon good"><PackageCheck size={21} /></div>
            <div><span>Healthy stock</span><strong>{summary?.optimalStockItems ?? '—'}</strong><small>Items above reorder level</small></div>
          </div>
        </div>
      </div>
  );
};

export default Dashboard;