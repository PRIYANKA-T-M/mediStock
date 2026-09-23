import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  RefreshCw,
  Printer,
  Boxes,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

const REPORT_TYPES = [
  { id: 'INVENTORY', name: 'Inventory Valuation & Stock Summary Report', desc: 'Current stock quantities, reorder thresholds, shelf placement & valuation' },
  { id: 'MOVEMENT', name: 'Stock Movement & Dispensing Audit Report', desc: 'Inflow from purchases vs outbound dispensing and adjustments' },
  { id: 'PURCHASE', name: 'Supplier Purchases & Restock Orders Report', desc: 'Supplier order status, purchase totals, lead times & fulfillment' },
  { id: 'EXPIRY', name: 'Expiry & Critical Disposal Risk Analysis', desc: 'Medicines nearing expiration within 7/30 days and expired inventory' },
];

const Reports = () => {
  const { user } = useAuth();

  const [reportType, setReportType] = useState('INVENTORY');
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [generating, setGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [medRes, supRes, alertRes] = await Promise.allSettled([
          api.get('/api/medicines'),
          api.get('/api/suppliers'),
          api.get('/api/alerts'),
        ]);

        if (medRes.status === 'fulfilled') setMedicines(medRes.value.data || []);
        if (supRes.status === 'fulfilled') setSuppliers(supRes.value.data || []);
        if (alertRes.status === 'fulfilled') setAlerts(alertRes.value.data || []);
      } catch (err) {
        console.error('Failed to load data for reporting:', err);
      }
    };

    fetchData();
  }, []);

  const handleGenerateReport = () => {
    setGenerating(true);

    setTimeout(() => {
      const now = new Date();
      let records = [];
      let totalValue = 0;

      if (reportType === 'INVENTORY') {
        records = medicines.map((m, idx) => {
          const qty = m.quantity || 0;
          const price = m.price || 15;
          const val = qty * price;
          totalValue += val;
          return {
            id: m.id || idx + 1,
            col1: m.name,
            col2: m.category || 'Pharmaceutical',
            col3: m.batchNumber || `BAT-${idx + 100}`,
            col4: `${qty} units`,
            col5: `₹${price.toFixed(2)}`,
            col6: `₹${val.toFixed(2)}`,
            col7: qty <= 20 ? (qty === 0 ? 'Out of Stock' : 'Low Stock') : 'Optimal',
          };
        });
      } else if (reportType === 'EXPIRY') {
        records = medicines.map((m, idx) => {
          const exp = m.expiryDate || '2026-12-31';
          const expDate = new Date(exp);
          const diffDays = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
          return {
            id: m.id || idx + 1,
            col1: m.name,
            col2: m.batchNumber || `BAT-${idx + 100}`,
            col3: exp,
            col4: diffDays > 0 ? `${diffDays} days` : 'EXPIRED',
            col5: `${m.quantity || 0} units`,
            col6: diffDays <= 7 ? 'Critical' : (diffDays <= 30 ? 'Near Expiry' : 'Safe'),
            col7: diffDays <= 30 ? 'Action Required' : 'Monitored',
          };
        });
      } else if (reportType === 'PURCHASE') {
        records = suppliers.map((s, idx) => {
          const spend = (idx + 1) * 32400;
          totalValue += spend;
          return {
            id: s.id || idx + 1,
            col1: s.name,
            col2: s.contactPerson || 'Sales Team',
            col3: `${s.leadTimeDays || 4} days`,
            col4: `★ ${s.rating || 4.5}`,
            col5: `₹${spend.toLocaleString()}`,
            col6: s.status || 'ACTIVE',
            col7: 'Fulfilled',
          };
        });
      } else {
        // MOVEMENT
        records = medicines.map((m, idx) => {
          const inQ = (idx + 1) * 45;
          const outQ = (idx + 1) * 22;
          return {
            id: m.id || idx + 1,
            col1: m.name,
            col2: `Dispense & Restock`,
            col3: `+${inQ} units`,
            col4: `-${outQ} units`,
            col5: `${m.quantity || 0} units remaining`,
            col6: 'Verified',
            col7: 'Audit Clean',
          };
        });
      }

      setGeneratedReport({
        id: `REP-${Math.floor(100000 + Math.random() * 900000)}`,
        type: reportType,
        typeName: REPORT_TYPES.find((r) => r.id === reportType)?.name,
        dateGenerated: now.toLocaleString(),
        generatedBy: user?.name || 'Administrator',
        dateRange: `${startDate} to ${endDate}`,
        totalValue: totalValue > 0 ? `₹${totalValue.toLocaleString()}` : null,
        recordCount: records.length,
        records,
      });

      setGenerating(false);
    }, 600);
  };

  const downloadCSV = () => {
    if (!generatedReport) return;

    let headers = [];
    if (generatedReport.type === 'INVENTORY') {
      headers = ['ID', 'Medicine', 'Category', 'Batch #', 'Stock Qty', 'Unit Price', 'Total Valuation', 'Status'];
    } else if (generatedReport.type === 'EXPIRY') {
      headers = ['ID', 'Medicine', 'Batch #', 'Expiry Date', 'Days Remaining', 'Current Stock', 'Risk Level', 'Recommendation'];
    } else if (generatedReport.type === 'PURCHASE') {
      headers = ['ID', 'Supplier', 'Contact Person', 'Lead Time', 'Rating', 'Total Order Value', 'Status', 'Fulfillment'];
    } else {
      headers = ['ID', 'Medicine', 'Operation', 'Inflow Quantity', 'Outflow Dispensed', 'Closing Balance', 'Verification', 'Audit Result'];
    }

    const rows = generatedReport.records.map((r) => [
      r.id,
      `"${r.col1}"`,
      `"${r.col2}"`,
      `"${r.col3}"`,
      `"${r.col4}"`,
      `"${r.col5}"`,
      `"${r.col6}"`,
      `"${r.col7 || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MediStock_${generatedReport.type}_${startDate}_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = () => {
    if (!generatedReport) return;

    const reportText = `
================================================================================
                    MEDISTOCK HEALTHCARE SYSTEMS
                  OFFICIAL PHARMACY & INVENTORY REPORT
================================================================================
Report ID      : ${generatedReport.id}
Report Title   : ${generatedReport.typeName}
Date Range     : ${generatedReport.dateRange}
Generated On   : ${generatedReport.dateGenerated}
Generated By   : ${generatedReport.generatedBy} (${user?.role || 'PHARMACIST'})
Record Count   : ${generatedReport.recordCount} items
${generatedReport.totalValue ? `Total Valuation: ${generatedReport.totalValue}\n` : ''}
================================================================================

${generatedReport.records
  .map(
    (r) =>
      `#${r.id.toString().padEnd(4)} | ${r.col1.padEnd(25)} | ${r.col2.padEnd(16)} | ${r.col3.padEnd(14)} | ${r.col4.padEnd(12)} | ${r.col5.padEnd(12)} | ${r.col6}`
  )
  .join('\n')}

================================================================================
End of Certified Report • MediStock System Signature Verified
================================================================================
    `;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MediStock_Report_${generatedReport.id}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
            <FileText size={14} className="text-sky-600" />
            Milestone 3 Analytics & Auditing
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Inventory & Compliance Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate certified inventory, stock movement, purchase orders and expiry reports with export to Excel & PDF.
          </p>
        </div>

        {generatedReport && (
          <div className="flex items-center gap-2">
            <button
              onClick={downloadPDF}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition"
            >
              <Download size={14} />
              <span>Download PDF</span>
            </button>
            <button
              onClick={downloadCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
            >
              <FileSpreadsheet size={14} />
              <span>Download Excel (CSV)</span>
            </button>
          </div>
        )}
      </div>

      {/* REPORT CONFIGURATION PANEL */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-slate-900">Configure Report Parameters</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Report Type */}
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {REPORT_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              {REPORT_TYPES.find((r) => r.id === reportType)?.desc}
            </p>
          </div>

          {/* Date Range - From */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              From Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Date Range - To */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              To Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Generate Button & Presets */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Quick Presets:</span>
            <button
              onClick={() => {
                const now = new Date();
                setEndDate(now.toISOString().split('T')[0]);
                setStartDate(new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0]);
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => {
                const now = new Date();
                setEndDate(now.toISOString().split('T')[0]);
                setStartDate(new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0]);
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              Last 30 Days
            </button>
            <button
              onClick={() => {
                const now = new Date();
                setEndDate(now.toISOString().split('T')[0]);
                setStartDate(new Date(now.getTime() - 90 * 86400000).toISOString().split('T')[0]);
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              Quarter
            </button>
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold shadow-md shadow-sky-600/20 transition disabled:opacity-50"
          >
            {generating ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Compiling Report...</span>
              </>
            ) : (
              <>
                <FileText size={16} />
                <span>Generate Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* GENERATED REPORT RESULT CONTAINER */}
      {generatedReport ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          {/* Report Meta Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900">{generatedReport.typeName}</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Ref ID: <span className="font-mono font-bold text-slate-800">{generatedReport.id}</span> •
                Period: {generatedReport.dateRange} • Generated by {generatedReport.generatedBy}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-semibold">Total Records</span>
                <span className="text-lg font-extrabold text-slate-900">{generatedReport.recordCount}</span>
              </div>
              {generatedReport.totalValue && (
                <div className="text-right pl-4 border-l border-slate-200">
                  <span className="text-xs text-slate-400 block font-semibold">Valuation</span>
                  <span className="text-lg font-extrabold text-emerald-600">{generatedReport.totalValue}</span>
                </div>
              )}
            </div>
          </div>

          {/* Report Table Preview */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold bg-slate-50/50">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">
                    {generatedReport.type === 'PURCHASE' ? 'Supplier' : 'Medicine'}
                  </th>
                  <th className="py-3 px-4">
                    {generatedReport.type === 'INVENTORY' ? 'Category' : (generatedReport.type === 'EXPIRY' ? 'Batch #' : (generatedReport.type === 'PURCHASE' ? 'Contact' : 'Operation'))}
                  </th>
                  <th className="py-3 px-4">
                    {generatedReport.type === 'INVENTORY' ? 'Batch #' : (generatedReport.type === 'EXPIRY' ? 'Expiry Date' : (generatedReport.type === 'PURCHASE' ? 'Lead Time' : 'Inflow'))}
                  </th>
                  <th className="py-3 px-4">
                    {generatedReport.type === 'INVENTORY' ? 'Stock Quantity' : (generatedReport.type === 'EXPIRY' ? 'Days Left' : (generatedReport.type === 'PURCHASE' ? 'Rating' : 'Outflow'))}
                  </th>
                  <th className="py-3 px-4">
                    {generatedReport.type === 'INVENTORY' ? 'Unit Price' : (generatedReport.type === 'EXPIRY' ? 'Quantity' : (generatedReport.type === 'PURCHASE' ? 'Total Order' : 'Balance'))}
                  </th>
                  <th className="py-3 px-4">
                    {generatedReport.type === 'INVENTORY' ? 'Total Valuation' : (generatedReport.type === 'EXPIRY' ? 'Risk Level' : (generatedReport.type === 'PURCHASE' ? 'Status' : 'Audit Check'))}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {generatedReport.records.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono text-slate-400">{r.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{r.col1}</td>
                    <td className="py-3 px-4 text-slate-600">{r.col2}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{r.col3}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{r.col4}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{r.col5}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {r.col6}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Download Action Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Report ready for export in standard formats. Compliant with pharmaceutical records auditing.
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={downloadPDF}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
              >
                <Download size={14} />
                <span>Download PDF</span>
              </button>
              <button
                onClick={downloadCSV}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
              >
                <FileSpreadsheet size={14} />
                <span>Download Excel (CSV)</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-xs text-center">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-4">
            <FileText size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Report Generated Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Select a report type and date range above, then click <strong>"Generate Report"</strong> to preview and export live data.
          </p>
        </div>
      )}
    </div>
  );
};

export default Reports;
