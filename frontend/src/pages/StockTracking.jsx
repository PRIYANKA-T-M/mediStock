import React, { useEffect, useMemo, useState } from 'react';
import { Boxes, PackageCheck, RefreshCw, Search, TriangleAlert, CircleAlert, CheckCircle2, ShieldCheck } from 'lucide-react';
import authService from '../services/authService';
import stockService from '../services/stockService';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import StockAdjuster from '../components/StockAdjuster';

const StockTracking = () => {
  const user = authService.getCurrentUser();
  const canAdjust = ['ADMIN', 'PHARMACIST'].includes(user?.role);
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { setItems(await stockService.getAll()); }
    catch (err) { setError(authService.handleError(err)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const counts = useMemo(() => ({
    total: items.length,
    optimal: items.filter((i) => i.status === 'OPTIMAL').length,
    low: items.filter((i) => i.status === 'LOW_STOCK').length,
    out: items.filter((i) => i.status === 'OUT_OF_STOCK').length,
  }), [items]);

  // Donut Chart Percentage Calculations
  const stockPercents = useMemo(() => {
    if (!counts.total) return { optimalPct: 0, lowPct: 0, outPct: 0 };
    const optimalPct = Math.round((counts.optimal / counts.total) * 100);
    const lowPct = Math.round((counts.low / counts.total) * 100);
    const outPct = 100 - (optimalPct + lowPct);
    return { optimalPct, lowPct, outPct };
  }, [counts]);

  // Category Distribution Bar Chart Data
  const categoryData = useMemo(() => {
    const buckets = {};
    items.forEach((item) => {
      const cat = item.category || 'Unassigned';
      buckets[cat] = (buckets[cat] || 0) + 1;
    });
    const maxVal = Math.max(...Object.values(buckets), 1);
    return { buckets, maxVal };
  }, [items]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => (filter === 'ALL' || item.status === filter))
        .filter((item) => !q || [item.medicineName, item.medicineCode, item.category, item.batchNumber, item.supplierName]
            .filter(Boolean).some((value) => String(value).toLowerCase().includes(q)));
  }, [items, filter, search]);

  const updateQuantity = async (item, quantity) => {
    if (!canAdjust || quantity < 0) return;
    setBusyId(item.id); setError(''); setMessage('');
    try {
      const updated = await stockService.updateQuantity(item.id, quantity);
      setItems((current) => current.map((row) => row.id === item.id ? updated : row));
      setMessage(`${updated.medicineName} updated to ${updated.quantity} ${updated.unit}. Alert status was checked automatically.`);
    } catch (err) {
      setError(authService.handleError(err));
    } finally {
      setBusyId(null);
    }
  };

  const refreshAlerts = async () => {
    setError(''); setMessage('');
    try {
      await stockService.refreshAlerts();
      await load();
      setMessage('All medicine stock levels were checked and alerts synchronized.');
    } catch (err) { setError(authService.handleError(err)); }
  };

  return (
      
        <div className="page-wrap">
          <div className="page-header">
            <div>
              <p className="eyebrow"></p>
              <h1>Welcome, {user?.name}   </h1> <h1>                  ROLE :{user?.role} </h1>
            </div>
            <div className="page-badge"><ShieldCheck size={17} /> {user?.role} · JWT protected</div>
          </div>
        {/* Header with User Info */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p className="eyebrow">Supplier + Alerts integration</p>
            <h1>Medicine Stock Tracking</h1>
            <p>Integration dataset for testing low-stock detection. Quantity changes automatically create, escalate, or resolve alerts.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <div className="page-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', borderRadius: '20px', backgroundColor: '#f3f4f6', fontSize: '0.85rem', fontWeight: 600 }}>
              <ShieldCheck size={16} style={{ color: '#3b82f6' }} />
              <span>{user?.name || 'User'} ({user?.role || 'GUEST'})</span>
            </div>
            {canAdjust && (
                <button className="secondary-btn" onClick={refreshAlerts}>
                  <RefreshCw size={16} /> Sync alerts
                </button>
            )}
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        {/* Visual Banners / Critical Operational Alerts */}
        <div className="alerts-banner-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {counts.out > 0 && (
              <div style={{ padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #ef4444', backgroundColor: '#fef2f2', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <CircleAlert size={24} style={{ color: '#ef4444', flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#991b1b' }}>Out of Stock Emergency</strong>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#7f1d1d' }}>{counts.out} item(s) completely out of stock and require urgent order.</p>
                </div>
              </div>
          )}

          {counts.low > 0 && (
              <div style={{ padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #f59e0b', backgroundColor: '#fffbe3', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <TriangleAlert size={24} style={{ color: '#f59e0b', flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#b45309' }}>Low Stock Warning</strong>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#78350f' }}>{counts.low} item(s) fallen below reorder threshold levels.</p>
                </div>
              </div>
          )}

          <div style={{ padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #10b981', backgroundColor: '#ecfdf5', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <CheckCircle2 size={24} style={{ color: '#10b981', flexShrink: 0 }} />
            <div>
              <strong style={{ color: '#047857' }}>Healthy Inventory</strong>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#065f46' }}>{stockPercents.optimalPct}% of tracked stock is currently optimal.</p>
            </div>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="metric-grid">
          <MetricCard title="Medicine Items" value={counts.total} icon={Boxes} tone="blue" subtitle="Integration stock records" />
          <MetricCard title="Optimal Stock" value={counts.optimal} icon={PackageCheck} tone="emerald" subtitle="Above reorder level" />
          <MetricCard title="Low Stock" value={counts.low} icon={TriangleAlert} tone="amber" subtitle="Reorder required" />
          <MetricCard title="Out of Stock" value={counts.out} icon={TriangleAlert} tone="red" subtitle="Immediate action" />
        </div>

        {/* Analytics & Graphs Section */}
        <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem', marginTop: '1.5rem' }}>

          {/* Inventory Status Donut Chart */}
          <div className="content-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600 }}>Stock Health Status</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
              <div
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: counts.total
                        ? `conic-gradient(
                      #10b981 0% ${stockPercents.optimalPct}%, 
                      #f59e0b ${stockPercents.optimalPct}% ${stockPercents.optimalPct + stockPercents.lowPct}%, 
                      #ef4444 ${stockPercents.optimalPct + stockPercents.lowPct}% 100%
                    )`
                        : '#e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
              >
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem', color: '#374151' }}>
                  {stockPercents.optimalPct}%
                </div>
              </div>
              <div style={{ fontSize: '0.875rem' }}>
                <p style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '2px' }}></span> Optimal: <strong>{counts.optimal}</strong>
                </p>
                <p style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '2px' }}></span> Low Stock: <strong>{counts.low}</strong>
                </p>
                <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '2px' }}></span> Out of Stock: <strong>{counts.out}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Category Breakdown Bar Chart */}
          <div className="content-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600 }}>Medicine Categories Breakdown</h3>
            <div style={{ display: 'flex', height: '110px', alignItems: 'flex-end', gap: '1rem', paddingBottom: '0.5rem' }}>
              {Object.keys(categoryData.buckets).length === 0 ? (
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>No categories registered.</p>
              ) : (
                  Object.entries(categoryData.buckets).slice(0, 5).map(([category, count]) => {
                    const heightPct = (count / categoryData.maxVal) * 100;
                    return (
                        <div key={category} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '2px' }}>{count} </span>
                          <div
                              style={{
                                width: '100%',
                                height: `${Math.max(heightPct, 8)}%`,
                                backgroundColor: '#3b82f6',
                                borderRadius: '4px 4px 0 0',
                                transition: 'height 0.3s ease'
                              }}
                          />
                          <span style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '60px' }} title={category}>
                      {category}
                    </span>
                        </div>
                    );
                  })
              )}
            </div>
          </div>

        </div>

        {/* Main Table Card */}
        <div className="content-card">
          <div className="table-toolbar toolbar-wrap">
            <div className="search-box"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search medicine, batch, supplier..." /></div>
            <div className="filter-tabs">
              {['ALL', 'OPTIMAL', 'LOW_STOCK', 'OUT_OF_STOCK'].map((value) => (
                  <button key={value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{value.replaceAll('_', ' ')}</button>
              ))}
            </div>
          </div>

          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Medicine</th><th>Category / Batch</th><th>Supplier</th><th>Stock</th><th>Reorder</th><th>Status</th><th>Expiry</th></tr></thead>
              <tbody>
              {loading ? <tr><td colSpan="7" className="empty-cell">Loading medicine stock...</td></tr> : visible.length === 0 ? (
                  <tr><td colSpan="7" className="empty-cell">No medicine stock matches this filter.</td></tr>
              ) : visible.map((item) => {
                const isOut = item.status === 'OUT_OF_STOCK';
                const isLow = item.status === 'LOW_STOCK';
                return (
                    <tr key={item.id} style={{ backgroundColor: isOut ? '#fef2f2' : isLow ? '#fffbe3' : 'transparent' }}>
                      <td><strong>{item.medicineName}</strong><small>{item.medicineCode}</small></td>
                      <td>{item.category || '—'}<small>{item.batchNumber || 'No batch'}</small></td>
                      <td>{item.supplierName || '—'}</td>
                      <td>
                        {canAdjust ? (
                            <StockAdjuster quantity={item.quantity} disabled={busyId === item.id} onDecrease={() => updateQuantity(item, item.quantity - 1)} onIncrease={() => updateQuantity(item, item.quantity + 1)} />
                        ) : (
                            <strong style={{ color: isOut ? '#ef4444' : isLow ? '#d97706' : 'inherit' }}>{item.quantity}</strong>
                        )}
                        <small>{item.unit}</small>
                      </td>
                      <td>{item.reorderLevel} <small>{item.unit}</small></td>
                      <td><StatusBadge status={item.status} /></td>
                      <td>{item.expiryDate || '—'}</td>
                    </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
};

export default StockTracking;