import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Bus,
  MessageSquareWarning,
  MessageSquare,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  ArrowRight,
  Activity,
  Layers,
  Users
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any>('/admin/stats')
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const handleExportCsv = async () => {
    try {
      const blob: any = await api.get('/admin/services/export-csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `apsrtc_timetables_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Error downloading CSV export.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-500">Loading Admin Metrics...</p>
        </div>
      </div>
    );
  }

  const m = stats?.metrics || {};

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
          <div>
            <div className="text-xs font-bold uppercase text-blue-600 tracking-wider">APSRTC Official Staff Console</div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Administrative Operations Center</h1>
            <p className="text-xs text-slate-500 mt-1">Timetable integrity, grievance redressal, and SMS route governance</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportCsv}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center shadow-sm transition"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5" />
              Export Timetables (CSV)
            </button>
            <Link
              to="/admin/timetables"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center shadow-sm transition"
            >
              <Bus className="w-4 h-4 mr-1.5" />
              Manage Schedules
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center text-slate-500 text-xs font-medium">
              <span>Verified Bus Services</span>
              <Bus className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{m.verified_services}</div>
            <div className="text-[11px] text-emerald-600 mt-1 flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              From Station Board Records
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center text-slate-500 text-xs font-medium">
              <span>Active Transit Routes</span>
              <Layers className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{m.total_routes}</div>
            <div className="text-[11px] text-slate-500 mt-1">Covering {m.total_stops} stations</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center text-slate-500 text-xs font-medium">
              <span>Pending Complaints</span>
              <MessageSquareWarning className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-600 mt-2">{m.pending_complaints}</div>
            <div className="text-[11px] text-slate-500 mt-1">{m.resolved_complaints} resolved to date</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center text-slate-500 text-xs font-medium">
              <span>SMS Inbound Queries</span>
              <MessageSquare className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{m.total_sms_queries}</div>
            <div className="text-[11px] text-slate-500 mt-1">{m.sms_registered_users} subscribers</div>
          </div>
        </div>

        {/* Action Modules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/admin/timetables"
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 transition flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-3">
                <Bus className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Timetable Management</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add, edit, verify, or deactivate timetable departures. Control operating days, sequence stops, and import CSV batches.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-600 flex items-center mt-4">
              Open Timetable Controls <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </span>
          </Link>

          <Link
            to="/admin/complaints"
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-amber-400 transition flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mb-3">
                <MessageSquareWarning className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Grievance Redressal</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Review passenger complaints, view photo evidence, append internal investigation notes, and publish official responses.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-600 flex items-center mt-4">
              Review Complaints <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </span>
          </Link>

          <Link
            to="/admin/routes"
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-400 transition flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-3">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">SMS Route Codes</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Configure SMS dispatch codes (e.g. VJY, HYD, RJY) mapped to operational routes for offline passenger enquiry.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 flex items-center mt-4">
              Manage Route Codes <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </span>
          </Link>
        </div>

        {/* Audit Log Activity & Recent Complaints */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Complaints Table */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-900">Recent Passenger Complaints</h3>
              <Link to="/admin/complaints" className="text-xs text-blue-600 font-semibold hover:underline">
                View All
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-2 font-semibold">Ref ID</th>
                    <th className="pb-2 font-semibold">Category</th>
                    <th className="pb-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats?.recent_complaints?.map((c: any) => (
                    <tr key={c.id}>
                      <td className="py-2.5 font-mono font-medium text-slate-700">{c.reference_id}</td>
                      <td className="py-2.5 text-slate-600">{c.category}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.current_status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' :
                          c.current_status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {c.current_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Trail */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-blue-600" />
              Administrative Audit Trail
            </h3>

            <div className="space-y-3">
              {stats?.recent_audit_logs?.slice(0, 5).map((log: any) => (
                <div key={log.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <div className="flex justify-between items-start text-slate-500">
                    <span className="font-semibold text-slate-800">{log.action}</span>
                    <span className="text-[10px]">{new Date(log.created_at).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-slate-600 mt-0.5">{log.details || log.entity_type}</div>
                  <div className="text-[10px] text-slate-400 mt-1">Admin: {log.admin_name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
