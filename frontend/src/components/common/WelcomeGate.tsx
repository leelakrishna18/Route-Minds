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
    <div className="fixed inset-0 z-[99999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white relative">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 shadow-inner mb-3">
            <ApsrtcLogo className="w-14 h-14" size={56} />
          </div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>APSRTC Official Digital Platform</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Welcome 👋 Let's Get Started!
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xs">
            Search live bus timetables, track grievances, and access women's safety services across AP.
          </p>
        </div>

        {/* Quick Email / Phone form */}
        <form onSubmit={handleContinue} className="space-y-3 mb-5">
          <div>
            <input
              type="text"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              placeholder="Enter your email or mobile number"
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={!emailOrPhone.trim()}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-blue-600/20"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-slate-800 w-full"></div>
          <span className="bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
            or choose an option
          </span>
          <div className="border-t border-slate-800 w-full"></div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => {
              navigate('/login');
              setHasDismissed(true);
            }}
            className="bg-slate-800 hover:bg-slate-700/80 text-white border border-slate-700 rounded-xl py-2.5 px-3 text-xs font-semibold flex items-center justify-center space-x-2 transition"
          >
            <LogIn className="w-3.5 h-3.5 text-blue-400" />
            <span>Log In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              navigate('/register');
              setHasDismissed(true);
            }}
            className="bg-slate-800 hover:bg-slate-700/80 text-white border border-slate-700 rounded-xl py-2.5 px-3 text-xs font-semibold flex items-center justify-center space-x-2 transition"
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Skip and explore as guest */}
        <div className="text-center pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={handleSkipAsGuest}
            className="text-xs text-slate-400 hover:text-white transition font-medium flex items-center justify-center space-x-1.5 mx-auto py-1"
          >
            <Bus className="w-3.5 h-3.5 text-amber-400" />
            <span>Skip and see bus schedules as Guest →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
