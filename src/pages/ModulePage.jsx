import { Link } from "react-router-dom";
import { ArrowLeft, Bell, FileText, Truck } from "lucide-react";
import "./ModulePage.css";

const moduleInfo = {
    suppliers: {
        title: "Supplier Management",
        subtitle: "Manage supplier records and keep vendor information organized.",
        icon: Truck,
        actions: ["Add Supplier", "View Suppliers"],
    },
    alerts: {
        title: "Alerts & Notifications",
        subtitle: "Review low-stock and expiry alerts from the inventory system.",
        icon: Bell,
        actions: ["Low Stock Alerts", "Expiry Alerts"],
    },
    reports: {
        title: "Reports",
        subtitle: "Access inventory, expiry and supplier reporting modules.",
        icon: FileText,
        actions: ["Inventory Report", "Expiry Report"],
    },
};

const ModulePage = ({ type }) => {
    const info = moduleInfo[type] || moduleInfo.reports;
    const Icon = info.icon;

    return (
        <div className="module-page">
            <div className="module-card">
                <Link to="/dashboard" className="back-link"><ArrowLeft size={17} /> Back to Dashboard</Link>
                <div className="module-icon"><Icon size={28} /></div>
                <p className="module-eyebrow">MEDISTOCK MODULE</p>
                <h1>{info.title}</h1>
                <p className="module-subtitle">{info.subtitle}</p>
                <div className="module-actions">
                    {info.actions.map((action) => <button key={action}>{action}</button>)}
                </div>
                <div className="module-note">This module is ready in the dashboard navigation. Its live CRUD/API functionality can be connected when the corresponding backend APIs are available.</div>
            </div>
        </div>
    );
};

export default ModulePage;
