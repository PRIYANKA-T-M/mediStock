import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pill,
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  DollarSign,
  Layers,
  Hash
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

const CATEGORIES = [
  'Antibiotics',
  'Analgesics',
  'Antipyretics',
  'Cardiovascular',
  'Diabetes & Insulin',
  'Respiratory',
  'Gastrointestinal',
  'Vitamins & Supplements',
  'Dermatological',
  'General Medicine',
];

const AddMedicine = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    batchNumber: '',
    category: 'Antibiotics',
    supplierId: '',
    quantity: '',
    price: '',
    reorderLevel: '20',
    manufacturingDate: '',
    expiryDate: '',
    location: 'Shelf A-1',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await api.get('/api/suppliers');
        const sups = res.data || [];
        setSuppliers(sups);
        if (sups.length > 0) {
          setFormData((prev) => ({ ...prev, supplierId: sups[0].id }));
        }
      } catch (err) {
        console.error('Failed to load suppliers:', err);
      } finally {
        setLoadingSuppliers(false);
      }
    };

    fetchSuppliers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validations required by PRD
    if (!formData.name.trim()) {
      setError('Medicine name is required.');
      return;
    }
    if (!formData.batchNumber.trim()) {
      setError('Batch number is required.');
      return;
    }
    const qty = Number(formData.quantity);
    if (isNaN(qty) || qty < 0) {
      setError('Quantity must be a valid non-negative number.');
      return;
    }
    const price = Number(formData.price);
    if (isNaN(price) || price <= 0) {
      setError('Price must be a valid positive number.');
      return;
    }
    if (formData.manufacturingDate && formData.expiryDate) {
      const mfg = new Date(formData.manufacturingDate);
      const exp = new Date(formData.expiryDate);
      if (exp <= mfg) {
        setError('Expiry date must be strictly after the manufacturing date.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        batchNumber: formData.batchNumber.trim(),
        category: formData.category,
        supplierId: Number(formData.supplierId) || (suppliers[0] ? suppliers[0].id : 1),
        quantity: qty,
        price: price,
        reorderLevel: Number(formData.reorderLevel) || 20,
        manufacturingDate: formData.manufacturingDate,
        expiryDate: formData.expiryDate,
        location: formData.location || 'Shelf A-1',
      };

      await api.post('/api/medicines', payload);

      setSuccess(`Medicine "${formData.name}" was successfully registered!`);
      setTimeout(() => {
        navigate('/medicines');
      }, 1200);
    } catch (err) {
      console.error('Failed to create medicine:', err);
      setError(
        err.response?.data?.message || 'Failed to save medicine to database. Please verify inputs.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/medicines')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              Add New Medicine
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Register a new pharmaceutical product, batch metadata, and inventory threshold.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/medicines')}
          className="text-xs font-bold text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* FORM CARD */}
      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Medicine Name */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Medicine Name *
            </label>
            <div className="relative">
              <Pill className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Paracetamol 500mg"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-9 pr-3.5 py-2.5 font-medium border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Batch Number */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Batch Number *
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                name="batchNumber"
                required
                placeholder="e.g. BAT-2026-089"
                value={formData.batchNumber}
                onChange={handleChange}
                className="w-full pl-9 pr-3.5 py-2.5 font-medium border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 font-medium border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Supplier */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Supplier Vendor *
            </label>
            <select
              name="supplierId"
              value={formData.supplierId}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 font-medium border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.city || 'India'})
                </option>
              ))}
            </select>
          </div>

          {/* Initial Stock Quantity */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Initial Quantity (Units) *
            </label>
            <input
              type="number"
              name="quantity"
              min="0"
              required
              placeholder="e.g. 100"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 font-medium border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Unit Price */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Unit Price (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="price"
                required
                placeholder="e.g. 24.50"
                value={formData.price}
                onChange={handleChange}
                className="w-full pl-8 pr-3.5 py-2.5 font-medium border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Manufacturing Date */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Manufacturing Date
            </label>
            <input
              type="date"
              name="manufacturingDate"
              value={formData.manufacturingDate}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 font-medium border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Expiry Date *
            </label>
            <input
              type="date"
              name="expiryDate"
              required
              value={formData.expiryDate}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 font-medium border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Reorder Level */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reorder Warning Threshold
            </label>
            <input
              type="number"
              name="reorderLevel"
              min="1"
              value={formData.reorderLevel}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 font-medium border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Storage Shelf / Location */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Pharmacy Storage Location
            </label>
            <input
              type="text"
              name="location"
              placeholder="e.g. Section B, Shelf 3"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 font-medium border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/medicines')}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-md shadow-sky-600/20 transition disabled:opacity-50"
          >
            <Save size={15} />
            <span>{submitting ? 'Registering Medicine...' : 'Save Medicine'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMedicine;
