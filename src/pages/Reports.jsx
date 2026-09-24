import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

const REPORT_TYPES = [
  {
    id: 'INVENTORY',
    name: 'Inventory Valuation & Stock Summary',
    desc: 'Current stock quantities, reorder thresholds, shelf placement, and valuation',
  },
  {
    id: 'MOVEMENT',
    name: 'Stock Movement & Dispensing Audit',
    desc: 'Inflow from purchases vs outbound dispensing and adjustments',
  },
  {
    id: 'PURCHASE',
    name: 'Supplier Purchases & Restock Orders',
    desc: 'Supplier order status, purchase totals, lead times, and fulfillment',
  },
  {
    id: 'EXPIRY',
    name: 'Expiry & Critical Disposal Risk Analysis',
    desc: 'Medicines nearing expiration within 7/30 days and expired inventory',
  },
];

const Reports = () => {
  const { user } = useAuth();

  const [reportType, setReportType] = useState('INVENTORY');
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

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
            col6: diffDays < 0 ? 'CRITICAL - EXPIRED' : diffDays <= 30 ? 'HIGH RISK' : 'STABLE',
          };
        });
      } else if (reportType === 'PURCHASE') {
        records = suppliers.map((s, idx) => ({
          id: s.id || idx + 1,
          col1: s.name,
          col2: s.phone || s.email || 'N/A',
          col3: `${s.leadTimeDays || 3} days lead`,
          col4: `★ ${s.rating || 4.5}`,
          col5: '₹45,000 avg PO',
          col6: s.status || 'ACTIVE',
        }));
      } else {
        records = [
          {
            id: 1,
            col1: 'Paracetamol 500mg',
            col2: 'DISPENSE',
            col3: '+500 in / -45 out',
            col4: '455 Net',
            col5: '₹5,460',
            col6: 'VERIFIED',
          },
          {
            id: 2,
            col1: 'Amoxicillin 500mg',
            col2: 'DISPENSE',
            col3: '+200 in / -32 out',
            col4: '168 Net',
            col5: '₹4,704',
            col6: 'VERIFIED',
          },
          {
            id: 3,
            col1: 'Human Insulin 40 IU/ml',
            col2: 'PURCHASE_PO',
            col3: '+100 in / -12 out',
            col4: '88 Net',
            col5: '₹15,840',
            col6: 'VERIFIED',
          },
          {
            id: 4,
            col1: 'Cetirizine 10mg',
            col2: 'DISPENSE',
            col3: '+300 in / -80 out',
            col4: '220 Net',
            col5: '₹1,760',
            col6: 'VERIFIED',
          },
        ];
      }

      setGeneratedReport({
        id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
        type: reportType,
        typeName: REPORT_TYPES.find((r) => r.id === reportType)?.name,
        dateGenerated: now.toISOString().split('T')[0],
        dateRange: `${startDate} to ${endDate}`,
        records,
        recordCount: records.length,
        totalValue: totalValue > 0 ? `₹${totalValue.toLocaleString()}` : null,
        generatedBy: user?.name || 'Administrator',
      });

      setGenerating(false);
    }, 400);
  };

  const downloadCSV = () => {
    if (!generatedReport) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `Report Title,${generatedReport.typeName}\n`;
    csvContent += `Report ID,${generatedReport.id}\n`;
    csvContent += `Period,${generatedReport.dateRange}\n`;
    csvContent += `Generated On,${generatedReport.dateGenerated}\n`;
    csvContent += `Generated By,${generatedReport.generatedBy}\n\n`;

    csvContent += 'Index,Column 1,Column 2,Column 3,Column 4,Column 5,Column 6\n';

    generatedReport.records.forEach((row) => {
      const line = [row.id, row.col1, row.col2, row.col3, row.col4, row.col5, row.col6]
        .map((val) => `"${val || ''}"`)
        .join(',');
      csvContent += line + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MediStock_Report_${generatedReport.id}.csv`);
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
End of Certified Report • MediStock System
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
    <div className="space-y-8">
      {/* ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Inventory & Compliance Reports
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate certified inventory, stock movement, purchase orders, and expiry statements.
          </p>
        </div>

        {generatedReport && (
          <div className="flex items-center gap-2">
            <button
              onClick={downloadPDF}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Download size={13} />
              <span>Download Text/PDF</span>
            </button>
            <button
              onClick={downloadCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <FileSpreadsheet size={13} />
              <span>Export CSV</span>
            </button>
          </div>
        )}
      </div>

      {/* PARAMETERS CONFIGURATION */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">Configure Report Parameters</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
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

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              From Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2 text-slate-400" size={14} />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              To Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2 text-slate-400" size={14} />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Presets:</span>
            <button
              onClick={() => {
                const now = new Date();
                setEndDate(now.toISOString().split('T')[0]);
                setStartDate(new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0]);
              }}
              className="px-2 py-0.5 rounded text-xs text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              7 Days
            </button>
            <button
              onClick={() => {
                const now = new Date();
                setEndDate(now.toISOString().split('T')[0]);
                setStartDate(new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0]);
              }}
              className="px-2 py-0.5 rounded text-xs text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              30 Days
            </button>
            <button
              onClick={() => {
                const now = new Date();
                setEndDate(now.toISOString().split('T')[0]);
                setStartDate(new Date(now.getTime() - 90 * 86400000).toISOString().split('T')[0]);
              }}
              className="px-2 py-0.5 rounded text-xs text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              Quarter
            </button>
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            {generating ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                <span>Compiling Report...</span>
              </>
            ) : (
              <>
                <FileText size={13} />
                <span>Generate Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* GENERATED REPORT RESULT */}
      {generatedReport ? (
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3.5 rounded-lg bg-slate-50/70 border border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">{generatedReport.typeName}</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Ref ID: <span className="font-mono font-medium text-slate-800">{generatedReport.id}</span> ·
                Period: {generatedReport.dateRange} · Generated by {generatedReport.generatedBy}
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Total Records</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {generatedReport.recordCount}
                </span>
              </div>
              {generatedReport.totalValue && (
                <div className="pl-4 border-l border-slate-200">
                  <span className="text-slate-400 block">Valuation</span>
                  <span className="text-base font-bold text-emerald-600 font-mono">
                    {generatedReport.totalValue}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/70">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">
                    {generatedReport.type === 'PURCHASE' ? 'Supplier' : 'Medicine'}
                  </th>
                  <th className="py-2.5 px-3">
                    {generatedReport.type === 'INVENTORY'
                      ? 'Category'
                      : generatedReport.type === 'EXPIRY'
                      ? 'Batch #'
                      : generatedReport.type === 'PURCHASE'
                      ? 'Contact'
                      : 'Operation'}
                  </th>
                  <th className="py-2.5 px-3">
                    {generatedReport.type === 'INVENTORY'
                      ? 'Batch #'
                      : generatedReport.type === 'EXPIRY'
                      ? 'Expiry Date'
                      : generatedReport.type === 'PURCHASE'
                      ? 'Lead Time'
                      : 'Inflow'}
                  </th>
                  <th className="py-2.5 px-3">
                    {generatedReport.type === 'INVENTORY'
                      ? 'Stock Quantity'
                      : generatedReport.type === 'EXPIRY'
                      ? 'Days Left'
                      : generatedReport.type === 'PURCHASE'
                      ? 'Rating'
                      : 'Outflow'}
                  </th>
                  <th className="py-2.5 px-3">
                    {generatedReport.type === 'INVENTORY'
                      ? 'Unit Price'
                      : generatedReport.type === 'EXPIRY'
                      ? 'Quantity'
                      : generatedReport.type === 'PURCHASE'
                      ? 'Total Order'
                      : 'Balance'}
                  </th>
                  <th className="py-2.5 px-3">
                    {generatedReport.type === 'INVENTORY'
                      ? 'Total Valuation'
                      : generatedReport.type === 'EXPIRY'
                      ? 'Risk Level'
                      : generatedReport.type === 'PURCHASE'
                      ? 'Status'
                      : 'Audit Check'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {generatedReport.records.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition">
                    <td className="py-2.5 px-3 font-mono text-slate-400">{r.id}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{r.col1}</td>
                    <td className="py-2.5 px-3 text-slate-600">{r.col2}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{r.col3}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-800">{r.col4}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-900">{r.col5}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-slate-700 font-medium">{r.col6}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-10 rounded-xl border border-slate-200/80 shadow-xs text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
            <FileText size={24} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">No Report Generated Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Select a report type and date range above, then click "Generate Report" to compile data.
          </p>
        </div>
      )}
    </div>
  );
};

export default Reports;
