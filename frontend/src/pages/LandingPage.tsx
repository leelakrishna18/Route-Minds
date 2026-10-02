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
import { useVoiceAssistant } from '../context/VoiceAssistantContext';
import { DEFAULT_STOPS } from '../utils/defaultStops';

export const LandingPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { openAssistant } = useVoiceAssistant();
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
          const elr = data.find(s => s.name === 'Eluru') || data[0];
          const bza = data.find(s => s.name === 'Vijayawada') || data[1];
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

  const eluruStop = stops.find(s => s.name === 'Eluru') || DEFAULT_STOPS[0];
  const destinationStops = stops.filter(s => s.name !== 'Eluru');

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-50 via-white to-blue-50/30 pt-12 sm:pt-16 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-100">
        <div className="max-w-5xl mx-auto text-center space-y-5">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {language === 'te' ? (
              <>
                ఆంధ్రప్రదేశ్ ప్రయాణీకుల <span className="text-blue-600">డిజిటల్ సేవా వేదిక</span>
              </>
            ) : (
              <>
                Unified APSRTC <span className="text-blue-600">Passenger Information Platform</span>
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Search verified bus schedules, request women's safety assistance, submit complaints with real-time tracking,
            query routes via SMS, or speak with our bilingual voice assistant.
          </p>

          {/* Quick Bus Schedule Search Widget */}
          <div className="bg-white rounded-2xl p-5 sm:p-7 shadow-sm border border-slate-200 text-slate-800 text-left max-w-4xl mx-auto mt-8">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center">
              <Bus className="w-5 h-5 mr-2 text-blue-600" />
              {t('busSchedules')} — Quick Search
            </h2>

            <form onSubmit={handleQuickSearch} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t('from')}</label>
                <select
                  value={sourceStopId}
                  onChange={(e) => setSourceStopId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                >
                  <option value={eluruStop.id}>
                    {eluruStop.name} {eluruStop.name_te ? `(${eluruStop.name_te})` : ''} — Eluru Depot Hub
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t('to')}</label>
                <select
                  value={destStopId}
                  onChange={(e) => setDestStopId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                >
                  <option value="">Select destination...</option>
                  {destinationStops.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.name_te ? `(${s.name_te})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t('travelDate')}</label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 transition shadow-xs"
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-10">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">One Unified Passenger Portal</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-lg mx-auto">Access all 5 vital passenger services from a single responsive interface</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Bus Schedules */}
          <div className="bg-white rounded-xl p-6 shadow-xs border border-slate-200 hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Bus className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Bus Schedules & Timetables</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Explore authentic bus departures for routes including Vijayawada, Hyderabad, Visakhapatnam, Tirupati, Rajahmundry, and rural mandals.
              </p>
            </div>
            <Link
              to="/schedules"
              className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              Search bus timings <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {/* Card 2: Women's Safety */}
          <div className="bg-white rounded-xl p-6 shadow-xs border border-slate-200 hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Women's Safety Assistance</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Save trusted emergency contacts, share temporary live GPS location with explicit permission, and access a one-click 112 emergency helpline.
              </p>
            </div>
            <Link
              to="/safety"
              className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              Access safety tools <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {/* Card 3: Complaints Portal */}
          <div className="bg-white rounded-xl p-6 shadow-xs border border-slate-200 hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <MessageSquareWarning className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Passenger Grievance Redressal</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Submit complaints regarding bus timings, cleanliness, staff conduct, or bus condition with photo proof and transparent reference tracking.
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/complaints"
                className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                File complaint <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
              <Link
                to="/complaints/track"
                className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-800"
              >
                Track status
              </Link>
            </div>
          </div>

          {/* Card 4: SMS Route Info */}
          <div className="bg-white rounded-xl p-6 shadow-xs border border-slate-200 hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">SMS Route Information</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                No internet? Text simple route codes like <span className="font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">VJY</span>, <span className="font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">HYD</span>, or <span className="font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">RJY</span> to receive scheduled departures directly on your mobile.
              </p>
            </div>
            <Link
              to="/sms"
              className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              View SMS codes <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {/* Card 5: Voice Assistant */}
          <div className="bg-white rounded-xl p-6 shadow-xs border border-slate-200 hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Mic className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Bilingual Voice Assistant</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Speak or type in English or Telugu (తెలుగు) to enquire about bus schedules, emergency features, and helpline contacts with spoken audio responses.
              </p>
            </div>
            <button
              type="button"
              onClick={openAssistant}
              className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800 text-left"
            >
              Start voice enquiry <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          {/* Card 6: Transit Data Verification */}
          <div className="bg-white rounded-xl p-6 shadow-xs border border-slate-200 hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Verified Transit Data</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                All timetables are directly linked to official APSRTC regional depot schedules. Authentic departure timings, verified routes, and real depot enquiry helpline.
              </p>
            </div>
            <div className="text-xs text-slate-500 border-t border-slate-100 pt-3">
              Depot Enquiry Desk: <span className="font-semibold text-slate-800">08812-230303</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
