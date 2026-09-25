import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/useAuth";
import ProtectedRoute from "../components/ProtectedRoutes";

import AdminDashboard from "../pages/AdminDashboard";
import PharmacistDashboard from "../pages/PharmacistDashboard";
import StaffDashboard from "../pages/StaffDashboard";
import Unauthorized from "../pages/Unauthorized";

import MedicineDashboard from "../pages/MedicineDashboard";
import AddMedicine from "../pages/AddMedicine";
import EditMedicine from "../pages/EditMedicine";
import Inventory from "../pages/Inventory";
import ExpiryAnalytics from "../pages/ExpiryAnalytics";
import DashboardLayout from "../components/DashboardLayout";
import MainDashboard from "../pages/MainDashboard";
import Suppliers from "../pages/Suppliers";
import Alerts from "../pages/Alerts";
import StockTracking from "../pages/StockTracking";
import Purchases from "../pages/Purchases";
import Reports from "../pages/Reports";

const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) return "/api";
  if (typeof window !== "undefined") {
    if (envUrl.includes("localhost") && !window.location.hostname.includes("localhost")) {
      return "/api";
    }
    if (window.location.protocol === "https:" && envUrl.startsWith("http:")) {
      return "/api";
    }
  }
  return `${envUrl}/api`;
};

const API_URL = getApiUrl();

/* =========================================================
   AUTH LEFT BRAND PANEL COMPONENT
========================================================= */

const AuthLeftPanel = () => (
  <div className="hidden lg:flex lg:w-1/2 bg-[#111c24] text-white p-14 sm:p-16 flex-col justify-between relative overflow-hidden select-none">
    {/* TOP BRAND */}
    <div className="flex items-center gap-3 z-10">
      <div className="w-7 h-7 rounded-full bg-[#4e6b5d] text-white flex items-center justify-center text-sm font-bold shadow-xs">
        <span className="font-bold leading-none">+</span>
      </div>
      <span className="font-bold text-base tracking-widest text-white font-mono">MEDISTOCK</span>
    </div>

    {/* CENTER APOTHECARY RADIAL / CLOCK GRAPHIC */}
    <div className="my-auto flex items-center justify-center relative py-12">
      <div className="relative w-88 h-88 flex items-center justify-center">
        {/* Outer subtle ring */}
        <div className="absolute inset-0 rounded-full border border-slate-700/40" />
        {/* Dashed middle ring */}
        <div className="absolute inset-10 rounded-full border border-dashed border-slate-700/60" />
        {/* Inner solid ring */}
        <div className="absolute inset-20 rounded-full border border-slate-700/50" />
        {/* Concentric rotating radial arms */}
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-52 h-52 text-[#4e6b5d]/85" viewBox="0 0 100 100" fill="none" stroke="currentColor">
            {/* Center hub */}
            <circle cx="50" cy="50" r="7" fill="#4e6b5d" />
            {/* Thick clock arms / molecule bonds */}
            <path d="M50 20 L50 50 L75 50" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M26 35 L44 46" strokeWidth="4.5" strokeLinecap="round" opacity="0.6" />
            <path d="M68 62 L82 72" strokeWidth="4.5" strokeLinecap="round" opacity="0.6" />
            <path d="M32 68 L44 57" strokeWidth="4.5" strokeLinecap="round" opacity="0.4" />
            <path d="M65 33 L78 22" strokeWidth="4.5" strokeLinecap="round" opacity="0.4" />
          </svg>
        </div>
      </div>
    </div>

    {/* BOTTOM TEXT */}
    <div className="max-w-lg z-10 space-y-3.5">
      <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
        Apothecary systems refined for modern clinical precision.
      </h3>
      <p className="text-sm text-slate-400 font-normal leading-relaxed">
        Designed to strict pharmaceutical standards to monitor cold-chains, track sensitive chemicals, and maintain continuous inventory integrity.
      </p>
    </div>
  </div>
);

/* =========================================================
   LOGIN
========================================================= */

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [maintainSession, setMaintainSession] = useState(true);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid email or password"
        );
      }

      // Store authentication data
      login(data);

      // Role-based navigation
      if (data.role === "ADMIN") {
        navigate("/admin");
      } else if (data.role === "PHARMACIST") {
        navigate("/pharmacist");
      } else if (data.role === "STAFF") {
        navigate("/staff");
      } else {
        navigate("/unauthorized");
      }

    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#fafaf8] font-sans antialiased text-slate-800">
      <AuthLeftPanel />

      {/* RIGHT AUTH FORM PANEL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-14 lg:p-20">
        <div className="w-full max-w-lg space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">Access System</h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-2 leading-relaxed">
              Provide your clinical identification keys to enter the pharmacy management portal.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium leading-relaxed">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                Work Email
              </label>
              <input
                type="email"
                placeholder="admin@clinical.medistock.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-xl border border-stone-200 bg-stone-50/50 text-slate-900 text-sm placeholder:text-stone-400 outline-none transition focus:bg-white focus:border-stone-400 focus:ring-2 focus:ring-[#4e6b5d]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-12 pl-4 pr-11 rounded-xl border border-stone-200 bg-stone-50/50 text-slate-900 text-sm placeholder:text-stone-400 outline-none transition focus:bg-white focus:border-stone-400 focus:ring-2 focus:ring-[#4e6b5d]/20"
                />
                <div className="absolute right-4 top-4 text-stone-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-stone-600">
                <input
                  type="checkbox"
                  checked={maintainSession}
                  onChange={(e) => setMaintainSession(e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300 text-[#4e6b5d] focus:ring-[#4e6b5d] cursor-pointer"
                />
                <span>Maintain active clinical session</span>
              </label>
              <button
                type="button"
                onClick={() => alert("Please contact your clinical pharmacy administrator to reset identification keys.")}
                className="text-stone-500 hover:text-slate-900 font-medium cursor-pointer transition"
              >
                Recovery options
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#4e6b5d] hover:bg-[#415b4f] text-white text-sm font-semibold tracking-wide transition shadow-xs disabled:opacity-60 cursor-pointer"
            >
              {loading ? "Authorizing Clinical Credentials..." : "Secure Authorization"}
            </button>

            {/* Quick Demo Switcher */}
            <div className="pt-5 border-t border-stone-100 text-center space-y-3">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest block">
                Quick Fill Clinical Credentials
              </span>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setEmail("admin@medistock.com");
                    setPassword("admin123");
                  }}
                  className="py-2.5 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-slate-800 transition cursor-pointer shadow-xs"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("pharmacist@medistock.com");
                    setPassword("pharma123");
                  }}
                  className="py-2.5 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-slate-800 transition cursor-pointer shadow-xs"
                >
                  Pharmacist
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("staff@medistock.com");
                    setPassword("staff123");
                  }}
                  className="py-2.5 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-slate-800 transition cursor-pointer shadow-xs"
                >
                  Staff
                </button>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="text-center pt-2 text-xs sm:text-sm text-stone-500">
            Unregistered clinician?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="font-bold text-slate-900 underline hover:text-[#4e6b5d] cursor-pointer"
            >
              Register associate account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   REGISTER
