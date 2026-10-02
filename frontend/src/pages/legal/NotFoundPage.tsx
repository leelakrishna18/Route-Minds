import React from 'react';
import { Link } from 'react-router-dom';
import { Bus, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 bg-blue-50 text-apsrtc-primary rounded-2xl flex items-center justify-center mx-auto">
          <Bus className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-slate-900">404</h1>
        <h2 className="text-base font-bold text-slate-800">Station / Page Not Found</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          The page or transit resource you requested could not be located on the APSRTC Smart Passenger Platform.
        </p>
        <div className="pt-2 flex justify-center space-x-3">
          <Link
            to="/"
            className="bg-apsrtc-primary hover:bg-apsrtc-primaryDark text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center transition"
          >
            <Home className="w-3.5 h-3.5 mr-1.5" /> Return Home
          </Link>
          <Link
            to="/schedules"
            className="border border-slate-300 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-50 transition"
          >
            Bus Schedules
          </Link>
        </div>
      </div>
    </div>
  );
};
