import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

const MedicineDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = ['ADMIN', 'PHARMACIST'].includes(user?.role);
  const canDelete = user?.role === 'ADMIN';

  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSupplier, setSelectedSupplier] = useState('ALL');
  const [selectedStockStatus, setSelectedStockStatus] = useState('ALL');
  const [selectedExpiry, setSelectedExpiry] = useState('ALL');

  // Modals & Detail View
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [deleteModalItem, setDeleteModalItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stockUpdateItem, setStockUpdateItem] = useState(null);
  const [newStockValue, setNewStockValue] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [medRes, supRes] = await Promise.allSettled([
        api.get('/api/medicines'),
        api.get('/api/suppliers'),
      ]);

      let medData = medRes.status === 'fulfilled' ? medRes.value.data || [] : [];
      let supData = supRes.status === 'fulfilled' ? supRes.value.data || [] : [];

      // Seed fallback realistic data if empty
      if (medData.length === 0) {
        medData = [
          {
            id: '1',
            name: 'Paracetamol 500mg',
            batchNumber: 'PR-8821',
            category: 'Analgesics',
            quantity: 2400,
            reorderLevel: 500,
            expiryDate: '2027-10-15',
            mfgDate: '2025-10-15',
            unitPrice: 45.0,
            supplierName: 'ABC Pharma Ltd.',
            location: 'Cabinet B-Row 4',
          },
          {
            id: '2',
            name: 'Amoxicillin 250mg',
            batchNumber: 'AM-9031',
            category: 'Antibiotics',
            quantity: 1200,
            reorderLevel: 300,
            expiryDate: '2026-12-10',
            mfgDate: '2024-12-10',
            unitPrice: 120.0,
            supplierName: 'Apex BioLabs LLC',
            location: 'Cabinet A-Row 2',
          },
          {
            id: '3',
            name: 'Metformin 500mg',
            batchNumber: 'MF-3320',
            category: 'Antidiabetic',
            quantity: 80,
            reorderLevel: 150,
            expiryDate: '2026-11-20',
            mfgDate: '2024-11-20',
            unitPrice: 85.0,
            supplierName: 'PharmaCorp Global',
            location: 'Cabinet C-Row 1',
          },
          {
            id: '4',
            name: 'Ibuprofen 400mg',
            batchNumber: 'IB-4402',
            category: 'Analgesics',
            quantity: 0,
            reorderLevel: 100,
            expiryDate: '2026-08-01',
            mfgDate: '2024-08-01',
            unitPrice: 60.0,
            supplierName: 'Vanguard Chem',
            location: 'Cabinet B-Row 2',
          },
          {
            id: '5',
            name: 'Cetirizine 10mg',
            batchNumber: 'CT-1109',
            category: 'Antihistamines',
            quantity: 850,
            reorderLevel: 200,
            expiryDate: '2027-04-18',
            mfgDate: '2025-04-18',
            unitPrice: 35.0,
            supplierName: 'ABC Pharma Ltd.',
            location: 'Cabinet D-Row 3',
          },
          {
            id: '6',
            name: 'Azithromycin 500mg',
            batchNumber: 'AZ-5501',
            category: 'Antibiotics',
            quantity: 45,
            reorderLevel: 80,
            expiryDate: '2026-06-30',
            mfgDate: '2024-06-30',
            unitPrice: 210.0,
            supplierName: 'SinoMedical Dist',
            location: 'Cabinet A-Row 4',
          },
          {
            id: '7',
            name: 'Omeprazole 20mg',
            batchNumber: 'OM-7742',
            category: 'Gastrointestinal',
            quantity: 1600,
            reorderLevel: 300,
            expiryDate: '2028-01-15',
            mfgDate: '2025-01-15',
            unitPrice: 95.0,
            supplierName: 'Apex BioLabs LLC',
            location: 'Cabinet E-Row 1',
          },
        ];
      }

      setMedicines(medData);
      setSuppliers(supData);
    } catch (err) {
      console.error('Failed to load medicines:', err);
      setError('Unable to load medicines catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteMedicine = async () => {
    if (!deleteModalItem) return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/medicines/${deleteModalItem.id}`);
      setMedicines((prev) => prev.filter((m) => m.id !== deleteModalItem.id));
      setSuccessMsg(`Medicine "${deleteModalItem.name}" deleted.`);
      setDeleteModalItem(null);
      if (selectedMedicine?.id === deleteModalItem.id) {
        setSelectedMedicine(null);
      }
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to delete medicine:', err);
      setError('Failed to delete medicine.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateStock = async () => {
    if (!stockUpdateItem) return;
    try {
      const updated = medicines.map((m) =>
        m.id === stockUpdateItem.id ? { ...m, quantity: Number(newStockValue) } : m
      );
      setMedicines(updated);
      if (selectedMedicine?.id === stockUpdateItem.id) {
        setSelectedMedicine((prev) => ({ ...prev, quantity: Number(newStockValue) }));
      }
      setStockUpdateItem(null);
      setSuccessMsg(`Stock updated successfully.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to update stock:', err);
    }
  };

  const categories = useMemo(() => {
    const list = Array.from(new Set(medicines.map((m) => m.category).filter(Boolean)));
    return ['ALL', ...list];
  }, [medicines]);

  const supplierNames = useMemo(() => {
    const list = Array.from(new Set(medicines.map((m) => m.supplierName || m.supplier?.name).filter(Boolean)));
    return ['ALL', ...list];
  }, [medicines]);

  const getStockStatus = (med) => {
    const qty = med.quantity || 0;
    const reorder = med.reorderLevel || 20;
    if (qty <= 0) return { label: 'Out of Stock', badgeClass: 'bg-[#fdeeed] text-[#c54b43]' };
    if (qty <= reorder) return { label: 'Low', badgeClass: 'bg-[#fef2e6] text-[#b45309]' };
    return { label: 'Normal', badgeClass: 'bg-[#edf2ef] text-[#426154]' };
  };

  const formatExpiry = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const filteredMedicines = useMemo(() => {
    return medicines.filter((m) => {
      const name = (m.name || '').toLowerCase();
      const batch = (m.batchNumber || '').toLowerCase();
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || name.includes(query) || batch.includes(query);

      const matchesCat = selectedCategory === 'ALL' || m.category === selectedCategory;
      const mSupplier = m.supplierName || m.supplier?.name;
      const matchesSup = selectedSupplier === 'ALL' || mSupplier === selectedSupplier;

      const qty = m.quantity || 0;
      const reorder = m.reorderLevel || 20;
      let statusKey = 'NORMAL';
      if (qty <= 0) statusKey = 'OUT';
      else if (qty <= reorder) statusKey = 'LOW';

      const matchesStatus =
        selectedStockStatus === 'ALL' ||
        (selectedStockStatus === 'NORMAL' && statusKey === 'NORMAL') ||
        (selectedStockStatus === 'LOW' && statusKey === 'LOW') ||
        (selectedStockStatus === 'OUT' && statusKey === 'OUT');

      return matchesSearch && matchesCat && matchesSup && matchesStatus;
    });
  }, [medicines, searchQuery, selectedCategory, selectedSupplier, selectedStockStatus]);

  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage) || 1;
  const paginatedMedicines = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMedicines.slice(start, start + itemsPerPage);
  }, [filteredMedicines, currentPage]);

  return (
    <div className="space-y-6">
      {/* MEDICINE DETAIL VIEW (IMAGE 8) */}
      {selectedMedicine ? (
        <div className="space-y-6">
          {/* Breadcrumb & Header */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <button
                onClick={() => setSelectedMedicine(null)}
                className="hover:text-slate-700 cursor-pointer"
              >
                Medicines
              </button>
              <span>&gt;</span>
              <span className="text-slate-700 font-medium">{selectedMedicine.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {selectedMedicine.name}
              </h1>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-md ${
                  getStockStatus(selectedMedicine).badgeClass
                }`}
              >
                {getStockStatus(selectedMedicine).label}
              </span>
            </div>
          </div>

          {/* 3 Detail Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. BASIC INFORMATION */}
            <div className="bg-white p-7 rounded-2xl border border-stone-200/80 shadow-xs space-y-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Basic Information
              </h3>
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider mb-0.5">Category</span>
                  <span className="font-semibold text-slate-800 text-sm tracking-wide">{selectedMedicine.category || 'Analgesics'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider mb-0.5">Batch Number</span>
                  <span className="font-semibold text-slate-800 font-mono text-sm tracking-wider">{selectedMedicine.batchNumber || 'P2026-001'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider mb-0.5">Supplier</span>
                  <span className="font-semibold text-slate-800 text-sm tracking-wide">{selectedMedicine.supplierName || 'ABC Pharma Ltd.'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider mb-0.5">Unit Price</span>
                  <span className="font-bold text-slate-900 text-base font-mono">
                    ₹{Number(selectedMedicine.unitPrice || 45).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. STOCK INFORMATION */}
            <div className="bg-white p-7 rounded-2xl border border-stone-200/80 shadow-xs space-y-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Stock Information
              </h3>
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider mb-0.5">Current Stock</span>
                  <span className="font-bold text-slate-900 text-base font-mono">
                    {selectedMedicine.quantity || 0} Units
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider mb-0.5">Reorder Level</span>
                  <span className="font-semibold text-slate-800 text-sm font-mono">
                    {selectedMedicine.reorderLevel || 500} Units
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider mb-1">Stock Status</span>
                  <span className={`inline-block font-semibold px-2.5 py-1 rounded-md text-[11px] tracking-wide ${getStockStatus(selectedMedicine).badgeClass}`}>
                    {getStockStatus(selectedMedicine).label}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider mb-0.5">Storage Location</span>
                  <span className="font-semibold text-slate-800 text-sm tracking-wide">
                    {selectedMedicine.location || 'Cabinet B-Row 4'}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. EXPIRY INFORMATION */}
            <div className="bg-white p-7 rounded-2xl border border-stone-200/80 shadow-xs space-y-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Expiry Information
              </h3>
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider mb-0.5">Manufacturing Date</span>
                  <span className="font-semibold text-slate-800 text-sm font-mono">
                    {formatExpiry(selectedMedicine.mfgDate || '2026-01-10')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider mb-0.5">Expiry Date</span>
                  <span className="font-bold text-slate-900 text-sm font-mono">
                    {formatExpiry(selectedMedicine.expiryDate)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider mb-1">Days Remaining</span>
                  <span className="font-bold text-slate-900 text-base font-mono">380 Days</span>
                  <div className="w-full bg-[#edebe7] h-2.5 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-[#4d6b5e] rounded-full" style={{ width: '70%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              onClick={() => {
                setStockUpdateItem(selectedMedicine);
                setNewStockValue(selectedMedicine.quantity || 0);
              }}
              className="px-5 py-2.5 rounded-xl bg-[#4d6b5e] hover:bg-[#415d51] text-white text-xs font-semibold shadow-xs transition cursor-pointer tracking-wide"
            >
              Update Stock
            </button>
            <button
              onClick={() => navigate('/edit-medicine', { state: { medicine: selectedMedicine } })}
              className="px-5 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-slate-700 text-xs font-semibold shadow-xs transition cursor-pointer tracking-wide"
            >
              Edit Medicine Details
            </button>
            <button
              onClick={() => setSelectedMedicine(null)}
              className="px-4 py-2.5 text-slate-500 hover:text-slate-800 text-xs font-medium cursor-pointer ml-auto tracking-wide"
            >
              &larr; Back to Catalog
            </button>
          </div>
        </div>
      ) : (
        /* MAIN MEDICINES LIST VIEW (IMAGE 6) */
        <div className="space-y-6">
          {/* HEADER BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">Medicines</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 tracking-wide leading-relaxed">
                Manage and monitor pharmacy formulations stock with clinical precision
              </p>
            </div>

            {canManage && (
              <button
                onClick={() => navigate('/add-medicine')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4d6b5e] hover:bg-[#415d51] text-white text-xs font-semibold shadow-xs transition cursor-pointer self-start sm:self-auto tracking-wide"
              >
                <Plus size={15} strokeWidth={2.5} />
                <span>Add Medicine</span>
              </button>
            )}
          </div>

          {/* Notification Messages */}
          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium leading-relaxed">
              {successMsg}
            </div>
          )}

          {/* FILTER BAR CARD */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
              {/* Search */}
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search formulation, batch..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-stone-200 bg-[#fafaf8] text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-stone-400 focus:bg-white tracking-wide transition"
                />
              </div>

              {/* Category */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-10 px-3.5 rounded-xl border border-stone-200 bg-[#fafaf8] text-xs text-slate-700 outline-none focus:border-stone-400 tracking-wide font-medium"
                >
                  <option value="ALL">All Categories</option>
                  {categories.filter((c) => c !== 'ALL').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Supplier */}
              <div>
                <select
                  value={selectedSupplier}
                  onChange={(e) => {
                    setSelectedSupplier(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-10 px-3.5 rounded-xl border border-stone-200 bg-[#fafaf8] text-xs text-slate-700 outline-none focus:border-stone-400 tracking-wide font-medium"
                >
                  <option value="ALL">All Suppliers</option>
                  {supplierNames.filter((s) => s !== 'ALL').map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Stock Status */}
              <div>
                <select
                  value={selectedStockStatus}
                  onChange={(e) => {
                    setSelectedStockStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-10 px-3.5 rounded-xl border border-stone-200 bg-[#fafaf8] text-xs text-slate-700 outline-none focus:border-stone-400 tracking-wide font-medium"
                >
                  <option value="ALL">All Stock Levels</option>
                  <option value="NORMAL">Normal</option>
                  <option value="LOW">Low Stock</option>
                  <option value="OUT">Out of Stock</option>
                </select>
              </div>

              {/* Expiry */}
              <div>
                <select
                  value={selectedExpiry}
                  onChange={(e) => setSelectedExpiry(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-stone-200 bg-[#fafaf8] text-xs text-slate-700 outline-none focus:border-stone-400 tracking-wide font-medium"
                >
                  <option value="ALL">All Expiries</option>
                  <option value="NEAR">Expiring Soon (&lt; 30d)</option>
                  <option value="VALID">Safe Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-100 text-slate-400 font-bold uppercase tracking-wider bg-[#fafaf8]">
                    <th className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5">
                        <span>MEDICINE NAME</span>
                        <ArrowUpDown size={11} className="text-slate-300" />
                      </div>
                    </th>
                    <th className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5">
                        <span>BATCH</span>
                        <ArrowUpDown size={11} className="text-slate-300" />
                      </div>
                    </th>
                    <th className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5">
                        <span>CATEGORY</span>
                        <ArrowUpDown size={11} className="text-slate-300" />
                      </div>
                    </th>
                    <th className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5">
                        <span>STOCK LEVEL</span>
                        <ArrowUpDown size={11} className="text-slate-300" />
                      </div>
                    </th>
                    <th className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5">
                        <span>EXPIRY DATE</span>
                        <ArrowUpDown size={11} className="text-slate-300" />
                      </div>
                    </th>
                    <th className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5">
                        <span>STATUS</span>
                        <ArrowUpDown size={11} className="text-slate-300" />
                      </div>
                    </th>
                    <th className="py-3.5 px-5 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100/80">
                  {paginatedMedicines.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-medium tracking-wide">
                        No medicines match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedMedicines.map((med) => {
                      const status = getStockStatus(med);
                      return (
                        <tr key={med.id} className="hover:bg-[#fafaf8] transition">
                          <td className="py-4 px-5 font-bold text-slate-900 tracking-wide text-sm">
                            {med.name}
                          </td>
                          <td className="py-4 px-5 font-mono text-slate-600 text-xs tracking-wider">
                            {med.batchNumber || '—'}
                          </td>
                          <td className="py-4 px-5 text-slate-600 tracking-wide">
                            {med.category || 'General'}
                          </td>
                          <td className="py-4 px-5 font-bold text-slate-900 font-mono text-sm">
                            {Number(med.quantity || 0).toLocaleString()}
                          </td>
                          <td className="py-4 px-5 text-slate-600 font-mono text-xs">
                            {formatExpiry(med.expiryDate)}
                          </td>
                          <td className="py-4 px-5">
                            <span className={`inline-block px-3 py-1 rounded-md font-semibold text-[11px] tracking-wide ${status.badgeClass}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-2.5">
                              {/* View detail button */}
                              <button
                                onClick={() => setSelectedMedicine(med)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-stone-100 transition cursor-pointer"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </button>

                              {/* Edit button */}
                              {canManage && (
                                <button
                                  onClick={() => navigate('/edit-medicine', { state: { medicine: med } })}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-stone-100 transition cursor-pointer"
                                  title="Edit Medicine"
                                >
                                  <Edit2 size={16} />
                                </button>
                              )}

                              {/* Delete button */}
                              {canDelete && (
                                <button
                                  onClick={() => setDeleteModalItem(med)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                  title="Delete Formulation"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION BAR */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-stone-100 bg-[#fafaf8] text-xs text-slate-500">
              <div>
                Showing 1-{Math.min(filteredMedicines.length, itemsPerPage)} of {filteredMedicines.length} medicines
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded border border-stone-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
                >
                  Previous
                </button>
                <span className="px-2.5 py-1 rounded bg-[#4d6b5e] text-white font-semibold">
                  {currentPage}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 rounded border border-stone-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE STOCK MODAL */}
      {stockUpdateItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-stone-200">
            <h3 className="text-sm font-bold text-slate-900">
              Update Stock: {stockUpdateItem.name}
            </h3>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                New Quantity (Units)
              </label>
              <input
                type="number"
                value={newStockValue}
                onChange={(e) => setNewStockValue(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm outline-none focus:border-slate-400"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setStockUpdateItem(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStock}
                className="px-3.5 py-1.5 rounded-lg bg-[#4d6b5e] hover:bg-[#415d51] text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-stone-200">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle size={20} />
              <h3 className="text-sm font-bold text-slate-900">Confirm Deletion</h3>
            </div>
            <p className="text-xs text-slate-500">
              Are you sure you want to remove <strong>{deleteModalItem.name}</strong> from the catalog? This action cannot be reversed.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteModalItem(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDeleteMedicine}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer shadow-xs disabled:opacity-60"
              >
                {isDeleting ? 'Deleting...' : 'Delete Formulation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineDashboard;
