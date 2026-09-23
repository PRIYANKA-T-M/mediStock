import React, { useEffect, useMemo, useState } from 'react';
import { Building2, CheckCircle2, Edit3, Plus, Search, Star, Trash2, Truck, X, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import supplierService from '../services/supplierService';
import authService from '../services/authService';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';

const emptyForm = {
  name: '', contactPerson: '', email: '', phone: '', address: '', city: '', state: '', pincode: '',
  gstNumber: '', licenseNumber: '', status: 'ACTIVE', rating: '', leadTimeDays: ''
};

const Suppliers = () => {
  const user = authService.getCurrentUser();
  const canWrite = ['ADMIN', 'PHARMACIST'].includes(user?.role);
  const canDelete = user?.role === 'ADMIN';
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true); setError('');
    try { setItems(await supplierService.getAll()); }
    catch (err) { setError(authService.handleError(err)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((s) => !q || [s.name, s.contactPerson, s.email, s.phone, s.city, s.state, s.gstNumber]
        .filter(Boolean).some((v) => String(v).toLowerCase().includes(q)));
  }, [items, search]);

  // Analytics Metrics
  const activeCount = useMemo(() => items.filter((s) => s.status === 'ACTIVE').length, [items]);
  const inactiveCount = items.length - activeCount;
  const activePercent = items.length ? Math.round((activeCount / items.length) * 100) : 0;

  const lowRatingSuppliers = useMemo(() => items.filter((s) => Number(s.rating) > 0 && Number(s.rating) < 3.0), [items]);
  const highLeadTimeSuppliers = useMemo(() => items.filter((s) => Number(s.leadTimeDays) > 14), [items]);

  const avgRating = items.length ? (items.reduce((sum, s) => sum + Number(s.rating || 0), 0) / items.length).toFixed(1) : '—';
  const avgLead = items.length ? Math.round(items.reduce((sum, s) => sum + Number(s.leadTimeDays || 0), 0) / items.length) : '—';

  // Bar Graph Lead-Time Bucket Data
  const leadTimeBuckets = useMemo(() => {
    const buckets = { '1-3 Days': 0, '4-7 Days': 0, '8-14 Days': 0, '15+ Days': 0 };
    items.forEach((s) => {
      const days = Number(s.leadTimeDays || 0);
      if (days <= 3) buckets['1-3 Days']++;
      else if (days <= 7) buckets['4-7 Days']++;
      else if (days <= 14) buckets['8-14 Days']++;
      else buckets['15+ Days']++;
    });
    return buckets;
  }, [items]);

  const maxBucketVal = Math.max(...Object.values(leadTimeBuckets), 1);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); setMessage(''); };
  const openEdit = (s) => {
    setEditingId(s.id);
    setForm({
      name: s.name || '', contactPerson: s.contactPerson || '', email: s.email || '', phone: s.phone || '',
      address: s.address || '', city: s.city || '', state: s.state || '', pincode: s.pincode || '',
      gstNumber: s.gstNumber || '', licenseNumber: s.licenseNumber || '', status: s.status || 'ACTIVE',
      rating: s.rating ?? '', leadTimeDays: s.leadTimeDays ?? ''
    });
    setShowForm(true); setMessage('');
  };

  const save = async (e) => {
    e.preventDefault(); setError(''); setMessage('');
    const payload = { ...form, rating: form.rating === '' ? null : Number(form.rating), leadTimeDays: form.leadTimeDays === '' ? null : Number(form.leadTimeDays) };
    try {
      if (editingId) { await supplierService.update(editingId, payload); setMessage('Supplier updated successfully.'); }
      else { await supplierService.create(payload); setMessage('Supplier added successfully.'); }
      setShowForm(false); await load();
    } catch (err) { setError(authService.handleError(err)); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this supplier?')) return;
    try { setError(''); await supplierService.remove(id); setMessage('Supplier deleted.'); await load(); }
    catch (err) { setError(authService.handleError(err)); }
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

        <div className="page-header">
          <div><p className="eyebrow"> Supplier management</p><h1>Suppliers</h1><p>Maintain verified medical suppliers, contact details, lead time, rating, and operational status.</p></div>
          {canWrite && <button className="action-btn" onClick={openCreate}><Plus size={17} /> Add supplier</button>}
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        {/* Visual Alerts */}
        <div className="alerts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {lowRatingSuppliers.length > 0 && (
              <div className="alert-card warning" style={{ padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #f59e0b', backgroundColor: '#fffbe3', display: 'flex', gap: '0.75rem' }}>
                <AlertTriangle className="text-amber-500" size={24} />
                <div>
                  <strong style={{ color: '#b45309' }}>Low Rating Alert</strong>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#78350f' }}>{lowRatingSuppliers.length} supplier(s) under 3.0 ★ threshold requiring review.</p>
                </div>
              </div>
          )}
          {highLeadTimeSuppliers.length > 0 && (
              <div className="alert-card danger" style={{ padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #ef4444', backgroundColor: '#fef2f2', display: 'flex', gap: '0.75rem' }}>
                <Clock className="text-red-500" size={24} />
                <div>
                  <strong style={{ color: '#b91c1c' }}>Lead Time Delay Risk</strong>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#991b1b' }}>{highLeadTimeSuppliers.length} vendor(s) have lead times longer than 14 days.</p>
                </div>
              </div>
          )}
          <div className="alert-card info" style={{ padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #10b981', backgroundColor: '#ecfdf5', display: 'flex', gap: '0.75rem' }}>
            <ShieldCheck className="text-emerald-500" size={24} />
            <div>
              <strong style={{ color: '#047857' }}>Operational Status</strong>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#065f46' }}>{activePercent}% network capacity currently operational.</p>
            </div>
          </div>
        </div>

        <div className="metric-grid">
          <MetricCard title="Total Suppliers" value={items.length} icon={Building2} tone="blue" subtitle="Registered in PostgreSQL" />
          <MetricCard title="Active Suppliers" value={activeCount} icon={CheckCircle2} tone="emerald" subtitle={`${inactiveCount} inactive`} />
          <MetricCard title="Average Rating" value={avgRating} icon={Star} tone="amber" subtitle="Out of 5.0" />
          <MetricCard title="Avg. Lead Time" value={avgLead === '—' ? avgLead : `${avgLead}d`} icon={Truck} tone="blue" subtitle="Expected supply time" />
        </div>

        {/* Visual Analytics Graphs Panel */}
        <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>

          {/* Pie Chart Card */}
          <div className="content-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600 }}>Supplier Operational Status</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
              <div
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: items.length
                        ? `conic-gradient(#10b981 0% ${activePercent}%, #9ca3af ${activePercent}% 100%)`
                        : '#e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
              >
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {activePercent}%
                </div>
              </div>
              <div style={{ fontSize: '0.875rem' }}>
                <p style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '2px' }}></span> Active: <strong>{activeCount}</strong>
                </p>
                <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '12px', height: '12px', backgroundColor: '#9ca3af', borderRadius: '2px' }}></span> Inactive: <strong>{inactiveCount}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Lead Time Distribution Bar Chart Card */}
          <div className="content-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600 }}>Lead Time Distribution</h3>
            <div style={{ display: 'flex', height: '110px', alignItems: 'flex-end', gap: '1rem', paddingBottom: '0.5rem' }}>
              {Object.entries(leadTimeBuckets).map(([label, count]) => {
                const heightPct = (count / maxBucketVal) * 100;
                return (
                    <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '2px' }}>{count}</span>
                      <div
                          style={{
                            width: '100%',
                            height: `${Math.max(heightPct, 5)}%`,
                            backgroundColor: '#3b82f6',
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.3s ease'
                          }}
                      />
                      <span style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '4px' }}>{label}</span>
                    </div>
                );
              })}
            </div>
          </div>

        </div>

        <div className="content-card">
          <div className="table-toolbar">
            <div className="search-box"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, contact, GST, city..." /></div>
            <span className="muted-text">{filtered.length} supplier(s)</span>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Supplier</th><th>Contact</th><th>Location</th><th>Rating</th><th>Status</th><th>Lead Time</th><th>Actions</th></tr></thead>
              <tbody>
              {loading ? <tr><td colSpan="7" className="empty-cell">Loading suppliers...</td></tr> : filtered.length === 0 ? (
                  <tr><td colSpan="7" className="empty-cell"><Truck size={22} /> No suppliers found.</td></tr>
              ) : filtered.map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.name}</strong><small>{s.gstNumber || s.licenseNumber || 'No registration number'}</small></td>
                    <td>{s.contactPerson || '—'}<small>{s.email || s.phone || ''}</small></td>
                    <td>{[s.city, s.state].filter(Boolean).join(', ') || '—'}<small>{s.pincode || ''}</small></td>
                    <td>
                    <span className="rating-cell" style={{ color: Number(s.rating) < 3.0 ? '#d97706' : 'inherit', fontWeight: Number(s.rating) < 3.0 ? 'bold' : 'normal' }}>
                      <Star size={13} fill={Number(s.rating) >= 3.0 ? "#f59e0b" : "none"} /> {s.rating ?? '—'}
                    </span>
                    </td>
                    <td><StatusBadge status={s.status} /></td>
                    <td>
                    <span style={{ color: Number(s.leadTimeDays) > 14 ? '#dc2626' : 'inherit', fontWeight: Number(s.leadTimeDays) > 14 ? 'bold' : 'normal' }}>
                      {s.leadTimeDays == null ? '—' : `${s.leadTimeDays} days`}
                    </span>
                    </td>
                    <td><div className="row-actions">
                      {canWrite && <button onClick={() => openEdit(s)} title="Edit"><Edit3 size={16} /></button>}
                      {canDelete && <button className="danger-icon" onClick={() => remove(s.id)} title="Delete"><Trash2 size={16} /></button>}
                      {!canWrite && <span className="muted-text">View only</span>}
                    </div></td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>

        {showForm && (
            <div className="modal-backdrop" onMouseDown={() => setShowForm(false)}>
              <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
                <div className="modal-head"><div><p className="eyebrow">Supplier record</p><h2>{editingId ? 'Edit supplier' : 'Add supplier'}</h2></div><button onClick={() => setShowForm(false)}><X size={20} /></button></div>
                <form className="form-grid" onSubmit={save}>
                  <label>Supplier name<input required maxLength="150" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
                  <label>Contact person<input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} /></label>
                  <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
                  <label>Phone<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
                  <label className="span-2">Address<input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
                  <label>City<input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label>
                  <label>State<input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></label>
                  <label>Pincode<input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} /></label>
                  <label>GST number<input value={form.gstNumber} onChange={(e) => setForm({ ...form, gstNumber: e.target.value })} /></label>
                  <label>License number<input value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} /></label>
                  <label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option></select></label>
                  <label>Rating (0–5)<input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} /></label>
                  <label>Lead time (days)<input type="number" min="0" max="365" value={form.leadTimeDays} onChange={(e) => setForm({ ...form, leadTimeDays: e.target.value })} /></label>
                  <div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setShowForm(false)}>Cancel</button><button className="action-btn" type="submit">Save supplier</button></div>
                </form>
              </div>
            </div>
        )}
      </div>
  );
};

export default Suppliers;