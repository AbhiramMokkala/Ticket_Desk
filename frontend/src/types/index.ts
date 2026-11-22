export type Role = 'EMPLOYEE' | 'SUPPORT_AGENT' | 'ADMINISTRATOR';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TicketCategory =
  | 'HARDWARE'
  | 'SOFTWARE'
  | 'NETWORK'
  | 'EMAIL'
  | 'ACCOUNT_ACCESS'
  | 'OTHER';

export interface User {
  userId: string;
  id?: string;
  email: string;
  fullName: string;
  role: Role;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: string;
  fullName: string;
  email: string;
  role: Role;
  expiresInHours: number;
}

export interface TicketActivity {
  id: string;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  performedByName: string;
  createdAt: string;
}

export interface TicketSummary {
  id: string;
  ticketNumber: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdById: string;
  createdByName: string;
  assignedToId: string | null;
  assignedToName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketDetail extends TicketSummary {
  description: string;
  createdByEmail: string;
  activities: TicketActivity[];
}

export interface CommentItem {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userRole: string;
  comment: string;
  createdAt: string;
}

export interface AttachmentItem {
  id: string;
  ticketId: string;
  uploadedBy: string;
  originalFilename: string;
  contentType: string;
  fileSize: number;
  uploadStatus: string;
  downloadUrl: string;
  createdAt: string;
}

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  priorityDistribution: Record<string, number>;
  recentTickets: TicketSummary[];
}

export interface UserSummary {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface UserStats {
  totalUsers: number;
  totalEmployees: number;
  totalAgents: number;
  totalAdmins: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}
