import React, { useState, useEffect } from 'react';
import { userApi } from '../services/api';
import { UserSummary, UserStats, Role } from '../types';
import { RoleBadge } from '../components/StatusBadge';
import { Users, Shield, UserCheck, AlertCircle, RefreshCw } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [userList, userStats] = await Promise.all([
        userApi.getAllUsers(),
        userApi.getUserStats(),
      ]);
      setUsers(userList);
      setStats(userStats);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch administration data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = async (userId: string, newRole: Role) => {
    setUpdatingId(userId);
    setError(null);
    try {
      await userApi.updateUserRole(userId, newRole);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user role');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Administration</h1>
          <p className="text-xs text-slate-500">
            Manage enterprise role-based access control and system personnel
          </p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Total Accounts</span>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{stats?.totalUsers ?? 0}</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Employees</span>
            <UserCheck className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{stats?.totalEmployees ?? 0}</div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-blue-800">
            <span>Support Agents</span>
            <Shield className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-900">{stats?.totalAgents ?? 0}</div>
        </div>

        <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-purple-800">
            <span>Administrators</span>
            <Shield className="h-4 w-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-900">{stats?.totalAdmins ?? 0}</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-sm font-semibold text-slate-900">Personnel Roster</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Current Role</th>
                <th className="px-6 py-3 font-medium">Registered</th>
                <th className="px-6 py-3 font-medium text-right">Role Assignment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80">
                  <td className="whitespace-nowrap px-6 py-3.5 font-medium text-slate-900">
                    {u.fullName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-3.5 text-slate-500">
                    {u.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-3.5">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-3.5 text-slate-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-3.5 text-right">
                    <select
                      value={u.role}
                      disabled={updatingId === u.id}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                      className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                    >
                      <option value="EMPLOYEE">EMPLOYEE</option>
                      <option value="SUPPORT_AGENT">SUPPORT_AGENT</option>
                      <option value="ADMINISTRATOR">ADMINISTRATOR</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
