import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bus,
  Shield,
  MessageSquareWarning,
  MessageSquare,
  Mic,
  ArrowRight,
  Search,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { api } from '../services/api';
import { Stop } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { DEFAULT_STOPS } from '../utils/defaultStops';

export const LandingPage: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [stops, setStops] = useState<Stop[]>(DEFAULT_STOPS);
  const [sourceStopId, setSourceStopId] = useState(() => DEFAULT_STOPS[0]?.id || '');
  const [destStopId, setDestStopId] = useState(() => DEFAULT_STOPS[1]?.id || '');
  const [travelDate, setTravelDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    api.get<Stop[]>('/schedules/stops')
      .then(data => {
        if (data && data.length > 0) {
          setStops(data);
          const elr = data.find(s => s.name === 'Eluru');
          const bza = data.find(s => s.name === 'Vijayawada');
          if (elr) setSourceStopId(elr.id);
          if (bza) setDestStopId(bza.id);
        }
      })
      .catch(console.error);
  }, []);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceStopId || !destStopId) return;
    navigate(`/schedules?from=${sourceStopId}&to=${destStopId}&date=${travelDate}`);
  };

  const swapStops = () => {
    const temp = sourceStopId;
    setSourceStopId(destStopId);
    setDestStopId(temp);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-apsrtc-primary via-apsrtc-primaryDark to-slate-900 text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-emerald-300 border border-white/15">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Authentic Station Board Schedules — Sourced directly from APSRTC Eluru Depot</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            {language === 'te' 
              ? 'ఆంధ్రప్రదేశ్ ప్రయాణీకుల డిజిటల్ సేవా వేదిక'
              : 'Unified APSRTC Passenger Information Platform'}
          </h1>

          <p className="text-sm sm:text-lg text-slate-200 max-w-3xl mx-auto leading-relaxed">
            Search verified bus schedules, request women's safety assistance, submit complaints with real-time tracking,
            query routes via SMS, or talk to our bilingual voice assistant.
          </p>

          {/* Quick Bus Schedule Search Widget */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-2xl text-slate-800 text-left max-w-4xl mx-auto mt-8 border border-slate-100">
            <h2 className="text-lg font-bold text-apsrtc-primary mb-4 flex items-center">
              <Bus className="w-5 h-5 mr-2" />
              {t('busSchedules')} — Quick Search
            </h2>

            <form onSubmit={handleQuickSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{t('from')}</label>
                <div className="relative">
                  <select
                    value={sourceStopId}
                    onChange={(e) => setSourceStopId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-apsrtc-primary"
                    required
                  >
                    <option value="">Select origin...</option>
                    {stops.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.name_te ? `(${s.name_te})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-600">{t('to')}</label>
                  <button
                    type="button"
                    onClick={swapStops}
                    className="text-[11px] text-apsrtc-primary hover:underline font-medium"
                  >
                    ⇄ Swap
                  </button>
                </div>
                <select
                  value={destStopId}
                  onChange={(e) => setDestStopId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-apsrtc-primary"
                  required
                >
                  <option value="">Select destination...</option>
                  {stops.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.name_te ? `(${s.name_te})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{t('travelDate')}</label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-apsrtc-primary"
                  required
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full bg-apsrtc-primary hover:bg-apsrtc-primaryDark text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 transition shadow-md"
                >
                  <Search className="w-4 h-4" />
                  <span>{t('searchBuses')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 5 Core Feature Cards Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-16 relative z-20">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">One Unified Passenger Portal</h3>
          <p className="text-sm text-slate-600">Access all 5 vital passenger services from a single responsive interface</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Bus Schedules */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 text-apsrtc-primary flex items-center justify-center mb-4">
                <Bus className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Bus Schedules & Timetables</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Explore real, station-verified bus departures for routes including Vijayawada, Hyderabad, Visakhapatnam, Tirupati, Rajahmundry, and rural mandals.
              </p>
            </div>
            <Link
              to="/schedules"
              className="inline-flex items-center text-sm font-semibold text-apsrtc-primary hover:text-apsrtc-primaryDark"
            >
              Search bus timings <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {/* Card 2: Women's Safety */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Women's Safety Assistance</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Save trusted emergency contacts, share your temporary live location with explicit permission, and access a one-click 112 emergency telephone dialer.
              </p>
            </div>
            <Link
              to="/safety"
              className="inline-flex items-center text-sm font-semibold text-rose-600 hover:text-rose-700"
            >
              Access safety tools <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {/* Card 3: Complaints Portal */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                <MessageSquareWarning className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Passenger Grievance Redressal</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Submit complaints regarding bus delays, cleanliness, staff conduct, or bus condition with photo proof and transparent reference tracking.
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/complaints"
                className="inline-flex items-center text-sm font-semibold text-amber-600 hover:text-amber-700"
              >
                File complaint <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <Link
                to="/complaints/track"
                className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800"
              >
                Track status
              </Link>
            </div>
          </div>

          {/* Card 4: SMS Route Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">SMS Route Information</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                No internet? Text simple route codes like <span className="font-mono font-bold bg-slate-100 px-1 rounded">VJY</span>, <span className="font-mono font-bold bg-slate-100 px-1 rounded">HYD</span>, or <span className="font-mono font-bold bg-slate-100 px-1 rounded">RJY</span> to receive scheduled departures directly on your mobile.
              </p>
            </div>
            <Link
              to="/sms"
              className="inline-flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700"
            >
              View SMS codes <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {/* Card 5: Voice Assistant */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <Mic className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Bilingual Voice Assistant</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Speak or type in English or Telugu (తెలుగు) to enquire about bus schedules, emergency features, and grievance registration with spoken audio answers.
              </p>
            </div>
            <Link
              to="/assistant"
              className="inline-flex items-center text-sm font-semibold text-purple-600 hover:text-purple-700"
            >
              Start conversation <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {/* Card 6: Transparency & Depot Verification */}
          <div className="bg-slate-900 rounded-xl p-6 text-white flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Verified Transit Data</h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                All timetables are transcribed directly from APSRTC Eluru Depot display boards (Platforms 1, 2, 4 & Main Hall). No fabricated GPS tracks or fake statuses.
              </p>
            </div>
            <div className="text-xs text-slate-400 border-t border-slate-800 pt-3">
              Depot Enquiry Desk: 08812-230303
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
