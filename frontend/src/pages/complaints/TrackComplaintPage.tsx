import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  MessageSquareWarning,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  ArrowLeft
} from 'lucide-react';
import { api, ApiError } from '../../services/api';
import { Complaint } from '../../types';

export const TrackComplaintPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [refInput, setRefInput] = useState(searchParams.get('ref') || '');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeTrack = async (referenceId: string) => {
    if (!referenceId.trim()) return;
    setError(null);
    setLoading(true);

    try {
      const data = await api.get<Complaint>(`/complaints/track/${encodeURIComponent(referenceId.trim())}`);
      setComplaint(data);
    } catch (err: any) {
      setComplaint(null);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Complaint reference ID not found.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setRefInput(ref);
      executeTrack(ref);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ ref: refInput });
    executeTrack(refInput);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">
              <MessageSquareWarning className="w-4 h-4" />
              <span>APSRTC Grievance Tracking Desk</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">Track Complaint Status</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your complaint reference ID to check the official resolution timeline
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={refInput}
              onChange={(e) => setRefInput(e.target.value)}
              placeholder="e.g. APSRTC-CMP-20261002-12345"
              className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-apsrtc-primary"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-apsrtc-primary hover:bg-apsrtc-primaryDark text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center space-x-1.5 shadow-sm transition disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Searching...' : 'Track'}</span>
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-rose-700 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {complaint && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            {/* Status Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-4">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Reference ID</div>
                <div className="text-lg font-mono font-black text-slate-900">{complaint.reference_id}</div>
              </div>

              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  complaint.current_status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                  complaint.current_status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {complaint.current_status}
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">CATEGORY</span>
                <span className="font-semibold text-slate-800">{complaint.category}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">SUBMISSION DATE</span>
                <span className="font-semibold text-slate-800">{new Date(complaint.created_at).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">SERVICE / BUS NUMBER</span>
                <span className="font-mono text-slate-800">{complaint.service_number || 'N/A'}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px]">SUBJECT & DESCRIPTION</span>
              <div className="text-xs font-bold text-slate-900 mt-0.5">{complaint.subject}</div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {complaint.description}
              </p>
            </div>

            {/* Admin Response if available */}
            {complaint.admin_response && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-1">
                <div className="text-xs font-bold text-blue-900 flex items-center">
                  <UserCheck className="w-4 h-4 mr-1.5 text-blue-700" />
                  Official APSRTC Response:
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  {complaint.admin_response}
                </p>
              </div>
            )}

            {/* Status History Timeline */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Redressal Timeline</h3>
              <div className="border-l-2 border-slate-200 pl-4 space-y-4 ml-1">
                {complaint.status_history && complaint.status_history.map((hist, idx) => (
                  <div key={idx} className="relative text-xs">
                    <span className="w-2.5 h-2.5 bg-apsrtc-primary rounded-full absolute -left-[21px] top-1"></span>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800">{hist.new_status}</span>
                      <span className="text-[10px] text-slate-400">{new Date(hist.created_at).toLocaleString()}</span>
                    </div>
                    {hist.passenger_message && (
                      <p className="text-slate-600 mt-0.5">{hist.passenger_message}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
