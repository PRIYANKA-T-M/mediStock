const InventoryAnalyticsCards = ({
  totalStockQuantity,
  categoriesTracked,
  lowStockCount,
  needsAttentionCount,
}) => {
  const cards = [
    { label: "Total Stock Quantity", value: totalStockQuantity, icon: "📦", tone: "bg-sky-50 text-sky-700" },
    { label: "Categories Tracked", value: categoriesTracked, icon: "🗂️", tone: "bg-violet-50 text-violet-700" },
    { label: "Low Stock Items", value: lowStockCount, icon: "📉", tone: "bg-amber-50 text-amber-700" },
    { label: "Needs Attention", value: needsAttentionCount, icon: "🚨", tone: "bg-red-50 text-red-700" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${card.tone}`}>
            {card.icon}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <h3 className="mt-1 text-2xl font-bold text-slate-900">{card.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryAnalyticsCards;