========================================================= */

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "PHARMACIST",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.text();

      if (!response.ok) {
        throw new Error(data || "Registration failed");
      }

      setMessage("Credentials established. Redirecting to access portal...");
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#fafaf8] font-sans antialiased text-slate-800">
      <AuthLeftPanel />

      {/* RIGHT AUTH FORM PANEL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-14 lg:p-20">
        <div className="w-full max-w-lg space-y-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">Establish Credentials</h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-2 leading-relaxed">
              Create your official clinical inventory associate account.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium leading-relaxed">
              {error}
            </div>
          )}

          {message && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium leading-relaxed">
              {message}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                Full Name & Title
              </label>
              <input
                type="text"
                name="name"
                placeholder="Dr. Eleanor Vance, PharmD"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full h-12 px-4 rounded-xl border border-stone-200 bg-stone-50/50 text-slate-900 text-sm placeholder:text-stone-400 outline-none transition focus:bg-white focus:border-stone-400 focus:ring-2 focus:ring-[#4e6b5d]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                Work Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="e.vance@clinical.medistock.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full h-12 px-4 rounded-xl border border-stone-200 bg-stone-50/50 text-slate-900 text-sm placeholder:text-stone-400 outline-none transition focus:bg-white focus:border-stone-400 focus:ring-2 focus:ring-[#4e6b5d]/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full h-12 pl-4 pr-11 rounded-xl border border-stone-200 bg-stone-50/50 text-slate-900 text-sm placeholder:text-stone-400 outline-none transition focus:bg-white focus:border-stone-400 focus:ring-2 focus:ring-[#4e6b5d]/20"
                  />
                  <div className="absolute right-4 top-4 text-stone-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full h-12 pl-4 pr-11 rounded-xl border border-stone-200 bg-stone-50/50 text-slate-900 text-sm placeholder:text-stone-400 outline-none transition focus:bg-white focus:border-stone-400 focus:ring-2 focus:ring-[#4e6b5d]/20"
                  />
                  <div className="absolute right-4 top-4 text-stone-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                Assigned Clinical Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full h-12 px-4 rounded-xl border border-stone-200 bg-stone-50/50 text-slate-900 text-sm outline-none transition focus:bg-white focus:border-stone-400 focus:ring-2 focus:ring-[#4e6b5d]/20 font-medium"
              >
                <option value="PHARMACIST">Pharmacist-in-Charge</option>
                <option value="ADMIN">Clinical Administrator</option>
                <option value="STAFF">Dispensary Staff</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#4e6b5d] hover:bg-[#415b4f] text-white text-sm font-semibold tracking-wide transition shadow-xs disabled:opacity-60 cursor-pointer"
            >
              {loading ? "Establishing Credentials..." : "Create Official Account"}
            </button>
          </form>

          <div className="text-center pt-2 text-xs sm:text-sm text-stone-500">
            Already registered?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-bold text-slate-900 underline hover:text-[#4e6b5d] cursor-pointer"
            >
              Access Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


/* =========================================================
   APPLICATION ROUTES
========================================================= */

const AppRoutes = () => {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* UNIFIED PROTECTED DASHBOARD LAYOUT FOR ALL ROLES */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "PHARMACIST", "STAFF"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<MainDashboard />} />

        {/* ROLE ROOT DASHBOARDS */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pharmacist"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "PHARMACIST"]}>
              <PharmacistDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "PHARMACIST", "STAFF"]}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        {/* PHARMACEUTICAL & STOCK OPERATIONS */}
        <Route path="/medicines" element={<MedicineDashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/stock" element={<StockTracking />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/alerts" element={<Alerts />} />

        {/* CLINICAL MANAGEMENT & SURVEILLANCE */}
        <Route
          path="/expiry-analytics"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "PHARMACIST"]}>
              <ExpiryAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchases"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "PHARMACIST"]}>
              <Purchases />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "PHARMACIST"]}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-medicine"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "PHARMACIST"]}>
              <AddMedicine />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-medicine"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "PHARMACIST"]}>
              <EditMedicine />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* FALLBACK CATCH-ALL */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;