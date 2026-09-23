import authFetch from "../services/authFetch";
import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import MedicineList from "./MedicineList";

const API_URL = "http://localhost:8082/api";

const MedicineDashboard = () => {

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [medicines, setMedicines] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const getHeaders = () => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`
    });

    const fetchMedicines = async () => {

        const response = await authFetch(
            `${API_URL}/medicines`,
            {
                method: "GET",
                headers: getHeaders()
            }
        );

        if (!response.ok) {
            throw new Error(`Medicine API failed: ${response.status}`);
        }

        return await response.json();
    };

    const fetchInventory = async () => {

        const response = await authFetch(
            `${API_URL}/inventory`,
            {
                method: "GET",
                headers: getHeaders()
            }
        );

        if (!response.ok) {
            throw new Error(`Inventory API failed: ${response.status}`);
        }

        return await response.json();
    };

    const loadData = async () => {

        try {

            setLoading(true);
            setError("");

            const [medicineData, inventoryData] = await Promise.all([
                fetchMedicines(),
                fetchInventory()
            ]);

            setMedicines(medicineData);
            setInventory(inventoryData);

        } catch (error) {

            console.error("Error loading data:", error);

            setError(
                "Unable to load medicines. Please check the backend and authorization token."
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        if (user?.token) {
            loadData();
        } else {
            setLoading(false);
            setError("Authorization token is missing.");
        }

    }, [user?.token]);


    const getQuantity = (medicineId) => {

        const item = inventory.find(
            (inventoryItem) =>
                inventoryItem.medicineId === medicineId
        );

        return item ? item.quantity : 0;
    };


    const medicinesWithStock = medicines.map((medicine) => ({
        ...medicine,
        quantity: getQuantity(medicine.id)
    }));


    const totalMedicines = medicinesWithStock.length;

    const availableStock = medicinesWithStock.filter(
        (medicine) => medicine.quantity > 10
    ).length;

    const lowStock = medicinesWithStock.filter(
        (medicine) =>
            medicine.quantity > 0 &&
            medicine.quantity <= 10
    ).length;

    const outOfStock = medicinesWithStock.filter(
        (medicine) => medicine.quantity === 0
    ).length;


    const handleDelete = async (id) => {

        const medicine = medicines.find(
            (item) => item.id === id
        );

        if (!medicine) {
            return;
        }

        const confirmDelete = window.confirm(
            `Are you sure you want to delete ${medicine.name}?`
        );

        if (!confirmDelete) {
            return;
        }

        try {

            const response = await authFetch(
                `${API_URL}/medicines/${id}`,
                {
                    method: "DELETE",
                    headers: getHeaders()
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Delete failed: ${response.status}`
                );
            }

            setMedicines((currentMedicines) =>
                currentMedicines.filter(
                    (item) => item.id !== id
                )
            );

            setInventory((currentInventory) =>
                currentInventory.filter(
                    (item) => item.medicineId !== id
                )
            );

        } catch (error) {

            console.error("Error deleting medicine:", error);

            alert("Failed to delete medicine.");
        }
    };


    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 text-left">

            <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-5 md:px-8">

                <div>
                    <h1>MediStock</h1>
                    <p>Medicine Inventory Management</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm">

                    <span>
                        Welcome, {user?.name}
                    </span>

                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-600">
                        {user?.role}
                    </span>

                    <button
                        onClick={logout}
                        className="rounded-lg border-0 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                        Logout
                    </button>

                </div>

            </header>


            <main className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8">

                <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">

                    <div>
                        <h2>Medicine Dashboard</h2>

                        <p>
                            Monitor and manage your medicine inventory
                        </p>
                    </div>

                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">

                        <button
                            className="rounded-lg border-0 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
                            onClick={() => navigate("/inventory")}
                        >
                            📦 Inventory
                        </button>

                        <button
                            className="rounded-lg border-0 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
                            onClick={() => navigate("/expiry-analytics")}
                        >
                            📊 Expiry Analytics
                        </button>

                        <button
                            className="inline-flex items-center justify-center rounded-lg border-0 bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            onClick={() => navigate("/add-medicine")}
                        >
                            + Add Medicine
                        </button>

                    </div>

                </div>


                <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">💊</div>

                        <div>
                            <p>Total Medicines</p>
                            <h3>{totalMedicines}</h3>
                        </div>
                    </div>


                    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">📦</div>

                        <div>
                            <p>Available Stock</p>
                            <h3>{availableStock}</h3>
                        </div>
                    </div>


                    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">⚠️</div>

                        <div>
                            <p>Low Stock</p>
                            <h3>{lowStock}</h3>
                        </div>
                    </div>


                    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">❌</div>

                        <div>
                            <p>Out of Stock</p>
                            <h3>{outOfStock}</h3>
                        </div>
                    </div>

                </div>


                {loading && (
                    <p>Loading medicines...</p>
                )}


                {error && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-red-600">
                        {error}
                    </p>
                )}


                {!loading && !error && (
                    <MedicineList
                        medicines={medicinesWithStock}
                        onDelete={handleDelete}
                        onRefresh={loadData}
                    />
                )}

            </main>

        </div>
    );
};

export default MedicineDashboard;