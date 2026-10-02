import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Shield, Clock, AlertTriangle, PhoneCall } from 'lucide-react';
import { api } from '../../services/api';
import { LocationMap } from '../../components/maps/LocationMap';

export const SharedLocationViewPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSharedLocation = () => {
    if (!token) return;
    api.get<any>(`/safety/location/view/${token}`)
      .then(res => {
        setData(res);
        setError(null);
      })
      .catch(err => {
        setError(err.message || 'This location sharing session is expired or inactive.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSharedLocation();
    // Poll updates every 15 seconds while active
    const interval = setInterval(fetchSharedLocation, 15000);
    return () => clearInterval(interval);
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-500">Connecting to secure location stream...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Session Ended or Expired</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The passenger has stopped sharing their location, or the 4-hour security window has expired.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 mb-1">
              <Shield className="w-4 h-4" />
              <span>APSRTC Suraksha &bull; Live Passenger Tracking</span>
            </div>
            <h1 className="text-xl font-black text-slate-900">
              {data.passenger_name}'s Shared Journey
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live GPS position stream &bull; Updates automatically
            </p>
          </div>

          <a
            href="tel:112"
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center shadow-sm"
          >
            <PhoneCall className="w-4 h-4 mr-1.5" />
            Call 112 Police
          </a>
        </div>

        {/* Map */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <LocationMap
            latitude={data.latitude}
            longitude={data.longitude}
            accuracy={data.accuracy_meters}
            markerTitle={`${data.passenger_name}'s Location`}
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 block text-[10px]">LAST UPDATED</span>
              <span className="font-semibold text-slate-800">{new Date(data.updated_at).toLocaleTimeString()}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">GPS ACCURACY</span>
              <span className="font-semibold text-slate-800">&plusmn; {Math.round(data.accuracy_meters || 10)} meters</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">VALID UNTIL</span>
              <span className="font-semibold text-slate-800">{new Date(data.expires_at).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
