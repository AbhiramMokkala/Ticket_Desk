import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  LifeBuoy,
  PlusCircle,
  Users,
  User,
  LogOut,
  Layers,
  Server
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout, hasRole } = useAuth();
  const isAdmin = hasRole(['ADMINISTRATOR']);

  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Tickets', to: '/tickets', icon: LifeBuoy },
    { label: 'Create Ticket', to: '/tickets/new', icon: PlusCircle },
    ...(isAdmin ? [{ label: 'Administration', to: '/admin', icon: Users }] : []),
    { label: 'My Profile', to: '/profile', icon: User },
  ];

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <span className="text-base font-bold tracking-tight text-slate-900">TicketDesk</span>
          <span className="block text-[10px] font-medium uppercase tracking-wider text-blue-600">IT Platform</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Cloud Microservices Badge */}
      <div className="mx-3 mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Server className="h-3.5 w-3.5 text-blue-600" />
          Microservice Topology
        </div>
        <div className="mt-2 space-y-1 text-[11px] text-slate-500">
          <div className="flex justify-between"><span>Core & Auth:</span><span className="font-medium text-slate-700">Java 21</span></div>
          <div className="flex justify-between"><span>Comments:</span><span className="font-medium text-slate-700">.NET 8</span></div>
          <div className="flex justify-between"><span>Attachments:</span><span className="font-medium text-slate-700">FastAPI</span></div>
          <div className="flex justify-between"><span>Database:</span><span className="font-medium text-slate-700">PostgreSQL</span></div>
        </div>
      </div>

      {/* Logout Footer */}
      <div className="border-t border-slate-200 p-3">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
