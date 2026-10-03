import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle, X } from 'lucide-react';
import { api, ApiError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ApsrtcLogo } from '../../components/common/ApsrtcLogo';

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile_number: '',
    password: '',
    confirm_password: '',
    terms_accepted: false,
    preferred_language: 'en'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileError, setMobileError] = useState<string | null>(null);
  const [mobileTouched, setMobileTouched] = useState(false);
  const [showPopupAlert, setShowPopupAlert] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMobileKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const hasSelection = (input.selectionEnd ?? 0) - (input.selectionStart ?? 0) > 0;

    if (/^\d$/.test(e.key) && formData.mobile_number.length >= 10 && !hasSelection) {
      e.preventDefault();
      setShowPopupAlert(true);
      setMobileError('Please enter a valid 10-digit mobile number. Do not enter more than 10 digits.');
    }
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const digitsOnly = rawValue.replace(/\D/g, '');

    if (digitsOnly.length > 10) {
      const truncated = digitsOnly.slice(0, 10);
      setFormData(prev => ({ ...prev, mobile_number: truncated }));
      setShowPopupAlert(true);
      setMobileError('Please enter a valid 10-digit mobile number. Do not enter more than 10 digits.');
      return;
    }

    setFormData(prev => ({ ...prev, mobile_number: digitsOnly }));

    if (digitsOnly.length === 10) {
      setMobileError(null);
      setShowPopupAlert(false);
    } else if (mobileTouched) {
      setMobileError('10 digits are required.');
    } else if (mobileError && mobileError.includes('10-digit')) {
      setMobileError(null);
      setShowPopupAlert(false);
    }
  };

  const handleMobileBlur = () => {
    setMobileTouched(true);
    if (formData.mobile_number.length !== 10) {
      setMobileError('10 digits are required.');
    } else {
      setMobileError(null);
    }
  };

  const handleMobilePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    const digitsOnly = pasteData.replace(/\D/g, '');
    if (digitsOnly.length > 10) {
      const truncated = digitsOnly.slice(0, 10);
      setFormData(prev => ({ ...prev, mobile_number: truncated }));
      setShowPopupAlert(true);
      setMobileError('Please enter a valid 10-digit mobile number. Do not enter more than 10 digits.');
    } else {
      setFormData(prev => ({ ...prev, mobile_number: digitsOnly }));
      if (digitsOnly.length === 10) {
        setMobileError(null);
        setShowPopupAlert(false);
      } else if (mobileTouched) {
        setMobileError('10 digits are required.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.mobile_number.length !== 10) {
      setMobileTouched(true);
      setMobileError('10 digits are required.');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    if (!formData.terms_accepted) {
      setError('You must accept the Terms of Service and Privacy Policy to register.');
      return;
    }

    setIsLoading(true);

    try {
      const data: any = await api.post('/auth/register', formData);
      try {
        const known = JSON.parse(localStorage.getItem('apsrtc_registered_accounts') || '{}');
        known[formData.email.trim().toLowerCase()] = {
          email: formData.email.trim(),
          password: formData.password,
          full_name: formData.full_name.trim(),
          mobile_number: formData.mobile_number.trim(),
          preferred_language: formData.preferred_language,
          terms_accepted: true
        };
        localStorage.setItem('apsrtc_registered_accounts', JSON.stringify(known));
      } catch (e) {}

      login(data.access_token, data.user);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err.message || 'Registration could not be completed. Please check your connection to the server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Red Pop-up Alert Message */}
      {showPopupAlert && (
        <div 
          role="alert"
          className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-md w-11/12 bg-red-600 text-white px-4 py-3.5 rounded-xl shadow-2xl flex items-center justify-between space-x-3 border-2 border-red-700 transition-all duration-300 animate-in fade-in slide-in-from-top-4"
        >
          <div className="flex items-center space-x-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-white" />
            <p className="text-xs sm:text-sm font-semibold tracking-tight">
              Please enter a valid 10-digit mobile number. Do not enter more than 10 digits.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowPopupAlert(false)}
            className="text-white/80 hover:text-white hover:bg-red-700/50 rounded-lg p-1 transition flex-shrink-0"
            title="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <ApsrtcLogo className="w-14 h-14 drop-shadow" size={56} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Passenger Registration</h2>
          <p className="text-xs text-slate-500 mt-1">Create an official APSRTC passenger account</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="e.g. Ramesh Varma"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-apsrtc-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. passenger@apsrtc.in"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number (10 digits)</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 bg-slate-100 text-slate-500 text-xs font-semibold">
                +91
              </span>
              <input
                type="tel"
                name="mobile_number"
                value={formData.mobile_number}
                onChange={handleMobileChange}
                onKeyDown={handleMobileKeyDown}
                onBlur={handleMobileBlur}
                onPaste={handleMobilePaste}
                placeholder="9848012345"
                maxLength={15}
                className={`w-full bg-slate-50 border rounded-r-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 font-mono ${
                  mobileError ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/20' : 'border-slate-300 focus:ring-blue-600'
                }`}
                required
              />
            </div>
            {mobileError && (
              <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center space-x-1" role="alert">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{mobileError}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 chars, 1 uppercase, 1 digit, 1 special"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              placeholder="Re-enter password"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div className="flex items-start space-x-2 pt-1">
            <input
              type="checkbox"
              id="terms_accepted"
              name="terms_accepted"
              checked={formData.terms_accepted}
              onChange={handleChange}
              className="mt-1 h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-600"
              required
            />
            <label htmlFor="terms_accepted" className="text-xs text-slate-600">
              I agree to the{' '}
              <Link to="/terms" target="_blank" className="text-blue-600 underline">
                Terms of Service
              </Link>{' '}
              and acknowledge the{' '}
              <Link to="/privacy" target="_blank" className="text-blue-600 underline">
                Privacy Policy
              </Link>.
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center space-x-2 transition shadow-xs disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
          Already registered?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
