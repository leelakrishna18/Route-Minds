import React, { useState, useEffect } from 'react';
import {
  MessageSquareWarning,
  Filter,
  CheckCircle2,
  Clock,
  User,
  Image as ImageIcon,
  Edit3,
  ChevronRight,
  Send
} from 'lucide-react';
import { api } from '../../services/api';
import { Complaint } from '../../types';

export const AdminComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);

  // Status update form
  const [newStatus, setNewStatus] = useState<'Submitted' | 'Under Review' | 'In Progress' | 'Resolved' | 'Rejected'>('Under Review');
  const [internalNote, setInternalNote] = useState('');
  const [passengerMessage, setPassengerMessage] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      let query = '/admin/complaints';
      if (statusFilter) query += `?status=${statusFilter}`;
      const data: any = await api.get(query);
      setComplaints(data.items || []);
      if (selectedComplaint) {
        const refreshed = (data.items || []).find((c: Complaint) => c.id === selectedComplaint.id);
        if (refreshed) setSelectedComplaint(refreshed);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setUpdating(true);
    try {
      await api.put(`/admin/complaints/${selectedComplaint.id}/status`, {
        status: newStatus,
        internal_note: internalNote,
        passenger_message: passengerMessage
      });
      setInternalNote('');
      setPassengerMessage('');
      fetchComplaints();
    } catch (err: any) {
      alert(err.message || 'Status update failed.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
          <div>
            <div className="text-xs font-bold uppercase text-amber-600 tracking-wider">APSRTC Grievance Operations</div>
            <h1 className="text-2xl font-black text-slate-900">Passenger Complaints Redressal</h1>
            <p className="text-xs text-slate-500 mt-0.5">Examine passenger reports, view evidence, and update official resolution status</p>
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Complaints List (1 Col) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
            <div className="p-3 border-b border-slate-100 text-xs font-bold text-slate-500">
              Complaints ({complaints.length})
            </div>

            <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading complaints...</div>
              ) : complaints.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No complaints matching filter.</div>
              ) : (
                complaints.map(c => {
                  const isSelected = selectedComplaint?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedComplaint(c);
                        setNewStatus(c.current_status);
                      }}
                      className={`p-4 cursor-pointer transition text-xs ${
                        isSelected ? 'bg-blue-50 border-l-4 border-apsrtc-primary' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-mono font-bold text-slate-800">{c.reference_id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.current_status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                          c.current_status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {c.current_status}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-900 mt-1 truncate">{c.subject}</div>
                      <div className="text-slate-500 mt-0.5 flex justify-between">
                        <span>{c.category}</span>
                        <span>{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Complaint Details & Action Panel (2 Cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-y-auto h-[700px]">
            {!selectedComplaint ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <MessageSquareWarning className="w-12 h-12 text-slate-300 mb-2" />
                <span>Select a complaint from the left panel to review evidence and update status.</span>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Header */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400">REFERENCE ID</span>
                    <h2 className="text-lg font-black text-slate-900">{selectedComplaint.reference_id}</h2>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Submitted by: <b>{selectedComplaint.passenger_name}</b> ({selectedComplaint.passenger_mobile || 'Mobile on file'})
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    selectedComplaint.current_status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                    selectedComplaint.current_status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedComplaint.current_status}
                  </span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px]">CATEGORY</span>
                    <span className="font-semibold text-slate-800">{selectedComplaint.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">SERVICE / BUS NUMBER</span>
                    <span className="font-mono text-slate-800">{selectedComplaint.service_number || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">TRAVEL DATE</span>
                    <span className="text-slate-800">{selectedComplaint.travel_date || 'N/A'}</span>
                  </div>
                </div>

                {/* Narrative */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Grievance Narrative</span>
                  <div className="text-xs font-bold text-slate-900 mt-1">{selectedComplaint.subject}</div>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100 whitespace-pre-wrap">
                    {selectedComplaint.description}
                  </p>
                </div>

                {/* Attachment View */}
                {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Photo Proof Attachment</span>
                    <div className="mt-2 flex items-center space-x-3">
                      {selectedComplaint.attachments.map(att => (
                        <a
                          key={att.id}
                          href={att.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="group relative block rounded-xl overflow-hidden border border-slate-200 shadow-sm"
                        >
                          <img src={att.file_url} alt={att.file_name} className="w-28 h-28 object-cover group-hover:scale-105 transition" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition">
                            View Full
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Status Action Form */}
                <form onSubmit={handleUpdateStatus} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center">
                    <Edit3 className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                    Update Redressal Status
                  </h3>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">New Resolution Status</label>
                    <select
                      value={newStatus}
                      onChange={(e: any) => setNewStatus(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-semibold"
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="Under Review">Under Review</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Passenger-Visible Message</label>
                    <textarea
                      rows={2}
                      value={passengerMessage}
                      onChange={(e) => setPassengerMessage(e.target.value)}
                      placeholder="e.g. Depot manager has summoned conductor AP39Z1234. Refund processed."
                      className="w-full bg-white border border-slate-300 rounded p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Internal Investigation Note (Staff Only)</label>
                    <input
                      type="text"
                      value={internalNote}
                      onChange={(e) => setInternalNote(e.target.value)}
                      placeholder="Internal audit note for depot records"
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center space-x-1 transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{updating ? 'Saving Status Update...' : 'Commit Status & Send Notification'}</span>
                  </button>
                </form>

              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
