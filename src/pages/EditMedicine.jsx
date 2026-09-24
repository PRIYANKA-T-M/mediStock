import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

const CATEGORIES = [
  'Analgesics',
  'Antibiotics',
  'Antidiabetic',
  'Cardiovascular',
  'Antihistamines',
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
    category: passedMed?.category || 'Analgesics',
    supplierId: passedMed?.supplierId || '',
    supplierName: passedMed?.supplierName || '',
    quantity: passedMed?.quantity !== undefined ? String(passedMed.quantity) : '0',
    unitPrice: passedMed?.unitPrice || passedMed?.price ? String(passedMed.unitPrice || passedMed.price) : '45.00',
    reorderLevel: passedMed?.reorderLevel ? String(passedMed.reorderLevel) : '500',
    manufacturingDate: passedMed?.mfgDate || passedMed?.manufacturingDate || '',
    expiryDate: passedMed?.expiryDate || '',
    location: passedMed?.location || 'Cabinet B-Row 4',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await api.get('/api/suppliers');
        setSuppliers(res.data || []);
      } catch (err) {
        console.error('Failed to load suppliers:', err);
      }
    };
    fetchSuppliers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'supplierId') {
      const selected = suppliers.find((s) => String(s.id) === String(value));
      setFormData((prev) => ({
        ...prev,
        supplierId: value,
        supplierName: selected?.name || '',
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Medicine name is required.');
      return;
    }

    setSubmitting(true);
    try {
      if (formData.id) {
        await api.put(`/api/medicines/${formData.id}`, {
          name: formData.name.trim(),
          batchNumber: formData.batchNumber.trim(),
          category: formData.category,
          supplierId: formData.supplierId ? Number(formData.supplierId) : null,
          supplierName: formData.supplierName,
          quantity: Number(formData.quantity),
          price: Number(formData.unitPrice || 0),
          unitPrice: Number(formData.unitPrice || 0),
          reorderLevel: Number(formData.reorderLevel || 20),
          manufacturingDate: formData.manufacturingDate || null,
          expiryDate: formData.expiryDate,
          location: formData.location || 'Shelf A-1',
        });
      }

      setSuccess(`Medicine "${formData.name}" updated successfully.`);
      setTimeout(() => {
        navigate('/medicines');
      }, 1000);
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
      {/* Breadcrumb & Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
          <button
            onClick={() => navigate('/medicines')}
            className="hover:text-slate-700 cursor-pointer"
          >
            Medicines
          </button>
          <span>&gt;</span>
          <span className="text-slate-700 font-medium">Edit Medicine Details</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Medicine Details</h1>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 size={15} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* FORM CARD */}
      <div className="bg-white rounded-2xl border border-stone-200/70 shadow-xs p-7 space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Formulation & Inventory Parameters
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Modify batch properties, stock levels, or reorder limits for this catalog item.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Paracetamol 500mg"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full h-10 px-3.5 rounded-lg border border-stone-200 bg-[#fafaf8] text-slate-800 text-xs outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Batch Number *
                </label>
                <input
                  type="text"
                  name="batchNumber"
                  required
                  placeholder="PR-8821"
                  value={formData.batchNumber}
                  onChange={handleChange}
                  className="w-full h-10 px-3.5 rounded-lg border border-stone-200 bg-[#fafaf8] text-slate-800 text-xs font-mono outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full h-10 px-3.5 rounded-lg border border-stone-200 bg-[#fafaf8] text-slate-800 text-xs outline-none focus:border-slate-400 focus:bg-white font-medium"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Preferred Supplier
                </label>
                <select
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleChange}
                  className="w-full h-10 px-3.5 rounded-lg border border-stone-200 bg-[#fafaf8] text-slate-800 text-xs outline-none focus:border-slate-400 focus:bg-white font-medium"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                  <option value="ABC Pharma Ltd.">ABC Pharma Ltd.</option>
                  <option value="Apex BioLabs LLC">Apex BioLabs LLC</option>
                  <option value="PharmaCorp Global">PharmaCorp Global</option>
                  <option value="Vanguard Chem">Vanguard Chem</option>
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Quantity (Units) *
                </label>
                <input
                  type="number"
                  name="quantity"
                  required
                  placeholder="2400"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full h-10 px-3.5 rounded-lg border border-stone-200 bg-[#fafaf8] text-slate-800 text-xs outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Manufacturing Date
                </label>
                <input
                  type="date"
                  name="manufacturingDate"
                  value={formData.manufacturingDate}
                  onChange={handleChange}
                  className="w-full h-10 px-3.5 rounded-lg border border-stone-200 bg-[#fafaf8] text-slate-800 text-xs outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  required
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="w-full h-10 px-3.5 rounded-lg border border-stone-200 bg-[#fafaf8] text-slate-800 text-xs outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Unit Price (INR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="unitPrice"
                  required
                  placeholder="45.00"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  className="w-full h-10 px-3.5 rounded-lg border border-stone-200 bg-[#fafaf8] text-slate-800 text-xs outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={() => navigate('/medicines')}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-[#4d6b5e] hover:bg-[#415d51] text-white text-xs font-semibold shadow-xs transition disabled:opacity-60 cursor-pointer"
            >
              {submitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMedicine;
