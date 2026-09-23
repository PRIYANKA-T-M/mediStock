import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  Filter,
  Package,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  Truck,
  X,
  AlertTriangle,
  Info,
  CircleAlert,
} from "lucide-react";

import api from "../services/api";

const ALERT_TYPES = [
  "ALL",
  "LOW_STOCK",
  "OUT_OF_STOCK",
  "EXPIRY",
  "SUPPLIER_DELAY",
  "SYSTEM",
];

const ALERT_SEVERITIES = ["ALL", "INFO", "WARNING", "CRITICAL"];

const ALERT_STATUSES = ["ALL", "OPEN", "ACKNOWLEDGED", "RESOLVED"];

// ------------------------------------------------------
// Helper functions
// ------------------------------------------------------

const getTypeLabel = (type) => {
  switch (type) {
    case "LOW_STOCK":
      return "Low Stock";
    case "OUT_OF_STOCK":
      return "Out of Stock";
    case "EXPIRY":
      return "Expiry";
    case "SUPPLIER_DELAY":
      return "Supplier Delay";
    case "SYSTEM":
      return "System";
    default:
      return type || "Alert";
  }
};

const getSeverityStyles = (severity) => {
  switch (severity) {
    case "CRITICAL":
      return {
        badge: "bg-red-50 text-red-700 border-red-200",
        icon: "bg-red-100 text-red-600",
        dot: "bg-red-500",
      };

    case "WARNING":
      return {
        badge: "bg-amber-50 text-amber-700 border-amber-200",
        icon: "bg-amber-100 text-amber-600",
        dot: "bg-amber-500",
      };

    case "INFO":
    default:
      return {
        badge: "bg-blue-50 text-blue-700 border-blue-200",
        icon: "bg-blue-100 text-blue-600",
        dot: "bg-blue-500",
      };
  }
};

