import { formatExpiryDate, getExpiryStatusClass } from "../../utils/expiryUtils";

const statusClasses = {
  "bg-red-100 text-red-600": "bg-red-100 text-red-700",
  "bg-amber-100 text-amber-700": "bg-amber-100 text-amber-700",
  "bg-green-100 text-green-700": "bg-emerald-100 text-emerald-700",
};

const ExpiryTable = ({ medicines }) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-4 font-semibold">Medicine Name</th>
            <th className="px-5 py-4 font-semibold">Category</th>
            <th className="px-5 py-4 font-semibold">Batch Number</th>
            <th className="px-5 py-4 font-semibold">Expiry Date</th>
            <th className="px-5 py-4 font-semibold">Quantity</th>
            <th className="px-5 py-4 font-semibold">Status</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {medicines.length === 0 ? (
            <tr>
              <td colSpan="6" className="px-5 py-12 text-center text-slate-500">
                No medicines found
              </td>
            </tr>
          ) : (
            medicines.map((medicine) => {
              const statusClass = getExpiryStatusClass(medicine.status);

              return (
                <tr key={medicine.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-900">{medicine.name}</td>
                  <td className="px-5 py-4 text-slate-600">{medicine.category}</td>
                  <td className="px-5 py-4 text-slate-600">{medicine.batchNumber}</td>
                  <td className="px-5 py-4 text-slate-600">{formatExpiryDate(medicine.expiryDate)}</td>
                  <td className="px-5 py-4 font-medium text-slate-700">{medicine.quantity}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        statusClasses[statusClass] || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {medicine.status}
                    </span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ExpiryTable;
