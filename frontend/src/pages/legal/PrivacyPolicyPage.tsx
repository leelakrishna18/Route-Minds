import React from 'react';
import { Shield, Lock, MapPin, Eye, FileText } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm space-y-8 text-xs text-slate-600 leading-relaxed">
        
        <div className="border-b border-slate-200 pb-6">
          <div className="flex items-center space-x-2 text-xs font-bold text-apsrtc-primary uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>APSRTC Official Digital Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Privacy Policy & Location Consent</h1>
          <p className="text-xs text-slate-500 mt-1">Effective Date: October 2026 &bull; Andhra Pradesh State Road Transport Corporation</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center">
            <Lock className="w-4 h-4 mr-1.5 text-apsrtc-primary" />
            1. Commitment to Passenger Data Protection
          </h2>
          <p>
            The Andhra Pradesh State Road Transport Corporation (APSRTC) is dedicated to safeguarding passenger privacy across all digital services.
            We adhere strictly to statutory privacy guidelines. Personal information collected through account creation, grievance submission, or SMS registration is processed exclusively to deliver transit information and safety assistance.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center">
            <MapPin className="w-4 h-4 mr-1.5 text-rose-600" />
            2. Women's Safety & Geolocation Permissions
          </h2>
          <p>
            Our Women's Safety Assistance feature complies with zero-background-tracking standards:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><b>Explicit Consent Only:</b> Geolocation coordinates are captured only when you explicitly press the "Start Live Location Sharing" button.</li>
            <li><b>No Silent Tracking:</b> We do not track your location in the background or when the application is closed.</li>
            <li><b>Instant Revocation:</b> Clicking "Stop Location Sharing" immediately halts coordinate capture and renders the shared tracking link permanently inactive.</li>
            <li><b>Automatic Expiry:</b> Active sharing sessions automatically terminate after 4 hours.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center">
            <Eye className="w-4 h-4 mr-1.5 text-blue-600" />
            3. Timetable Data Authenticity
          </h2>
          <p>
            All bus departure schedules provided on this platform are transcribed directly from official APSRTC station display boards (specifically Eluru Depot / New Bus Stand). We do not fabricate estimated timings, live GPS positions, or imaginary intermediate stops.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center">
            <FileText className="w-4 h-4 mr-1.5 text-amber-600" />
            4. Passenger Grievances & Photo Attachments
          </h2>
          <p>
            Images and descriptions uploaded to the Passenger Complaint Portal are accessible solely to authorized APSRTC staff for resolution. We do not display private passenger details on public tracking dashboards.
          </p>
        </section>

      </div>
    </div>
  );
};
