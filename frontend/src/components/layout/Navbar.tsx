import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceAssistant } from '../../context/VoiceAssistantContext';
import {
  Bus,
  Shield,
  MessageSquareWarning,
  MessageSquare,
  Mic,
  LayoutDashboard,
  User as UserIcon,
  LogOut,
  LogIn,
  Menu,
  X,
  PhoneCall,
  Lock
} from 'lucide-react';
import { ApsrtcLogo } from '../common/ApsrtcLogo';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { openAssistant } = useVoiceAssistant();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* Top emergency & language banner */}
      <div className="bg-apsrtc-primary text-white text-xs px-4 py-1.5 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="flex items-center font-medium">
            <PhoneCall className="w-3.5 h-3.5 mr-1 text-amber-300" />
            {t('contactEnquiry')}
          </span>
          <span className="hidden sm:inline-block text-slate-300">|</span>
          <span className="hidden sm:flex items-center font-bold text-red-300">
            {t('emergencyHelpline')}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Language selector */}
          <div className="flex items-center space-x-1 bg-apsrtc-primaryDark px-2 py-0.5 rounded text-xs">
            <button
              onClick={() => setLanguage('en')}
              className={`px-1.5 py-0.5 rounded transition ${language === 'en' ? 'bg-white text-apsrtc-primary font-bold' : 'text-slate-200 hover:text-white'}`}
            >
              English
            </button>
            <span>/</span>
            <button
              onClick={() => setLanguage('te')}
              className={`px-1.5 py-0.5 rounded transition ${language === 'te' ? 'bg-white text-apsrtc-primary font-bold' : 'text-slate-200 hover:text-white'}`}
            >
              తెలుగు
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center space-x-3">
            <ApsrtcLogo className="w-10 h-10 drop-shadow" />
            <div>
              <div className="text-xl font-black tracking-tight text-apsrtc-primary leading-none">APSRTC</div>
              <div className="text-[10px] tracking-wider text-slate-500 font-semibold uppercase">{t('tagline')}</div>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {isAdmin ? (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive('/admin/dashboard') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 mr-1.5 text-blue-600" />
                  Operations Center
                </Link>

                <Link
                  to="/admin/timetables"
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive('/admin/timetables') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Bus className="w-4 h-4 mr-1.5 text-blue-600" />
                  Fleet & Timetables
                </Link>

                <Link
                  to="/admin/routes"
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive('/admin/routes') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 mr-1.5 text-blue-600" />
                  Routes & SMS Codes
                </Link>

                <Link
                  to="/admin/users"
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive('/admin/users') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <UserIcon className="w-4 h-4 mr-1.5 text-blue-600" />
                  Passenger Registry
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/schedules"
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive('/schedules') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Bus className="w-4 h-4 mr-1.5 text-blue-600" />
                  {t('busSchedules')}
                </Link>

                <Link
                  to="/safety"
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive('/safety') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Shield className="w-4 h-4 mr-1.5 text-blue-600" />
                  {t('womensSafety')}
                </Link>

                <Link
                  to="/complaints"
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive('/complaints') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <MessageSquareWarning className="w-4 h-4 mr-1.5 text-blue-600" />
                  {t('complaints')}
                </Link>

                <Link
                  to="/sms"
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive('/sms') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 mr-1.5 text-blue-600" />
                  {t('smsRoute')}
                </Link>

                <button
                  type="button"
                  onClick={openAssistant}
                  className="flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold transition bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                >
                  <Mic className="w-4 h-4 mr-1.5 text-blue-600 animate-pulse" />
                  <span>{t('voiceAssistant')}</span>
                </button>
              </>
            )}
          </nav>

          {/* User profile / Auth buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link
                  to={isAdmin ? "/admin/dashboard" : "/dashboard"}
                  className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg text-sm font-medium transition"
                >
                  <LayoutDashboard className="w-4 h-4 text-apsrtc-primary" />
                  <span>{t('dashboard')}</span>
                </Link>

                <Link
                  to="/profile"
                  className="p-1.5 text-slate-600 hover:text-apsrtc-primary hover:bg-slate-100 rounded-full transition"
                  title="Profile"
                >
                  <UserIcon className="w-5 h-5" />
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-slate-500 hover:text-rose-600 p-1.5 rounded-full hover:bg-rose-50 transition"
                  title={t('logout')}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="flex items-center space-x-1 text-slate-700 hover:text-apsrtc-primary px-3 py-1.5 text-sm font-medium transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t('login')}</span>
                </Link>

                <Link
                  to="/register"
                  className="bg-apsrtc-primary hover:bg-apsrtc-primaryDark text-white px-3.5 py-1.5 rounded-lg text-sm font-semibold shadow-sm transition"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-700 hover:text-apsrtc-primary p-2 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 pt-2 pb-6 space-y-2 shadow-lg">
          {isAdmin ? (
            <>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-md text-base font-medium text-slate-800 hover:bg-blue-50"
              >
                <LayoutDashboard className="w-5 h-5 mr-3 text-blue-600" />
                Operations Center
              </Link>
              <Link
                to="/admin/timetables"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-md text-base font-medium text-slate-800 hover:bg-blue-50"
              >
                <Bus className="w-5 h-5 mr-3 text-blue-600" />
                Fleet & Timetables
              </Link>
              <Link
                to="/admin/routes"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-md text-base font-medium text-slate-800 hover:bg-blue-50"
              >
                <MessageSquare className="w-5 h-5 mr-3 text-blue-600" />
                Routes & SMS Codes
              </Link>
              <Link
                to="/admin/users"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-md text-base font-medium text-slate-800 hover:bg-blue-50"
              >
                <UserIcon className="w-5 h-5 mr-3 text-blue-600" />
                Passenger Registry
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/schedules"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-md text-base font-medium text-slate-800 hover:bg-blue-50"
              >
                <Bus className="w-5 h-5 mr-3 text-blue-600" />
                {t('busSchedules')}
              </Link>

              <Link
                to="/safety"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-md text-base font-medium text-slate-800 hover:bg-blue-50"
              >
                <Shield className="w-5 h-5 mr-3 text-blue-600" />
                {t('womensSafety')}
              </Link>

              <Link
                to="/complaints"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-md text-base font-medium text-slate-800 hover:bg-blue-50"
              >
                <MessageSquareWarning className="w-5 h-5 mr-3 text-blue-600" />
                {t('complaints')}
              </Link>

              <Link
                to="/sms"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-md text-base font-medium text-slate-800 hover:bg-blue-50"
              >
                <MessageSquare className="w-5 h-5 mr-3 text-blue-600" />
                {t('smsRoute')}
              </Link>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAssistant();
                }}
                className="flex items-center w-full px-3 py-2.5 rounded-md text-base font-medium text-blue-700 hover:bg-blue-50"
              >
                <Mic className="w-5 h-5 mr-3 text-blue-600 animate-pulse" />
                <span>{t('voiceAssistant')}</span>
              </button>
            </>
          )}

          <div className="border-t border-slate-200 pt-3">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to={isAdmin ? "/admin/dashboard" : "/dashboard"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-3 py-2 text-base font-medium text-apsrtc-primary"
                >
                  <LayoutDashboard className="w-5 h-5 mr-3" />
                  {t('dashboard')}
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-3 py-2 text-base font-medium text-slate-700"
                >
                  <UserIcon className="w-5 h-5 mr-3" />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-rose-600"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  {t('logout')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 bg-apsrtc-primary text-white rounded-lg text-sm font-semibold"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
