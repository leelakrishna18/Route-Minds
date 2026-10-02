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
  ChevronRight,
  Sparkles,
  Save,
  X
} from 'lucide-react';
import { api } from '../../services/api';
import { Route, Stop } from '../../types';

interface ServiceFormState {
  service_number: string;
  bus_number: string;
  bus_type: string;
  fare: string;
  seating_capacity: number;
  depot_name: string;
  route_id: string;
  operating_days: string;
  source_of_information: string;
  verification_status: string;
  is_active?: boolean;
  schedule: Array<{
    stop_id: string;
    scheduled_departure_time: string;
    scheduled_arrival_time: string;
    platform_number: string;
    remarks?: string;
  }>;
}

const initialForm: ServiceFormState = {
  service_number: '',
  bus_number: '',
  bus_type: 'Super Luxury',
  fare: '₹150',
  seating_capacity: 49,
  depot_name: 'Eluru Depot-1',
  route_id: '',
  operating_days: 'DAILY',
  source_of_information: 'Eluru Depot Master Log',
  verification_status: 'VERIFIED',
  schedule: [
    { stop_id: '', scheduled_departure_time: '08:00', scheduled_arrival_time: '', platform_number: 'Platform 1', remarks: '' }
  ]
};

export const AdminTimetablePage: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState<ServiceFormState>(initialForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

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
    api.get<Route[]>('/schedules/routes').then(r => {
      setRoutes(r || []);
      if (r && r.length > 0) {
        setServiceForm(prev => ({ ...prev, route_id: r[0].id }));
      }
    }).catch(console.error);
    api.get<Stop[]>('/schedules/stops').then(s => setStops(s || [])).catch(console.error);
  }, []);

  const handleOpenAdd = () => {
    setFormError(null);
    setFormSuccess(null);
    setEditingServiceId(null);
    setServiceForm({
      ...initialForm,
      route_id: routes[0]?.id || '',
      schedule: [
        { stop_id: stops[0]?.id || '', scheduled_departure_time: '08:00', scheduled_arrival_time: '', platform_number: 'Platform 1', remarks: '' }
      ]
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (service: any) => {
    setFormError(null);
    setFormSuccess(null);
    setEditingServiceId(service.id);

    const sch = (service.schedule && service.schedule.length > 0)
      ? service.schedule.map((entry: any) => ({
          stop_id: entry.stop_id,
          scheduled_departure_time: entry.scheduled_departure_time || '',
          scheduled_arrival_time: entry.scheduled_arrival_time || '',
          platform_number: entry.platform_number || 'Platform 1',
          remarks: entry.remarks || ''
        }))
      : [
          { stop_id: stops[0]?.id || '', scheduled_departure_time: '08:00', scheduled_arrival_time: '', platform_number: 'Platform 1', remarks: '' }
        ];

    setServiceForm({
      service_number: service.service_number || '',
      bus_number: service.bus_number || '',
      bus_type: service.bus_type || 'Super Luxury',
      fare: service.fare || 'Standard Fare',
      seating_capacity: service.seating_capacity || 49,
      depot_name: service.depot_name || 'Eluru Depot',
      route_id: service.route_id || routes[0]?.id || '',
      operating_days: service.operating_days || 'DAILY',
      source_of_information: service.source_of_information || 'Eluru Depot Master Log',
      verification_status: service.verification_status || 'VERIFIED',
      is_active: service.is_active !== undefined ? service.is_active : true,
      schedule: sch
    });
    setShowAddModal(true);
  };

  const handleAddStopToSchedule = () => {
    setServiceForm(prev => ({
      ...prev,
      schedule: [
        ...prev.schedule,
        { stop_id: stops[0]?.id || '', scheduled_departure_time: '', scheduled_arrival_time: '', platform_number: 'Platform 1', remarks: '' }
      ]
    }));
  };

  const handleRemoveStopFromSchedule = (idx: number) => {
    setServiceForm(prev => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== idx)
    }));
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setSaving(true);

    try {
      if (editingServiceId) {
        // Edit existing bus in database
        await api.put(`/admin/services/${editingServiceId}`, serviceForm);
        setFormSuccess('Bus service updated in database successfully!');
      } else {
        // Add new bus to database
        await api.post('/admin/services', serviceForm);
        setFormSuccess('New bus service inserted into database successfully!');
      }

      setTimeout(() => {
        setShowAddModal(false);
        setEditingServiceId(null);
        fetchServices(page);
      }, 700);
    } catch (err: any) {
      setFormError(err.message || 'Error saving service to database.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateService = async (id: string, currentActive: boolean) => {
    const action = currentActive ? 'deactivate' : 'reactivate';
    if (!confirm(`Are you sure you want to ${action} this bus service in the database?`)) return;

    try {
      if (currentActive) {
        await api.delete(`/admin/services/${id}`);
      } else {
        await api.put(`/admin/services/${id}`, { is_active: true });
      }
      fetchServices(page);
    } catch (err: any) {
      alert(err.message || `Error updating service state.`);
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

  // Filtered services
  const filteredServices = services.filter(s => {
    const matchesSearch = s.service_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.route_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.bus_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || s.bus_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 mb-1">
              <Bus className="w-3.5 h-3.5 text-blue-600" />
              <span>APSRTC Master Fleet Database</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Bus Database Management (CRUD)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Live administrator controls to add, edit, and update bus services, vehicle numbers, seating capacities, and fares directly in the database.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportCsv}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold px-3.5 py-2.5 rounded-lg flex items-center transition shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" />
              Export CSV
            </button>
            <button
              onClick={handleOpenAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center transition shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Bus Service to Database
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="w-full sm:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search service, bus number, or route..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <label className="text-xs font-semibold text-slate-600">Bus Type:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Service Classes</option>
              <option value="Amaravathi">Amaravathi (Multi-Axle)</option>
              <option value="Super Luxury">Super Luxury</option>
              <option value="Ultra Deluxe">Ultra Deluxe</option>
              <option value="Express">Express</option>
              <option value="Palle Velugu">Palle Velugu</option>
              <option value="Indra (AC)">Indra (A/C)</option>
            </select>
          </div>
        </div>

        {/* Timetable Services Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center text-xs text-slate-500">
            <span>Showing verified timetable database records (Page {page} of {totalPages})</span>
            <span className="font-semibold text-blue-700">{filteredServices.length} buses matching</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-3 px-4 font-semibold">Service ID & Vehicle</th>
                  <th className="py-3 px-4 font-semibold">Class / Type</th>
                  <th className="py-3 px-4 font-semibold">Route & Depot</th>
                  <th className="py-3 px-4 font-semibold">Fare & Capacity</th>
                  <th className="py-3 px-4 font-semibold">Operating Days</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Database Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">Loading database records...</td>
                  </tr>
                ) : filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">No matching bus services found.</td>
                  </tr>
                ) : (
                  filteredServices.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900">{s.service_number}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">{s.bus_number || 'AP-39-Z-XXXX'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{s.bus_type}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">{s.route_name}</div>
                        <div className="text-[11px] text-slate-500">{s.depot_name || 'Eluru Depot'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-emerald-700">{s.fare || 'Standard'}</div>
                        <div className="text-[11px] text-slate-500">{s.seating_capacity || 49} Seats</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-mono">{s.operating_days}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          s.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {s.is_active ? (s.verification_status || 'VERIFIED') : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Edit bus database details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeactivateService(s.id, s.is_active)}
                            className={`p-1.5 rounded transition ${
                              s.is_active ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={s.is_active ? 'Deactivate service' : 'Reactivate service'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 disabled:opacity-30 hover:bg-slate-50 flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </button>
            <span className="text-slate-500">Page {page} of {totalPages}</span>
            <button
              onClick={() => fetchServices(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 disabled:opacity-30 hover:bg-slate-50 flex items-center"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

        {/* Modal: Add or Edit Bus Service in Database */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 my-8 border border-slate-200">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Bus className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingServiceId ? 'Edit Bus Service Details (Database)' : 'Add New Bus Service to Database'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {formError && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-700 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSaveService} className="space-y-4 text-xs">
                {/* Basic Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Service Number</label>
                    <input
                      type="text"
                      value={serviceForm.service_number}
                      onChange={(e) => setServiceForm({ ...serviceForm, service_number: e.target.value })}
                      placeholder="e.g. ELR-HYD-AMARAVATHI-2200"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Vehicle Reg Number</label>
                    <input
                      type="text"
                      value={serviceForm.bus_number}
                      onChange={(e) => setServiceForm({ ...serviceForm, bus_number: e.target.value })}
                      placeholder="e.g. AP 39 Z 4812"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Bus Class / Type</label>
                    <select
                      value={serviceForm.bus_type}
                      onChange={(e) => setServiceForm({ ...serviceForm, bus_type: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="Amaravathi">Amaravathi (Multi-Axle)</option>
                      <option value="Super Luxury">Super Luxury</option>
                      <option value="Ultra Deluxe">Ultra Deluxe</option>
                      <option value="Express">Express</option>
                      <option value="Palle Velugu">Palle Velugu</option>
                      <option value="Indra (AC)">Indra (A/C)</option>
                      <option value="Vennela (Sleeper)">Vennela (Sleeper)</option>
                      <option value="Star Liner">Star Liner</option>
                    </select>
                  </div>
                </div>

                {/* Commercial Fields: Fare, Capacity, Depot */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Ticket Fare</label>
                    <input
                      type="text"
                      value={serviceForm.fare}
                      onChange={(e) => setServiceForm({ ...serviceForm, fare: e.target.value })}
                      placeholder="e.g. ₹180 or ₹350"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Seating Capacity</label>
                    <input
                      type="number"
                      value={serviceForm.seating_capacity}
                      onChange={(e) => setServiceForm({ ...serviceForm, seating_capacity: parseInt(e.target.value) || 49 })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Assigned Depot</label>
                    <input
                      type="text"
                      value={serviceForm.depot_name}
                      onChange={(e) => setServiceForm({ ...serviceForm, depot_name: e.target.value })}
                      placeholder="e.g. Eluru Depot-1"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                {/* Route and Operating Days */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Route</label>
                    <select
                      value={serviceForm.route_id}
                      onChange={(e) => setServiceForm({ ...serviceForm, route_id: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      required
                    >
                      {routes.map(r => (
                        <option key={r.id} value={r.id}>{r.route_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Operating Days</label>
                    <input
                      type="text"
                      value={serviceForm.operating_days}
                      onChange={(e) => setServiceForm({ ...serviceForm, operating_days: e.target.value })}
                      placeholder="DAILY or MON,TUE,WED,THU,FRI,SAT,SUN"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 uppercase font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                {/* Staged Stop Schedule */}
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-800">Station Stop Timings & Platforms</span>
                    <button
                      type="button"
                      onClick={handleAddStopToSchedule}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-[11px] flex items-center"
                    >
                      <Plus className="w-3.5 h-3.5 mr-0.5" /> Add Station Stop
                    </button>
                  </div>

                  {serviceForm.schedule.map((entry, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-white p-2.5 rounded-lg border border-slate-200 items-center">
                      <div className="sm:col-span-4">
                        <select
                          value={entry.stop_id}
                          onChange={(e) => {
                            const updated = [...serviceForm.schedule];
                            updated[idx].stop_id = e.target.value;
                            setServiceForm({ ...serviceForm, schedule: updated });
                          }}
                          className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs"
                          required
                        >
                          <option value="">Select Stop...</option>
                          {stops.map(st => (
                            <option key={st.id} value={st.id}>{st.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <input
                          type="time"
                          value={entry.scheduled_departure_time}
                          onChange={(e) => {
                            const updated = [...serviceForm.schedule];
                            updated[idx].scheduled_departure_time = e.target.value;
                            setServiceForm({ ...serviceForm, schedule: updated });
                          }}
                          className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs"
                          title="Departure Time"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          value={entry.platform_number}
                          onChange={(e) => {
                            const updated = [...serviceForm.schedule];
                            updated[idx].platform_number = e.target.value;
                            setServiceForm({ ...serviceForm, schedule: updated });
                          }}
                          placeholder="Platform 1"
                          className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs"
                        />
                      </div>

                      <div className="sm:col-span-1 text-right">
                        {serviceForm.schedule.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveStopFromSchedule(idx)}
                            className="text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving to Database...' : 'Save to Database'}</span>
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
