import React from 'react';
import { TicketStatus, TicketPriority } from '../types';

export const StatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
  const styles: Record<TicketStatus, { bg: string; text: string; dot: string; label: string }> = {
    OPEN: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Open' },
    IN_PROGRESS: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500', label: 'In Progress' },
    RESOLVED: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', dot: 'bg-purple-500', label: 'Resolved' },
    CLOSED: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-600', dot: 'bg-slate-400', label: 'Closed' },
  };

  const s = styles[status] || styles.OPEN;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`}></span>
      {s.label}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: TicketPriority }> = ({ priority }) => {
  const styles: Record<TicketPriority, { bg: string; label: string }> = {
    LOW: { bg: 'bg-slate-100 text-slate-700 border-slate-200', label: 'Low' },
    MEDIUM: { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Medium' },
    HIGH: { bg: 'bg-orange-50 text-orange-700 border-orange-200', label: 'High' },
    CRITICAL: { bg: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold', label: 'Critical' },
  };

  const p = styles[priority] || styles.MEDIUM;

  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${p.bg}`}>
      {p.label}
    </span>
  );
};

export const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const cleanRole = role.replace('ROLE_', '');
  const styles: Record<string, string> = {
    ADMINISTRATOR: 'bg-purple-100 text-purple-800 border-purple-200',
    SUPPORT_AGENT: 'bg-blue-100 text-blue-800 border-blue-200',
    EMPLOYEE: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  const style = styles[cleanRole] || styles.EMPLOYEE;

  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${style}`}>
      {cleanRole.replace('_', ' ')}
    </span>
  );
};
