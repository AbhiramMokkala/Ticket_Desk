import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketApi, commentApi, attachmentApi, userApi } from '../services/api';
import {
  TicketDetail,
  CommentItem,
  AttachmentItem,
  UserSummary,
  TicketStatus
} from '../types';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft,
  MessageSquare,
  Paperclip,
  Clock,
  Send,
  Upload,
  UserCheck,
  CheckCircle2,
  Download,
  FileText
} from 'lucide-react';

export const TicketDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [agents, setAgents] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const canManage = hasRole(['SUPPORT_AGENT', 'ADMINISTRATOR']);

  const loadTicketData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Core Ticket from Java Backend
      const ticketData = await ticketApi.getTicketById(id);
      setTicket(ticketData);

      // 2. Comments from .NET Backend
      try {
        const commentsData = await commentApi.getComments(id);
        setComments(commentsData);
      } catch (cErr) {
        console.warn('Comments fetch notice', cErr);
      }

      // 3. Attachments from Python Backend
      try {
        const attachmentsData = await attachmentApi.getAttachments(id);
        setAttachments(attachmentsData);
      } catch (aErr) {
        console.warn('Attachments fetch notice', aErr);
      }

      // 4. If agent/admin, load available agents for assignment
      if (canManage) {
        try {
          const allUsers = await userApi.getAllUsers();
          setAgents(allUsers.filter((u) => u.role === 'SUPPORT_AGENT' || u.role === 'ADMINISTRATOR'));
        } catch {}
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicketData();
  }, [id]);

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!id) return;
    try {
      const updated = await ticketApi.updateStatus(id, newStatus);
      setTicket(updated);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update ticket status');
    }
  };

  const handleAssignAgent = async (agentId: string) => {
    if (!id || !agentId) return;
    try {
      const updated = await ticketApi.assignTicket(id, agentId);
      setTicket(updated);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign ticket');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      // Calls ASP.NET Core Comment Service via Nginx proxy
      const created = await commentApi.addComment(id, newComment.trim());
      setComments((prev) => [...prev, created]);
      setNewComment('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!id || !e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    setUploadingFile(true);
    try {
      // Calls Python FastAPI Attachment Service via Nginx proxy
      await attachmentApi.uploadAttachment(id, file);
      const updatedList = await attachmentApi.getAttachments(id);
      setAttachments(updatedList);
    } catch (err: any) {
      alert(err.response?.data?.detail || err.response?.data?.message || 'Failed to upload attachment');
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          <p className="text-xs text-slate-500">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">
        <p className="font-semibold">{error || 'Ticket not found'}</p>
        <button
          onClick={() => navigate('/tickets')}
          className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white"
        >
          Return to Tickets List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/tickets')}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-blue-600">{ticket.ticketNumber}</span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{ticket.subject}</h1>
          </div>
        </div>

        {/* Operational Actions for Support Agents & Admins */}
        {canManage && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="font-medium">Workflow:</span>
              <select
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                className="rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
              >
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>

            <div className="h-4 w-[1px] bg-slate-200" />

            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="font-medium">Assign:</span>
              <select
                value={ticket.assignedToId || ''}
                onChange={(e) => handleAssignAgent(e.target.value)}
                className="rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
              >
                <option value="" disabled>Select Support Agent</option>
                {agents.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.fullName} ({ag.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Ticket Details + Side Audit/Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols): Description, Comments, Attachments */}
        <div className="space-y-6 lg:col-span-2">
          {/* Ticket Description Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Issue Description
            </h3>
            <p className="mt-3 whitespace-pre-line text-sm text-slate-800 leading-relaxed">
              {ticket.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-slate-100 pt-4 text-xs text-slate-500">
              <div>
                <span className="font-medium text-slate-700">Created By:</span> {ticket.createdByName} ({ticket.createdByEmail})
              </div>
              <div>
                <span className="font-medium text-slate-700">Category:</span> {ticket.category}
              </div>
              <div>
                <span className="font-medium text-slate-700">Assigned Agent:</span>{' '}
                {ticket.assignedToName || <span className="italic text-slate-400">Unassigned</span>}
              </div>
            </div>
          </div>

          {/* Attachments Section (Powered by Python FastAPI) */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Attachments ({attachments.length})
                </h3>
              </div>

              {/* Upload button */}
              <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100">
                <Upload className="h-3.5 w-3.5 text-blue-600" />
                <span>{uploadingFile ? 'Uploading...' : 'Add Attachment'}</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                  accept=".png,.jpg,.jpeg,.pdf,.txt,.docx"
                />
              </label>
            </div>

            <div className="mt-4 space-y-2">
              {attachments.length > 0 ? (
                attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="text-xs font-medium text-slate-900">{att.originalFilename}</div>
                        <div className="text-[11px] text-slate-400">
                          {(att.fileSize / 1024).toFixed(1)} KB • {new Date(att.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <a
                      href={attachmentApi.downloadAttachmentUrl(att.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </a>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-xs text-slate-400">
                  No documents or screenshots attached to this ticket.
                </p>
              )}
            </div>
          </div>

          {/* Comments Thread (Powered by ASP.NET Core .NET 8) */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-slate-900">
                Communication History (.NET 8 Service)
              </h3>
            </div>

            {/* Existing Comments */}
            <div className="mt-4 space-y-4">
              {comments.length > 0 ? (
                comments.map((comm) => (
                  <div key={comm.id} className="rounded-lg border border-slate-100 bg-slate-50/70 p-4">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{comm.userName}</span>
                        <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 uppercase">
                          {comm.userRole}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(comm.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                      {comm.comment}
                    </p>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-xs text-slate-400">
                  No comments yet. Start the conversation below.
                </p>
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="mt-6">
              <label className="block text-xs font-semibold text-slate-700">Add a Comment</label>
              <textarea
                rows={3}
                required
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Type your comment or update here..."
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Timeline & Metadata Audit */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Ticket Details
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Status</span>
                <StatusBadge status={ticket.status} />
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Priority</span>
                <PriorityBadge priority={ticket.priority} />
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Category</span>
                <span className="font-medium text-slate-800">{ticket.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Created Date</span>
                <span className="text-slate-700">{new Date(ticket.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Last Modified</span>
                <span className="text-slate-700">{new Date(ticket.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Activity Timeline Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Clock className="h-4 w-4 text-blue-600" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Activity Audit Trail
              </h3>
            </div>

            <div className="mt-4 flow-root">
              <ul className="-mb-8">
                {ticket.activities && ticket.activities.length > 0 ? (
                  ticket.activities.map((act, actIdx) => (
                    <li key={act.id}>
                      <div className="relative pb-8">
                        {actIdx !== ticket.activities.length - 1 && (
                          <span
                            className="absolute left-3.5 top-4 -ml-px h-full w-0.5 bg-slate-200"
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                              <CheckCircle2 className="h-4 w-4" />
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1">
                            <div>
                              <p className="text-xs font-medium text-slate-800">
                                {act.action.replace('_', ' ')}
                              </p>
                              {act.newValue && (
                                <p className="text-[11px] text-slate-500">
                                  {act.oldValue ? `${act.oldValue} → ${act.newValue}` : act.newValue}
                                </p>
                              )}
                              <p className="text-[10px] text-slate-400">By {act.performedByName}</p>
                            </div>
                            <div className="whitespace-nowrap text-right text-[10px] text-slate-400">
                              {new Date(act.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No activity recorded.</p>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
