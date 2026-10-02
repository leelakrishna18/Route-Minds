import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquareWarning,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  ArrowRight
} from 'lucide-react';
import { api, ApiError } from '../../services/api';

const CATEGORIES = [
  'Bus delay',
  'Staff behaviour',
  'Cleanliness',
  'Bus condition',
  'Route-related issue',
  'Other'
];

export const SubmitComplaintPage: React.FC = () => {
  const [formData, setFormData] = useState({
    category: 'Bus delay',
    subject: '',
    description: '',
    service_number: '',
    travel_date: new Date().toISOString().split('T')[0]
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedComplaint, setSubmittedComplaint] = useState<any | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError('Attachment exceeds maximum limit of 5 MB.');
        return;
      }
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = new FormData();
      data.append('category', formData.category);
      data.append('subject', formData.subject);
      data.append('description', formData.description);
      if (formData.service_number) data.append('service_number', formData.service_number);
      if (formData.travel_date) data.append('travel_date', formData.travel_date);
      if (selectedFile) data.append('attachment', selectedFile);

      const result: any = await api.post('/complaints', data);
      setSubmittedComplaint(result);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to submit complaint. Please check your network connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">
              <MessageSquareWarning className="w-4 h-4" />
              <span>APSRTC Public Grievance Redressal</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">Passenger Complaint Portal</h1>
            <p className="text-xs text-slate-500 mt-0.5">Submit feedback or grievances with verified reference tracking</p>
          </div>

          <Link
            to="/complaints/track"
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3.5 py-2 rounded-lg flex items-center transition"
          >
            <Search className="w-3.5 h-3.5 mr-1.5" />
            Track Existing Grievance
          </Link>
        </div>

        {/* Success Confirmation Card */}
        {submittedComplaint ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">Complaint Registered Successfully</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Your grievance has been lodged in the APSRTC central monitoring system and forwarded to the concerned depot supervisor.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-sm mx-auto">
              <div className="text-[10px] uppercase font-bold text-slate-400">Your Unique Reference ID</div>
              <div className="text-lg font-mono font-black text-apsrtc-primary mt-1 select-all">
                {submittedComplaint.reference_id}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Please retain this ID for checking grievance status updates.
              </div>
            </div>

            <div className="flex justify-center space-x-3 pt-2">
              <Link
                to={`/complaints/track?ref=${submittedComplaint.reference_id}`}
                className="bg-apsrtc-primary hover:bg-apsrtc-primaryDark text-white text-xs font-bold px-5 py-2.5 rounded-lg flex items-center shadow-sm"
              >
                Track Status Now <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
              <button
                onClick={() => {
                  setSubmittedComplaint(null);
                  setFormData({ category: 'Bus delay', subject: '', description: '', service_number: '', travel_date: new Date().toISOString().split('T')[0] });
                  setSelectedFile(null);
                  setFilePreview(null);
                }}
                className="py-2.5 px-4 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Submit Another Complaint
              </button>
            </div>
          </div>
        ) : (
          /* Complaint Form */
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-rose-700 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Grievance Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-apsrtc-primary"
                    required
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Travel Date (if applicable)</label>
                  <input
                    type="date"
                    value={formData.travel_date}
                    onChange={(e) => setFormData({ ...formData, travel_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-apsrtc-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Service / Bus Number (Optional)</label>
                  <input
                    type="text"
                    value={formData.service_number}
                    onChange={(e) => setFormData({ ...formData, service_number: e.target.value })}
                    placeholder="e.g. ELR-BZA-0800 or AP39Z1234"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-apsrtc-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Brief summary of the issue"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-apsrtc-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description *</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide complete details including station/bus stop name, direction of travel, time, and incident description..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs focus:outline-none focus:ring-2 focus:ring-apsrtc-primary"
                  required
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Photo Evidence (Optional, max 5 MB)</label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-xs text-slate-600 block">
                    {selectedFile ? selectedFile.name : 'Click or drag image file here (PNG, JPG, WebP)'}
                  </span>
                </div>

                {filePreview && (
                  <div className="mt-3 flex items-center space-x-3">
                    <img src={filePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-slate-200" />
                    <button
                      type="button"
                      onClick={() => { setSelectedFile(null); setFilePreview(null); }}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      Remove photo
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-apsrtc-primary hover:bg-apsrtc-primaryDark text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition shadow-sm disabled:opacity-50 mt-4"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Submit Grievance</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
