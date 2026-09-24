import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from '../services/apiClient';
import { useHifz } from '../context/HifzContext';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  Link,
  Unlink,
  RefreshCw,
  Search,
  Download,
  AlertTriangle,
  CheckCircle2,
  Lock,
  GraduationCap,
  BookOpen
} from 'lucide-react';

interface AppUser {
  id: number;
  uid: string;
  email: string;
  role: string;
  circleCode: string | null;
  displayName: string | null;
  disabled: boolean;
  createdAt: string;
  updatedAt: string;
  linkedStudents?: { id: number; studentId: string; studentName?: string }[];
}

export const AdminUserDirectoryView: React.FC = () => {
  const { students } = useHifz();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<'all' | 'unassigned' | 'teacher' | 'parent' | 'disabled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modal / Action states
  const [selectedUserForRole, setSelectedUserForRole] = useState<AppUser | null>(null);
  const [newRole, setNewRole] = useState<string>('parent');
  const [newCircleCode, setNewCircleCode] = useState<string>('HALAQAH-A');

  const [selectedUserForLink, setSelectedUserForLink] = useState<AppUser | null>(null);
  const [studentIdToLink, setStudentIdToLink] = useState<string>('');

  const [exportingStudentId, setExportingStudentId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authenticatedFetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        setError(`Failed to load users (HTTP ${res.status})`);
      }
    } catch (err: any) {
      setError(err?.message || 'Network error fetching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForRole) return;
    try {
      const res = await authenticatedFetch('/api/admin/users/assign-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: selectedUserForRole.uid,
          role: newRole,
          circleCode: newRole === 'teacher' ? newCircleCode : null
        })
      });
      if (res.ok) {
        setActionSuccess(`Role for ${selectedUserForRole.email} successfully updated to ${newRole}`);
        setSelectedUserForRole(null);
        fetchUsers();
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || 'Failed to update user role');
      }
    } catch {
      setError('Network failure during role assignment');
    }
  };

  const handleLinkParent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForLink || !studentIdToLink) return;
    try {
      const res = await authenticatedFetch('/api/admin/users/link-parent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentUid: selectedUserForLink.uid,
          studentId: studentIdToLink
        })
      });
      if (res.ok) {
        setActionSuccess(`Linked parent ${selectedUserForLink.email} to student ${studentIdToLink}`);
        setSelectedUserForLink(null);
        setStudentIdToLink('');
        fetchUsers();
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || 'Failed to link parent to student');
      }
    } catch {
      setError('Network failure linking parent to student');
    }
  };

  const handleUnlinkParent = async (parentUid: string, studentId: string) => {
    if (!confirm(`Are you sure you want to unlink student ${studentId} from this parent?`)) return;
    try {
      const res = await authenticatedFetch('/api/admin/users/unlink-parent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentUid, studentId })
      });
      if (res.ok) {
        setActionSuccess(`Unlinked relationship successfully`);
        fetchUsers();
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || 'Failed to unlink');
      }
    } catch {
      setError('Network failure unlinking parent');
    }
  };

  const handleRevoke = async (user: AppUser) => {
    if (!confirm(`Revoke and deactivate account access for ${user.email}? This preserves past records but denies future login access.`)) return;
    try {
      const res = await authenticatedFetch('/api/admin/users/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid })
      });
      if (res.ok) {
        setActionSuccess(`Access revoked for ${user.email}`);
        fetchUsers();
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || 'Failed to revoke access');
      }
    } catch {
      setError('Network failure revoking user access');
    }
  };

  const handleDownloadGdprSar = async (studentId: string) => {
    setExportingStudentId(studentId);
    try {
      const res = await authenticatedFetch(`/api/export/student/${studentId}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gdpr-sar-export-${studentId}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setActionSuccess(`GDPR SAR export for student ${studentId} generated and downloaded`);
      } else {
        setError(`Failed to generate export: HTTP ${res.status}`);
      }
    } catch {
      setError('Network error downloading GDPR SAR export');
    } finally {
      setExportingStudentId(null);
    }
  };

  const filteredUsers = users.filter(u => {
    if (filterRole === 'unassigned' && u.role !== 'unassigned') return false;
    if (filterRole === 'teacher' && u.role !== 'teacher') return false;
    if (filterRole === 'parent' && u.role !== 'parent') return false;
    if (filterRole === 'disabled' && !u.disabled && u.role !== 'disabled') return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchEmail = u.email?.toLowerCase().includes(term);
      const matchUid = u.uid?.toLowerCase().includes(term);
      const matchRole = u.role?.toLowerCase().includes(term);
      const matchCircle = u.circleCode?.toLowerCase().includes(term);
      return matchEmail || matchUid || matchRole || matchCircle;
    }
    return true;
  });

  const unassignedCount = users.filter(u => u.role === 'unassigned' && !u.disabled).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                <Users className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900">User Directory & Onboarding</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Manage madrasah accounts without database access. Onboard newly registered users, assign teachers to ḥalqah circles, securely link parents to their children, and instantly revoke permissions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchUsers}
              disabled={loading}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Directory</span>
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {actionSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button type="button" onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">×</button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button type="button" onClick={() => setError(null)} className="text-rose-700 hover:text-rose-900 font-bold">×</button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterRole('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              filterRole === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Accounts ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterRole('unassigned')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              filterRole === 'unassigned' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <span>Awaiting Approval</span>
            {unassignedCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                filterRole === 'unassigned' ? 'bg-white text-amber-900' : 'bg-amber-600 text-white'
              }`}>
                {unassignedCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setFilterRole('teacher')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              filterRole === 'teacher' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Teachers
          </button>
          <button
            type="button"
            onClick={() => setFilterRole('parent')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              filterRole === 'parent' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Parents
          </button>
          <button
            type="button"
            onClick={() => setFilterRole('disabled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              filterRole === 'disabled' ? 'bg-rose-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Revoked / Disabled
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search email, UID, or role..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
            <span>Loading user directory from Cloud database...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No accounts found matching current filter or search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Account / Email</th>
                  <th className="px-4 py-3">Role & Scope</th>
                  <th className="px-4 py-3">Linked Children / Status</th>
                  <th className="px-4 py-3 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isUnassigned = u.role === 'unassigned';
                  const isDisabled = u.disabled || u.role === 'disabled';

                  return (
                    <tr key={u.uid} className={`hover:bg-slate-50/70 transition-colors ${isUnassigned ? 'bg-amber-50/30' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{u.email || 'No email attached'}</div>
                        <div className="font-mono text-[10px] text-slate-400 truncate max-w-[220px]" title={u.uid}>
                          UID: {u.uid}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wide ${
                            isDisabled
                              ? 'bg-rose-100 text-rose-800'
                              : u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'teacher'
                              ? 'bg-emerald-100 text-emerald-800'
                              : u.role === 'parent'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {isDisabled ? 'Disabled' : u.role}
                          </span>

                          {u.circleCode && (
                            <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                              ḥalqah: {u.circleCode}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {u.role === 'parent' && (
                          <div className="space-y-1">
                            {u.linkedStudents && u.linkedStudents.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {u.linkedStudents.map((ls) => (
                                  <span
                                    key={ls.studentId}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] text-slate-700"
                                  >
                                    <GraduationCap className="w-3 h-3 text-slate-500" />
                                    <span>{ls.studentName || ls.studentId}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleUnlinkParent(u.uid, ls.studentId)}
                                      title="Unlink child"
                                      className="text-slate-400 hover:text-rose-600 font-bold ml-0.5"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">No children linked yet</span>
                            )}
                          </div>
                        )}

                        {u.role === 'teacher' && (
                          <span className="text-slate-500 text-[11px]">
                            Authorised for assigned ḥalqah circle
                          </span>
                        )}

                        {isUnassigned && (
                          <span className="text-amber-700 font-medium text-[11px] flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            Awaiting Role Assignment
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Role Assignment */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUserForRole(u);
                              setNewRole(u.role === 'unassigned' ? 'parent' : u.role);
                              setNewCircleCode(u.circleCode || 'HALAQAH-A');
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium transition-colors"
                            title="Assign or modify role"
                          >
                            Assign Role
                          </button>

                          {/* Link Child (Parent Role) */}
                          {u.role === 'parent' && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUserForLink(u);
                                if (students.length > 0) setStudentIdToLink(students[0].id);
                              }}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1"
                              title="Link a student to this parent account"
                            >
                              <Link className="w-3 h-3" />
                              <span>Link Child</span>
                            </button>
                          )}

                          {/* Revoke Access */}
                          {!isDisabled && u.role !== 'admin' && (
                            <button
                              type="button"
                              onClick={() => handleRevoke(u)}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1"
                              title="Revoke / Deactivate Account"
                            >
                              <UserX className="w-3 h-3" />
                              <span>Revoke</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* GDPR Data Export Tool for Madrasah Administrator (Phase 8) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
            <Download className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-900">GDPR Subject Access Request (SAR) Export</h3>
            <p className="text-xs text-slate-500">
              Generate a legally compliant, machine-readable JSON export of a student’s complete academic records, recitations, home study, tarbiyah, and parent notice records.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <label className="text-xs font-semibold text-slate-700">Select Student:</label>
          <select
            id="gdpr-student-export-select"
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            defaultValue={students[0]?.id || ''}
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.id}) - {s.circleCode}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('gdpr-student-export-select') as HTMLSelectElement;
              if (el && el.value) handleDownloadGdprSar(el.value);
            }}
            disabled={exportingStudentId !== null}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Download className={`w-3.5 h-3.5 ${exportingStudentId ? 'animate-bounce' : ''}`} />
            <span>{exportingStudentId ? 'Generating Export...' : 'Download Student SAR Dossier'}</span>
          </button>
        </div>
      </div>

      {/* Assign Role Modal */}
      {selectedUserForRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Assign User Role</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedUserForRole(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Setting role for <strong className="text-slate-900">{selectedUserForRole.email}</strong>:
            </p>

            <form onSubmit={handleAssignRole} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="parent">Parent</option>
                  <option value="teacher">Teacher (Ustadh)</option>
                  <option value="admin">Administrator</option>
                  <option value="unassigned">Unassigned (Hold)</option>
                  <option value="disabled">Disabled / Revoked</option>
                </select>
              </div>

              {newRole === 'teacher' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assign Ḥalqah Circle Code</label>
                  <select
                    value={newCircleCode}
                    onChange={(e) => setNewCircleCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="HALAQAH-A">HALAQAH-A (Ustadh Qari Bilal)</option>
                    <option value="HALAQAH-B">HALAQAH-B (Ustadh Shaykh Tariq)</option>
                    <option value="HALAQAH-C">HALAQAH-C (Ustadh Hafiz Imran)</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForRole(null)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow"
                >
                  Save Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link Parent Modal */}
      {selectedUserForLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Link className="w-4 h-4 text-blue-600" />
                <span>Link Parent to Student</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedUserForLink(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Linking parent <strong className="text-slate-900">{selectedUserForLink.email}</strong> to their registered child:
            </p>

            <form onSubmit={handleLinkParent} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Student</label>
                <select
                  value={studentIdToLink}
                  onChange={(e) => setStudentIdToLink(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.id}) - Parent on file: {s.parentName} ({s.parentEmail})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-[11px] leading-relaxed">
                Once linked, this parent UID will receive cryptographic read and home-learning signature write permissions for this child.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForLink(null)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold shadow"
                >
                  Link Child
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
