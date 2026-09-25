import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  Package,
  RefreshCw,
  Search,
  ShieldAlert,
  Truck,
  CircleAlert,
} from 'lucide-react';
import api from '../services/api';

const ALERT_TYPES = [
  'ALL',
  'LOW_STOCK',
  'OUT_OF_STOCK',
  'EXPIRY',
  'SUPPLIER_DELAY',
  'SYSTEM',
];

const ALERT_SEVERITIES = ['ALL', 'INFO', 'WARNING', 'CRITICAL'];
const ALERT_STATUSES = ['ALL', 'OPEN', 'ACKNOWLEDGED', 'RESOLVED'];

const getTypeLabel = (type) => {
  switch (type) {
    case 'LOW_STOCK':
      return 'Low Stock';
    case 'OUT_OF_STOCK':
      return 'Out of Stock';
    case 'EXPIRY':
      return 'Expiry';
    case 'SUPPLIER_DELAY':
      return 'Supplier Delay';
    case 'SYSTEM':
      return 'System';
    default:
      return type || 'Alert';
  }
};

const getAlertIcon = (type) => {
  switch (type) {
    case 'LOW_STOCK':
      return Package;
    case 'OUT_OF_STOCK':
      return CircleAlert;
    case 'EXPIRY':
      return Clock;
    case 'SUPPLIER_DELAY':
      return Truck;
    case 'SYSTEM':
      return ShieldAlert;
    default:
      return Bell;
  }
};

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const loadAlerts = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setRefreshing(true);
      setError('');

      const res = await api.get('/api/alerts');
      setAlerts(res.data || []);
    } catch (err) {
      console.error('Failed to load alerts:', err);
      setError('Unable to load current alerts.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAlerts(true);
  }, []);

  const handleAcknowledge = async (alert) => {
    if (!alert?.id) return;
    try {
      setActionLoading(alert.id);
      await api.patch(`/api/alerts/${alert.id}/acknowledge`);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alert.id ? { ...a, status: 'ACKNOWLEDGED' } : a))
      );
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
      setError('Could not acknowledge alert.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolve = async (alert) => {
    if (!alert?.id) return;
    try {
      setActionLoading(alert.id);
      await api.patch(`/api/alerts/${alert.id}/resolve`);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alert.id ? { ...a, status: 'RESOLVED' } : a))
      );
    } catch (err) {
      console.error('Failed to resolve alert:', err);
      setError('Could not resolve alert.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const search = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !search ||
        alert.title?.toLowerCase().includes(search) ||
        alert.message?.toLowerCase().includes(search) ||
        alert.medicineName?.toLowerCase().includes(search);

      const matchesType = typeFilter === 'ALL' || alert.type === typeFilter;
      const matchesSeverity = severityFilter === 'ALL' || alert.severity === severityFilter;
      const matchesStatus =
        statusFilter === 'ALL' ||
        alert.status === statusFilter ||
        (statusFilter === 'OPEN' && alert.status === 'ACTIVE');

      return matchesSearch && matchesType && matchesSeverity && matchesStatus;
    });
  }, [alerts, searchTerm, typeFilter, severityFilter, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: alerts.length,
      open: alerts.filter((a) => a.status === 'OPEN' || a.status === 'ACTIVE').length,
      acknowledged: alerts.filter((a) => a.status === 'ACKNOWLEDGED').length,
      resolved: alerts.filter((a) => a.status === 'RESOLVED').length,
      critical: alerts.filter((a) => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length,
    };
  }, [alerts]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-sky-600 rounded-full animate-spin" />
        <p className="mt-3 text-xs font-medium text-slate-500">Loading alerts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">System Alerts</h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 leading-relaxed">
            Operational surveillance for inventory depletion, batch expiries, and vendor supply delays.
          </p>
        </div>

        <button
          onClick={() => loadAlerts(false)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition cursor-pointer shadow-xs"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          <span>Refresh Incidents</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-rose-600 hover:text-rose-800 font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* KPI METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          onClick={() => setStatusFilter('ALL')}
          className={`bg-white p-6 rounded-2xl border shadow-xs cursor-pointer transition ${
            statusFilter === 'ALL'
              ? 'border-emerald-700 ring-2 ring-emerald-700/10'
              : 'border-stone-200/80 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider text-[11px]">Total Incidents</span>
            <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
              <Bell size={16} />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-4 font-mono tabular-nums tracking-tight">
            {stats.total}
          </div>
          <div className="text-xs text-stone-400 mt-1.5">Recorded surveillance incidents</div>
        </div>

        <div
          onClick={() => setStatusFilter('OPEN')}
          className={`bg-white p-6 rounded-2xl border shadow-xs cursor-pointer transition ${
            statusFilter === 'OPEN'
              ? 'border-rose-600 ring-2 ring-rose-500/10'
              : 'border-stone-200/80 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider text-[11px]">Open Incidents</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <CircleAlert size={16} />
            </div>
          </div>
          <div className="text-3xl font-bold text-rose-700 mt-4 font-mono tabular-nums tracking-tight">
            {stats.open}
          </div>
          <div className="text-xs text-rose-500/80 mt-1.5 font-medium">Require immediate resolution</div>
        </div>

        <div
          onClick={() => setStatusFilter('ACKNOWLEDGED')}
          className={`bg-white p-6 rounded-2xl border shadow-xs cursor-pointer transition ${
            statusFilter === 'ACKNOWLEDGED'
              ? 'border-amber-600 ring-2 ring-amber-500/10'
              : 'border-stone-200/80 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider text-[11px]">Acknowledged</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Check size={16} />
            </div>
          </div>
          <div className="text-3xl font-bold text-amber-700 mt-4 font-mono tabular-nums tracking-tight">
            {stats.acknowledged}
          </div>
          <div className="text-xs text-stone-400 mt-1.5">In review by pharmacy staff</div>
        </div>

        <div
          onClick={() => setStatusFilter('RESOLVED')}
          className={`bg-white p-6 rounded-2xl border shadow-xs cursor-pointer transition ${
            statusFilter === 'RESOLVED'
              ? 'border-emerald-700 ring-2 ring-emerald-700/10'
              : 'border-stone-200/80 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider text-[11px]">Resolved</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <CheckCheck size={16} />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-800 mt-4 font-mono tabular-nums tracking-tight">
            {stats.resolved}
          </div>
          <div className="text-xs text-stone-400 mt-1.5">Closed & verified healthy</div>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {ALERT_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                statusFilter === status
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {status === 'ALL' ? 'All Alerts' : status}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-3 text-stone-400" size={15} />
          <input
            type="text"
            placeholder="Search alerts or medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs border border-stone-200 rounded-xl bg-stone-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition"
          />
        </div>
      </div>

      {/* ALERTS FEED */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200/80 p-16 text-center text-stone-400 shadow-xs">
            <Bell size={32} className="mx-auto text-stone-300 mb-3" />
            <p className="font-bold text-slate-800 text-base">No alerts match criteria</p>
            <p className="text-xs text-stone-500 mt-1">All monitored storage and inventory subsystems are operating normally.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const Icon = getAlertIcon(alert.type);
            const isResolved = alert.status === 'RESOLVED';
            const isAcknowledged = alert.status === 'ACKNOWLEDGED';
            const isCritical = alert.severity === 'CRITICAL';

            return (
              <div
                key={alert.id}
                className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs hover:border-stone-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-5"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      isResolved
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : isCritical
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    <Icon size={20} />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-sm">{alert.title}</h4>
                      <span className="text-stone-300">·</span>
                      <span className="text-xs text-stone-500 font-medium">
                        {getTypeLabel(alert.type)}
                      </span>
                      {alert.medicineName && (
                        <>
                          <span className="text-stone-300">·</span>
                          <span className="text-xs font-mono font-semibold text-slate-800 bg-stone-100 px-2 py-0.5 rounded-md">
                            {alert.medicineName}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl">{alert.message}</p>
                    <div className="text-[11px] text-stone-400 pt-1 flex items-center gap-3">
                      <span>Logged: {alert.createdAt || 'Recent'}</span>
                      {isResolved && <span className="text-emerald-800 font-semibold">· Verified Resolved</span>}
                      {isAcknowledged && <span className="text-amber-800 font-semibold">· In Review</span>}
                    </div>
                  </div>
                </div>

                {!isResolved && (
                  <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                    {!isAcknowledged && (
                      <button
                        onClick={() => handleAcknowledge(alert)}
                        disabled={actionLoading === alert.id}
                        className="px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition cursor-pointer"
                      >
                        Acknowledge
                      </button>
                    )}
                    <button
                      onClick={() => handleResolve(alert)}
                      disabled={actionLoading === alert.id}
                      className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                    >
                      Resolve Incident
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Alerts;
