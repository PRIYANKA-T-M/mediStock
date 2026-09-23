import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Boxes,
  ChartNoAxesCombined,
  ClipboardList,
  FileText,
  Package,
  Plus,
  Truck,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import authFetch from "../services/authFetch";
import { useAuth } from "../context/useAuth";
import { getDaysUntilExpiry } from "../utils/expiryUtils";

const API_URL = "http://localhost:8082/api";

const MainDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      };

      try {
        const [medicineResponse, inventoryResponse] = await Promise.all([
          authFetch(`${API_URL}/medicines`, {
            method: "GET",
            headers,
          }),
          authFetch(`${API_URL}/inventory`, {
            method: "GET",
            headers,
          }),
        ]);

        if (!medicineResponse.ok) {
          throw new Error("Medicine API unavailable");
        }

        const medicineData = await medicineResponse.json();
        const inventoryData = inventoryResponse.ok
          ? await inventoryResponse.json()
          : [];

        setMedicines(Array.isArray(medicineData) ? medicineData : []);
        setInventory(Array.isArray(inventoryData) ? inventoryData : []);
      } catch (err) {
        console.error(err);
        setError(
          "Some dashboard data could not be loaded. Please check the backend."
        );
        setMedicines([]);
        setInventory([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user?.token]);

  const quantityFor = (medicineId) => {
    const item = inventory.find(
      (entry) => entry.medicineId === medicineId
    );

    return item?.quantity ?? 0;
  };

  const stats = useMemo(() => {
    const totalStock = medicines.reduce(
      (sum, medicine) => sum + quantityFor(medicine.id),
      0
    );

    const lowStock = medicines.filter((medicine) => {
      const quantity = quantityFor(medicine.id);

      return (
        quantity > 0 &&
        medicine.reorderLevel != null &&
        quantity <= medicine.reorderLevel
      );
    }).length;

    const outOfStock = medicines.filter(
      (medicine) => quantityFor(medicine.id) === 0
    ).length;

    const datedMedicines = medicines.filter(
      (medicine) => medicine.expiryDate
    );

    const expired = datedMedicines.filter(
      (medicine) => getDaysUntilExpiry(medicine.expiryDate) < 0
    ).length;

    const expiringSoon = datedMedicines.filter((medicine) => {
      const days = getDaysUntilExpiry(medicine.expiryDate);
      return days >= 0 && days <= 30;
    }).length;

    return {
      totalStock,
      lowStock,
      outOfStock,
      expired,
      expiringSoon,
    };
  }, [medicines, inventory]);

  const categoryData = useMemo(() => {
    const map = {};

    medicines.forEach((medicine) => {
      const category = medicine.category || "Uncategorized";

      map[category] =
        (map[category] || 0) + quantityFor(medicine.id);
    });

    return Object.entries(map).map(([category, stock]) => ({
      category,
      stock,
    }));
  }, [medicines, inventory]);

  const expiryData = [
    {
      name: "Expired",
      value: stats.expired,
    },
    {
      name: "Expiring Soon",
      value: stats.expiringSoon,
    },
    {
      name: "Safe",
      value: Math.max(
        medicines.filter((m) => m.expiryDate).length -
          stats.expired -
          stats.expiringSoon,
        0
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <main className="min-w-0 flex-1 px-4 py-6 md:px-7 md:py-8">
        <header className="mb-6 flex flex-col items-start justify-between gap-5 md:flex-row md:items-start">
          <div>
            <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-blue-600">MEDICAL INVENTORY MANAGEMENT</p>

            <h1>Dashboard</h1>

            <p className="mt-1.5 text-sm text-slate-500">
              Welcome back, {user?.name || "User"}. Here is your inventory
              overview.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <button
              className="relative grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
              onClick={() => navigate("/alerts")}
              title="Alerts"
            >
              <Bell size={20} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
            </button>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-100 font-extrabold text-blue-600">
                {(user?.name || "U").charAt(0).toUpperCase()}
              </div>

              <div>
                <strong>{user?.name || "User"}</strong>
                <span>{user?.role || "USER"}</span>
              </div>
            </div>
          </div>
        </header>

        {error && <div className="mb-5 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-xs text-orange-800">{error}</div>}

        <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm [&_.grid h-11 w-11 place-items-center rounded-xl]:bg-blue-50 [&_.grid h-11 w-11 place-items-center rounded-xl]:text-blue-600">
            <div className="grid h-11 w-11 place-items-center rounded-xl">
              <Package size={21} />
            </div>

            <div>
              <span>Total Medicines</span>
              <strong>{loading ? "—" : medicines.length}</strong>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm [&_.grid h-11 w-11 place-items-center rounded-xl]:bg-cyan-50 [&_.grid h-11 w-11 place-items-center rounded-xl]:text-cyan-600">
            <div className="grid h-11 w-11 place-items-center rounded-xl">
              <Boxes size={21} />
            </div>

            <div>
              <span>Available Stock</span>
              <strong>{loading ? "—" : stats.totalStock}</strong>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm [&_.grid h-11 w-11 place-items-center rounded-xl]:bg-amber-50 [&_.grid h-11 w-11 place-items-center rounded-xl]:text-amber-600">
            <div className="grid h-11 w-11 place-items-center rounded-xl">
              <TriangleAlert size={21} />
            </div>

            <div>
              <span>Low Stock</span>
              <strong>{loading ? "—" : stats.lowStock}</strong>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm [&_.grid h-11 w-11 place-items-center rounded-xl]:bg-red-50 [&_.grid h-11 w-11 place-items-center rounded-xl]:text-red-600">
            <div className="grid h-11 w-11 place-items-center rounded-xl">
              <XCircle size={21} />
            </div>

            <div>
              <span>Out of Stock</span>
              <strong>{loading ? "—" : stats.outOfStock}</strong>
            </div>
          </div>
        </section>

        <section className="mb-5 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center">
          <div>
            <h2>Quick Actions</h2>
            <p>Access the most-used inventory tasks.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/add-medicine"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 no-underline transition hover:bg-slate-50 border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus size={18} />
              Add Medicine
            </Link>

            <Link
              to="/inventory"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 no-underline transition hover:bg-slate-50"
            >
              <Boxes size={18} />
              View Inventory
            </Link>

            <Link
              to="/suppliers"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 no-underline transition hover:bg-slate-50"
            >
              <Truck size={18} />
              Suppliers
            </Link>

            <Link
              to="/expiry-analytics"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 no-underline transition hover:bg-slate-50"
            >
              <ChartNoAxesCombined size={18} />
              Expiry Analytics
            </Link>
          </div>
        </section>

        <section className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm chart-panel">
            <div className="mb-3 flex items-start justify-between gap-3 [&_h2]:m-0 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-slate-900 [&_p]:mt-1 [&_p]:text-xs [&_p]:text-slate-500 [&_a]:text-xs [&_a]:font-bold [&_a]:text-blue-600 [&_a]:no-underline">
              <div>
                <h2>Stock by Category</h2>
                <p>Current quantity across medicine categories</p>
              </div>

              <Link to="/inventory">View inventory</Link>
            </div>

            {categoryData.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={categoryData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -20,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="stock"
                    fill="#2563eb"
                    radius={[7, 7, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-[280px] place-items-center rounded-xl bg-slate-50 text-xs text-slate-400">
                No inventory data available.
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm chart-panel">
            <div className="mb-3 flex items-start justify-between gap-3 [&_h2]:m-0 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-slate-900 [&_p]:mt-1 [&_p]:text-xs [&_p]:text-slate-500 [&_a]:text-xs [&_a]:font-bold [&_a]:text-blue-600 [&_a]:no-underline">
              <div>
                <h2>Expiry Overview</h2>
                <p>
                  Based only on medicines with an actual expiry date
                </p>
              </div>

              <Link to="/expiry-analytics">
                Open analytics
              </Link>
            </div>

            {expiryData.some((item) => item.value > 0) ? (
              <div className="flex min-h-[250px] items-center">
                <ResponsiveContainer width="58%" height={250}>
                  <PieChart>
                    <Pie
                      data={expiryData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={68}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {expiryData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={
                            ["#dc2626", "#f59e0b", "#16a34a"][
                              index
                            ]
                          }
                        />
                      ))}
                    </Pie>

                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="flex-1 [&_div]:my-3 [&_div]:grid [&_div]:grid-cols-[10px_1fr_auto] [&_div]:items-center [&_div]:gap-2 [&_div]:text-xs [&_span]:text-slate-500 [&_strong]:text-slate-900 [&_i]:h-2 [&_i]:w-2 [&_i]:rounded-full">
                  {expiryData.map((item, index) => (
                    <div key={item.name}>
                      <i
                        style={{
                          background: [
                            "#dc2626",
                            "#f59e0b",
                            "#16a34a",
                          ][index],
                        }}
                      />

                      <span>{item.name}</span>

                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid h-[280px] place-items-center rounded-xl bg-slate-50 text-xs text-slate-400">
                No expiry dates have been provided yet.
              </div>
            )}
          </div>
        </section>

        <section className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm attention-panel">
            <div className="mb-3 flex items-start justify-between gap-3 [&_h2]:m-0 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-slate-900 [&_p]:mt-1 [&_p]:text-xs [&_p]:text-slate-500 [&_a]:text-xs [&_a]:font-bold [&_a]:text-blue-600 [&_a]:no-underline">
              <div>
                <h2>Needs Attention</h2>
                <p>Items that may need action</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 [&_button]:flex [&_button]:items-center [&_button]:gap-2 [&_button]:rounded-lg [&_button]:border [&_button]:border-slate-200 [&_button]:bg-slate-50 [&_button]:p-3 [&_button]:text-left [&_button]:text-slate-600 [&_button]:transition [&_button]:hover:bg-slate-100 [&_button_span]:flex-1 [&_button_span]:text-xs [&_button_strong]:text-xs [&_button_strong]:text-slate-900">
              {stats.outOfStock > 0 && (
                <button onClick={() => navigate("/inventory")}>
                  <XCircle size={18} />
                  <span>Out-of-stock medicines</span>
                  <strong>{stats.outOfStock}</strong>
                </button>
              )}

              {stats.lowStock > 0 && (
                <button onClick={() => navigate("/inventory")}>
                  <TriangleAlert size={18} />
                  <span>Low-stock medicines</span>
                  <strong>{stats.lowStock}</strong>
                </button>
              )}

              {stats.expired > 0 && (
                <button
                  onClick={() => navigate("/expiry-analytics")}
                >
                  <XCircle size={18} />
                  <span>Expired medicines</span>
                  <strong>{stats.expired}</strong>
                </button>
              )}

              {stats.expiringSoon > 0 && (
                <button
                  onClick={() => navigate("/expiry-analytics")}
                >
                  <Bell size={18} />
                  <span>Expiring within 30 days</span>
                  <strong>{stats.expiringSoon}</strong>
                </button>
              )}

              {!stats.outOfStock &&
                !stats.lowStock &&
                !stats.expired &&
                !stats.expiringSoon && (
                  <div className="flex items-center gap-2 px-2 py-6 text-xs text-slate-500">
                    <ClipboardList size={20} />
                    <span>
                      No current alerts based on available data.
                    </span>
                  </div>
                )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm modules-panel">
            <div className="mb-3 flex items-start justify-between gap-3 [&_h2]:m-0 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-slate-900 [&_p]:mt-1 [&_p]:text-xs [&_p]:text-slate-500 [&_a]:text-xs [&_a]:font-bold [&_a]:text-blue-600 [&_a]:no-underline">
              <div>
                <h2>Management Modules</h2>
                <p>More areas of the MediStock system</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 [&_a]:flex [&_a]:flex-col [&_a]:gap-1 [&_a]:rounded-xl [&_a]:border [&_a]:border-slate-200 [&_a]:bg-slate-50 [&_a]:p-3 [&_a]:text-blue-600 [&_a]:no-underline [&_a]:hover:border-blue-200 [&_a]:hover:bg-blue-50 [&_a_span]:text-xs [&_a_span]:font-extrabold [&_a_span]:text-slate-900 [&_a_small]:text-[10px] [&_a_small]:text-slate-500">
              <Link to="/suppliers">
                <Truck size={20} />
                <span>Supplier Management</span>
                <small>Manage suppliers</small>
              </Link>

              <Link to="/alerts">
                <Bell size={20} />
                <span>Alerts & Notifications</span>
                <small>Review alerts</small>
              </Link>

              <Link to="/reports">
                <FileText size={20} />
                <span>Reports</span>
                <small>View reports</small>
              </Link>

              <Link to="/expiry-analytics">
                <ChartNoAxesCombined size={20} />
                <span>Analytics</span>
                <small>Expiry & stock insights</small>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MainDashboard;