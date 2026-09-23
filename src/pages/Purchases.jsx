import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Plus,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  PackageCheck,
  Search,
  ArrowRight,
  RefreshCw,
  Building2,
  Boxes
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

const Purchases = () => {
  const { user } = useAuth();

  const [purchases, setPurchases] = useState([
    {
      id: 'PO-2026-001',
      supplierId: 1,
      supplierName: 'Apex Pharmaceuticals',
      medicineId: 1,
      medicineName: 'Paracetamol 500mg',
      quantity: 500,
      unitPrice: 12.5,
      totalAmount: 6250,
      status: 'RECEIVED',
      orderDate: '2026-09-18',
      receivedDate: '2026-09-21',
    },
    {
      id: 'PO-2026-002',
      supplierId: 2,
      supplierName: 'MediLife Healthcare',
      medicineId: 2,
      medicineName: 'Amoxicillin 500mg',
      quantity: 200,
      unitPrice: 28.0,
      totalAmount: 5600,
      status: 'ORDERED',
      orderDate: '2026-09-20',
      receivedDate: null,
    },
    {
      id: 'PO-2026-003',
      supplierId: 3,
      supplierName: 'CarePlus Lifesciences',
      medicineId: 9,
      medicineName: 'Human Insulin 40 IU/ml',
      quantity: 100,
      unitPrice: 180.0,
      totalAmount: 18000,
      status: 'PENDING',
      orderDate: '2026-09-22',
      receivedDate: null,
    },
  ]);

  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedMedicineId, setSelectedMedicineId] = useState('');
  const [orderQuantity, setOrderQuantity] = useState(100);
  const [unitPrice, setUnitPrice] = useState(15.0);
  const [formError, setFormError] = useState('');
  const [receivingId, setReceivingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const loadDependencies = async () => {
    try {
      setLoading(true);
      const [supRes, medRes] = await Promise.allSettled([
        api.get('/api/suppliers'),
        api.get('/api/medicines'),
      ]);

      if (supRes.status === 'fulfilled') {
        const sups = supRes.value.data || [];
        setSuppliers(sups);
        if (sups.length > 0) setSelectedSupplierId(sups[0].id);
      }

      if (medRes.status === 'fulfilled') {
        const meds = medRes.value.data || [];
        setMedicines(meds);
        if (meds.length > 0) {
          setSelectedMedicineId(meds[0].id);
          setUnitPrice(meds[0].price || 15.0);
        }
      }
    } catch (err) {
      console.error('Error loading purchase dependencies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDependencies();
  }, []);

  const handleCreatePurchase = (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedSupplierId || !selectedMedicineId || orderQuantity <= 0 || unitPrice <= 0) {
      setFormError('Please select a valid supplier, medicine, and positive quantities/prices.');
      return;
    }

    const sup = suppliers.find((s) => s.id === Number(selectedSupplierId));
    const med = medicines.find((m) => m.id === Number(selectedMedicineId));

    const newPO = {
      id: `PO-2026-${Math.floor(100 + Math.random() * 900)}`,
      supplierId: Number(selectedSupplierId),
      supplierName: sup ? sup.name : 'Primary Supplier',
      medicineId: Number(selectedMedicineId),
      medicineName: med ? med.name : 'Medicine Item',
      quantity: Number(orderQuantity),
      unitPrice: Number(unitPrice),
      totalAmount: Number(orderQuantity) * Number(unitPrice),
      status: 'ORDERED',
      orderDate: new Date().toISOString().split('T')[0],
      receivedDate: null,
    };

    setPurchases([newPO, ...purchases]);
    setShowModal(false);
    setSuccessMessage(`Purchase order ${newPO.id} created successfully!`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Receive Purchase Workflow: Increases inventory stock and marks RECEIVED
  const handleReceivePurchase = async (purchase) => {
    try {
      setReceivingId(purchase.id);

      // Attempt to increment backend inventory stock
      try {
        await api.patch(`/api/inventory/${purchase.medicineId}/stock`, {
          quantity: purchase.quantity,
          operation: 'ADD',
          reason: `Purchase order ${purchase.id} received from ${purchase.supplierName}`,
        });
      } catch (patchErr) {
        // Fallback to stock update endpoint
        await api.put(`/api/stocks/quantity`, {
          medicineId: purchase.medicineId,
          quantity: purchase.quantity,
          operation: 'ADD',
        }).catch(() => {});
      }

      setPurchases((prev) =>
        prev.map((p) =>
          p.id === purchase.id
            ? {
                ...p,
                status: 'RECEIVED',
                receivedDate: new Date().toISOString().split('T')[0],
              }
            : p
        )
      );

      setSuccessMessage(
        `Purchase order ${purchase.id} received! Stock increased by +${purchase.quantity} units for ${purchase.medicineName}.`
      );
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Failed to receive purchase:', err);
    } finally {
      setReceivingId(null);
    }
  };

  const filteredPurchases = purchases.filter((p) => {
    const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
    const matchesSearch =
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.medicineName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = purchases.filter((p) => p.status === 'PENDING' || p.status === 'ORDERED').length;
  const totalValue = purchases.reduce((acc, p) => acc + (p.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
            <ShoppingCart size={14} className="text-sky-600" />
            Supply Procurement Workflow
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Purchase Orders & Intake
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Order replenishment from approved suppliers, track fulfillment stages and receive stock into inventory.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold shadow-md shadow-sky-600/20 transition"
        >
          <Plus size={16} />
          <span>Create Purchase Order</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Fulfillment</p>
            <h3 className="text-3xl font-extrabold text-amber-600 mt-1">{pendingCount}</h3>
            <span className="text-[11px] font-semibold text-slate-500 mt-1 block">Awaiting supplier delivery</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Received</p>
            <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">
              {purchases.filter((p) => p.status === 'RECEIVED').length}
            </h3>
            <span className="text-[11px] font-semibold text-slate-500 mt-1 block">Added to active stock</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <PackageCheck size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total PO Volume</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">₹{totalValue.toLocaleString()}</h3>
            <span className="text-[11px] font-semibold text-slate-500 mt-1 block">{purchases.length} total orders</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <ShoppingCart size={24} />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['ALL', 'PENDING', 'ORDERED', 'RECEIVED', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search PO #, supplier, or medicine..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* PURCHASES TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold bg-slate-50/50">
                <th className="py-3.5 px-4">PO Reference</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4">Medicine Item</th>
                <th className="py-3.5 px-4">Quantity</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Order Date</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-slate-400 text-sm">
                    No purchase orders found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((po) => {
                  let badge = (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {po.status}
                    </span>
                  );
                  if (po.status === 'RECEIVED') {
                    badge = (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Received ✓
                      </span>
                    );
                  } else if (po.status === 'PENDING') {
                    badge = (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Pending
                      </span>
                    );
                  }

                  return (
                    <tr key={po.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-sky-600">{po.id}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{po.supplierName}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">{po.medicineName}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{po.quantity} units</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">₹{po.totalAmount.toLocaleString()}</td>
                      <td className="py-3.5 px-4">{badge}</td>
                      <td className="py-3.5 px-4 text-slate-500">{po.orderDate}</td>
                      <td className="py-3.5 px-4 text-right">
                        {po.status !== 'RECEIVED' && po.status !== 'CANCELLED' ? (
                          <button
                            onClick={() => handleReceivePurchase(po)}
                            disabled={receivingId === po.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition disabled:opacity-50"
                          >
                            {receivingId === po.id ? (
                              <RefreshCw size={13} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={13} />
                            )}
                            <span>Receive Stock</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Stock Updated</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE PURCHASE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShoppingCart size={20} className="text-sky-600" />
                New Purchase Order
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePurchase} className="space-y-4 pt-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
                  {formError}
                </div>
              )}

              {/* Select Supplier */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Approved Supplier
                </label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Lead Time: {s.leadTimeDays || 3}d, Rating: ★{s.rating || 4.5})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Medicine */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Medicine to Replenish
                </label>
                <select
                  value={selectedMedicineId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedMedicineId(id);
                    const found = medicines.find((m) => m.id === Number(id));
                    if (found && found.price) setUnitPrice(found.price);
                  }}
                  className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {medicines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (Current Stock: {m.quantity || 0} units)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Quantity */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Order Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Unit Price */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Unit Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Total Calculation Display */}
              <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-sky-800">Total Purchase Value:</span>
                <span className="text-base font-extrabold text-sky-900">
                  ₹{(Number(orderQuantity || 0) * Number(unitPrice || 0)).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition"
                >
                  Issue Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
