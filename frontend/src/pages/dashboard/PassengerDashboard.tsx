import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bus,
  Shield,
  MessageSquareWarning,
  MessageSquare,
  Mic,
  ArrowRight,
  User,
  PhoneCall,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Complaint, TrustedContact } from '../../types';

export const PassengerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<Complaint[]>('/complaints/my').catch(() => []),
      api.get<TrustedContact[]>('/safety/contacts').catch(() => [])
    ]).then(([comps, conts]) => {
      setRecentComplaints(comps);
      setContacts(conts);
      setLoading(false);
    });
  }, []);

  const passengerName = user?.profile?.full_name || 'Passenger';

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-apsrtc-primary to-apsrtc-primaryDark rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-emerald-300 font-bold mb-1">
              APSRTC Smart Portal &bull; Passenger Desk
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {language === 'te' ? `నమస్కారం, ${passengerName} గారు!` : `Welcome, ${passengerName}!`}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 mt-2 max-w-2xl leading-relaxed">
              Access verified timetables from Eluru Depot, activate women's safety location sharing,
              track grievances, or text our SMS gateway for instant travel timings.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/safety"
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center shadow transition"
            >
              <Shield className="w-4 h-4 mr-1.5" />
              Safety Assistance
            </Link>
            <a
              href="tel:112"
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2.5 rounded-lg flex items-center border border-white/20 transition"
            >
              <PhoneCall className="w-3.5 h-3.5 mr-1 text-red-300" />
              Call 112
            </a>
          </div>
        </div>

        {/* Five Main Working Feature Cards */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Core Passenger Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1: Bus Schedules */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:border-blue-300 transition flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-apsrtc-primary flex items-center justify-center mb-4">
                  <Bus className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">1. Bus Schedules & Routes</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Search bus timetables for Vijayawada, Hyderabad, Visakhapatnam, Tirupati, and rural mandals. Boarding and arrival times verified against depot boards.
                </p>
              </div>
              <Link
                to="/schedules"
                className="w-full bg-blue-50 hover:bg-blue-100 text-apsrtc-primary font-semibold text-xs py-2.5 px-3 rounded-lg flex items-center justify-center transition"
              >
                Search Bus Schedules <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </div>

            {/* Feature 2: Women's Safety */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:border-rose-300 transition flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">2. Women's Safety Assistance</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Register emergency contacts, trigger temporary live location sharing with an encrypted link, and access emergency call options.
                </p>
              </div>
              <Link
                to="/safety"
                className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs py-2.5 px-3 rounded-lg flex items-center justify-center transition"
              >
                Open Safety Assistance <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </div>

            {/* Feature 3: Passenger Grievances */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:border-amber-300 transition flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                  <MessageSquareWarning className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">3. Passenger Complaint Portal</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Report bus delays, cleanliness issues, staff behaviour, or mechanical problems with photo attachments. Get a unique Reference ID to track redressal.
                </p>
              </div>
              <Link
                to="/complaints"
                className="w-full bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-xs py-2.5 px-3 rounded-lg flex items-center justify-center transition"
              >
                File or Track Complaint <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </div>

            {/* Feature 4: SMS Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:border-emerald-300 transition flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">4. SMS-Based Route Information</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Send simple SMS route codes (VJY, HYD, RJY, TPG) from any basic feature phone to instantly get upcoming scheduled departures.
                </p>
              </div>
              <Link
                to="/sms"
                className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs py-2.5 px-3 rounded-lg flex items-center justify-center transition"
              >
                View SMS Codes & Simulator <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </div>

            {/* Feature 5: Multilingual Voice Assistant */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:border-purple-300 transition flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                  <Mic className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">5. Bilingual Voice Assistant</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Speak in Telugu or English. Ask questions about bus routes, next departures, complaint instructions, or women's safety assistance with audio synthesis.
                </p>
              </div>
              <Link
                to="/assistant"
                className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs py-2.5 px-3 rounded-lg flex items-center justify-center transition"
              >
                Launch Voice Assistant <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </div>

            {/* Profile Management Quick Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:border-slate-300 transition flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Profile & Emergency Info</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Manage your personal details, preferred language, emergency blood group, and medical notes for safety features.
                </p>
              </div>
              <Link
                to="/profile"
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2.5 px-3 rounded-lg flex items-center justify-center transition"
              >
                Manage Profile <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </div>

          </div>
        </div>

        {/* Recent Activity Sections (Complaints & Trusted Contacts) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Complaints */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <MessageSquareWarning className="w-4 h-4 mr-2 text-amber-600" />
                My Submitted Complaints
              </h3>
              <Link to="/complaints" className="text-xs text-apsrtc-primary font-semibold hover:underline">
                File New
              </Link>
            </div>

            {loading ? (
              <div className="text-xs text-slate-400 py-4 text-center">Loading complaints...</div>
            ) : recentComplaints.length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center border border-dashed rounded-lg">
                No complaints submitted yet.
              </div>
            ) : (
              <div className="space-y-3">
                {recentComplaints.slice(0, 3).map(c => (
                  <div key={c.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <div className="flex justify-between items-start">
                      <span className="font-mono font-bold text-slate-700">{c.reference_id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.current_status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' :
                        c.current_status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {c.current_status}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-900 mt-1">{c.subject}</div>
                    <div className="text-slate-500 mt-0.5">{c.category} &bull; {new Date(c.created_at).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Trusted Contacts Preview */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <Shield className="w-4 h-4 mr-2 text-rose-600" />
                Emergency Trusted Contacts
              </h3>
              <Link to="/safety" className="text-xs text-rose-600 font-semibold hover:underline">
                Manage
              </Link>
            </div>

            {loading ? (
              <div className="text-xs text-slate-400 py-4 text-center">Loading contacts...</div>
            ) : contacts.length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center border border-dashed rounded-lg">
                No trusted contacts saved. Add family members to enable instant emergency sharing.
              </div>
            ) : (
              <div className="space-y-3">
                {contacts.map(cnt => (
                  <div key={cnt.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-slate-900 flex items-center">
                        {cnt.name}
                        {cnt.is_primary && (
                          <span className="ml-2 bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.2 rounded font-bold">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500">{cnt.relationship} &bull; +91 {cnt.mobile_number}</div>
                    </div>
                    <a
                      href={`tel:+91${cnt.mobile_number}`}
                      className="p-2 text-slate-600 hover:text-emerald-600 bg-white rounded-full border border-slate-200 shadow-sm"
                      title="Call Contact"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
