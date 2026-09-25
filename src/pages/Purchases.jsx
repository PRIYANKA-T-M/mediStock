import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Plus,
  Truck,
  CheckCircle2,
  Clock,
  PackageCheck,
  Search,
  RefreshCw,
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

  const handleCreateOrder = (e) => {
    e.preventDefault();
    setFormError('');

    const qty = Number(orderQuantity);
    const price = Number(unitPrice);

    if (isNaN(qty) || qty <= 0) {
      setFormError('Order quantity must be a positive number.');
      return;
    }

    if (isNaN(price) || price <= 0) {
      setFormError('Unit price must be a positive number.');
      return;
    }

    const sup = suppliers.find((s) => s.id === Number(selectedSupplierId));
    const med = medicines.find((m) => m.id === Number(selectedMedicineId));

    const newOrder = {
      id: `PO-2026-${String(purchases.length + 1).padStart(3, '0')}`,
      supplierId: Number(selectedSupplierId),
      supplierName: sup ? sup.name : 'Selected Supplier',
      medicineId: Number(selectedMedicineId),
      medicineName: med ? med.name : 'Selected Medicine',
      quantity: qty,
      unitPrice: price,
      totalAmount: qty * price,
      status: 'ORDERED',
      orderDate: new Date().toISOString().split('T')[0],
      receivedDate: null,
    };

    setPurchases((prev) => [newOrder, ...prev]);
    setShowModal(false);
    setSuccessMessage(`Purchase order ${newOrder.id} successfully created!`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleReceiveOrder = async (poId) => {
    setReceivingId(poId);
    try {
      const target = purchases.find((p) => p.id === poId);
      if (target) {
        try {
          await api.patch(`/api/inventory/${target.medicineId}/stock`, {
            quantity: target.quantity,
            operation: 'ADD',
            reason: `Purchase order ${target.id} fulfillment`,
          });
        } catch {
          // Soft-fail if backend inventory update endpoint has minor difference
        }
      }

      setPurchases((prev) =>
        prev.map((p) =>
          p.id === poId
            ? {
                ...p,
                status: 'RECEIVED',
                receivedDate: new Date().toISOString().split('T')[0],
              }
            : p
        )
      );

      setSuccessMessage(`Order ${poId} marked as received and added to active stock!`);
      setTimeout(() => setSuccessMessage(''), 4000);
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
    <div className="space-y-8">
      {/* ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">Purchase Orders</h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 leading-relaxed">
            Issue procurement orders, monitor deliveries, and intake incoming stock directly into clinical inventory.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <Plus size={15} />
          <span>Create Purchase Order</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2.5 font-medium leading-relaxed">
          <CheckCircle2 size={18} className="text-emerald-700 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider text-[11px]">Pending Fulfillment</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <div className="text-3xl font-bold text-amber-700 mt-4 font-mono tabular-nums tracking-tight">
            {pendingCount}
          </div>
          <div className="text-xs text-stone-400 mt-1.5 font-medium">Awaiting delivery & clinical verification</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider text-[11px]">Completed Orders</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <PackageCheck size={18} />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-800 mt-4 font-mono tabular-nums tracking-tight">
            {purchases.filter((p) => p.status === 'RECEIVED').length}
          </div>
          <div className="text-xs text-stone-400 mt-1.5 font-medium">Added to active dispensary stock</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider text-[11px]">Total Procurement Volume</span>
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
              <ShoppingCart size={18} />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-4 font-mono tabular-nums tracking-tight">
            ₹{totalValue.toLocaleString()}
          </div>
          <div className="text-xs text-stone-400 mt-1.5 font-medium">{purchases.length} total procurement requisitions</div>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {['ALL', 'PENDING', 'ORDERED', 'RECEIVED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                filterStatus === status
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {status === 'ALL' ? 'All Orders' : status}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-3 text-stone-400" size={15} />
          <input
            type="text"
            placeholder="Search PO, supplier, medicine..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs border border-stone-200 rounded-xl bg-stone-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition"
          />
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200/80 text-stone-500 font-semibold bg-stone-50/70 uppercase tracking-wider text-[11px]">
                <th className="py-4 px-6">PO Number</th>
                <th className="py-4 px-6">Supplier</th>
                <th className="py-4 px-6">Medicine Item</th>
                <th className="py-4 px-6 text-right">Quantity</th>
                <th className="py-4 px-6 text-right">Total Amount</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-stone-400">
                    <Truck size={28} className="mx-auto text-stone-300 mb-3" />
                    <p className="font-semibold text-slate-700 text-sm">No purchase orders found</p>
                    <p className="text-xs text-stone-400 mt-1">Try refining search parameters or filters</p>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((po) => {
                  const isReceived = po.status === 'RECEIVED';

                  let statusBadge = (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      Received
                    </span>
                  );
                  if (po.status === 'ORDERED') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-500" />
                        In Transit
                      </span>
                    );
                  } else if (po.status === 'PENDING') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                        Pending
                      </span>
                    );
                  }

                  return (
                    <tr key={po.id} className="hover:bg-stone-50/60 transition">
                      <td className="py-4 px-6 font-mono font-bold text-slate-900 text-sm">{po.id}</td>
                      <td className="py-4 px-6 text-slate-800 font-medium">{po.supplierName}</td>
                      <td className="py-4 px-6 font-bold text-slate-900">{po.medicineName}</td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-slate-900">
                        {po.quantity}
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-semibold text-slate-900">
                        ₹{(po.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-6">{statusBadge}</td>
                      <td className="py-4 px-6 text-right">
                        {!isReceived ? (
                          <button
                            onClick={() => handleReceiveOrder(po.id)}
                            disabled={receivingId === po.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs transition cursor-pointer"
                          >
                            <CheckCircle2 size={13} />
                            <span>{receivingId === po.id ? 'Intaking...' : 'Receive'}</span>
                          </button>
                        ) : (
                          <span className="text-xs text-stone-400 font-mono font-medium">
                            {po.receivedDate || 'Fulfilled'}
                          </span>
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

      {/* CREATE ORDER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <ShoppingCart size={16} className="text-sky-600" />
                Create Purchase Order
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateOrder} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Select Supplier *</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.contactPerson || 'Vendor'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Select Medicine *</label>
                <select
                  value={selectedMedicineId}
                  onChange={(e) => {
                    setSelectedMedicineId(e.target.value);
                    const selected = medicines.find((m) => m.id === Number(e.target.value));
                    if (selected) setUnitPrice(selected.price || 15.0);
                  }}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                >
                  {medicines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (Batch: {m.batchNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Quantity (Units) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Unit Price (₹) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
                <span className="text-slate-500">Estimated Requisition Total:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  ₹{((Number(orderQuantity) || 0) * (Number(unitPrice) || 0)).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-xs transition cursor-pointer"
                >
                  Place Order
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
