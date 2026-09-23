import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Pill,
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
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

const EditMedicine = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const passedMed = location.state?.medicine;

  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    id: passedMed?.id || '',
    name: passedMed?.name || '',
    batchNumber: passedMed?.batchNumber || '',
    category: passedMed?.category || 'Antibiotics',
    supplierId: passedMed?.supplierId || '',
    quantity: passedMed?.quantity !== undefined ? passedMed.quantity : '',
    price: passedMed?.price !== undefined ? passedMed.price : '',
    reorderLevel: passedMed?.reorderLevel !== undefined ? passedMed.reorderLevel : '20',
    manufacturingDate: passedMed?.manufacturingDate || '',
    expiryDate: passedMed?.expiryDate || '',
    location: passedMed?.location || 'Shelf A-1',
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
      } catch (err) {
        console.error('Failed to load suppliers:', err);
      }
    };

    fetchSuppliers();

    if (!passedMed) {
      setError('No medicine selected for editing. Please navigate from the medicine catalog.');
    }
  }, [passedMed]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id) {
      setError('Cannot update: missing medicine ID.');
      return;
    }

    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Medicine name is required.');
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

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        batchNumber: formData.batchNumber.trim(),
        category: formData.category,
        supplierId: Number(formData.supplierId) || passedMed?.supplierId || 1,
        quantity: qty,
        price: price,
        reorderLevel: Number(formData.reorderLevel) || 20,
        manufacturingDate: formData.manufacturingDate,
        expiryDate: formData.expiryDate,
        location: formData.location,
      };

      await api.put(`/api/medicines/${formData.id}`, payload);

      setSuccess(`Medicine "${formData.name}" was successfully updated!`);
      setTimeout(() => {
        navigate('/medicines');
      }, 1200);
    } catch (err) {
      console.error('Failed to update medicine:', err);
      setError(
        err.response?.data?.message || 'Failed to update medicine. Please verify inputs.'
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
              Edit Medicine Details
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Modify catalog specifications, pricing, stock levels or expiry dates.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/medicines')}
          className="text-xs font-bold text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
        >
          Back to List
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
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 font-medium border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Batch Number */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Batch Number *
            </label>
            <input
              type="text"
              name="batchNumber"
              required
              value={formData.batchNumber}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 font-medium border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
            />
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
              Supplier Vendor
            </label>
            <select
              name="supplierId"
              value={formData.supplierId}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 font-medium border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Quantity on Hand *
            </label>
            <input
              type="number"
              name="quantity"
              min="0"
              required
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
            <input
              type="number"
              step="0.01"
              min="0.01"
              name="price"
              required
              value={formData.price}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 font-medium border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
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

          {/* Storage Shelf */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Pharmacy Storage Location
            </label>
            <input
              type="text"
              name="location"
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
            <span>{submitting ? 'Updating Record...' : 'Update Medicine'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMedicine;
