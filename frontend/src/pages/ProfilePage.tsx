import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { RoleBadge } from '../components/StatusBadge';
import { User, Mail, Shield, Key, LogOut } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Profile</h1>
        <p className="text-xs text-slate-500">Authenticated user account details and permissions</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white shadow-sm">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.fullName}</h2>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="mt-2">
              {user && <RoleBadge role={user.role} />}
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4 text-xs">
          <div className="flex items-center gap-3 text-slate-600">
            <Mail className="h-4 w-4 text-slate-400" />
            <span className="font-medium text-slate-700">Email:</span>
            <span>{user?.email}</span>
          </div>

          <div className="flex items-center gap-3 text-slate-600">
            <Key className="h-4 w-4 text-slate-400" />
            <span className="font-medium text-slate-700">User ID (UUID):</span>
            <span className="font-mono text-[11px] text-slate-500">{user?.userId || user?.id}</span>
          </div>

          <div className="flex items-center gap-3 text-slate-600">
            <Shield className="h-4 w-4 text-slate-400" />
            <span className="font-medium text-slate-700">Security Clearance:</span>
            <span>
              {user?.role === 'ADMINISTRATOR'
                ? 'Full system privileges (User Management, Ticket Reassignment, Workflow)'
                : user?.role === 'SUPPORT_AGENT'
                ? 'Operational privileges (Ticket Management, Assignment, Commenting)'
                : 'Employee privileges (Ticket authoring, commenting on personal tickets)'}
            </span>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6">
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
          >
            <LogOut className="h-4 w-4" />
            Sign Out of TicketDesk
          </button>
        </div>
      </div>
    </div>
  );
};
