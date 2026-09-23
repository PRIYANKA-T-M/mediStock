import authFetch from "../services/authFetch";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

import ExpirySummaryCards from "../components/expiry/ExpirySummaryCards";
import InventoryAnalyticsCards from "../components/expiry/InventoryAnalyticsCards";
import ExpiryFilters from "../components/expiry/ExpiryFilters";
import ExpiryTable from "../components/expiry/ExpiryTable";
import ExpiryCharts from "../components/expiry/ExpiryCharts";

import { EXPIRY_STATUS, getExpiryStatus } from "../utils/expiryUtils";

const API_URL = "http://localhost:8082/api";

// Milestone 3 Frontend 1 — Expiry + Inventory Analytics UI.
// Uses only data returned by the backend. No expiry dates or batch numbers are generated on the frontend.
const ExpiryAnalytics = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [rawMedicines, setRawMedicines] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    useEffect(() => {
        const getHeaders = () => ({
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
        });

        const loadMedicines = async () => {
            setLoading(true);

            try {
                // Fetch medicines and inventory in parallel, same as
                // MedicineDashboard, so real stock quantities are shown
                // instead of always falling back to 0.
                const [medicinesResponse, inventoryResponse] = await Promise.all([
                    authFetch(`${API_URL}/medicines`, {
                        method: "GET",
                        headers: getHeaders(),
                    }),
                    authFetch(`${API_URL}/inventory`, {
                        method: "GET",
                        headers: getHeaders(),
                    }),
                ]);

                if (!medicinesResponse.ok) {
                    throw new Error(`Medicine API failed: ${medicinesResponse.status}`);
                }

                const medicinesData = await medicinesResponse.json();

                if (!Array.isArray(medicinesData) || medicinesData.length === 0) {
                    throw new Error("No medicines returned");
                }

                // Inventory is optional — if it fails, quantities just
                // stay at 0 rather than the whole page falling back to mock.
                let inventoryData = [];

                if (inventoryResponse.ok) {
                    inventoryData = await inventoryResponse.json();
                }

                const getQuantity = (medicineId) => {
                    const item = inventoryData.find(
                        (inventoryItem) => inventoryItem.medicineId === medicineId
                    );
                    return item ? item.quantity : 0;
                };

                const medicinesWithStock = medicinesData.map((medicine) => ({
                    ...medicine,
                    quantity: getQuantity(medicine.id),
                }));

                setRawMedicines(medicinesWithStock);

            } catch (error) {
                console.error("Unable to load expiry data:", error);
                setRawMedicines([]);

            } finally {
                setLoading(false);
            }
        };

        if (user?.token) {
            loadMedicines();
        } else {
            setRawMedicines([]);
            setLoading(false);
        }
    }, [user?.token]);

    // Attach computed expiry status to every medicine.
    const medicinesWithStatus = useMemo(
        () =>
            rawMedicines.map((medicine) => ({
                ...medicine,
                status: getExpiryStatus(medicine.expiryDate),
            })),
        [rawMedicines]
    );

    const categories = useMemo(
        () =>
            Array.from(
                new Set(medicinesWithStatus.map((m) => m.category).filter(Boolean))
            ).sort(),
        [medicinesWithStatus]
    );

    const filteredMedicines = useMemo(() => {
        return medicinesWithStatus.filter((medicine) => {
            const matchesSearch = medicine.name
                .toLowerCase()
                .includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === "" || medicine.status === statusFilter;

            const matchesCategory =
                categoryFilter === "" || medicine.category === categoryFilter;

            return matchesSearch && matchesStatus && matchesCategory;
        });
    }, [medicinesWithStatus, search, statusFilter, categoryFilter]);

    const handleResetFilters = () => {
        setSearch("");
        setStatusFilter("");
        setCategoryFilter("");
    };

    // Summary + chart data is based on the FULL dataset (not the filtered
    // table), so the dashboard always reflects the overall inventory.
    const summary = useMemo(() => {
        const total = medicinesWithStatus.length;

        const expired = medicinesWithStatus.filter(
            (m) => m.status === EXPIRY_STATUS.EXPIRED
        ).length;

        const expiringSoon = medicinesWithStatus.filter(
            (m) => m.status === EXPIRY_STATUS.EXPIRING_SOON
        ).length;

        const safe = medicinesWithStatus.filter(
            (m) => m.status === EXPIRY_STATUS.SAFE
        ).length;

        return { total, expired, expiringSoon, safe };
    }, [medicinesWithStatus]);

    const categoryCounts = useMemo(() => {
        const counts = {};

        medicinesWithStatus.forEach((medicine) => {
            const key = medicine.category || "Uncategorized";
            counts[key] = (counts[key] || 0) + 1;
        });

        return Object.entries(counts).map(([category, count]) => ({
            category,
            count,
        }));
    }, [medicinesWithStatus]);

    // Inventory-focused metrics (distinct from the expiry-status summary
    // above) — total stock on hand, category spread, bg-amber-100 text-amber-700 items,
    // and an overall "needs attention" count (expired + expiring soon).
    const inventoryStats = useMemo(() => {
        const totalStockQuantity = medicinesWithStatus.reduce(
            (sum, m) => sum + (Number(m.quantity) || 0),
            0
        );

        const categoriesTracked = categories.length;

        const lowStockCount = medicinesWithStatus.filter(
            (m) =>
                m.reorderLevel !== undefined &&
                m.reorderLevel !== null &&
                Number(m.quantity) <= Number(m.reorderLevel)
        ).length;

        const needsAttentionCount = summary.expired + summary.expiringSoon;

        return {
            totalStockQuantity,
            categoriesTracked,
            lowStockCount,
            needsAttentionCount,
        };
    }, [medicinesWithStatus, categories, summary]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 text-left">

            <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-5 md:px-8">
                <div>
                    <h1>MediStock</h1>
                    <p>Expiry + Inventory Analytics</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span>Welcome, {user?.name}</span>
                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-600">{user?.role}</span>
                    <button onClick={logout} className="rounded-lg border-0 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
                        Logout
                    </button>
                </div>
            </header>

            <main className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8">

                <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h2>Expiry Dashboard</h2>
                        <p>Track medicine expiry status and inventory analytics</p>
                    </div>

                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                        <button
                            className="rounded-lg border-0 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
                            onClick={() => navigate("/medicines")}
                        >
                            💊 Medicines
                        </button>

                        <button
                            className="rounded-lg border-0 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
                            onClick={() => navigate("/inventory")}
                        >
                            📦 Inventory
                        </button>
                    </div>
                </div>

                {loading ? (
                    <p>Loading expiry data...</p>
                ) : (
                    <>
                        <ExpirySummaryCards
                            total={summary.total}
                            expired={summary.expired}
                            expiringSoon={summary.expiringSoon}
                            safe={summary.safe}
                        />

                        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6 mb-6">
                            <div className="mb-4 [&_h2]:m-0 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900 [&_p]:mt-1 [&_p]:text-sm [&_p]:text-slate-500">
                                <div>
                                    <h2>Inventory Analytics</h2>
                                    <p>Overview of medicines by expiry status and category</p>
                                </div>
                            </div>

                            <InventoryAnalyticsCards
                                totalStockQuantity={inventoryStats.totalStockQuantity}
                                categoriesTracked={inventoryStats.categoriesTracked}
                                lowStockCount={inventoryStats.lowStockCount}
                                needsAttentionCount={inventoryStats.needsAttentionCount}
                            />

                            <ExpiryCharts
                                statusCounts={{
                                    expired: summary.expired,
                                    expiringSoon: summary.expiringSoon,
                                    safe: summary.safe,
                                }}
                                categoryCounts={categoryCounts}
                            />
                        </section>

                        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                            <div className="mb-4 [&_h2]:m-0 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900 [&_p]:mt-1 [&_p]:text-sm [&_p]:text-slate-500">
                                <div>
                                    <h2>Expiry Table</h2>
                                    <p>Search and filter medicines by expiry status</p>
                                </div>
                            </div>

                            <ExpiryFilters
                                search={search}
                                onSearchChange={setSearch}
                                statusFilter={statusFilter}
                                onStatusChange={setStatusFilter}
                                categoryFilter={categoryFilter}
                                onCategoryChange={setCategoryFilter}
                                categories={categories}
                                onReset={handleResetFilters}
                            />

                            <ExpiryTable medicines={filteredMedicines} />
                        </section>
                    </>
                )}

            </main>

        </div>
    );
};

export default ExpiryAnalytics;
