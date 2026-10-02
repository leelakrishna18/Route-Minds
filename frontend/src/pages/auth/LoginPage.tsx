import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { api, ApiError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { ApsrtcLogo } from '../../components/common/ApsrtcLogo';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let data: any;
      try {
        data = await api.post('/auth/login', {
          identifier: identifier.trim(),
          password
        });
      } catch (loginErr: any) {
        // If server cold-started without user in ephemeral sqlite, check if we have a known registered account locally
        const knownAccounts = JSON.parse(localStorage.getItem('apsrtc_registered_accounts') || '{}');
        const candidate = knownAccounts[identifier.trim().toLowerCase()] ||
          Object.values(knownAccounts).find((a: any) => a.mobile_number === identifier.trim());

        if (candidate && candidate.password === password) {
          // Re-seed user to the active backend instance seamlessly
          await api.post('/auth/register', candidate);
          data = await api.post('/auth/login', {
            identifier: identifier.trim(),
            password
          });
        } else {
          throw loginErr;
        }
      }

      login(data.access_token, data.user);
      const from = (location.state as any)?.from?.pathname || (data.user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Login failed. Please check your network connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <ApsrtcLogo className="w-16 h-16 drop-shadow" size={64} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Passenger Login</h2>
          <p className="text-xs text-slate-500 mt-1">Access your saved contacts, grievances, and personalized travel services</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email or Mobile Number
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. yourname@gmail.com or 9440123456"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-apsrtc-primary"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <Link to="/forgot-password" className="text-xs text-apsrtc-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-apsrtc-primary pr-10"
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-apsrtc-primary hover:bg-apsrtc-primaryDark text-white font-semibold py-2.5 rounded-lg flex items-center justify-center space-x-2 transition shadow-sm disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-bold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
