import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import authService from '../services/authService';
import { useAuth } from '../context/useAuth';

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState(location.state?.successMessage || '');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    if (apiError) setApiError('');
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login({
        email: formData.email.trim(),
        password: formData.password,
      });

      login(response);
      setApiSuccess('Login successful! Redirecting...');

      const role = response?.role?.toUpperCase();

      if (role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (role === 'PHARMACIST') {
        navigate('/dashboard', { replace: true });
      } else if (role === 'STAFF') {
        navigate('/staff', { replace: true });
      } else {
        navigate('/unauthorized', { replace: true });
      }
    } catch (err) {
      const message = authService.handleError(err);
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
        
        {/* Branding */}
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-stone-100 text-stone-700 mb-4 border border-stone-200">
            <Activity size={28} strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">
            Medi<span className="text-[#4e6b5d]">Stock</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-2 text-center leading-relaxed">
            Clinical apothecary & pharmacy inventory control system
          </p>
        </div>

        {/* Success Banner */}
        {apiSuccess && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800 leading-relaxed">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
            <div>{apiSuccess}</div>
          </div>
        )}

        {/* Error Banner */}
        {apiError && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800 leading-relaxed">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-600" />
            <div>{apiError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
          
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
              Work Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-stone-400 pointer-events-none">
                <Mail size={18} />
              </span>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="name@hospital.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="email"
                className={`w-full h-12 pl-11 pr-4 rounded-xl border bg-stone-50/50 text-sm text-slate-900 outline-none transition focus:bg-white 
                  ${errors.email ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' : 'border-stone-200 hover:border-stone-300 focus:border-stone-400 focus:ring-2 focus:ring-[#4e6b5d]/20'}`}
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-xs font-medium text-rose-600 flex items-center gap-1">
                <AlertCircle size={13} /> {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-stone-400 pointer-events-none">
                <Lock size={18} />
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your security password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="current-password"
                className={`w-full h-12 pl-11 pr-11 rounded-xl border bg-stone-50/50 text-sm text-slate-900 outline-none transition focus:bg-white 
                  ${errors.password ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' : 'border-stone-200 hover:border-stone-300 focus:border-stone-400 focus:ring-2 focus:ring-[#4e6b5d]/20'}`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400 hover:text-stone-600 transition cursor-pointer"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-2 text-xs font-medium text-rose-600 flex items-center gap-1">
                <AlertCircle size={13} /> {errors.password}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#4e6b5d] text-white text-sm font-semibold tracking-wide transition hover:bg-[#415b4f] disabled:opacity-70 disabled:cursor-not-allowed shadow-xs cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-xs sm:text-sm text-stone-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-slate-900 underline hover:text-[#4e6b5d] transition">
            Create an associate account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
