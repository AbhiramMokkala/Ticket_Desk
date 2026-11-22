import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../services/api';
import { DashboardStats } from '../types';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { useAuth } from '../contexts/AuthContext';
import {
  LifeBuoy,
  Clock,
  CheckCircle2,
  XCircle,
  FolderOpen,
  ArrowRight,
  TrendingUp,
  PlusCircle,
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (err: any) {
      setError('Failed to fetch dashboard analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const priorityData = stats?.priorityDistribution
    ? Object.entries(stats.priorityDistribution).map(([name, count]) => ({
        name,
        count,
      }))
    : [];

  const statusPieData = stats
    ? [
        { name: 'Open', value: stats.openTickets, color: '#10b981' },
        { name: 'In Progress', value: stats.inProgressTickets, color: '#3b82f6' },
        { name: 'Resolved', value: stats.resolvedTickets, color: '#a855f7' },
        { name: 'Closed', value: stats.closedTickets, color: '#94a3b8' },
      ].filter((item) => item.value > 0)
    : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.fullName}
          </h1>
          <p className="text-xs text-slate-500">
            {user?.role === 'EMPLOYEE'
              ? 'Tracking your submitted IT support tickets and requests'
              : 'Enterprise Support Helpdesk Overview & Live Metrics'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/tickets/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <PlusCircle className="h-4 w-4" />
            Raise Ticket
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Tickets</span>
            <LifeBuoy className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{stats?.totalTickets ?? 0}</div>
          <div className="mt-1 text-[11px] text-slate-400">All registered issues</div>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800">Open</span>
            <FolderOpen className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-900">{stats?.openTickets ?? 0}</div>
          <div className="mt-1 text-[11px] text-emerald-700">Awaiting assignment</div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-800">In Progress</span>
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-900">{stats?.inProgressTickets ?? 0}</div>
          <div className="mt-1 text-[11px] text-blue-700">Under investigation</div>
        </div>

        <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-800">Resolved</span>
            <CheckCircle2 className="h-4 w-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-900">{stats?.resolvedTickets ?? 0}</div>
          <div className="mt-1 text-[11px] text-purple-700">Fix verified</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Closed</span>
            <XCircle className="h-4 w-4 text-slate-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-800">{stats?.closedTickets ?? 0}</div>
          <div className="mt-1 text-[11px] text-slate-400">Completed lifecycle</div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Priority Distribution Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Tickets by Priority</h3>
            <span className="text-xs text-slate-400">Severity distribution</span>
          </div>
          <div className="h-64 w-full">
            {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No priority data available
              </div>
            )}
          </div>
        </div>

        {/* Status Distribution Donut */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Tickets by Status</h3>
            <span className="text-xs text-slate-400">Lifecycle breakdown</span>
          </div>
          <div className="h-64 w-full">
            {statusPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No status data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Tickets Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-sm font-semibold text-slate-900">Recent Tickets</h3>
          <Link to="/tickets" className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
            View All Tickets <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Ticket ID</th>
                <th className="px-6 py-3 font-medium">Subject</th>
                <th className="px-6 py-3 font-medium">Priority</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Created</th>
                <th className="px-6 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {stats?.recentTickets && stats.recentTickets.length > 0 ? (
                stats.recentTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-6 py-3.5 font-semibold text-blue-600">
                      {t.ticketNumber}
                    </td>
                    <td className="max-w-xs truncate px-6 py-3.5 font-medium text-slate-900">
                      {t.subject}
                    </td>
                    <td className="px-6 py-3.5">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-slate-400">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-right">
                      <Link
                        to={`/tickets/${t.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No tickets found. Create your first ticket above!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
