import React, { useState, useEffect } from 'react';
import {
  Bus,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit2,
  Clock,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { api, ApiError } from '../../services/api';
import { Route, Stop } from '../../types';

export const AdminTimetablePage: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    service_number: '',
    bus_type: 'Super Luxury',
    route_id: '',
    operating_days: 'DAILY',
    source_of_information: 'Station Master Log - Eluru',
    verification_status: 'VERIFIED',
    schedule: [
      { stop_id: '', scheduled_departure_time: '08:00', scheduled_arrival_time: '', platform_number: 'Platform 1' }
    ]
  });
  const [formError, setFormError] = useState<string | null>(null);

  const fetchServices = async (pageNumber: number) => {
    setLoading(true);
    try {
      const data: any = await api.get(`/admin/services?page=${pageNumber}&per_page=15`);
      setServices(data.items || []);
      setPage(data.page);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices(1);
    api.get<Route[]>('/schedules/routes').then(r => setRoutes(r || [])).catch(console.error);
    api.get<Stop[]>('/schedules/stops').then(s => setStops(s || [])).catch(console.error);
  }, []);

  const handleAddStopToSchedule = () => {
    setServiceForm(prev => ({
      ...prev,
      schedule: [
        ...prev.schedule,
        { stop_id: '', scheduled_departure_time: '', scheduled_arrival_time: '', platform_number: 'Platform 1' }
      ]
    }));
  };

  const handleRemoveStopFromSchedule = (idx: number) => {
    setServiceForm(prev => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== idx)
    }));
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await api.post('/admin/services', serviceForm);
      setShowAddModal(false);
      fetchServices(1);
    } catch (err: any) {
      setFormError(err.message || 'Error saving service.');
    }
  };

  const handleDeactivateService = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this service?')) return;
    try {
      await api.delete(`/admin/services/${id}`);
      fetchServices(page);
    } catch (err: any) {
      alert(err.message || 'Error deactivating service.');
    }
  };

  const handleExportCsv = async () => {
    try {
      const blob: any = await api.get('/admin/services/export-csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `apsrtc_timetables_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('CSV export error.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
          <div>
            <div className="text-xs font-bold uppercase text-blue-600 tracking-wider">APSRTC Master Timetable Database</div>
            <h1 className="text-2xl font-black text-slate-900">Bus Timetable Management</h1>
            <p className="text-xs text-slate-500 mt-0.5">Maintain verified bus services, platforms, and directional stops</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportCsv}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center transition shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5" />
              Download Timetable CSV
            </button>
            <button
              onClick={() => {
                if (routes.length > 0) {
                  setServiceForm(prev => ({ ...prev, route_id: routes[0].id }));
                }
                setShowAddModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center transition shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Scheduled Service
            </button>
          </div>
        </div>

        {/* Timetable Services Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center text-xs text-slate-500">
            <span>Showing verified timetable services (Page {page} of {totalPages})</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-3 px-4 font-semibold">Service ID</th>
                  <th className="py-3 px-4 font-semibold">Bus Type</th>
                  <th className="py-3 px-4 font-semibold">Route</th>
                  <th className="py-3 px-4 font-semibold">Days</th>
                  <th className="py-3 px-4 font-semibold">Data Source</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">Loading services...</td>
                  </tr>
                ) : services.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">No services found.</td>
                  </tr>
                ) : (
                  services.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{s.service_number}</td>
                      <td className="py-3 px-4 text-slate-700">{s.bus_type}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">{s.route_name}</td>
                      <td className="py-3 px-4 text-slate-500">{s.operating_days}</td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{s.source_of_information}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {s.is_active ? s.verification_status : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {s.is_active && (
                          <button
                            onClick={() => handleDeactivateService(s.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition"
                            title="Deactivate service"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-200 flex justify-between items-center text-xs">
            <button
              onClick={() => fetchServices(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 disabled:opacity-30 hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-slate-500">Page {page} of {totalPages}</span>
            <button
              onClick={() => fetchServices(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 disabled:opacity-30 hover:bg-slate-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Add Service Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 my-8">
              <h3 className="text-lg font-bold text-slate-900">Add New Bus Service</h3>

              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-xs text-rose-700">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateService} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Service Number</label>
                    <input
                      type="text"
                      value={serviceForm.service_number}
                      onChange={(e) => setServiceForm({ ...serviceForm, service_number: e.target.value })}
                      placeholder="e.g. ELR-HYD-AMARAVATHI-2200"
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Bus Type</label>
                    <select
                      value={serviceForm.bus_type}
                      onChange={(e) => setServiceForm({ ...serviceForm, bus_type: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                    >
                      <option value="Amaravathi">Amaravathi (Multi-Axle)</option>
                      <option value="Super Luxury">Super Luxury</option>
                      <option value="Ultra Deluxe">Ultra Deluxe</option>
                      <option value="Express">Express</option>
                      <option value="Palle Velugu">Palle Velugu</option>
                      <option value="Indra (AC)">Indra (A/C)</option>
                      <option value="Vennela (Sleeper)">Vennela (Sleeper)</option>
                      <option value="Star Liner">Star Liner</option>
                      <option value="Night Rider">Night Rider</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Route</label>
                    <select
                      value={serviceForm.route_id}
                      onChange={(e) => setServiceForm({ ...serviceForm, route_id: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                      required
                    >
                      {routes.map(r => (
                        <option key={r.id} value={r.id}>{r.route_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Operating Days</label>
                    <input
                      type="text"
                      value={serviceForm.operating_days}
                      onChange={(e) => setServiceForm({ ...serviceForm, operating_days: e.target.value })}
                      placeholder="DAILY or MON,TUE,WED,THU,FRI,SAT,SUN"
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Source of Timetable Info</label>
                    <input
                      type="text"
                      value={serviceForm.source_of_information}
                      onChange={(e) => setServiceForm({ ...serviceForm, source_of_information: e.target.value })}
                      placeholder="APSRTC Station Display Board"
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                    />
                  </div>
                </div>

                {/* Schedule entries */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">Stop-wise Timings:</span>
                    <button
                      type="button"
                      onClick={handleAddStopToSchedule}
                      className="text-xs text-blue-600 font-bold hover:underline"
                    >
                      + Add Stop Timing
                    </button>
                  </div>

                  {serviceForm.schedule.map((entry, idx) => (
                    <div key={idx} className="grid grid-cols-4 gap-2 items-center bg-slate-50 p-2 rounded border border-slate-200 text-xs">
                      <select
                        value={entry.stop_id}
                        onChange={(e) => {
                          const updated = [...serviceForm.schedule];
                          updated[idx].stop_id = e.target.value;
                          setServiceForm({ ...serviceForm, schedule: updated });
                        }}
                        className="bg-white border border-slate-300 rounded p-1 text-xs"
                        required
                      >
                        <option value="">Select Stop...</option>
                        {stops.map(st => (
                          <option key={st.id} value={st.id}>{st.name}</option>
                        ))}
                      </select>

                      <input
                        type="text"
                        placeholder="Dep: HH:MM"
                        value={entry.scheduled_departure_time}
                        onChange={(e) => {
                          const updated = [...serviceForm.schedule];
                          updated[idx].scheduled_departure_time = e.target.value;
                          setServiceForm({ ...serviceForm, schedule: updated });
                        }}
                        className="bg-white border border-slate-300 rounded p-1 text-xs font-mono"
                      />

                      <input
                        type="text"
                        placeholder="Platform"
                        value={entry.platform_number}
                        onChange={(e) => {
                          const updated = [...serviceForm.schedule];
                          updated[idx].platform_number = e.target.value;
                          setServiceForm({ ...serviceForm, schedule: updated });
                        }}
                        className="bg-white border border-slate-300 rounded p-1 text-xs"
                      />

                      <div className="flex justify-end">
                        {serviceForm.schedule.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveStopFromSchedule(idx)}
                            className="text-rose-600 text-[11px] hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Save & Publish Service
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
