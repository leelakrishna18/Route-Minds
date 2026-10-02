import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, LogIn, UserPlus, Bus, Shield, Sparkles, CheckCircle2 } from 'lucide-react';
import { ApsrtcLogo } from './ApsrtcLogo';
import { useAuth } from '../../context/AuthContext';

export const WelcomeGate: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [hasDismissed, setHasDismissed] = useState<boolean>(() => {
    return sessionStorage.getItem('apsrtc_guest_pass') === 'true';
  });
  const [emailOrPhone, setEmailOrPhone] = useState('');

  // If already authenticated, do not show the gate
  useEffect(() => {
    if (isAuthenticated) {
      setHasDismissed(true);
    }
  }, [isAuthenticated]);

  if (isLoading || hasDismissed || isAuthenticated) {
    return null;
  }

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    const val = emailOrPhone.trim();
    if (!val) return;

    // Check if recognized in local storage
    try {
      const known = JSON.parse(localStorage.getItem('apsrtc_registered_accounts') || '{}');
      if (known[val.toLowerCase()]) {
        navigate(`/login?email=${encodeURIComponent(val)}`);
      } else {
        navigate(`/register?email=${encodeURIComponent(val)}`);
      }
    } catch {
      navigate(`/login?email=${encodeURIComponent(val)}`);
    }
    setHasDismissed(true);
  };

  const handleSkipAsGuest = () => {
    sessionStorage.setItem('apsrtc_guest_pass', 'true');
    setHasDismissed(true);
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl text-slate-800 relative">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 mb-3 shadow-sm">
            <ApsrtcLogo className="w-14 h-14" size={56} />
          </div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>APSRTC Official Digital Platform</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome to APSRTC
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-xs leading-relaxed">
            Search authentic bus timetables, track grievances, and access passenger services across Andhra Pradesh.
          </p>
        </div>

        {/* Quick Email / Phone form */}
        <form onSubmit={handleContinue} className="space-y-3 mb-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email or Mobile Number</label>
            <input
              type="text"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              placeholder="e.g. passenger@apsrtc.in or 9440123456"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
            />
          </div>

          <button
            type="submit"
            disabled={!emailOrPhone.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center space-x-2 transition shadow-sm"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-slate-200 w-full"></div>
          <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            or choose an option
          </span>
          <div className="border-t border-slate-200 w-full"></div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            type="button"
            onClick={() => {
              navigate('/login');
              setHasDismissed(true);
            }}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg py-2.5 px-3 text-xs font-semibold flex items-center justify-center space-x-2 transition shadow-xs"
          >
            <LogIn className="w-3.5 h-3.5 text-blue-600" />
            <span>Log In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              navigate('/register');
              setHasDismissed(true);
            }}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg py-2.5 px-3 text-xs font-semibold flex items-center justify-center space-x-2 transition shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5 text-blue-600" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Skip and explore as guest */}
        <div className="text-center pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleSkipAsGuest}
            className="text-xs text-slate-500 hover:text-blue-700 transition font-medium flex items-center justify-center space-x-1.5 mx-auto py-1"
          >
            <Bus className="w-3.5 h-3.5 text-blue-600" />
            <span>Skip and see bus schedules as Guest →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
