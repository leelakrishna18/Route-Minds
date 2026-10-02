import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Bus,
  Search,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Filter,
  RotateCcw,
  Info,
  ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';
import { Stop, BusSearchResult } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { DEFAULT_STOPS } from '../../utils/defaultStops';

export const BusScheduleSearchPage: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [stops, setStops] = useState<Stop[]>(DEFAULT_STOPS);
  const eluruStop = stops.find(s => s.name === 'Eluru') || DEFAULT_STOPS[0];
  const destinationStops = stops.filter(s => s.name !== 'Eluru');

  const [sourceStopId, setSourceStopId] = useState(() => eluruStop.id);
  const [destStopId, setDestStopId] = useState(() => searchParams.get('to') || DEFAULT_STOPS[1]?.id || '');
  const [travelDate, setTravelDate] = useState(searchParams.get('date') || new Date().toISOString().split('T')[0]);
  const [busTypeFilter, setBusTypeFilter] = useState('');
  
  const [results, setResults] = useState<BusSearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load stops & lock source to Eluru Depot
  useEffect(() => {
    api.get<Stop[]>('/schedules/stops')
      .then(data => {
        if (data && data.length > 0) {
          setStops(data);
          const elr = data.find(s => s.name === 'Eluru') || data[0];
          const bza = data.find(s => s.name === 'Vijayawada') || data[1];
          setSourceStopId(elr.id);
          if (!searchParams.get('to') && bza) setDestStopId(bza.id);
        }
      })
      .catch(console.error);
  }, []);

  // Perform search if params present
  useEffect(() => {
    const to = searchParams.get('to');
    const date = searchParams.get('date');
    if (to && date) {
      setDestStopId(to);
      setTravelDate(date);
      executeSearch(eluruStop.id, to, date, busTypeFilter);
    }
  }, [searchParams]);

  const executeSearch = async (fromId: string, toId: string, dateStr: string, bType?: string) => {
    if (!fromId || !toId) {
      setError('Please select both origin and destination stations.');
      return;
    }
    if (fromId === toId) {
      setError('Source and Destination cannot be the same bus stop.');
      return;
    }

    setError(null);
    setLoading(true);
    setHasSearched(true);

    try {
      let query = `/schedules/search?source_stop_id=${fromId}&destination_stop_id=${toId}&travel_date=${dateStr}`;
      if (bType) query += `&bus_type=${encodeURIComponent(bType)}`;

      const data: any = await api.get(query);
      setResults(data.results || []);
    } catch (err: any) {
      setError(err.message || 'Error retrieving bus schedules.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({
      from: sourceStopId,
      to: destStopId,
      date: travelDate
    });
    executeSearch(sourceStopId, destStopId, travelDate, busTypeFilter);
  };

  const handleReset = () => {
    setBusTypeFilter('');
    const elr = stops.find(s => s.name === 'Eluru')?.id || '';
    const bza = stops.find(s => s.name === 'Vijayawada')?.id || '';
    setSourceStopId(elr);
    setDestStopId(bza);
    setTravelDate(new Date().toISOString().split('T')[0]);
    setResults([]);
    setHasSearched(false);
    setError(null);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-apsrtc-primary mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>APSRTC Timetable Enquiry &bull; Verified Depot Records</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Search Scheduled Bus Services</h1>
          <p className="text-xs text-slate-500 mt-1">
            Timetables reflect confirmed schedules from APSRTC Eluru Depot display boards. All departure timings originate from your selected boarding stop.
          </p>

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t('from')}</label>
                <select
                  value={sourceStopId}
                  onChange={(e) => setSourceStopId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-apsrtc-primary"
                  required
                >
                  <option value={eluruStop.id}>
                    {eluruStop.name} {eluruStop.name_te ? `(${eluruStop.name_te})` : ''} — Eluru Depot Hub
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t('to')}</label>
                <select
                  value={destStopId}
                  onChange={(e) => setDestStopId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-apsrtc-primary"
                  required
                >
                  <option value="">Select destination...</option>
                  {destinationStops.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.name_te ? `(${s.name_te})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t('travelDate')}</label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-apsrtc-primary"
                  required
                />
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-apsrtc-primary hover:bg-apsrtc-primaryDark text-white font-semibold py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition shadow-sm disabled:opacity-50 text-sm"
                >
                  <Search className="w-4 h-4" />
                  <span>{loading ? 'Searching...' : 'Search Buses'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="p-2 border border-slate-300 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                  title="Reset form"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter by bus type */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <span className="font-semibold flex items-center">
                <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Filter by Service Type:
              </span>
              {['All', 'Amaravathi', 'Super Luxury', 'Express', 'Palle Velugu', 'Indra'].map((type) => {
                const isSelected = (type === 'All' && !busTypeFilter) || busTypeFilter === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      const newFilter = type === 'All' ? '' : type;
                      setBusTypeFilter(newFilter);
                      if (sourceStopId && destStopId) {
                        executeSearch(sourceStopId, destStopId, travelDate, newFilter);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-full font-medium transition ${
                      isSelected
                        ? 'bg-apsrtc-primary text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </form>
        </div>

        {/* Results Area */}
        {loading && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 border-4 border-apsrtc-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-semibold text-slate-700">Querying APSRTC Station Timetable Database...</p>
            <p className="text-xs text-slate-400 mt-1">Verifying stop sequence and date operating conditions</p>
          </div>
        )}

        {!loading && hasSearched && results.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              No scheduled service found in our available records for this route and date.
            </h3>
            <p className="text-xs text-slate-500 max-w-lg mx-auto mt-2 leading-relaxed">
              This result depends strictly on the timetable records currently available and verified in the platform.
              We do not fabricate estimated timings. Please check alternative dates or contact APSRTC Eluru Depot enquiry at 08812-230303.
            </p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs text-slate-500 px-1">
              <span>Found <b>{results.length}</b> verified scheduled departures</span>
              <span>Sorted by Boarding Time (Earliest First)</span>
            </div>

            <div className="space-y-3">
              {results.map((bus) => (
                <div
                  key={bus.service_id}
                  className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  {/* Left: Timing & Route */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="bg-blue-100 text-apsrtc-primary text-xs font-black px-2.5 py-1 rounded">
                        {bus.boarding_time}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">
                        {bus.source_stop_name} &rarr; {bus.destination_stop_name}
                      </span>
                      {bus.remarks && (
                        <span className="bg-slate-100 text-slate-700 text-[11px] font-mono px-2 py-0.5 rounded font-bold">
                          {bus.remarks}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{bus.bus_type}</span>
                      <span>&bull;</span>
                      <span>Service: <code className="font-mono text-slate-800">{bus.service_number}</code></span>
                      <span>&bull;</span>
                      <span>Platform: <b>{bus.platform_number}</b></span>
                      <span>&bull;</span>
                      <span className="text-emerald-700 font-medium flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        {bus.verification_status}
                      </span>
                    </div>

                    {/* Intermediate stops chain */}
                    {bus.intermediate_stops && bus.intermediate_stops.length > 2 && (
                      <div className="text-[11px] text-slate-400">
                        Via: {bus.intermediate_stops.join(' &rarr; ')}
                      </div>
                    )}
                  </div>

                  {/* Right: Destination Arrival & Action */}
                  <div className="flex flex-row md:flex-col items-end justify-between w-full md:w-auto gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Destination Arrival</div>
                      <div className="text-xs font-semibold text-slate-700">
                        {bus.has_verified_arrival_time && bus.arrival_time ? (
                          <span className="text-slate-900 font-bold">{bus.arrival_time}</span>
                        ) : (
                          <span className="text-slate-400 italic">Not listed on station board</span>
                        )}
                      </div>
                    </div>

                    <Link
                      to={`/schedules/service/${bus.service_id}`}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center transition"
                    >
                      <span>Full Timetable</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-100 p-3 rounded-xl text-center text-xs text-slate-500 border border-slate-200">
              Disclaimer: Timetables are based on APSRTC station display boards. Subject to operational changes by APSRTC Eluru Depot.
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
