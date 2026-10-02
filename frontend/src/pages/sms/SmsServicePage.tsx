import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Smartphone,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserPlus,
  Trash2,
  PhoneCall,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import { SmsRouteCode } from '../../types';

interface KeypadUserItem {
  id: string;
  name: string;
  mobile_number: string;
  preferred_route_code: string;
  relationship: string;
  alert_frequency: string;
  is_active: boolean;
  created_at: string;
}

export const SmsServicePage: React.FC = () => {
  const [routeCodes, setRouteCodes] = useState<SmsRouteCode[]>([]);
  const [smsNumber, setSmsNumber] = useState('56070');
  
  // Keypad Users List
  const [keypadUsers, setKeypadUsers] = useState<KeypadUserItem[]>([]);
  const [keypadName, setKeypadName] = useState('');
  const [keypadMobile, setKeypadMobile] = useState('');
  const [keypadRoute, setKeypadRoute] = useState('VJY');
  const [keypadRelation, setKeypadRelation] = useState('Parent');
  const [keypadSuccess, setKeypadSuccess] = useState<string | null>(null);
  const [keypadError, setKeypadError] = useState<string | null>(null);
  const [keypadLoading, setKeypadLoading] = useState(false);

  // Direct SMS Dispatch
  const [targetMobile, setTargetMobile] = useState('');
  const [targetRoute, setTargetRoute] = useState('VJY');
  const [dispatchResult, setDispatchResult] = useState<any | null>(null);
  const [dispatchLoading, setDispatchLoading] = useState(false);
  const [dispatchError, setDispatchError] = useState<string | null>(null);

  // SMS Logs
  const [smsLogs, setSmsLogs] = useState<any[]>([]);

  const fetchCodesAndData = () => {
    api.get<any>('/sms/codes')
      .then(res => {
        setRouteCodes(res.codes || []);
        if (res.sms_number) setSmsNumber(res.sms_number);
      })
      .catch(console.error);

    api.get<KeypadUserItem[]>('/sms/keypad-users')
      .then(users => setKeypadUsers(users || []))
      .catch(console.error);

    api.get<any[]>('/sms/simulator/history')
      .then(logs => setSmsLogs(logs || []))
      .catch(console.error);
  };

  useEffect(() => {
    fetchCodesAndData();
  }, []);

  const handleRegisterKeypadUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setKeypadSuccess(null);
    setKeypadError(null);
    setKeypadLoading(true);

    try {
      const res: any = await api.post('/sms/keypad-users', {
        name: keypadName.trim(),
        mobile_number: keypadMobile.trim(),
        preferred_route_code: keypadRoute,
        relationship: keypadRelation
      });
      setKeypadSuccess(`Keypad user "${keypadName}" (+91-${keypadMobile}) registered successfully!`);
      setKeypadName('');
      setKeypadMobile('');
      fetchCodesAndData();
    } catch (err: any) {
      setKeypadError(err.message || 'Failed to register keypad user.');
    } finally {
      setKeypadLoading(false);
    }
  };

  const handleDeleteKeypadUser = async (id: string) => {
    try {
      await api.delete(`/sms/keypad-users/${id}`);
      fetchCodesAndData();
    } catch (err: any) {
      alert(err.message || 'Failed to remove keypad user.');
    }
  };

  const handleSendScheduleToKeypad = async (mobile: string, routeCode: string, name?: string) => {
    setDispatchLoading(true);
    setDispatchError(null);
    setDispatchResult(null);

    try {
      const res: any = await api.post('/sms/send-schedule', {
        recipient_mobile: mobile,
        route_code: routeCode
      });
      setDispatchResult({
        ...res,
        recipient_name: name || mobile
      });
      fetchCodesAndData();
    } catch (err: any) {
      setDispatchError(err.message || 'Failed to dispatch SMS timetable.');
    } finally {
      setDispatchLoading(false);
    }
  };

  const handleDirectDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetMobile.trim()) return;
    await handleSendScheduleToKeypad(targetMobile.trim(), targetRoute);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Clean Header Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              <Smartphone className="w-3.5 h-3.5 text-blue-600" />
              <span>Offline Connectivity & Keypad Mobile Support</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              SMS Route & Timetable Service
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Register keypad/basic feature phones for elderly parents or rural family members so they receive scheduled bus timings without internet. You can also send them bus timetable SMS with one click.
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-center min-w-[200px]">
            <div className="text-[11px] font-bold uppercase text-blue-600 tracking-wider">Inbound SMS Helpline</div>
            <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">{smsNumber}</div>
            <div className="text-[11px] text-slate-500 mt-1">Text route code (e.g. VJY)</div>
          </div>
        </div>

        {/* Section 1: Keypad User Registration & Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Registration Form Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 lg:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Register Keypad User</h2>
                <p className="text-[11px] text-slate-500">For family with basic button phones</p>
              </div>
            </div>

            {keypadSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600" />
                <span>{keypadSuccess}</span>
              </div>
            )}

            {keypadError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{keypadError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterKeypadUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">User Name / Relative</label>
                <input
                  type="text"
                  value={keypadName}
                  onChange={(e) => setKeypadName(e.target.value)}
                  placeholder="e.g. Father (Eluru) or Grandfather"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">10-Digit Mobile Number</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={keypadMobile}
                  onChange={(e) => setKeypadMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 9848012345"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Preferred Home Route</label>
                <select
                  value={keypadRoute}
                  onChange={(e) => setKeypadRoute(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {routeCodes.map(rc => (
                    <option key={rc.id} value={rc.route_code}>
                      {rc.route_code} — {rc.description}
                    </option>
                  ))}
                  {routeCodes.length === 0 && (
                    <>
                      <option value="VJY">VJY — Eluru to Vijayawada</option>
                      <option value="HYD">HYD — Eluru to Hyderabad</option>
                      <option value="RJY">RJY — Eluru to Rajahmundry</option>
                      <option value="TPG">TPG — Eluru to Tadepalligudem</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Relationship</label>
                <select
                  value={keypadRelation}
                  onChange={(e) => setKeypadRelation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Parent">Parent</option>
                  <option value="Grandparent">Grandparent</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Rural Relative">Rural Relative</option>
                  <option value="Neighbor">Neighbor</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={keypadLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center space-x-1.5 transition shadow-xs mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{keypadLoading ? 'Saving...' : 'Register Keypad Phone'}</span>
              </button>
            </form>
          </div>

          {/* Registered Keypad Users Table Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-slate-900">Registered Keypad Phone Users</h2>
                <p className="text-xs text-slate-500">Family members who receive offline schedule text messages</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
                {keypadUsers.length} Registered
              </span>
            </div>

            {keypadUsers.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                <Smartphone className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-600">No keypad users registered yet.</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                  Use the registration form on the left to add parents or relatives with feature phones so you can send them bus timings directly.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
                {keypadUsers.map(user => (
                  <div key={user.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-50 transition">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-slate-900">{user.name}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                          {user.relationship}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center space-x-3">
                        <span className="font-mono text-slate-700 font-medium">+91-{user.mobile_number}</span>
                        <span>•</span>
                        <span>Route Code: <strong className="text-slate-800">{user.preferred_route_code || 'VJY'}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleSendScheduleToKeypad(user.mobile_number, user.preferred_route_code || 'VJY', user.name)}
                        disabled={dispatchLoading}
                        className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Bus Timings Now</span>
                      </button>
                      <button
                        onClick={() => handleDeleteKeypadUser(user.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                        title="Remove user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Direct Dispatch Feedback Banner */}
            {dispatchResult && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2 mt-4">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>SMS Dispatched Successfully to {dispatchResult.recipient_name} (+91-{dispatchResult.recipient})</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-emerald-100 text-xs font-mono text-slate-800">
                  {dispatchResult.message}
                </div>
                <p className="text-[10px] text-emerald-700">
                  Dispatched from APSRTC Station Timetable database. Carrier delivery log recorded.
                </p>
              </div>
            )}

            {dispatchError && (
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg text-xs text-rose-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{dispatchError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Direct Single Number Test & Active Route Codes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Quick Single SMS Sender */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Direct Route Schedule SMS Sender</h3>
                <p className="text-[11px] text-slate-500">Send instant departure timings to any mobile number</p>
              </div>
            </div>

            <form onSubmit={handleDirectDispatch} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Recipient Mobile Number</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={targetMobile}
                  onChange={(e) => setTargetMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Route Code</label>
                <select
                  value={targetRoute}
                  onChange={(e) => setTargetRoute(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {routeCodes.map(rc => (
                    <option key={rc.id} value={rc.route_code}>
                      {rc.route_code} — {rc.description}
                    </option>
                  ))}
                  {routeCodes.length === 0 && (
                    <>
                      <option value="VJY">VJY — Eluru to Vijayawada</option>
                      <option value="HYD">HYD — Eluru to Hyderabad</option>
                      <option value="RJY">RJY — Eluru to Rajahmundry</option>
                    </>
                  )}
                </select>
              </div>

              <button
                type="submit"
                disabled={dispatchLoading || !targetMobile.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center space-x-1.5 transition shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{dispatchLoading ? 'Sending...' : 'Send Timetable SMS Now'}</span>
              </button>
            </form>
          </div>

          {/* Active Route Codes Reference */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Active APSRTC Route SMS Codes</h3>
                <p className="text-[11px] text-slate-500">Keypad users can also text these codes to {smsNumber}</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {routeCodes.map(code => (
                <div key={code.id} className="py-2.5 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold bg-blue-50 text-blue-800 px-2 py-0.5 rounded text-xs border border-blue-200">
                      {code.route_code}
                    </span>
                    <span className="font-medium text-slate-700">{code.description}</span>
                  </div>
                  <button
                    onClick={() => {
                      setTargetRoute(code.route_code);
                    }}
                    className="text-[11px] text-blue-600 font-semibold hover:underline"
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: SMS Transaction Log */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <Clock className="w-4 h-4 mr-1.5 text-blue-600" />
              Recent SMS Dispatches & Inbound Logs
            </h3>
            <span className="text-[11px] text-slate-500">Last 10 carrier transactions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Mobile Number</th>
                  <th className="py-2.5 px-3 font-semibold">Route Code</th>
                  <th className="py-2.5 px-3 font-semibold">Delivered Content</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {smsLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">No recent SMS transactions.</td>
                  </tr>
                ) : (
                  smsLogs.slice(0, 8).map(log => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-slate-700 font-medium">{log.sender_mobile}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                          {log.route_code_matched || 'INQUIRY'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 max-w-md truncate">{log.response_text}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {log.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400 text-[11px]">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
