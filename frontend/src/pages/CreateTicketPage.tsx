import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketApi, attachmentApi } from '../services/api';
import { TicketCategory, TicketPriority } from '../types';
import { PlusCircle, Upload, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export const CreateTicketPage: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>('SOFTWARE');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdTicketNumber, setCreatedTicketNumber] = useState<string | null>(null);
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('Attachment cannot exceed 10 MB limit');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!subject.trim() || !description.trim()) {
      setError('Please provide both subject and description');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create Core Ticket via Java Spring Boot Service
      const ticket = await ticketApi.createTicket({
        subject: subject.trim(),
        description: description.trim(),
        category,
        priority,
      });

      // 2. Upload optional attachment via Python FastAPI Service
      if (file && ticket.id) {
        try {
          await attachmentApi.uploadAttachment(ticket.id, file);
        } catch (uploadErr: any) {
          console.error('Ticket created but attachment upload failed', uploadErr);
          setError(`Ticket was created successfully (${ticket.ticketNumber}), but attachment upload failed: ${uploadErr.response?.data?.detail || uploadErr.message}`);
          setIsSubmitting(false);
          return;
        }
      }

      setCreatedTicketNumber(ticket.ticketNumber);
      setCreatedTicketId(ticket.id);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/tickets')}
          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create Support Ticket</h1>
          <p className="text-xs text-slate-500">
            Submit a technical request to the Enterprise IT Support Operations team
          </p>
        </div>
      </div>

      {createdTicketNumber ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-emerald-600" />
          <h2 className="mt-3 text-lg font-bold text-emerald-900">Ticket Submitted Successfully!</h2>
          <p className="mt-1 text-sm text-emerald-700">
            Your ticket identifier is <strong className="font-mono text-base">{createdTicketNumber}</strong>
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              onClick={() => navigate(`/tickets/${createdTicketId}`)}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              View Ticket Details
            </button>
            <button
              onClick={() => {
                setCreatedTicketNumber(null);
                setSubject('');
                setDescription('');
                setFile(null);
              }}
              className="rounded-lg border border-emerald-300 bg-white px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              Submit Another Ticket
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Subject <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={255}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of the issue (e.g., Unable to connect to corporate VPN)"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TicketCategory)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="HARDWARE">Hardware</option>
                  <option value="SOFTWARE">Software</option>
                  <option value="NETWORK">Network</option>
                  <option value="EMAIL">Email</option>
                  <option value="ACCOUNT_ACCESS">Account Access</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Priority <span className="text-rose-500">*</span>
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TicketPriority)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="LOW">Low â€” Non-urgent question</option>
                  <option value="MEDIUM">Medium â€” General technical problem</option>
                  <option value="HIGH">High â€” Impaired productivity</option>
                  <option value="CRITICAL">Critical â€” System completely down</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the technical problem, steps to reproduce, error codes, and troubleshooting already attempted..."
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Optional Attachment Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Attachment (Screenshots, Log Files, PDFs)
              </label>
              <div className="mt-1 flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-2.5 text-xs font-medium text-slate-600 hover:border-blue-500 hover:bg-slate-50">
                  <Upload className="h-4 w-4 text-blue-600" />
                  <span>{file ? file.name : 'Choose file (PNG, JPG, PDF, TXT, DOCX)'}</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".png,.jpg,.jpeg,.pdf,.txt,.docx"
                  />
                </label>
                {file && (
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-xs font-medium text-rose-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Maximum file size: 10 MB. Managed securely via Python FastAPI attachment microservice.
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => navigate('/tickets')}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
              >
                <PlusCircle className="h-4 w-4" />
                {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

