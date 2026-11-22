import axios from 'axios';
import {
  AuthResponse,
  ApiResponse,
  User,
  TicketSummary,
  TicketDetail,
  DashboardStats,
  CommentItem,
  AttachmentItem,
  UserSummary,
  UserStats,
  Role,
  TicketStatus,
  TicketPriority,
  TicketCategory
} from '../types';

const api = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ticketdesk_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('ticketdesk_token');
      localStorage.removeItem('ticketdesk_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<ApiResponse<AuthResponse>>('/api/auth/login', { email, password });
    return res.data.data;
  },
  register: async (fullName: string, email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<ApiResponse<AuthResponse>>('/api/auth/register', { fullName, email, password });
    return res.data.data;
  },
  getProfile: async (): Promise<User> => {
    const res = await api.get<ApiResponse<User>>('/api/auth/me');
    return res.data.data;
  },
};

export const ticketApi = {
  getTickets: async (params?: {
    status?: TicketStatus;
    priority?: TicketPriority;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<{ content: TicketSummary[]; totalElements: number; totalPages: number }> => {
    const res = await api.get<ApiResponse<any>>('/api/tickets', { params });
    return res.data.data;
  },
  getTicketById: async (id: string): Promise<TicketDetail> => {
    const res = await api.get<ApiResponse<TicketDetail>>(`/api/tickets/${id}`);
    return res.data.data;
  },
  createTicket: async (data: {
    subject: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
  }): Promise<TicketDetail> => {
    const res = await api.post<ApiResponse<TicketDetail>>('/api/tickets', data);
    return res.data.data;
  },
  updateStatus: async (id: string, status: TicketStatus): Promise<TicketDetail> => {
    const res = await api.patch<ApiResponse<TicketDetail>>(`/api/tickets/${id}/status`, { status });
    return res.data.data;
  },
  assignTicket: async (id: string, agentId: string): Promise<TicketDetail> => {
    const res = await api.patch<ApiResponse<TicketDetail>>(`/api/tickets/${id}/assign`, { agentId });
    return res.data.data;
  },
};

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await api.get<ApiResponse<DashboardStats>>('/api/dashboard/stats');
    return res.data.data;
  },
};

// .NET Microservice Endpoints (routed through Nginx)
export const commentApi = {
  getComments: async (ticketId: string): Promise<CommentItem[]> => {
    const res = await api.get<ApiResponse<CommentItem[]>>(`/api/tickets/${ticketId}/comments`);
    return res.data.data || [];
  },
  addComment: async (ticketId: string, comment: string): Promise<CommentItem> => {
    const res = await api.post<ApiResponse<CommentItem>>(`/api/tickets/${ticketId}/comments`, { comment });
    return res.data.data;
  },
};

// Python FastAPI Microservice Endpoints (routed through Nginx)
export const attachmentApi = {
  getAttachments: async (ticketId: string): Promise<AttachmentItem[]> => {
    const res = await api.get<ApiResponse<AttachmentItem[]>>(`/api/tickets/${ticketId}/attachments`);
    return res.data.data || [];
  },
  uploadAttachment: async (ticketId: string, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<ApiResponse<any>>(`/api/tickets/${ticketId}/attachments/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  },
  downloadAttachmentUrl: (attachmentId: string): string => {
    return `/api/attachments/${attachmentId}/download`;
  },
};

export const userApi = {
  getAllUsers: async (): Promise<UserSummary[]> => {
    const res = await api.get<ApiResponse<UserSummary[]>>('/api/users');
    return res.data.data || [];
  },
  getUserStats: async (): Promise<UserStats> => {
    const res = await api.get<ApiResponse<UserStats>>('/api/users/stats');
    return res.data.data;
  },
  updateUserRole: async (userId: string, role: Role): Promise<UserSummary> => {
    const res = await api.patch<ApiResponse<UserSummary>>(`/api/users/${userId}/role`, { role });
    return res.data.data;
  },
};

export default api;
