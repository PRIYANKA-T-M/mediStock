import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Boxes,
  CalendarClock,
  CheckCircle2,
  Clock,
  Package,
  Plus,
  RefreshCw,
  ShoppingCart,
  Truck,
  XCircle,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/useAuth";

const PharmacistDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [medicines, setMedicines] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  // --------------------------------------------------
  // Fetch dashboard data
  // --------------------------------------------------

  const loadDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const results = await Promise.allSettled([
        api.get("/api/medicines"),
        api.get("/api/inventory"),
        api.get("/api/suppliers"),
        api.get("/api/alerts"),
      ]);

      const [medicineResult, inventoryResult, supplierResult, alertResult] =
        results;

      // Medicines
      if (medicineResult.status === "fulfilled") {
        const data = medicineResult.value.data;

        setMedicines(
          Array.isArray(data)
            ? data
            : data?.content || data?.data || []
        );
      }

      // Inventory
      if (inventoryResult.status === "fulfilled") {
        const data = inventoryResult.value.data;

        setInventory(
          Array.isArray(data)
            ? data
            : data?.content || data?.data || []
        );
      }

      // Suppliers
      if (supplierResult.status === "fulfilled") {
        const data = supplierResult.value.data;

        setSuppliers(
          Array.isArray(data)
            ? data
            : data?.content || data?.data || []
        );
      }

      // Alerts
      if (alertResult.status === "fulfilled") {
        const data = alertResult.value.data;

        setAlerts(
          Array.isArray(data)
            ? data
            : data?.content || data?.data || []
        );
      }

      // Only show an error if all requests failed
      const allFailed = results.every(
        (result) => result.status === "rejected"
      );

      if (allFailed) {
        setError(
          "Unable to load dashboard data. Please check that the backend is running."
        );
      }
    } catch (err) {
      console.error("Pharmacist dashboard error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // --------------------------------------------------
  // Inventory calculations
  // --------------------------------------------------

  const inventoryData = useMemo(() => {
    /*
     * Different backend responses may use slightly
     * different field names. We normalize them here.
     */

    const records =
      inventory.length > 0 ? inventory : medicines;

    const getQuantity = (item) => {
      return Number(
        item.currentStock ??
          item.quantity ??
          item.stockQuantity ??
          item.availableQuantity ??
          0
      );
    };

    const getThreshold = (item) => {
      return Number(
        item.thresholdStock ??
          item.reorderLevel ??
          item.minimumStock ??
          item.minStock ??
          0
      );
    };

    const lowStock = records.filter((item) => {
      const quantity = getQuantity(item);
      const threshold = getThreshold(item);

      return threshold > 0 && quantity > 0 && quantity <= threshold;
    });

    const outOfStock = records.filter((item) => {
      return getQuantity(item) <= 0;
    });

    return {
      total: records.length,
      lowStock,
      outOfStock,
    };
  }, [inventory, medicines]);

  // --------------------------------------------------
  // Expiring medicines
  // --------------------------------------------------

  const expiringMedicines = useMemo(() => {
    const records =
      inventory.length > 0 ? inventory : medicines;

    const today = new Date();

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(
      today.getDate() + 30
    );

    return records
      .filter((item) => {
        const expiry =
          item.expiryDate ||
          item.expiry ||
          item.expirationDate;

        if (!expiry) return false;

        const expiryDate = new Date(expiry);

        return (
          !Number.isNaN(expiryDate.getTime()) &&
          expiryDate >= today &&
          expiryDate <= thirtyDaysFromNow
        );
      })
      .sort((a, b) => {
        const dateA = new Date(
          a.expiryDate ||
            a.expiry ||
            a.expirationDate
        );

        const dateB = new Date(
          b.expiryDate ||
            b.expiry ||
            b.expirationDate
        );

        return dateA - dateB;
      });
  }, [inventory, medicines]);

  // --------------------------------------------------
  // Supplier insights
  // --------------------------------------------------

  const supplierInsights = useMemo(() => {
    const activeSuppliers = suppliers.filter(
      (supplier) =>
        !supplier.status ||
        supplier.status === "ACTIVE"
    );

    const ratings = suppliers
      .map((supplier) => Number(supplier.rating))
      .filter((rating) => !Number.isNaN(rating) && rating > 0);

    const leadTimes = suppliers
      .map((supplier) => Number(supplier.leadTimeDays))
      .filter(
        (days) => !Number.isNaN(days) && days >= 0
      );

    const averageRating =
      ratings.length > 0
        ? (
            ratings.reduce(
              (sum, rating) => sum + rating,
              0
            ) / ratings.length
          ).toFixed(1)
        : "—";

    const averageLeadTime =
      leadTimes.length > 0
        ? Math.round(
            leadTimes.reduce(
              (sum, days) => sum + days,
              0
            ) / leadTimes.length
          )
        : "—";

    return {
      active: activeSuppliers.length,
      averageRating,
      averageLeadTime,
    };
  }, [suppliers]);

  // --------------------------------------------------
  // Alert calculations
  // --------------------------------------------------

  const openAlerts = useMemo(() => {
    return alerts.filter(
      (alert) =>
        alert.status === "OPEN" ||
        alert.status === "ACKNOWLEDGED"
    );
  }, [alerts]);

  const criticalAlerts = useMemo(() => {
    return openAlerts.filter(
      (alert) => alert.severity === "CRITICAL"
    );
  }, [openAlerts]);

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------

  const getMedicineName = (medicine) => {
    return (
      medicine.medicineName ||
      medicine.name ||
      medicine.medicine?.name ||
      "Unknown medicine"
    );
  };

  const getQuantity = (medicine) => {
    return (
      medicine.currentStock ??
      medicine.quantity ??
      medicine.stockQuantity ??
      medicine.availableQuantity ??
      0
    );
  };

  const getExpiryDate = (medicine) => {
    return (
      medicine.expiryDate ||
      medicine.expiry ||
      medicine.expirationDate
    );
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysUntilExpiry = (dateValue) => {
    if (!dateValue) return null;

    const today = new Date();
    const expiry = new Date(dateValue);

    if (Number.isNaN(expiry.getTime())) {
      return null;
    }

    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    return Math.ceil(
      (expiry - today) /
        (1000 * 60 * 60 * 24)
    );
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-7">
          <div className="flex min-h-[70vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

              <p className="mt-4 text-sm font-medium text-slate-500">
                Loading pharmacist dashboard...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-7 md:py-8">

        {/* ============================================
            HEADER
        ============================================ */}

        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <p className="text-sm font-medium text-blue-600">
              Pharmacist Dashboard
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-800 md:text-3xl">
              Welcome back
              {user?.name ? `, ${user.name}` : ""} 👋
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Monitor inventory, stock levels, expiry dates
              and suppliers from one place.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

            <button
              onClick={() => navigate("/add-medicine")}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus size={17} />

              Add Medicine
            </button>

          </div>
        </div>

        {/* ============================================
            ERROR
        ============================================ */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

            <AlertTriangle
              size={19}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div>
              <p className="text-sm font-semibold text-red-800">
                Dashboard data unavailable
              </p>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>
            </div>

          </div>
        )}

        {/* ============================================
            KPI CARDS
        ============================================ */}

        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* Total Medicines */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Medicines
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-800">
                  {inventoryData.total}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Medicines in inventory
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Package size={21} />
              </div>

            </div>

          </div>

          {/* Low Stock */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Low Stock
                </p>

                <p className="mt-2 text-3xl font-bold text-amber-600">
                  {inventoryData.lowStock.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Need attention
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <AlertTriangle size={21} />
              </div>

            </div>

          </div>

          {/* Expiring */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Expiring Soon
                </p>

                <p className="mt-2 text-3xl font-bold text-orange-600">
                  {expiringMedicines.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Within 30 days
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <CalendarClock size={21} />
              </div>

            </div>

          </div>

          {/* Out of Stock */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Out of Stock
                </p>

                <p className="mt-2 text-3xl font-bold text-red-600">
                  {inventoryData.outOfStock.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Immediate attention
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <XCircle size={21} />
              </div>

            </div>

          </div>

        </div>

        {/* ============================================
            MAIN GRID
        ============================================ */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          {/* ==========================================
              INVENTORY OVERVIEW
          ========================================== */}

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Boxes size={18} />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-800">
                    Inventory Overview
                  </h2>

                  <p className="text-xs text-slate-400">
                    Current stock status
                  </p>
                </div>

              </div>

              <button
                onClick={() => navigate("/inventory")}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View Inventory
                <ArrowRight size={14} />
              </button>

            </div>

            <div className="grid grid-cols-3 divide-x divide-slate-100">

              <div className="p-5 text-center">
                <p className="text-2xl font-bold text-slate-800">
                  {inventoryData.total}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Total
                </p>
              </div>

              <div className="p-5 text-center">
                <p className="text-2xl font-bold text-amber-600">
                  {inventoryData.lowStock.length}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Low Stock
                </p>
              </div>

              <div className="p-5 text-center">
                <p className="text-2xl font-bold text-red-600">
                  {inventoryData.outOfStock.length}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Out of Stock
                </p>
              </div>

            </div>

          </div>

          {/* ==========================================
              SUPPLIER INSIGHTS
          ========================================== */}

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                  <Truck size={18} />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-800">
                    Supplier Insights
                  </h2>

                  <p className="text-xs text-slate-400">
                    Supplier performance
                  </p>
                </div>

              </div>

              <button
                onClick={() => navigate("/suppliers")}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View Suppliers
                <ArrowRight size={14} />
              </button>

            </div>

            <div className="grid grid-cols-3 divide-x divide-slate-100">

              <div className="p-5 text-center">
                <p className="text-2xl font-bold text-slate-800">
                  {supplierInsights.active}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Active Suppliers
                </p>
              </div>

              <div className="p-5 text-center">
                <p className="text-2xl font-bold text-teal-600">
                  {supplierInsights.averageRating}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Avg. Rating
                </p>
              </div>

              <div className="p-5 text-center">
                <p className="text-2xl font-bold text-slate-800">
                  {supplierInsights.averageLeadTime}
                  {supplierInsights.averageLeadTime !== "—"
                    ? "d"
                    : ""}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Avg. Lead Time
                </p>
              </div>

            </div>

          </div>

          {/* ==========================================
              LOW STOCK
          ========================================== */}

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <AlertTriangle size={18} />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-800">
                    Low Stock Items
                  </h2>

                  <p className="text-xs text-slate-400">
                    Medicines requiring attention
                  </p>
                </div>

              </div>

              <button
                onClick={() => navigate("/alerts")}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View Alerts
                <ArrowRight size={14} />
              </button>

            </div>

            <div className="p-5">

              {inventoryData.lowStock.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-center">

                  <div>
                    <CheckCircle2
                      size={28}
                      className="mx-auto text-green-500"
                    />

                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      Stock levels look good
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      No medicines are currently below their threshold.
                    </p>
                  </div>

                </div>
              ) : (
                <div className="space-y-3">

                  {inventoryData.lowStock
                    .slice(0, 5)
                    .map((medicine, index) => {

                      const quantity =
                        getQuantity(medicine);

                      return (
                        <div
                          key={
                            medicine.id ||
                            medicine.medicineId ||
                            index
                          }
                          className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
                        >

                          <div className="flex min-w-0 items-center gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-amber-600">
                              <Package size={17} />
                            </div>

                            <div className="min-w-0">

                              <p className="truncate text-sm font-semibold text-slate-700">
                                {getMedicineName(
                                  medicine
                                )}
                              </p>

                              <p className="text-xs text-slate-400">
                                Stock requires attention
                              </p>

                            </div>

                          </div>

                          <div className="ml-3 text-right">

                            <p className="text-sm font-bold text-amber-600">
                              {quantity}
                            </p>

                            <p className="text-[11px] text-slate-400">
                              units
                            </p>

                          </div>

                        </div>
                      );
                    })}

                </div>
              )}

            </div>

          </div>

          {/* ==========================================
              EXPIRING MEDICINES
          ========================================== */}

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                  <Clock size={18} />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-800">
                    Expiring Medicines
                  </h2>

                  <p className="text-xs text-slate-400">
                    Expiring within 30 days
                  </p>
                </div>

              </div>

              <button
                onClick={() =>
                  navigate("/expiry-analytics")
                }
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View Expiry
                <ArrowRight size={14} />
              </button>

            </div>

            <div className="p-5">

              {expiringMedicines.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-center">

                  <div>

                    <CheckCircle2
                      size={28}
                      className="mx-auto text-green-500"
                    />

                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      No medicines expiring soon
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Nothing requires expiry attention within 30 days.
                    </p>

                  </div>

                </div>
              ) : (
                <div className="space-y-3">

                  {expiringMedicines
                    .slice(0, 5)
                    .map((medicine, index) => {

                      const expiry =
                        getExpiryDate(medicine);

                      const days =
                        getDaysUntilExpiry(expiry);

                      return (
                        <div
                          key={
                            medicine.id ||
                            medicine.medicineId ||
                            index
                          }
                          className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
                        >

                          <div className="flex min-w-0 items-center gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-orange-600">
                              <CalendarClock size={17} />
                            </div>

                            <div className="min-w-0">

                              <p className="truncate text-sm font-semibold text-slate-700">
                                {getMedicineName(
                                  medicine
                                )}
                              </p>

                              <p className="text-xs text-slate-400">
                                Expires {formatDate(expiry)}
                              </p>

                            </div>

                          </div>

                          <div className="ml-3 shrink-0 text-right">

                            <p
                              className={`text-sm font-bold ${
                                days !== null &&
                                days <= 7
                                  ? "text-red-600"
                                  : "text-orange-600"
                              }`}
                            >
                              {days !== null
                                ? `${days}d`
                                : "—"}
                            </p>

                            <p className="text-[11px] text-slate-400">
                              remaining
                            </p>

                          </div>

                        </div>
                      );
                    })}

                </div>
              )}

            </div>

          </div>

        </div>

        {/* ============================================
            PURCHASE SUMMARY
        ============================================ */}

        <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <ShoppingCart size={18} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-800">
                  Purchase Summary
                </h2>

                <p className="text-xs text-slate-400">
                  Purchase workflow overview
                </p>
              </div>

            </div>

          </div>

          <div className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">

            <div>
              <p className="text-sm font-medium text-slate-700">
                Purchase management
              </p>

              <p className="mt-1 max-w-xl text-sm text-slate-500">
                Use the purchase workflow to manage medicine
                procurement and supplier orders.
              </p>
            </div>

            <button
              onClick={() => navigate("/purchases")}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <ShoppingCart size={16} />
              View Purchases
              <ArrowRight size={15} />
            </button>

          </div>

        </div>

        {/* ============================================
            ALERT SUMMARY
        ============================================ */}

        <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <Bell size={18} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-800">
                  Alerts & Notifications
                </h2>

                <p className="text-xs text-slate-400">
                  Items requiring your attention
                </p>
              </div>

            </div>

            <button
              onClick={() => navigate("/alerts")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View All
              <ArrowRight size={14} />
            </button>

          </div>

          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">

            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">

              <div className="flex items-center justify-between">

                <p className="text-sm font-medium text-slate-500">
                  Open Alerts
                </p>

                <Bell
                  size={17}
                  className="text-red-500"
                />

              </div>

              <p className="mt-2 text-2xl font-bold text-slate-800">
                {openAlerts.length}
              </p>

            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">

              <div className="flex items-center justify-between">

                <p className="text-sm font-medium text-slate-500">
                  Critical
                </p>

                <AlertTriangle
                  size={17}
                  className="text-red-500"
                />

              </div>

              <p className="mt-2 text-2xl font-bold text-red-600">
                {criticalAlerts.length}
              </p>

            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">

              <div className="flex items-center justify-between">

                <p className="text-sm font-medium text-slate-500">
                  Status
                </p>

                <CheckCircle2
                  size={17}
                  className="text-green-500"
                />

              </div>

              <p className="mt-2 text-sm font-semibold text-green-600">
                {criticalAlerts.length === 0
                  ? "No critical alerts"
                  : "Attention required"}
              </p>

            </div>

          </div>

        </div>

        {/* ============================================
            QUICK ACTIONS
        ============================================ */}

        <div className="mt-6">

          <h2 className="mb-3 text-sm font-semibold text-slate-700">
            Quick Actions
          </h2>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">

            <button
              onClick={() =>
                navigate("/add-medicine")
              }
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <Plus size={17} />
              Add Medicine
            </button>

            <button
              onClick={() =>
                navigate("/inventory")
              }
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <Package size={17} />
              Inventory
            </button>

            <button
              onClick={() =>
                navigate("/expiry-analytics")
              }
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
            >
              <CalendarClock size={17} />
              Expiry
            </button>

            <button
              onClick={() =>
                navigate("/suppliers")
              }
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
            >
              <Truck size={17} />
              Suppliers
            </button>

            <button
              onClick={() =>
                navigate("/alerts")
              }
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              <Bell size={17} />
              Alerts
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};

export default PharmacistDashboard;