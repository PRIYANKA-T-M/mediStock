import { Routes, Route, useNavigate } from "react-router-dom";
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

const API_URL = "http://localhost:8082/api";

/* =========================================================
   LOGIN
========================================================= */

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center px-6 py-10">

      {/* Main authentication container */}
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col md:flex-row">

        {/* =================================================
            LEFT BRANDING SECTION
        ================================================= */}

        <div className="hidden md:flex md:w-1/2 bg-blue-600 text-white p-10 flex-col justify-between relative overflow-hidden">

          {/* Decorative circles */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500 rounded-full opacity-50" />
          <div className="absolute -bottom-32 -left-20 w-72 h-72 bg-teal-500 rounded-full opacity-30" />

          <div className="relative z-10">

            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center text-xl font-bold">
                M
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  MediStock
                </h1>

                <p className="text-blue-100 text-xs">
                  Medical Inventory Management
                </p>
              </div>
            </div>

            {/* Main heading */}
            <div className="max-w-md">

              <p className="text-blue-100 text-sm font-semibold mb-3">
                MEDICAL INVENTORY PLATFORM
              </p>

              <h2 className="text-4xl font-bold leading-tight mb-5">
                Manage your medical inventory with confidence.
              </h2>

              <p className="text-blue-100 leading-relaxed">
                Track medicines, monitor stock levels, manage
                suppliers and stay informed about expiry and
                inventory alerts.
              </p>

            </div>

            {/* Features */}
            <div className="mt-10 space-y-4">

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  ✓
                </div>

                <span className="text-blue-50">
                  Smart inventory management
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  ✓
                </div>

                <span className="text-blue-50">
                  Stock and expiry monitoring
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  ✓
                </div>

                <span className="text-blue-50">
                  Role-based secure access
                </span>
              </div>

            </div>
          </div>

          <p className="relative z-10 text-blue-200 text-xs">
            MediStock © 2026
          </p>

        </div>


        {/* =================================================
            RIGHT LOGIN FORM
        ================================================= */}

        <div className="w-full md:w-1/2 p-8 sm:p-10 lg:p-12 flex items-center">

          <div className="w-full max-w-md mx-auto">

            {/* Mobile logo */}
            <div className="md:hidden flex items-center gap-3 mb-8">

              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                M
              </div>

              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  MediStock
                </h1>

                <p className="text-xs text-slate-500">
                  Medical Inventory Management
                </p>
              </div>

            </div>


            {/* Heading */}
            <div className="mb-8">

              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Welcome back
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Sign in to access your MediStock dashboard.
              </p>

            </div>


            {/* Error */}
            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}


            {/* Login form */}
            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-12 px-4 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
              </div>


              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-12 px-4 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
              </div>


              {/* Login button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Logging in..." : "Login"}
              </button>

            </form>


            {/* Register */}
            <div className="mt-7 text-center">

              <span className="text-sm text-slate-500">
                Don't have an account?{" "}
              </span>

              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Create an account
              </button>

            </div>

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
    role: "STAFF",
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

    setMessage("");
    setError("");
    setLoading(true);

    try {

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });


      /*
       * Backend returns plain text:
       * "User registered successfully"
       *
       * Therefore use response.text()
       * instead of response.json()
       */
      const data = await response.text();


      if (!response.ok) {
        throw new Error(
          data || "Registration failed"
        );
      }


      setMessage(
        "Registration successful. You can now login."
      );


      setTimeout(() => {
        navigate("/login");
      }, 1200);


    } catch (err) {

      setError(
        err.message || "Registration failed"
      );

    } finally {

      setLoading(false);

    }
  };


  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center px-6 py-10">

      {/* Main authentication container */}
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col md:flex-row">


        {/* =================================================
            LEFT BRANDING SECTION
        ================================================= */}

        <div className="hidden md:flex md:w-1/2 bg-blue-600 text-white p-10 flex-col justify-between relative overflow-hidden">

          <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500 rounded-full opacity-50" />

          <div className="absolute -bottom-32 -left-20 w-72 h-72 bg-teal-500 rounded-full opacity-30" />


          <div className="relative z-10">

            <div className="flex items-center gap-3 mb-12">

              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center text-xl font-bold">
                M
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  MediStock
                </h1>

                <p className="text-blue-100 text-xs">
                  Medical Inventory Management
                </p>
              </div>

            </div>


            <div className="max-w-md">

              <p className="text-blue-100 text-sm font-semibold mb-3">
                JOIN MEDISTOCK
              </p>

              <h2 className="text-4xl font-bold leading-tight mb-5">
                Get started with smarter inventory management.
              </h2>

              <p className="text-blue-100 leading-relaxed">
                Create your account and access the tools
                you need to manage medicines, inventory and
                stock information efficiently.
              </p>

            </div>


            <div className="mt-10 space-y-4">

              <div className="flex items-center gap-3">

                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  ✓
                </div>

                <span className="text-blue-50">
                  Easy medicine management
                </span>

              </div>


              <div className="flex items-center gap-3">

                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  ✓
                </div>

                <span className="text-blue-50">
                  Real-time inventory tracking
                </span>

              </div>


              <div className="flex items-center gap-3">

                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  ✓
                </div>

                <span className="text-blue-50">
                  Secure role-based access
                </span>

              </div>

            </div>

          </div>


          <p className="relative z-10 text-blue-200 text-xs">
            MediStock © 2026
          </p>

        </div>


        {/* =================================================
            RIGHT REGISTER FORM
        ================================================= */}

        <div className="w-full md:w-1/2 p-8 sm:p-10 lg:p-12 flex items-center">

          <div className="w-full max-w-md mx-auto">


            {/* Mobile logo */}
            <div className="md:hidden flex items-center gap-3 mb-8">

              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                M
              </div>

              <div>

                <h1 className="text-xl font-bold text-slate-900">
                  MediStock
                </h1>

                <p className="text-xs text-slate-500">
                  Medical Inventory Management
                </p>

              </div>

            </div>


            {/* Heading */}
            <div className="mb-8">

              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Create your account
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Register to start using MediStock.
              </p>

            </div>


            {/* Error */}
            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}


            {/* Success */}
            {message && (
              <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {message}
              </div>
            )}


            {/* Register form */}
            <form
              onSubmit={handleRegister}
              className="space-y-5"
            >


              {/* Name */}
              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full h-12 px-4 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />

              </div>


              {/* Email */}
              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full h-12 px-4 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />

              </div>


              {/* Password */}
              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full h-12 px-4 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />

              </div>


              {/* Role */}
              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Role
                </label>

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full h-12 px-4 rounded-lg border border-slate-300 bg-white text-slate-800 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                >

                  <option value="STAFF">
                    Staff
                  </option>

                  <option value="PHARMACIST">
                    Pharmacist
                  </option>

                </select>

              </div>


              {/* Register button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Account"}
              </button>

            </form>


            {/* Back to login */}
            <div className="mt-7 text-center">

              <span className="text-sm text-slate-500">
                Already have an account?{" "}
              </span>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Sign in
              </button>

            </div>

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

      {/* =================================================
          PUBLIC ROUTES
      ================================================= */}

      <Route
        path="/"
        element={<Login />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />


      {/* =================================================
          ADMIN
      ================================================= */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />


      {/* =================================================
          MAIN DASHBOARD LAYOUT
      ================================================= */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["ADMIN", "PHARMACIST"]}
          >
            <DashboardLayout />
          </ProtectedRoute>
        }
      >

        <Route
          path="/dashboard"
          element={<MainDashboard />}
        />

        <Route
          path="/medicines"
          element={<MedicineDashboard />}
        />

        <Route
          path="/inventory"
          element={<Inventory />}
        />

        <Route
          path="/expiry-analytics"
          element={<ExpiryAnalytics />}
        />

      </Route>


      {/* =================================================
          MEDICINE MANAGEMENT
      ================================================= */}

      <Route
        path="/add-medicine"
        element={
          <ProtectedRoute
            allowedRoles={["ADMIN", "PHARMACIST"]}
          >
            <AddMedicine />
          </ProtectedRoute>
        }
      />

      <Route
        path="/edit-medicine"
        element={
          <ProtectedRoute
            allowedRoles={["ADMIN", "PHARMACIST"]}
          >
            <EditMedicine />
          </ProtectedRoute>
        }
      />


      {/* =================================================
          SUPPLIERS
      ================================================= */}

      <Route 
      path="/suppliers"
      element={ 
      <ProtectedRoute 
      allowedRoles={["ADMIN", "PHARMACIST"]}
      >
      <Suppliers />
      </ProtectedRoute>
      }
      />
      


      {/* =================================================
          ALERTS
      ================================================= */}

      <Route
  path="/alerts"
  element={
    <ProtectedRoute
      allowedRoles={["ADMIN", "PHARMACIST"]}
    >
      <Alerts />
    </ProtectedRoute>
  }
/>


      {/* =================================================
          REPORTS
      ================================================= */}

      <Route
        path="/reports"
        element={
          <ProtectedRoute
            allowedRoles={["ADMIN", "PHARMACIST"]}
          >

            <div className="min-h-screen bg-slate-50 p-8">

              <div className="max-w-6xl mx-auto bg-white rounded-xl border border-slate-200 p-8 shadow-sm">

                <h1 className="text-2xl font-bold text-slate-900">
                  Reports
                </h1>

                <p className="mt-2 text-slate-500">
                  Reports module will be integrated here.
                </p>

              </div>

            </div>

          </ProtectedRoute>
        }
      />


      {/* =================================================
          PHARMACIST
      ================================================= */}

      <Route
        path="/pharmacist"
        element={
          <ProtectedRoute allowedRoles={["PHARMACIST"]}>
            <PharmacistDashboard />
          </ProtectedRoute>
        }
      />


      {/* =================================================
          STAFF
      ================================================= */}

      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={["STAFF"]}>
            <StaffDashboard />
          </ProtectedRoute>
        }
      />


      {/* =================================================
          UNAUTHORIZED
      ================================================= */}

      <Route
        path="/unauthorized"
        element={<Unauthorized />}
      />

    </Routes>
  );
};

export default AppRoutes;