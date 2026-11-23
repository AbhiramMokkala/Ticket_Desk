import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { RoleBadge } from './StatusBadge';
import { Bell, ShieldCheck, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
          AWS Cloud Engineer POC
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>

        <div className="h-5 w-[1px] bg-slate-200" />

        <Link to="/profile" className="flex items-center gap-3 rounded-lg p-1.5 hover:bg-slate-50">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="hidden text-left md:block">
            <div className="text-xs font-medium text-slate-900">{user?.fullName}</div>
            <div className="text-[11px] text-slate-500">{user?.email}</div>
          </div>
          {user && <RoleBadge role={user.role} />}
        </Link>
      </div>
    </header>
  );
};

