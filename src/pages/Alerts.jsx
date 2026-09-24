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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Alerts</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational surveillance for inventory depletion, batch expiries, and vendor delays.
          </p>
        </div>

        <button
          onClick={() => loadAlerts(false)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium transition cursor-pointer shadow-xs"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-rose-500 hover:text-rose-700 font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* KPI METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setStatusFilter('ALL')}
          className={`bg-white p-5 rounded-xl border shadow-xs cursor-pointer transition ${
            statusFilter === 'ALL'
              ? 'border-sky-500 ring-2 ring-sky-100'
              : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center">
              <Bell size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-3 font-mono tabular-nums">
            {stats.total}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Recorded audit incidents</div>
        </div>

        <div
          onClick={() => setStatusFilter('OPEN')}
          className={`bg-white p-5 rounded-xl border shadow-xs cursor-pointer transition ${
            statusFilter === 'OPEN'
              ? 'border-rose-500 ring-2 ring-rose-100'
              : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Open Incidents</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <CircleAlert size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-3 font-mono tabular-nums">
            {stats.open}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Require immediate resolution</div>
        </div>

        <div
          onClick={() => setStatusFilter('ACKNOWLEDGED')}
          className={`bg-white p-5 rounded-xl border shadow-xs cursor-pointer transition ${
            statusFilter === 'ACKNOWLEDGED'
              ? 'border-amber-500 ring-2 ring-amber-100'
              : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Acknowledged</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Check size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-3 font-mono tabular-nums">
            {stats.acknowledged}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">In review by pharmacy staff</div>
        </div>

        <div
          onClick={() => setStatusFilter('RESOLVED')}
          className={`bg-white p-5 rounded-xl border shadow-xs cursor-pointer transition ${
            statusFilter === 'RESOLVED'
              ? 'border-emerald-500 ring-2 ring-emerald-100'
              : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Resolved</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCheck size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-3 font-mono tabular-nums">
            {stats.resolved}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Closed without issues</div>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto">
          {ALERT_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                statusFilter === status
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status === 'ALL' ? 'All Alerts' : status}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search alerts or medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* ALERTS FEED */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center text-slate-400 shadow-xs">
            <Bell size={28} className="mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700 text-sm">No alerts match filter</p>
            <p className="text-xs text-slate-400 mt-0.5">All monitored systems are operating smoothly.</p>
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
                className="bg-white rounded-xl border border-slate-200/80 p-4.5 shadow-xs hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isResolved
                        ? 'bg-emerald-50 text-emerald-600'
                        : isCritical
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    <Icon size={18} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-slate-900 text-xs">{alert.title}</h4>
                      <span className="text-[11px] text-slate-400">·</span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {getTypeLabel(alert.type)}
                      </span>
                      {alert.medicineName && (
                        <>
                          <span className="text-[11px] text-slate-400">·</span>
                          <span className="text-[11px] font-mono font-medium text-slate-700">
                            {alert.medicineName}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{alert.message}</p>
                    <div className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-2">
                      <span>Logged: {alert.createdAt || 'Recent'}</span>
                      {isResolved && <span className="text-emerald-600 font-medium">· Resolved</span>}
                      {isAcknowledged && <span className="text-amber-600 font-medium">· In Review</span>}
                    </div>
                  </div>
                </div>

                {!isResolved && (
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {!isAcknowledged && (
                      <button
                        onClick={() => handleAcknowledge(alert)}
                        disabled={actionLoading === alert.id}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition cursor-pointer"
                      >
                        Acknowledge
                      </button>
                    )}
                    <button
                      onClick={() => handleResolve(alert)}
                      disabled={actionLoading === alert.id}
                      className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                    >
                      Resolve
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
