import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const STATUS_COLORS = {
  Expired: "#dc2626",
  "Expiring Soon": "#f59e0b",
  Safe: "#16a34a",
};

const ExpiryCharts = ({ statusCounts, categoryCounts }) => {
  const statusData = [
    { name: "Expired", value: statusCounts.expired },
    { name: "Expiring Soon", value: statusCounts.expiringSoon },
    { name: "Safe", value: statusCounts.safe },
  ];

  const categoryData = categoryCounts.map((item) => ({
    category: item.category,
    count: item.count,
  }));

  const totalMedicines = statusData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Expired vs Expiring Soon vs Safe
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Distribution of medicines by expiry status.
          </p>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={72}
                outerRadius={105}
                paddingAngle={3}
                labelLine={false}
              >
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 text-center">
          <span className="text-2xl font-bold text-slate-900">{totalMedicines}</span>
          <span className="ml-2 text-sm text-slate-500">Medicines</span>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Medicines by Category
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Number of medicine items in each category.
          </p>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={categoryData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="category"
                width={100}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Bar dataKey="count" name="Medicines" fill="#2563eb" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ExpiryCharts;