const getStatusStyles = (status) => {
  switch (status) {
    case "OPEN":
      return "bg-red-50 text-red-700 border-red-200";

    case "ACKNOWLEDGED":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "RESOLVED":
      return "bg-green-50 text-green-700 border-green-200";

    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
};

const getAlertIcon = (type) => {
  switch (type) {
    case "LOW_STOCK":
      return Package;

    case "OUT_OF_STOCK":
      return CircleAlert;

    case "EXPIRY":
      return Clock;

    case "SUPPLIER_DELAY":
      return Truck;

    case "SYSTEM":
      return ShieldAlert;

    default:
      return Bell;
  }
};

const formatDate = (dateValue) => {
  if (!dateValue) return "Unknown";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getTimeAgo = (dateValue) => {
  if (!dateValue) return "";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const difference = Date.now() - date.getTime();

  const minutes = Math.floor(difference / (1000 * 60));

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 30) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  return formatDate(dateValue);
};

// ------------------------------------------------------
// API functions
// ------------------------------------------------------

const fetchAlerts = async (params = {}) => {
  const response = await api.get("/api/alerts", {
    params,
  });

  return response.data;
};

const acknowledgeAlert = async (id) => {
  const response = await api.patch(`/api/alerts/${id}/acknowledge`);

  return response.data;
};

const resolveAlert = async (id) => {
  const response = await api.patch(`/api/alerts/${id}/resolve`);

  return response.data;
};

// ------------------------------------------------------
// Main component
// ------------------------------------------------------

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [typeFilter, setTypeFilter] = useState("ALL");

  const [severityFilter, setSeverityFilter] = useState("ALL");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedAlert, setSelectedAlert] = useState(null);

  const [actionLoading, setActionLoading] = useState(null);

  // ----------------------------------------------------
  // Load alerts
  // ----------------------------------------------------

  const loadAlerts = async (showFullLoader = true) => {
    try {
      if (showFullLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const data = await fetchAlerts();

      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load alerts:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to view alerts.");
      } else if (!err.response) {
        setError(
          "Unable to connect to the server. Please check that the backend is running."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to load alerts. Please try again."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAlerts(true);
  }, []);

  // ----------------------------------------------------
  // Filtering
  // ----------------------------------------------------

  const filteredAlerts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return alerts.filter((alert) => {
      const matchesSearch =
        !search ||
        alert.title?.toLowerCase().includes(search) ||
        alert.message?.toLowerCase().includes(search) ||
        alert.medicineName?.toLowerCase().includes(search) ||
        alert.supplierName?.toLowerCase().includes(search) ||
        alert.referenceKey?.toLowerCase().includes(search);

      const matchesType =
        typeFilter === "ALL" || alert.type === typeFilter;

      const matchesSeverity =
        severityFilter === "ALL" || alert.severity === severityFilter;

      const matchesStatus =
        statusFilter === "ALL" || alert.status === statusFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesSeverity &&
        matchesStatus
      );
    });
  }, [
    alerts,
    searchTerm,
    typeFilter,
    severityFilter,
    statusFilter,
  ]);

  // ----------------------------------------------------
  // Statistics
  // ----------------------------------------------------

  const stats = useMemo(() => {
    return {
      total: alerts.length,

      open: alerts.filter((alert) => alert.status === "OPEN").length,

      acknowledged: alerts.filter(
        (alert) => alert.status === "ACKNOWLEDGED"
      ).length,

      resolved: alerts.filter(
        (alert) => alert.status === "RESOLVED"
      ).length,

      critical: alerts.filter(
        (alert) =>
          alert.severity === "CRITICAL" &&
          alert.status !== "RESOLVED"
      ).length,
    };
  }, [alerts]);

  // ----------------------------------------------------
  // Acknowledge
  // ----------------------------------------------------

  const handleAcknowledge = async (alert) => {
    if (!alert?.id) return;

    try {
      setActionLoading(`acknowledge-${alert.id}`);

      const updatedAlert = await acknowledgeAlert(alert.id);

      setAlerts((currentAlerts) =>
        currentAlerts.map((item) =>
          item.id === alert.id
            ? updatedAlert || {
                ...item,
                status: "ACKNOWLEDGED",
              }
            : item
        )
      );

      setSelectedAlert((current) =>
        current?.id === alert.id
          ? updatedAlert || {
              ...current,
              status: "ACKNOWLEDGED",
            }
          : current
      );
    } catch (err) {
      console.error("Failed to acknowledge alert:", err);

      setError(
        err.response?.data?.message ||
          "Failed to acknowledge the alert."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ----------------------------------------------------
  // Resolve
  // ----------------------------------------------------

  const handleResolve = async (alert) => {
    if (!alert?.id) return;

    try {
      setActionLoading(`resolve-${alert.id}`);

      const updatedAlert = await resolveAlert(alert.id);

      setAlerts((currentAlerts) =>
        currentAlerts.map((item) =>
          item.id === alert.id
            ? updatedAlert || {
                ...item,
                status: "RESOLVED",
              }
            : item
        )
      );

      setSelectedAlert((current) =>
        current?.id === alert.id
          ? updatedAlert || {
              ...current,
              status: "RESOLVED",
            }
          : current
      );
    } catch (err) {
      console.error("Failed to resolve alert:", err);

      setError(
        err.response?.data?.message ||
          "Failed to resolve the alert."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ----------------------------------------------------
  // Clear filters
  // ----------------------------------------------------

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("ALL");
    setSeverityFilter("ALL");
    setStatusFilter("ALL");
  };

  const hasFilters =
    searchTerm ||
    typeFilter !== "ALL" ||
    severityFilter !== "ALL" ||
    statusFilter !== "ALL";

  // ----------------------------------------------------
  // Loading state
  // ----------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-7">
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

              <p className="text-sm font-medium text-slate-500">
                Loading alerts...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // UI
  // ----------------------------------------------------

  return (
    <div className="min-h-[70vh] bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-7">
        {/* -------------------------------------------- */}
        {/* Header */}
        {/* -------------------------------------------- */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Bell size={22} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Alerts & Notifications
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Monitor inventory, expiry and supplier alerts
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => loadAlerts(false)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* -------------------------------------------- */}
        {/* Error */}
        {/* -------------------------------------------- */}

        {error && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={19}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div>
                <p className="text-sm font-semibold text-red-800">
                  Something went wrong
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>

            <button
              onClick={() => setError("")}
              className="rounded-md p-1 text-red-500 hover:bg-red-100"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* -------------------------------------------- */}
        {/* Statistics */}
        {/* -------------------------------------------- */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Total */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Alerts
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-800">
                  {stats.total}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Bell size={19} />
              </div>
            </div>
          </div>

          {/* Open */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Open
                </p>

                <p className="mt-2 text-2xl font-bold text-red-600">
                  {stats.open}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <CircleAlert size={19} />
              </div>
            </div>
          </div>

          {/* Acknowledged */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Acknowledged
                </p>

                <p className="mt-2 text-2xl font-bold text-amber-600">
                  {stats.acknowledged}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Clock size={19} />
              </div>
            </div>
          </div>

          {/* Resolved */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Resolved
                </p>

                <p className="mt-2 text-2xl font-bold text-green-600">
                  {stats.resolved}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
                <CheckCheck size={19} />
              </div>
            </div>
          </div>

          {/* Critical */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Critical
                </p>

                <p className="mt-2 text-2xl font-bold text-red-600">
                  {stats.critical}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <ShieldAlert size={19} />
              </div>
            </div>
          </div>
        </div>

        {/* -------------------------------------------- */}
        {/* Filters */}
        {/* -------------------------------------------- */}

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Filter size={17} className="text-slate-500" />

            <h2 className="text-sm font-semibold text-slate-700">
              Filter Alerts
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="relative lg:col-span-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Type */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {ALERT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type === "ALL" ? "All Types" : getTypeLabel(type)}
                </option>
              ))}
            </select>

            {/* Severity */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {ALERT_SEVERITIES.map((severity) => (
                <option key={severity} value={severity}>
                  {severity === "ALL"
                    ? "All Severities"
                    : severity}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {ALERT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status === "ALL" ? "All Statuses" : status}
                </option>
              ))}
            </select>
          </div>

          {hasFilters && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* -------------------------------------------- */}
        {/* Results count */}
        {/* -------------------------------------------- */}

        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredAlerts.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {alerts.length}
            </span>{" "}
            alerts
          </p>
        </div>

        {/* -------------------------------------------- */}
        {/* Empty state */}
        {/* -------------------------------------------- */}

        {filteredAlerts.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Bell size={25} />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-slate-800">
              No alerts found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {hasFilters
                ? "No alerts match your current filters. Try changing or clearing the filters."
                : "There are currently no alerts in the system."}
            </p>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          /* ------------------------------------------ */
          /* Alert list */
          /* ------------------------------------------ */
          <div className="space-y-3">
            {filteredAlerts.map((alert) => {
              const Icon = getAlertIcon(alert.type);

              const severityStyles = getSeverityStyles(
                alert.severity
              );

              const isOpen = alert.status === "OPEN";

              return (
                <div
                  key={alert.id}
                  className={`rounded-xl border bg-white shadow-sm transition hover:shadow-md ${
                    isOpen
                      ? "border-slate-200"
                      : "border-slate-200 opacity-95"
                  }`}
                >
                  <div className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      {/* Left */}
                      <div className="flex min-w-0 gap-4">
                        {/* Icon */}
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${severityStyles.icon}`}
                        >
                          <Icon size={20} />
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-slate-800">
                              {alert.title || "System Alert"}
                            </h3>

                            {alert.severity && (
                              <span
                                className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${severityStyles.badge}`}
                              >
                                {alert.severity}
                              </span>
                            )}

                            {alert.status && (
                              <span
                                className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getStatusStyles(
                                  alert.status
                                )}`}
                              >
                                {alert.status}
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-sm font-medium text-blue-600">
                            {getTypeLabel(alert.type)}
                          </p>

                          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                            {alert.message ||
                              "No additional information available."}
                          </p>

                          {/* Medicine / supplier information */}
                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                            {alert.medicineName && (
                              <span>
                                Medicine:{" "}
                                <span className="font-semibold text-slate-700">
                                  {alert.medicineName}
                                </span>
                              </span>
                            )}

                            {alert.currentStock !== null &&
                              alert.currentStock !== undefined && (
                                <span>
                                  Current Stock:{" "}
                                  <span className="font-semibold text-slate-700">
                                    {alert.currentStock}
                                  </span>
                                </span>
                              )}

                            {alert.thresholdStock !== null &&
                              alert.thresholdStock !== undefined && (
                                <span>
                                  Threshold:{" "}
                                  <span className="font-semibold text-slate-700">
                                    {alert.thresholdStock}
                                  </span>
                                </span>
                              )}

                            {alert.supplierName && (
                              <span>
                                Supplier:{" "}
                                <span className="font-semibold text-slate-700">
                                  {alert.supplierName}
                                </span>
                              </span>
                            )}

                            {alert.referenceKey && (
                              <span>
                                Reference:{" "}
                                <span className="font-semibold text-slate-700">
                                  {alert.referenceKey}
                                </span>
                              </span>
                            )}
                          </div>

                          {/* Timestamp */}
                          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                            <Clock size={13} />

                            <span>
                              {formatDate(alert.createdAt)}
                            </span>

                            <span>•</span>

                            <span>
                              {getTimeAgo(alert.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
                        <button
                          onClick={() => setSelectedAlert(alert)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                          View
                        </button>

                        {alert.status === "OPEN" && (
                          <button
                            onClick={() =>
                              handleAcknowledge(alert)
                            }
                            disabled={
                              actionLoading ===
                              `acknowledge-${alert.id}`
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Check size={14} />

                            {actionLoading ===
                            `acknowledge-${alert.id}`
                              ? "Updating..."
                              : "Acknowledge"}
                          </button>
                        )}

                        {(alert.status === "OPEN" ||
                          alert.status === "ACKNOWLEDGED") && (
                          <button
                            onClick={() => handleResolve(alert)}
                            disabled={
                              actionLoading ===
                              `resolve-${alert.id}`
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <CheckCheck size={14} />

                            {actionLoading ===
                            `resolve-${alert.id}`
                              ? "Updating..."
                              : "Resolve"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* -------------------------------------------- */}
        {/* Detail Modal */}
        {/* -------------------------------------------- */}

        {selectedAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      getSeverityStyles(
                        selectedAlert.severity
                      ).icon
                    }`}
                  >
                    {(() => {
                      const Icon = getAlertIcon(
                        selectedAlert.type
                      );

                      return <Icon size={19} />;
                    })()}
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      Alert Details
                    </h2>

                    <p className="text-xs text-slate-500">
                      {getTypeLabel(selectedAlert.type)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedAlert(null)}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="space-y-5 px-6 py-6">
                <div>
                  <h3 className="text-base font-semibold text-slate-800">
                    {selectedAlert.title || "System Alert"}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {selectedAlert.message ||
                      "No message available."}
                  </p>
                </div>

                {/* Status / Severity */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Severity
                    </p>

                    <div className="mt-2">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                          getSeverityStyles(
                            selectedAlert.severity
                          ).badge
                        }`}
                      >
                        {selectedAlert.severity || "INFO"}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Status
                    </p>

                    <div className="mt-2">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyles(
                          selectedAlert.status
                        )}`}
                      >
                        {selectedAlert.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Medicine */}
                {selectedAlert.medicineName && (
                  <div className="rounded-xl border border-slate-200 p-4">
                    <h4 className="mb-3 text-sm font-semibold text-slate-700">
                      Medicine Information
                    </h4>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-slate-400">
                          Medicine
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {selectedAlert.medicineName}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Current Stock
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {selectedAlert.currentStock ??
                            "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Threshold
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {selectedAlert.thresholdStock ??
                            "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Supplier */}
                {selectedAlert.supplierName && (
                  <div className="rounded-xl border border-slate-200 p-4">
                    <h4 className="mb-3 text-sm font-semibold text-slate-700">
                      Supplier Information
                    </h4>

                    <div>
                      <p className="text-xs text-slate-400">
                        Supplier
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {selectedAlert.supplierName}
                      </p>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="rounded-xl border border-slate-200 p-4">
                  <h4 className="mb-3 text-sm font-semibold text-slate-700">
                    Alert Information
                  </h4>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-slate-400">
                        Created At
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {formatDate(selectedAlert.createdAt)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Updated At
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {formatDate(selectedAlert.updatedAt)}
                      </p>
                    </div>

                    {selectedAlert.actedBy && (
                      <div>
                        <p className="text-xs text-slate-400">
                          Acted By
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {selectedAlert.actedBy}
                        </p>
                      </div>
                    )}

                    {selectedAlert.referenceKey && (
                      <div>
                        <p className="text-xs text-slate-400">
                          Reference
                        </p>

                        <p className="mt-1 break-all text-sm font-medium text-slate-700">
                          {selectedAlert.referenceKey}
                        </p>
                      </div>
                    )}

                    {selectedAlert.acknowledgedAt && (
                      <div>
                        <p className="text-xs text-slate-400">
                          Acknowledged At
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {formatDate(
                            selectedAlert.acknowledgedAt
                          )}
                        </p>
                      </div>
                    )}

                    {selectedAlert.resolvedAt && (
                      <div>
                        <p className="text-xs text-slate-400">
                          Resolved At
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {formatDate(
                            selectedAlert.resolvedAt
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex flex-col-reverse gap-2 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Close
                </button>

                {selectedAlert.status === "OPEN" && (
                  <button
                    onClick={() =>
                      handleAcknowledge(selectedAlert)
                    }
                    disabled={
                      actionLoading ===
                      `acknowledge-${selectedAlert.id}`
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-60"
                  >
                    <Check size={16} />

                    {actionLoading ===
                    `acknowledge-${selectedAlert.id}`
                      ? "Acknowledging..."
                      : "Acknowledge"}
                  </button>
                )}

                {(selectedAlert.status === "OPEN" ||
                  selectedAlert.status === "ACKNOWLEDGED") && (
                  <button
                    onClick={() =>
                      handleResolve(selectedAlert)
                    }
                    disabled={
                      actionLoading ===
                      `resolve-${selectedAlert.id}`
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
                  >
                    <CheckCheck size={16} />

                    {actionLoading ===
                    `resolve-${selectedAlert.id}`
                      ? "Resolving..."
                      : "Resolve"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}