import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Smartphone,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  History,
  RotateCcw
} from 'lucide-react';
import { api } from '../../services/api';
import { SmsRouteCode } from '../../types';

export const SmsServicePage: React.FC = () => {
  const [routeCodes, setRouteCodes] = useState<SmsRouteCode[]>([]);
  const [smsNumber, setSmsNumber] = useState('56070');
  const [regMobile, setRegMobile] = useState('');
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // Simulator state
  const [simSender, setSimSender] = useState('9848011223');
  const [simText, setSimText] = useState('VJY');
  const [simResponse, setSimResponse] = useState<any | null>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [smsLogs, setSmsLogs] = useState<any[]>([]);

  const fetchCodesAndLogs = () => {
    api.get<any>('/sms/codes')
      .then(res => {
        setRouteCodes(res.codes || []);
        if (res.sms_number) setSmsNumber(res.sms_number);
      })
      .catch(console.error);

    api.get<any[]>('/sms/simulator/history')
      .then(logs => setSmsLogs(logs || []))
      .catch(console.error);
  };

  const [regError, setRegError] = useState<string | null>(null);
  const [simError, setSimError] = useState<string | null>(null);

  useEffect(() => {
    fetchCodesAndLogs();
  }, []);

  const handleRegisterMobile = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegSuccess(null);
    setRegError(null);
    try {
      await api.post('/sms/register', { mobile_number: regMobile });
      setRegSuccess(`Mobile number +91-${regMobile} successfully registered for APSRTC SMS enquiries.`);
      setRegMobile('');
    } catch (err: any) {
      setRegError(err.message || 'Registration failed.');
    }
  };

  const handleSimulateSms = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimLoading(true);
    setSimError(null);
    try {
      const resp: any = await api.post('/sms/webhook', {
        sender: simSender,
        message: simText
      });
      setSimResponse(resp);
      fetchCodesAndLogs();
    } catch (err: any) {
      setSimError(err.message || 'SMS simulator webhook failed.');
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-700 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
              <Smartphone className="w-4 h-4" />
              <span>Offline Passenger Connectivity</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">SMS Route Information Service</h1>
            <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
              Query scheduled bus departures from any basic feature phone without mobile internet.
              Send short route codes like <b>VJY</b> to <b>{smsNumber}</b>.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Col 1: Available Route Codes & Registration */}
          <div className="space-y-6">
            
            {/* Route Codes Table */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-emerald-600" />
                Active SMS Route Codes
              </h2>
              <p className="text-xs text-slate-500">
                Text any of the following verified route codes to <span className="font-mono font-bold text-slate-800">{smsNumber}</span>:
              </p>

              <div className="divide-y divide-slate-100 text-xs">
                {routeCodes.map(code => (
                  <div key={code.id} className="py-2.5 flex justify-between items-center">
                    <div>
                      <span className="font-mono font-bold bg-slate-100 text-emerald-800 px-2 py-0.5 rounded text-xs">
                        {code.route_code}
                      </span>
                      <span className="ml-2 font-medium text-slate-700">{code.description}</span>
                    </div>
                    <button
                      onClick={() => setSimText(code.route_code)}
                      className="text-[11px] text-emerald-700 font-semibold hover:underline"
                    >
                      Try in Simulator
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Registration Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <Smartphone className="w-4 h-4 mr-1.5 text-apsrtc-primary" />
                Register Mobile for SMS Alerts
              </h3>
              <p className="text-xs text-slate-500">
                Register your number to receive proactive schedule updates or service alerts from APSRTC.
              </p>

              {regSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{regSuccess}</span>
                </div>
              )}

              {regError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-rose-700 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterMobile} className="flex gap-2">
                <div className="flex flex-1">
                  <span className="inline-flex items-center px-2.5 rounded-l-lg border border-r-0 border-slate-300 bg-slate-100 text-slate-500 text-xs font-semibold">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value)}
                    placeholder="9440123456"
                    className="w-full bg-slate-50 border border-slate-300 rounded-r-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-apsrtc-primary"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-apsrtc-primary hover:bg-apsrtc-primaryDark text-white text-xs font-bold px-4 py-2 rounded-lg"
                >
                  Register
                </button>
              </form>
            </div>

          </div>

          {/* Col 2: Interactive SMS Webhook Simulator */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <h2 className="text-base font-bold text-slate-900">Interactive SMS Webhook Simulator</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Test how the real Flask SMS webhook handles incoming messages and formats 160-char responses.
              </p>
            </div>

            {simError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-rose-700 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{simError}</span>
              </div>
            )}

            <form onSubmit={handleSimulateSms} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Simulated Sender Mobile</label>
                  <input
                    type="text"
                    value={simSender}
                    onChange={(e) => setSimSender(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Incoming SMS Text</label>
                  <input
                    type="text"
                    value={simText}
                    onChange={(e) => setSimText(e.target.value)}
                    placeholder="VJY, HYD, RJY"
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono uppercase"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={simLoading}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center space-x-1.5 transition shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{simLoading ? 'Simulating SMS Dispatch...' : 'Dispatch Webhook Payload'}</span>
              </button>
            </form>

            {/* Simulated Phone Message Screen */}
            {simResponse && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase">Received SMS Message On Handset:</div>
                <div className="bg-emerald-950 text-emerald-200 p-4 rounded-2xl font-mono text-xs shadow-inner border border-emerald-900 relative">
                  <div className="text-[10px] text-emerald-400 mb-1 flex justify-between">
                    <span>FROM: APSRTC</span>
                    <span>STATUS: {simResponse.status}</span>
                  </div>
                  <div className="leading-relaxed whitespace-pre-wrap">
                    {simResponse.message}
                  </div>
                </div>
              </div>
            )}

            {/* Recent SMS Logs */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-700 flex items-center">
                <History className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Recent Webhook Transactions
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {smsLogs.slice(0, 4).map((log, i) => (
                  <div key={i} className="p-2 bg-slate-50 rounded border border-slate-200 text-[11px]">
                    <div className="flex justify-between font-mono text-slate-600">
                      <span>Sender: {log.sender_mobile}</span>
                      <span className="font-bold text-emerald-700">{log.status}</span>
                    </div>
                    <div className="text-slate-500 truncate mt-0.5 font-mono">{log.incoming_text} &rarr; {log.response_text}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
