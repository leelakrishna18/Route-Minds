import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  ArrowLeft,
  MessageSquareWarning,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Phone,
  Mail,
  Calendar,
  Send
} from 'lucide-react';
import { api, ApiError } from '../../services/api';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Selected User Complaints Drawer
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userComplaints, setUserComplaints] = useState<any[]>([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);

  // Status update modal for a specific complaint
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);
  const [updateStatus, setUpdateStatus] = useState('Under Review');
  const [adminNote, setAdminNote] = useState('');
  const [passengerMessage, setPassengerMessage] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let url = '/admin/users';
      const params: string[] = [];
      if (roleFilter) params.push(`role=${roleFilter}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res: any = await api.get(url);
      setUsers(res || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUserComplaints = async (user: any) => {
    setSelectedUser(user);
    setLoadingComplaints(true);
    try {
      const res: any = await api.get(`/admin/users/${user.id}/complaints`);
      setUserComplaints(res.complaints || []);
    } catch (err) {
      alert('Error fetching user complaints.');
    } finally {
      setLoadingComplaints(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setUpdating(true);
    try {
      await api.put(`/admin/complaints/${selectedComplaint.id}/status`, {
        status: updateStatus,
        note: adminNote,
        passenger_message: passengerMessage
      });

      // Refresh complaints list
      if (selectedUser) {
        const res: any = await api.get(`/admin/users/${selectedUser.id}/complaints`);
        setUserComplaints(res.complaints || []);
      }
      setSelectedComplaint(null);
      setAdminNote('');
      setPassengerMessage('');
      alert('Grievance status updated successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const name = (u.full_name || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const phone = (u.mobile_number || '').toLowerCase();
    return name.includes(term) || email.includes(term) || phone.includes(term);
  });

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
          <div>
            <Link to="/admin/dashboard" className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800 mb-2">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back to Operations Center
            </Link>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <Users className="w-6 h-6 text-blue-600" />
              <span>Registered Passengers & Grievances</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Inspect registered users and review individual passenger complaints
            </p>
          </div>

          <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-xl border border-blue-200 text-xs font-bold">
            Total Users: {users.length}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or mobile..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 w-full sm:w-auto"
            >
              <option value="">All Roles</option>
              <option value="passenger">Passengers</option>
              <option value="admin">Administrators</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading user directory...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">No registered users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Passenger Name</th>
                    <th className="py-3 px-4">Contact Details</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Registered Date</th>
                    <th className="py-3 px-4">Grievances</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{u.full_name || 'Passenger'}</div>
                        <div className="text-[10px] text-slate-400">ID: {u.id.substring(0, 8)}...</div>
                      </td>
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="flex items-center space-x-1.5 text-slate-700">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{u.email}</span>
                        </div>
                        {u.mobile_number && (
                          <div className="flex items-center space-x-1.5 text-slate-500 text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{u.mobile_number}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Active'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`font-semibold px-2 py-0.5 rounded ${
                          u.complaints_count > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {u.complaints_count} filed
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenUserComplaints(u)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-semibold text-xs transition inline-flex items-center space-x-1 shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          <span>View Grievances ({u.complaints_count})</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* User Complaints Drawer/Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base flex items-center space-x-2">
                  <MessageSquareWarning className="w-5 h-5 text-amber-400" />
                  <span>Complaints from {selectedUser.full_name || selectedUser.email}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Email: {selectedUser.email} | Mobile: {selectedUser.mobile_number || 'N/A'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Complaints List */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50">
              {loadingComplaints ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading complaints...</div>
              ) : userComplaints.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200 p-6">
                  This passenger has not submitted any complaints.
                </div>
              ) : (
                userComplaints.map((c) => (
                  <div key={c.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <div className="text-[10px] font-mono text-blue-600 font-bold">
                          REF: {c.reference_number || c.id.substring(0, 8)}
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-0.5">{c.subject}</h4>
                        <div className="text-xs text-slate-500">Category: <span className="font-semibold text-slate-700">{c.category}</span></div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          c.current_status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                          c.current_status === 'Under Review' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {c.current_status}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedComplaint(c);
                            setUpdateStatus(c.current_status);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md transition"
                        >
                          Update Status
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                      {c.description}
                    </p>

                    {c.service_number && (
                      <div className="text-[11px] text-slate-500">
                        Bus Service: <span className="font-mono text-slate-800 font-semibold">{c.service_number}</span>
                      </div>
                    )}

                    {c.admin_response && (
                      <div className="bg-blue-50/70 p-2.5 rounded-lg border border-blue-100 text-xs text-blue-900">
                        <span className="font-bold text-[11px]">Official Admin Response:</span>
                        <p className="mt-0.5">{c.admin_response}</p>
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400">
                      Submitted on: {new Date(c.created_at).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900 text-base">Update Grievance Status</h3>
              <button onClick={() => setSelectedComplaint(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Action Taken">Action Taken</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Public Passenger Response
                </label>
                <textarea
                  value={passengerMessage}
                  onChange={(e) => setPassengerMessage(e.target.value)}
                  rows={2}
                  placeholder="Official response visible to passenger on complaint tracking..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Internal Staff Investigation Note
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={2}
                  placeholder="Internal audit note for depot supervisor..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
                >
                  {updating ? <span>Saving...</span> : <span>Confirm & Publish</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
