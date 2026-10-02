import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Bus,
  ArrowLeft,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MapPin
} from 'lucide-react';
import { api } from '../../services/api';

export const BusServiceDetailPage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId) return;
    api.get<any>(`/schedules/services/${serviceId}`)
      .then(data => {
        setService(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Service details could not be loaded.');
        setLoading(false);
      });
  }, [serviceId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-apsrtc-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-slate-900">Service Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">{error || 'This service does not exist in available records.'}</p>
          <Link
            to="/schedules"
            className="mt-4 inline-flex items-center text-xs font-bold text-apsrtc-primary hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Return to Schedules Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <Link
          to="/schedules"
          className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-apsrtc-primary transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Bus Search
        </Link>

        {/* Card 1: Overview */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="text-xs font-mono font-bold text-slate-400">SERVICE ID</div>
              <h1 className="text-2xl font-black text-slate-900">{service.service_number}</h1>
              <div className="text-xs font-semibold text-apsrtc-primary mt-0.5">{service.bus_type}</div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                {service.verification_status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <div className="text-slate-400 font-medium">Route</div>
              <div className="font-bold text-slate-800 mt-0.5">{service.route_name}</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Operating Frequency</div>
              <div className="font-bold text-slate-800 mt-0.5">{service.operating_days}</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Data Provenance</div>
              <div className="font-bold text-slate-800 mt-0.5">{service.source_of_information}</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Last Verified</div>
              <div className="font-bold text-slate-800 mt-0.5">{service.date_last_verified}</div>
            </div>
          </div>
        </div>

        {/* Card 2: Stop-by-stop Timetable */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-apsrtc-primary" />
            Station-wise Schedule Entries
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-3 font-semibold">Bus Stop / Station</th>
                  <th className="pb-3 font-semibold">Boarding / Departure</th>
                  <th className="pb-3 font-semibold">Arrival</th>
                  <th className="pb-3 font-semibold">Platform</th>
                  <th className="pb-3 font-semibold">Notes / Board Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {service.schedule && service.schedule.map((entry: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 font-bold text-slate-900 flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      {entry.stop_name} {entry.stop_name_te ? `(${entry.stop_name_te})` : ''}
                    </td>
                    <td className="py-3 font-mono font-semibold text-slate-700">
                      {entry.scheduled_departure_time || '—'}
                    </td>
                    <td className="py-3 font-mono text-slate-600">
                      {entry.scheduled_arrival_time || <span className="text-slate-400 italic">Not listed</span>}
                    </td>
                    <td className="py-3 text-slate-600">
                      {entry.platform_number || 'Main Platform'}
                    </td>
                    <td className="py-3 text-slate-500">
                      {entry.remarks ? <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">{entry.remarks}</span> : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            Note: Platform numbers and remarks copied directly as displayed on APSRTC Eluru Depot boards. Unscheduled intermediate stops are excluded from this verified record.
          </div>
        </div>

      </div>
    </div>
  );
};
