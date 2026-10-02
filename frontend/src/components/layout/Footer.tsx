import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Phone, Mail, MapPin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: About */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src="/apsrtc_logo.svg" alt="APSRTC Logo" className="w-8 h-8" />
              <span className="text-lg font-black text-white tracking-tight">APSRTC</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Andhra Pradesh State Road Transport Corporation Smart Passenger Information Platform.
              Delivering verified schedules, safety services, grievance redressal, SMS route enquiry, and voice assistance.
            </p>
            <div className="flex items-center text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
              Verified Timetable Records Source: Eluru Depot
            </div>
          </div>

          {/* Col 2: Passenger Services */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Services</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/schedules" className="hover:text-white transition">Bus Schedules & Timetables</Link>
              </li>
              <li>
                <Link to="/safety" className="hover:text-white transition">Women's Safety & Location Sharing</Link>
              </li>
              <li>
                <Link to="/complaints" className="hover:text-white transition">Passenger Grievance Redressal</Link>
              </li>
              <li>
                <Link to="/complaints/track" className="hover:text-white transition">Track Complaint Status</Link>
              </li>
              <li>
                <Link to="/sms" className="hover:text-white transition">SMS Route Code Enquiry</Link>
              </li>
              <li>
                <Link to="/assistant" className="hover:text-white transition">Multilingual Voice Assistant</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Support & Contacts */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Helpline & Contacts</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center text-rose-400 font-semibold">
                <Shield className="w-4 h-4 mr-2" />
                Emergency Services: 112 (Toll Free)
              </li>
              <li className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-slate-400" />
                APSRTC Eluru Depot: 08812-230303
              </li>
              <li className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-slate-400" />
                Vijayawada Central: 0866-2570005
              </li>
              <li className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-slate-400" />
                customercare@apsrtc.ap.gov.in
              </li>
              <li className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                APSRTC House, PNBS, Vijayawada - 520013
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Policies */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Legal & Transparency</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/privacy" className="hover:text-white transition">Privacy Policy & Location Consent</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition">Terms & Conditions of Carriage</Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-white transition text-slate-500">Official Staff Portal</Link>
              </li>
            </ul>
            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500">
              Timetable data strictly curated from station display boards. No simulated GPS tracking.
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} Andhra Pradesh State Road Transport Corporation (APSRTC). All rights reserved.
          </div>
          <div className="mt-2 sm:mt-0 flex items-center space-x-1">
            <span>Built for the passengers of Andhra Pradesh</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
