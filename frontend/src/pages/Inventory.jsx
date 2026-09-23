import authFetch from "../services/authFetch";
import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8082/api";

const Inventory = () => {

    const { user } = useAuth();
    const navigate = useNavigate();

    const [inventory, setInventory] = useState([]);
    const [medicines, setMedicines] = useState([]);

    const [search, setSearch] = useState("");
    const [stockFilter, setStockFilter] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showAddForm, setShowAddForm] = useState(false);

    const [newInventory, setNewInventory] = useState({
        medicineId: "",
        quantity: ""
    });

    const getHeaders = () => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`
    });


    // =========================
    // GET ALL INVENTORY
    // =========================

    const fetchInventory = async () => {

        try {

            const response = await authFetch(
                `${API_URL}/inventory`,
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Inventory API failed: ${response.status}`
                );
            }

            const data = await response.json();

            setInventory(data);

        } catch (error) {

            console.error(
                "Error fetching inventory:",
                error
            );

            setError(
                "Unable to load inventory from the server."
            );
        }
    };


    // =========================
    // GET MEDICINES
    // Used for Add Inventory
    // =========================

    const fetchMedicines = async () => {

        try {

            const response = await authFetch(
                `${API_URL}/medicines`,
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Medicine API failed: ${response.status}`
                );
            }

            const data = await response.json();

            setMedicines(data);

        } catch (error) {

            console.error(
                "Error fetching medicines:",
                error
            );
        }
    };


    // =========================
    // LOAD DATA
    // =========================

    const loadData = async () => {

        try {

            setLoading(true);
            setError("");

            await Promise.all([
                fetchInventory(),
                fetchMedicines()
            ]);

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


    // =========================
    // UPDATE STOCK
    // =========================

    const updateStock = async (inventoryId, currentQuantity, change) => {

        const newQuantity =
            currentQuantity + change;

        if (newQuantity < 0) {
            return;
        }

        try {

            const response = await authFetch(
                `${API_URL}/inventory/${inventoryId}/stock`,
                {
                    method: "PUT",

                    headers: getHeaders(),

                    body: JSON.stringify({
                        quantity: newQuantity
                    })
                }
            );


            if (!response.ok) {

                const errorText =
                    await response.text();

                throw new Error(
                    errorText ||
                    `Stock update failed: ${response.status}`
                );
            }


            const updatedInventory =
                await response.json();


            setInventory((currentInventory) =>
                currentInventory.map((item) =>
                    item.id === inventoryId
                        ? updatedInventory
                        : item
                )
            );


        } catch (error) {

            console.error(
                "Error updating stock:",
                error
            );

            alert(
                "Failed to update stock."
            );
        }
    };


    // =========================
    // ADD INVENTORY
    // =========================

    const handleAddInventory = async (e) => {

        e.preventDefault();

        if (
            !newInventory.medicineId ||
            newInventory.quantity === ""
        ) {
            alert("Please select a medicine and enter quantity.");
            return;
        }


        try {

            const response = await authFetch(
                `${API_URL}/inventory`,
                {
                    method: "POST",

                    headers: getHeaders(),

                    body: JSON.stringify({
                        medicineId: Number(
                            newInventory.medicineId
                        ),

                        quantity: Number(
                            newInventory.quantity
                        )
                    })
                }
            );


            if (!response.ok) {

                const errorText =
                    await response.text();

                throw new Error(
                    errorText ||
                    `Add inventory failed: ${response.status}`
                );
            }


            const addedInventory =
                await response.json();


            setInventory((currentInventory) => [
                ...currentInventory,
                addedInventory
            ]);


            setNewInventory({
                medicineId: "",
                quantity: ""
            });

            setShowAddForm(false);


        } catch (error) {

            console.error(
                "Error adding inventory:",
                error
            );

            alert(
                "Failed to add inventory."
            );
        }
    };


    // =========================
    // FILTER INVENTORY
    // =========================

    const filteredInventory =
        inventory.filter((item) => {

            const matchesSearch =
                item.medicineName
                    ?.toLowerCase()
                    .includes(
                        search.toLowerCase()
                    );


            const matchesStock =
                stockFilter === "" ||
                item.status === stockFilter;


            return (
                matchesSearch &&
                matchesStock
            );
        });


    // =========================
    // DASHBOARD COUNTS
    // =========================

    const totalItems =
        inventory.length;

    const availableStock =
        inventory.filter(
            (item) => item.status === "IN_STOCK"
        ).length;

    const lowStock =
        inventory.filter(
            (item) => item.status === "LOW_STOCK"
        ).length;

    const outOfStock =
        inventory.filter(
            (item) => item.status === "OUT_OF_STOCK"
        ).length;


    // =========================
    // STATUS DISPLAY
    // =========================

    const getStatusText = (status) => {

        if (status === "IN_STOCK") {
            return "Available";
        }

        if (status === "LOW_STOCK") {
            return "Low Stock";
        }

        if (status === "OUT_OF_STOCK") {
            return "Out of Stock";
        }

        return status;
    };


    const getStatusClass = (status) => {

        if (status === "IN_STOCK") {
            return "bg-green-100 text-green-700";
        }

        if (status === "LOW_STOCK") {
            return "bg-amber-100 text-amber-700";
        }

        if (status === "OUT_OF_STOCK") {
            return "bg-red-100 text-red-600";
        }

        return "";
    };


    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 text-left">

            {/* ================= HEADER ================= */}

            <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-5 md:px-8">

                <div>

                    <h1>MediStock</h1>

                    <p>
                        Medicine Inventory Management
                    </p>

                </div>


                <div className="flex flex-wrap items-center gap-3 text-sm">

                    <span>
                        Welcome, {user?.name}
                    </span>

                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-600">
                        {user?.role}
                    </span>

                    <button
                        onClick={() =>
                            navigate("/medicines")
                        }
                        className="rounded-lg border-0 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                        Back to Medicines
                    </button>

                </div>

            </header>


            {/* ================= MAIN ================= */}

            <main className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8">

                <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">

                    <div>

                        <h2>
                            Inventory Management
                        </h2>

                        <p>
                            Monitor and manage medicine stock
                        </p>

                    </div>


                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">

                        <button
                            className="inline-flex items-center justify-center rounded-lg border-0 bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            onClick={() =>
                                setShowAddForm(
                                    !showAddForm
                                )
                            }
                        >
                            + Add Inventory
                        </button>

                    </div>

                </div>


                {/* ================= STATS ================= */}

                <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">
                            📦
                        </div>

                        <div>

                            <p>
                                Total Items
                            </p>

                            <h3>
                                {totalItems}
                            </h3>

                        </div>

                    </div>


                    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">
                            ✅
                        </div>

                        <div>

                            <p>
                                Available Stock
                            </p>

                            <h3>
                                {availableStock}
                            </h3>

                        </div>

                    </div>


                    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">
                            ⚠️
                        </div>

                        <div>

                            <p>
                                Low Stock
                            </p>

                            <h3>
                                {lowStock}
                            </h3>

                        </div>

                    </div>


                    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">
                            ❌
                        </div>

                        <div>

                            <p>
                                Out of Stock
                            </p>

                            <h3>
                                {outOfStock}
                            </h3>

                        </div>

                    </div>

                </div>


                {/* ================= ADD INVENTORY FORM ================= */}

                {showAddForm && (

                    <form
                        className="w-full max-w-3xl rounded-xl bg-white p-5 shadow-md md:p-7"
                        onSubmit={handleAddInventory}
                    >

                        <h3>
                            Add Inventory
                        </h3>


                        <div className="mb-5 flex flex-col [&_label]:mb-2 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-slate-800 [&_input]:w-full [&_input]:box-border [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-300 [&_input]:bg-white [&_input]:px-3.5 [&_input]:py-3 [&_input]:text-sm [&_input]:text-slate-800 [&_input]:outline-none [&_input]:focus:border-blue-600 [&_input]:focus:ring-2 [&_input]:focus:ring-blue-100 [&_select]:w-full [&_select]:box-border [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-300 [&_select]:bg-white [&_select]:px-3.5 [&_select]:py-3 [&_select]:text-sm [&_select]:text-slate-800 [&_select]:outline-none [&_select]:focus:border-blue-600 [&_select]:focus:ring-2 [&_select]:focus:ring-blue-100 [&_textarea]:w-full [&_textarea]:box-border [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-300 [&_textarea]:bg-white [&_textarea]:px-3.5 [&_textarea]:py-3 [&_textarea]:text-sm [&_textarea]:text-slate-800 [&_textarea]:outline-none [&_textarea]:focus:border-blue-600 [&_textarea]:focus:ring-2 [&_textarea]:focus:ring-blue-100">

                            <label>
                                Medicine
                            </label>

                            <select
                                value={
                                    newInventory.medicineId
                                }
                                onChange={(e) =>
                                    setNewInventory({
                                        ...newInventory,
                                        medicineId:
                                        e.target.value
                                    })
                                }
                                required
                            >

                                <option value="">
                                    Select medicine
                                </option>

                                {medicines.map(
                                    (medicine) => (

                                        <option
                                            key={
                                                medicine.id
                                            }
                                            value={
                                                medicine.id
                                            }
                                        >
                                            {medicine.name}
                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        <div className="mb-5 flex flex-col [&_label]:mb-2 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-slate-800 [&_input]:w-full [&_input]:box-border [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-300 [&_input]:bg-white [&_input]:px-3.5 [&_input]:py-3 [&_input]:text-sm [&_input]:text-slate-800 [&_input]:outline-none [&_input]:focus:border-blue-600 [&_input]:focus:ring-2 [&_input]:focus:ring-blue-100 [&_select]:w-full [&_select]:box-border [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-300 [&_select]:bg-white [&_select]:px-3.5 [&_select]:py-3 [&_select]:text-sm [&_select]:text-slate-800 [&_select]:outline-none [&_select]:focus:border-blue-600 [&_select]:focus:ring-2 [&_select]:focus:ring-blue-100 [&_textarea]:w-full [&_textarea]:box-border [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-300 [&_textarea]:bg-white [&_textarea]:px-3.5 [&_textarea]:py-3 [&_textarea]:text-sm [&_textarea]:text-slate-800 [&_textarea]:outline-none [&_textarea]:focus:border-blue-600 [&_textarea]:focus:ring-2 [&_textarea]:focus:ring-blue-100">

                            <label>
                                Quantity
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={
                                    newInventory.quantity
                                }
                                onChange={(e) =>
                                    setNewInventory({
                                        ...newInventory,
                                        quantity:
                                        e.target.value
                                    })
                                }
                                required
                            />

                        </div>


                        <div className="mt-2 flex flex-col justify-end gap-3 sm:flex-row">

                            <button
                                type="button"
                                className="rounded-lg border-0 bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-300"
                                onClick={() =>
                                    setShowAddForm(false)
                                }
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="inline-flex items-center justify-center rounded-lg border-0 bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Add Inventory
                            </button>

                        </div>

                    </form>

                )}


                {/* ================= SEARCH & FILTER ================= */}

                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

                    <div className="mb-4 [&_h2]:m-0 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900 [&_p]:mt-1 [&_p]:text-sm [&_p]:text-slate-500">

                        <div>

                            <h2>
                                Inventory Stock
                            </h2>

                            <p>
                                View and update current stock
                            </p>

                        </div>

                    </div>


                    <div className="my-5 flex flex-col gap-3 md:flex-row">

                        <input
                            type="text"
                            placeholder="🔍 Search medicine..."
                            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />


                        <select
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            value={stockFilter}
                            onChange={(e) =>
                                setStockFilter(
                                    e.target.value
                                )
                            }
                        >

                            <option value="">
                                All Stock
                            </option>

                            <option value="IN_STOCK">
                                Available
                            </option>

                            <option value="LOW_STOCK">
                                Low Stock
                            </option>

                            <option value="OUT_OF_STOCK">
                                Out of Stock
                            </option>

                        </select>

                    </div>


                    {/* ================= TABLE ================= */}

                    <div className="overflow-x-auto">

                        {loading ? (

                            <p>
                                Loading inventory...
                            </p>

                        ) : error ? (

                            <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-red-600">
                                {error}
                            </p>

                        ) : (

                            <table className="w-full border-collapse text-left text-sm [&_th]:border-b [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-3 [&_th]:py-3 [&_th]:font-semibold [&_th]:text-slate-500 [&_td]:border-b [&_td]:border-slate-100 [&_td]:px-3 [&_td]:py-4">

                                <thead>

                                <tr>

                                    <th>
                                        Medicine
                                    </th>

                                    <th>
                                        Quantity
                                    </th>

                                    <th>
                                        Reorder Level
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Stock Action
                                    </th>

                                </tr>

                                </thead>


                                <tbody>

                                {filteredInventory.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="5"
                                            className="!p-10 text-center text-slate-400"
                                        >
                                            No inventory found
                                        </td>

                                    </tr>

                                ) : (

                                    filteredInventory.map(
                                        (item) => (

                                            <tr
                                                key={
                                                    item.id
                                                }
                                            >

                                                <td>

                                                    <strong>
                                                        {
                                                            item.medicineName
                                                        }
                                                    </strong>

                                                </td>


                                                <td>
                                                    {
                                                        item.quantity
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        item.reorderLevel
                                                    }
                                                </td>


                                                <td>

                                                        <span
                                                            className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                                                                item.status
                                                            )}`}
                                                        >
                                                            {getStatusText(
                                                                item.status
                                                            )}
                                                        </span>

                                                </td>


                                                <td>

                                                    <button
                                                        className="mr-1.5 rounded-md border-0 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                                                        onClick={() =>
                                                            updateStock(
                                                                item.id,
                                                                item.quantity,
                                                                -1
                                                            )
                                                        }
                                                        disabled={
                                                            item.quantity ===
                                                            0
                                                        }
                                                    >
                                                        −
                                                    </button>


                                                    <span
                                                        style={{
                                                            margin: "0 12px",
                                                            fontWeight:
                                                                "600"
                                                        }}
                                                    >
                                                            {
                                                                item.quantity
                                                            }
                                                        </span>


                                                    <button
                                                        className="mr-1.5 rounded-md border-0 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                                                        onClick={() =>
                                                            updateStock(
                                                                item.id,
                                                                item.quantity,
                                                                1
                                                            )
                                                        }
                                                    >
                                                        +
                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )

                                )}

                                </tbody>

                            </table>

                        )}

                    </div>

                </section>

            </main>

        </div>
    );
};

export default Inventory;