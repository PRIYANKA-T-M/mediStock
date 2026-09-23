import { useState } from "react";
import { useNavigate } from "react-router-dom";

const MedicineList = ({ medicines, onDelete }) => {

    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [stock, setStock] = useState("");

    const getStockStatus = (medicine) => {

        if (medicine.quantity === 0) {
            return "Out of Stock";
        }

        if (
            medicine.reorderLevel !== undefined &&
            medicine.quantity <= medicine.reorderLevel
        ) {
            return "Low Stock";
        }

        return "Available";
    };


    const filteredMedicines = medicines.filter((medicine) => {

        const matchesSearch =
            medicine.name
                .toLowerCase()
                .includes(search.toLowerCase());

        const matchesCategory =
            category === "" ||
            medicine.category.toLowerCase() ===
            category.toLowerCase();

        const status = getStockStatus(medicine);

        const matchesStock =
            stock === "" ||
            status.toLowerCase() === stock.toLowerCase();

        return (
            matchesSearch &&
            matchesCategory &&
            matchesStock
        );
    });


    const handleEdit = (medicine) => {

        navigate("/edit-medicine", {
            state: {
                medicine
            }
        });
    };


    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

            <div className="mb-4 [&_h2]:m-0 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900 [&_p]:mt-1 [&_p]:text-sm [&_p]:text-slate-500">

                <div>
                    <h2>Medicine Inventory</h2>

                    <p>
                        View and manage bg-green-100 text-green-700 medicines
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
                    value={category}
                    onChange={(e) =>
                        setCategory(e.target.value)
                    }
                >
                    <option value="">
                        All Categories
                    </option>

                    <option value="tablet">
                        Tablet
                    </option>

                    <option value="capsule">
                        Capsule
                    </option>

                    <option value="syrup">
                        Syrup
                    </option>

                    <option value="injection">
                        Injection
                    </option>
                </select>


                <select
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    value={stock}
                    onChange={(e) =>
                        setStock(e.target.value)
                    }
                >
                    <option value="">
                        All Stock
                    </option>

                    <option value="bg-green-100 text-green-700">
                        Available
                    </option>

                    <option value="low stock">
                        Low Stock
                    </option>

                    <option value="out of stock">
                        Out of Stock
                    </option>
                </select>

            </div>


            <div className="overflow-x-auto">

                <table className="w-full border-collapse text-left text-sm [&_th]:border-b [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-3 [&_th]:py-3 [&_th]:font-semibold [&_th]:text-slate-500 [&_td]:border-b [&_td]:border-slate-100 [&_td]:px-3 [&_td]:py-4">

                    <thead>

                    <tr>
                        <th>Medicine Name</th>
                        <th>Category</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Manufacturer</th>
                        <th>Reorder Level</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>

                    </thead>


                    <tbody>

                    {filteredMedicines.length === 0 ? (

                        <tr>
                            <td
                                colSpan="8"
                                className="!p-10 text-center text-slate-400"
                            >
                                No medicines found
                            </td>
                        </tr>

                    ) : (

                        filteredMedicines.map((medicine) => {

                            const status =
                                getStockStatus(medicine);

                            return (

                                <tr key={medicine.id}>

                                    <td>
                                        <strong>
                                            {medicine.name}
                                        </strong>
                                    </td>

                                    <td>
                                        {medicine.category}
                                    </td>

                                    <td>
                                        {medicine.quantity}
                                    </td>

                                    <td>
                                        ₹{medicine.price}
                                    </td>

                                    <td>
                                        {medicine.manufacturer}
                                    </td>

                                    <td>
                                        {medicine.reorderLevel}
                                    </td>

                                    <td>

                                            <span
                                                className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${status
                                                    .toLowerCase()
                                                    .replaceAll(
                                                        " ",
                                                        "-"
                                                    )}`}
                                            >
                                                {status}
                                            </span>

                                    </td>

                                    <td>

                                        <button
                                            className="mr-1.5 rounded-md border-0 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                                            onClick={() =>
                                                handleEdit(medicine)
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="mr-1.5 rounded-md border-0 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                                            onClick={() =>
                                                onDelete(
                                                    medicine.id
                                                )
                                            }
                                        >
                                            Delete
                                        </button>

                                    </td>

                                </tr>

                            );
                        })

                    )}

                    </tbody>

                </table>

            </div>

        </section>
    );
};

export default MedicineList;