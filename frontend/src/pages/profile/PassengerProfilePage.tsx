import React, { useState } from 'react';
import { User as UserIcon, Mail, Phone, Shield, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const PassengerProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [fullName, setFullName] = useState(user?.profile?.full_name || '');
  const [preferredLanguage, setPreferredLanguage] = useState(user?.profile?.preferred_language || 'en');
  const [bloodGroup, setBloodGroup] = useState(user?.profile?.emergency_blood_group || '');
  const [medicalNotes, setMedicalNotes] = useState(user?.profile?.medical_notes || '');

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.put('/auth/profile', {
        full_name: fullName,
        preferred_language: preferredLanguage,
        emergency_blood_group: bloodGroup,
        medical_notes: medicalNotes
      });
      await refreshUser();
      setSuccess('Profile and emergency medical notes updated successfully.');
    } catch (err: any) {
      setError(err.message || 'Unable to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-14 h-14 bg-blue-100 text-apsrtc-primary rounded-full flex items-center justify-center font-bold text-xl">
            {fullName.charAt(0).toUpperCase() || 'P'}
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">{fullName || 'Passenger Profile'}</h1>
            <p className="text-xs text-slate-500">APSRTC Verified Passenger &bull; {user?.email}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900">Personal & Emergency Details</h2>

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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-apsrtc-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Language</label>
                <select
                  value={preferredLanguage}
                  onChange={(e: any) => setPreferredLanguage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-apsrtc-primary"
                >
                  <option value="en">English</option>
                  <option value="te">తెలుగు (Telugu)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Email (Read-only)</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Mobile (Read-only)</label>
                <input
                  type="text"
                  value={user ? `+91 ${user.mobile_number}` : ''}
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Blood Group</label>
                <input
                  type="text"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  placeholder="e.g. O+, B+, A-"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-apsrtc-primary uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Medical / Allergy Notes</label>
                <input
                  type="text"
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  placeholder="e.g. Asthmatic, Diabetic, Allergy to Penicillin"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-apsrtc-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="bg-apsrtc-primary hover:bg-apsrtc-primaryDark text-white text-xs font-bold py-2.5 px-5 rounded-lg flex items-center space-x-1.5 shadow-sm transition disabled:opacity-50 mt-4"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
