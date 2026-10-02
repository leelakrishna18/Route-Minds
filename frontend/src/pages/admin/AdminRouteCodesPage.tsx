import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { SmsRouteCode, Route } from '../../types';

export const AdminRouteCodesPage: React.FC = () => {
  const [codes, setCodes] = useState<SmsRouteCode[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  const [routeCode, setRouteCode] = useState('');
  const [routeId, setRouteId] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [c, r] = await Promise.all([
        api.get<SmsRouteCode[]>('/admin/sms-codes'),
        api.get<Route[]>('/schedules/routes')
      ]);
      setCodes(c || []);
      setRoutes(r || []);
      if (r && r.length > 0 && !routeId) {
        setRouteId(r[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await api.post('/admin/sms-codes', {
        route_code: routeCode,
        route_id: routeId,
        description
      });
      setSuccess(`SMS Route Code '${routeCode.toUpperCase()}' registered successfully.`);
      setRouteCode('');
      setDescription('');
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Error registering SMS code.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold uppercase text-emerald-600 tracking-wider">SMS Gateway Configuration</div>
          <h1 className="text-2xl font-black text-slate-900">SMS Route Codes Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure keywords that passengers can send via SMS to query schedules offline
          </p>
        </div>

        {/* Add Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center">
            <Plus className="w-4 h-4 mr-1.5 text-emerald-600" />
            Register New Route Code
          </h2>

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-rose-700 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCreateCode} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Route Code (e.g. VJY)</label>
              <input
                type="text"
                value={routeCode}
                onChange={(e) => setRouteCode(e.target.value.toUpperCase())}
                placeholder="VJY"
                maxLength={6}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs font-mono font-bold uppercase"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mapped Transit Route</label>
              <select
                value={routeId}
                onChange={(e) => setRouteId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs"
                required
              >
                {routes.map(r => (
                  <option key={r.id} value={r.id}>{r.route_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Eluru to Vijayawada"
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs"
                required
              />
            </div>

            <div className="sm:col-span-3">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition shadow-sm"
              >
                Register Route Code
              </button>
            </div>
          </form>
        </div>

        {/* List of Registered Codes */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 text-xs font-bold text-slate-700">
            Active SMS Dispatch Codes ({codes.length})
          </div>

          <div className="divide-y divide-slate-100">
            {codes.map(c => (
              <div key={c.id} className="p-4 flex justify-between items-center text-xs">
                <div>
                  <span className="font-mono font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs">
                    {c.route_code}
                  </span>
                  <span className="ml-3 font-semibold text-slate-800">{c.description}</span>
                  <div className="text-slate-500 text-[11px] mt-0.5">Route: {c.route_name}</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  ACTIVE
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
