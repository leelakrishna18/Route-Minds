import React from 'react';
import { FileCheck, AlertTriangle, PhoneCall } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm space-y-8 text-xs text-slate-600 leading-relaxed">
        
        <div className="border-b border-slate-200 pb-6">
          <div className="flex items-center space-x-2 text-xs font-bold text-apsrtc-primary uppercase tracking-wider mb-1">
            <FileCheck className="w-4 h-4" />
            <span>APSRTC Regulatory Terms</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Terms and Conditions of Service</h1>
          <p className="text-xs text-slate-500 mt-1">Andhra Pradesh State Road Transport Corporation</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            1. Timetable Information & Operational Flexibility
          </h2>
          <p>
            Timetable records provided through this platform reflect published depot schedules.
            APSRTC reserves the right to reassign fleets, alter operating frequencies during adverse weather or festive peak periods, or cancel specific trips in accordance with depot operating protocols.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            2. Emergency Helplines & Safety Tools
          </h2>
          <p>
            The emergency tools provided on this portal, including the 112 dialer and temporary location sharing, are assistive services.
            They do not replace official emergency first-response dispatches. In situations of imminent danger, passengers should call 112 directly.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            3. Passenger Conduct & Redressal Filing
          </h2>
          <p>
            Passengers submitting grievances via the Complaint Portal must provide authentic, factual information.
            Frivolous, abusive, or knowingly fraudulent submissions may result in account termination.
          </p>
        </section>

        <div className="pt-6 border-t border-slate-200 text-slate-400 text-[11px]">
          For regulatory inquiries, contact APSRTC Legal Cell, PNBS, Vijayawada.
        </div>

      </div>
    </div>
  );
};
