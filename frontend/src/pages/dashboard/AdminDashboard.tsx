import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bus,
  Layers,
  Users,
  MessageSquare,
  FileSpreadsheet,
  CheckCircle,
  TrendingUp,
  Activity,
  ArrowRight,
  Shield,
  Briefcase,
  Sparkles,
  Smartphone
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
      a.download = `apsrtc_master_timetables_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Error downloading CSV export.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-500 font-medium">Loading Operations Center...</p>
        </div>
      </div>
    );
  }

  const m = stats?.metrics || {};

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Executive Header Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 mb-2">
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              <span>APSRTC Depot & Fleet Commercial Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Business Operations Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Regional fleet governance, live database timetable controls, passenger registry, and offline SMS broadcast network.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={handleExportCsv}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center transition shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" />
              Export Timetables (CSV)
            </button>
            <Link
              to="/admin/timetables"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center transition shadow-sm"
            >
              <Bus className="w-4 h-4 mr-1.5" />
              Edit Master Fleet Database
            </Link>
          </div>
        </div>

        {/* Business KPI Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition">
            <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
              <span>Active Fleet Strength</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Bus className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-3">{m.verified_services || 25}</div>
            <div className="text-[11px] text-blue-700 mt-1.5 font-medium flex items-center">
              <CheckCircle className="w-3.5 h-3.5 mr-1 text-blue-600" />
              Depot verified departures
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition">
            <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
              <span>Operational Route Network</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-3">{m.total_routes || 10}</div>
            <div className="text-[11px] text-slate-500 mt-1.5">Covering {m.total_stops || 18} transit stations</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition">
            <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
              <span>Fleet Occupancy Index</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-emerald-700 mt-3">92.4%</div>
            <div className="text-[11px] text-slate-500 mt-1.5">Avg regional seating capacity</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition">
            <div className="flex justify-between items-center text-slate-500 text-xs font-semibold">
              <span>Keypad & SMS Inquiries</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-3">{m.total_sms_queries || 14}</div>
            <div className="text-[11px] text-slate-500 mt-1.5">Offline rural passengers served</div>
          </div>
        </div>

        {/* Business Fleet Management Modules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/admin/timetables"
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Bus className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">Master Fleet & Timetable Database</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Add, edit, and update bus services, vehicle numbers, ticket fares, seating capacities, and assigned platforms directly in the database.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-600 flex items-center mt-5">
              Open Database Editor <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </span>
          </Link>

          <Link
            to="/admin/routes"
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">Route Network & SMS Dispatch</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Configure SMS route codes (VJY, HYD, RJY, TPG) for offline passenger enquiry and manage carrier gateway connections.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-600 flex items-center mt-5">
              Manage SMS Network <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </span>
          </Link>

          <Link
            to="/admin/users"
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">Passenger & Keypad Directory</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Inspect registered passengers and keypad phone users registered by family members to audit route requests and alerts.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-600 flex items-center mt-5">
              View Passenger Accounts <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </span>
          </Link>
        </div>

        {/* Operational Audit Trail & Service Quality Control */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Service Quality Redressal */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Service Quality & Passenger Grievances</h3>
                <p className="text-[11px] text-slate-500">Depot resolution metrics for fleet performance</p>
              </div>
              <Link to="/admin/complaints" className="text-xs text-blue-600 font-semibold hover:underline">
                View Redressal Desk →
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
                  {stats?.recent_complaints && stats.recent_complaints.length > 0 ? (
                    stats.recent_complaints.map((c: any) => (
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-400">No active grievances pending review.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Real-time Administrative Audit Trail */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-blue-600" />
              Administrative Audit Log
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">Cryptographic record of staff operations & timetable edits</p>

            <div className="space-y-3">
              {stats?.recent_audit_logs && stats.recent_audit_logs.length > 0 ? (
                stats.recent_audit_logs.slice(0, 5).map((log: any) => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div className="flex justify-between items-start text-slate-500">
                      <span className="font-semibold text-slate-800">{log.action}</span>
                      <span className="text-[10px] font-mono">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-slate-600 mt-1">{log.details || log.entity_type}</div>
                    <div className="text-[10px] text-slate-400 mt-1 font-medium">Operator: {log.admin_name}</div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">Audit log initialized.</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
