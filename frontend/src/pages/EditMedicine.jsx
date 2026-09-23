import authFetch from "../services/authFetch";
import { useState } from "react";
import { useAuth } from "../context/useAuth";
import { useLocation, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8082/api";

const EditMedicine = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const existingMedicine = location.state?.medicine;

    const [medicine, setMedicine] = useState(
        existingMedicine
            ? {
                name: existingMedicine.name || "",
                category: existingMedicine.category || "",
                manufacturer: existingMedicine.manufacturer || "",
                description: existingMedicine.description || "",
                price: existingMedicine.price ?? "",
                reorderLevel: existingMedicine.reorderLevel ?? "",
                batchNumber: existingMedicine.batchNumber || "",
                expiryDate: existingMedicine.expiryDate || ""
            }
            : null
    );

    const [loading, setLoading] = useState(false);

    if (!medicine) {

        return (
            <div className="min-h-screen bg-slate-50 text-slate-800 text-left">

                <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-5 md:px-8">

                    <div>
                        <h1>MediStock</h1>

                        <p>
                            Medicine Inventory Management
                        </p>
                    </div>

                </header>

                <main className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8">

                    <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">

                        <div>

                            <h2>
                                Medicine Not Found
                            </h2>

                            <p>
                                Please select a medicine from the dashboard.
                            </p>

                        </div>

                    </div>

                    <button
                        className="inline-flex items-center justify-center rounded-lg border-0 bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={() => navigate("/medicines")}
                    >
                        Back to Dashboard
                    </button>

                </main>

            </div>
        );
    }

    const handleChange = (e) => {

        setMedicine({
            ...medicine,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (
            !medicine.name ||
            !medicine.category ||
            !medicine.manufacturer ||
            !medicine.description ||
            medicine.price === "" ||
            medicine.reorderLevel === ""
        ) {
            alert("Please fill all fields.");
            return;
        }

        try {

            setLoading(true);

            const response = await authFetch(
                `${API_URL}/medicines/${existingMedicine.id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user?.token}`
                    },

                    body: JSON.stringify({
                        name: medicine.name,
                        category: medicine.category,
                        manufacturer: medicine.manufacturer,
                        description: medicine.description,
                        price: Number(medicine.price),
                        reorderLevel: Number(medicine.reorderLevel),
                        // Sent only if the backend Medicine model supports them;
                        // most backends simply ignore unknown JSON fields, so
                        // this stays safe even before that field is added.
                        batchNumber: medicine.batchNumber || null,
                        expiryDate: medicine.expiryDate || null
                    })
                }
            );

            const responseText = await response.text();

            if (!response.ok) {

                throw new Error(
                    responseText ||
                    `Update failed: ${response.status}`
                );
            }

            alert("Medicine updated successfully.");

            navigate("/medicines");

        } catch (error) {

            console.error(
                "Error updating medicine:",
                error
            );

            alert(
                error.message ||
                "Failed to update medicine."
            );

        } finally {

            setLoading(false);
        }
    };

    return (

        <div className="min-h-screen bg-slate-50 text-slate-800 text-left">

            <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-5 md:px-8">

                <div>

                    <h1>MediStock</h1>

                    <p>
                        Medicine Inventory Management
                    </p>

                </div>

                <button
                    className="rounded-lg border-0 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                    onClick={() => navigate("/medicines")}
                >
                    Back to Dashboard
                </button>

            </header>

            <main className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8">

                <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">

                    <div>

                        <h2>
                            Edit Medicine
                        </h2>

                        <p>
                            Update medicine information
                        </p>

                    </div>

                </div>

                <form
                    className="w-full max-w-3xl rounded-xl bg-white p-5 shadow-md md:p-7"
                    onSubmit={handleSubmit}
                >

                    <div className="mb-5 flex flex-col [&_label]:mb-2 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-slate-800 [&_input]:w-full [&_input]:box-border [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-300 [&_input]:bg-white [&_input]:px-3.5 [&_input]:py-3 [&_input]:text-sm [&_input]:text-slate-800 [&_input]:outline-none [&_input]:focus:border-blue-600 [&_input]:focus:ring-2 [&_input]:focus:ring-blue-100 [&_select]:w-full [&_select]:box-border [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-300 [&_select]:bg-white [&_select]:px-3.5 [&_select]:py-3 [&_select]:text-sm [&_select]:text-slate-800 [&_select]:outline-none [&_select]:focus:border-blue-600 [&_select]:focus:ring-2 [&_select]:focus:ring-blue-100 [&_textarea]:w-full [&_textarea]:box-border [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-300 [&_textarea]:bg-white [&_textarea]:px-3.5 [&_textarea]:py-3 [&_textarea]:text-sm [&_textarea]:text-slate-800 [&_textarea]:outline-none [&_textarea]:focus:border-blue-600 [&_textarea]:focus:ring-2 [&_textarea]:focus:ring-blue-100">

                        <label>
                            Medicine Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={medicine.name}
                            onChange={handleChange}
                            required
                        />

                    </div>

                    <div className="mb-5 flex flex-col [&_label]:mb-2 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-slate-800 [&_input]:w-full [&_input]:box-border [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-300 [&_input]:bg-white [&_input]:px-3.5 [&_input]:py-3 [&_input]:text-sm [&_input]:text-slate-800 [&_input]:outline-none [&_input]:focus:border-blue-600 [&_input]:focus:ring-2 [&_input]:focus:ring-blue-100 [&_select]:w-full [&_select]:box-border [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-300 [&_select]:bg-white [&_select]:px-3.5 [&_select]:py-3 [&_select]:text-sm [&_select]:text-slate-800 [&_select]:outline-none [&_select]:focus:border-blue-600 [&_select]:focus:ring-2 [&_select]:focus:ring-blue-100 [&_textarea]:w-full [&_textarea]:box-border [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-300 [&_textarea]:bg-white [&_textarea]:px-3.5 [&_textarea]:py-3 [&_textarea]:text-sm [&_textarea]:text-slate-800 [&_textarea]:outline-none [&_textarea]:focus:border-blue-600 [&_textarea]:focus:ring-2 [&_textarea]:focus:ring-blue-100">

                        <label>
                            Category
                        </label>

                        <select
                            name="category"
                            value={medicine.category}
                            onChange={handleChange}
                            required
                        >

                            <option value="">
                                Select category
                            </option>

                            <option value="Tablet">
                                Tablet
                            </option>

                            <option value="Capsule">
                                Capsule
                            </option>

                            <option value="Syrup">
                                Syrup
                            </option>

                            <option value="Injection">
                                Injection
                            </option>

                        </select>

                    </div>

                    <div className="mb-5 flex flex-col [&_label]:mb-2 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-slate-800 [&_input]:w-full [&_input]:box-border [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-300 [&_input]:bg-white [&_input]:px-3.5 [&_input]:py-3 [&_input]:text-sm [&_input]:text-slate-800 [&_input]:outline-none [&_input]:focus:border-blue-600 [&_input]:focus:ring-2 [&_input]:focus:ring-blue-100 [&_select]:w-full [&_select]:box-border [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-300 [&_select]:bg-white [&_select]:px-3.5 [&_select]:py-3 [&_select]:text-sm [&_select]:text-slate-800 [&_select]:outline-none [&_select]:focus:border-blue-600 [&_select]:focus:ring-2 [&_select]:focus:ring-blue-100 [&_textarea]:w-full [&_textarea]:box-border [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-300 [&_textarea]:bg-white [&_textarea]:px-3.5 [&_textarea]:py-3 [&_textarea]:text-sm [&_textarea]:text-slate-800 [&_textarea]:outline-none [&_textarea]:focus:border-blue-600 [&_textarea]:focus:ring-2 [&_textarea]:focus:ring-blue-100">

                        <label>
                            Manufacturer
                        </label>

                        <input
                            type="text"
                            name="manufacturer"
                            value={medicine.manufacturer}
                            onChange={handleChange}
                            required
                        />

                    </div>

                    <div className="mb-5 flex flex-col [&_label]:mb-2 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-slate-800 [&_input]:w-full [&_input]:box-border [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-300 [&_input]:bg-white [&_input]:px-3.5 [&_input]:py-3 [&_input]:text-sm [&_input]:text-slate-800 [&_input]:outline-none [&_input]:focus:border-blue-600 [&_input]:focus:ring-2 [&_input]:focus:ring-blue-100 [&_select]:w-full [&_select]:box-border [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-300 [&_select]:bg-white [&_select]:px-3.5 [&_select]:py-3 [&_select]:text-sm [&_select]:text-slate-800 [&_select]:outline-none [&_select]:focus:border-blue-600 [&_select]:focus:ring-2 [&_select]:focus:ring-blue-100 [&_textarea]:w-full [&_textarea]:box-border [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-300 [&_textarea]:bg-white [&_textarea]:px-3.5 [&_textarea]:py-3 [&_textarea]:text-sm [&_textarea]:text-slate-800 [&_textarea]:outline-none [&_textarea]:focus:border-blue-600 [&_textarea]:focus:ring-2 [&_textarea]:focus:ring-blue-100">

                        <label>
                            Description
                        </label>

                        <textarea
                            name="description"
                            value={medicine.description}
                            onChange={handleChange}
                            rows="4"
                            required
                        />

                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        <div className="mb-5 flex flex-col [&_label]:mb-2 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-slate-800 [&_input]:w-full [&_input]:box-border [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-300 [&_input]:bg-white [&_input]:px-3.5 [&_input]:py-3 [&_input]:text-sm [&_input]:text-slate-800 [&_input]:outline-none [&_input]:focus:border-blue-600 [&_input]:focus:ring-2 [&_input]:focus:ring-blue-100 [&_select]:w-full [&_select]:box-border [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-300 [&_select]:bg-white [&_select]:px-3.5 [&_select]:py-3 [&_select]:text-sm [&_select]:text-slate-800 [&_select]:outline-none [&_select]:focus:border-blue-600 [&_select]:focus:ring-2 [&_select]:focus:ring-blue-100 [&_textarea]:w-full [&_textarea]:box-border [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-300 [&_textarea]:bg-white [&_textarea]:px-3.5 [&_textarea]:py-3 [&_textarea]:text-sm [&_textarea]:text-slate-800 [&_textarea]:outline-none [&_textarea]:focus:border-blue-600 [&_textarea]:focus:ring-2 [&_textarea]:focus:ring-blue-100">

                            <label>
                                Price
                            </label>

                            <input
                                type="number"
                                name="price"
                                min="0"
                                step="0.01"
                                value={medicine.price}
                                onChange={handleChange}
                                required
                            />

                        </div>

                        <div className="mb-5 flex flex-col [&_label]:mb-2 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-slate-800 [&_input]:w-full [&_input]:box-border [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-300 [&_input]:bg-white [&_input]:px-3.5 [&_input]:py-3 [&_input]:text-sm [&_input]:text-slate-800 [&_input]:outline-none [&_input]:focus:border-blue-600 [&_input]:focus:ring-2 [&_input]:focus:ring-blue-100 [&_select]:w-full [&_select]:box-border [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-300 [&_select]:bg-white [&_select]:px-3.5 [&_select]:py-3 [&_select]:text-sm [&_select]:text-slate-800 [&_select]:outline-none [&_select]:focus:border-blue-600 [&_select]:focus:ring-2 [&_select]:focus:ring-blue-100 [&_textarea]:w-full [&_textarea]:box-border [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-300 [&_textarea]:bg-white [&_textarea]:px-3.5 [&_textarea]:py-3 [&_textarea]:text-sm [&_textarea]:text-slate-800 [&_textarea]:outline-none [&_textarea]:focus:border-blue-600 [&_textarea]:focus:ring-2 [&_textarea]:focus:ring-blue-100">

                            <label>
                                Reorder Level
                            </label>

                            <input
                                type="number"
                                name="reorderLevel"
                                min="0"
                                value={medicine.reorderLevel}
                                onChange={handleChange}
                                required
                            />

                        </div>

                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        <div className="mb-5 flex flex-col [&_label]:mb-2 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-slate-800 [&_input]:w-full [&_input]:box-border [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-300 [&_input]:bg-white [&_input]:px-3.5 [&_input]:py-3 [&_input]:text-sm [&_input]:text-slate-800 [&_input]:outline-none [&_input]:focus:border-blue-600 [&_input]:focus:ring-2 [&_input]:focus:ring-blue-100 [&_select]:w-full [&_select]:box-border [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-300 [&_select]:bg-white [&_select]:px-3.5 [&_select]:py-3 [&_select]:text-sm [&_select]:text-slate-800 [&_select]:outline-none [&_select]:focus:border-blue-600 [&_select]:focus:ring-2 [&_select]:focus:ring-blue-100 [&_textarea]:w-full [&_textarea]:box-border [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-300 [&_textarea]:bg-white [&_textarea]:px-3.5 [&_textarea]:py-3 [&_textarea]:text-sm [&_textarea]:text-slate-800 [&_textarea]:outline-none [&_textarea]:focus:border-blue-600 [&_textarea]:focus:ring-2 [&_textarea]:focus:ring-blue-100">

                            <label>
                                Batch Number
                            </label>

                            <input
                                type="text"
                                name="batchNumber"
                                placeholder="e.g. BT-24011"
                                value={medicine.batchNumber}
                                onChange={handleChange}
                            />

                        </div>

                        <div className="mb-5 flex flex-col [&_label]:mb-2 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-slate-800 [&_input]:w-full [&_input]:box-border [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-300 [&_input]:bg-white [&_input]:px-3.5 [&_input]:py-3 [&_input]:text-sm [&_input]:text-slate-800 [&_input]:outline-none [&_input]:focus:border-blue-600 [&_input]:focus:ring-2 [&_input]:focus:ring-blue-100 [&_select]:w-full [&_select]:box-border [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-300 [&_select]:bg-white [&_select]:px-3.5 [&_select]:py-3 [&_select]:text-sm [&_select]:text-slate-800 [&_select]:outline-none [&_select]:focus:border-blue-600 [&_select]:focus:ring-2 [&_select]:focus:ring-blue-100 [&_textarea]:w-full [&_textarea]:box-border [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-300 [&_textarea]:bg-white [&_textarea]:px-3.5 [&_textarea]:py-3 [&_textarea]:text-sm [&_textarea]:text-slate-800 [&_textarea]:outline-none [&_textarea]:focus:border-blue-600 [&_textarea]:focus:ring-2 [&_textarea]:focus:ring-blue-100">

                            <label>
                                Expiry Date
                            </label>

                            <input
                                type="date"
                                name="expiryDate"
                                value={medicine.expiryDate}
                                onChange={handleChange}
                            />

                        </div>

                    </div>

                    <div className="mt-2 flex flex-col justify-end gap-3 sm:flex-row">

                        <button
                            type="button"
                            className="rounded-lg border-0 bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-300"
                            onClick={() => navigate("/medicines")}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-lg border-0 bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={loading}
                        >
                            {loading
                                ? "Updating..."
                                : "Update Medicine"}
                        </button>

                    </div>

                </form>

            </main>

        </div>
    );
};

export default EditMedicine;