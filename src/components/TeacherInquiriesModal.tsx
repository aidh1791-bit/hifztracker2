import React, { useState } from 'react';
import { useHifz } from '../context/HifzContext';
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  User,
  Send,
  Sparkles,
  X,
  Mail,
  AlertCircle
} from 'lucide-react';
import { buildMailtoUrl } from '../utils/exportHelpers';

interface TeacherInquiriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherInquiriesModal: React.FC<TeacherInquiriesModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    parentUpdateRequests,
    acknowledgeParentUpdateRequest,
    teacherSettings,
    selectedStudent
  } = useHifz();

  const [replies, setReplies] = useState<Record<string, string>>({});
  const [successId, setSuccessId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleReplyChange = (id: string, text: string) => {
    setReplies(prev => ({ ...prev, [id]: text }));
  };

  const handleAcknowledge = (requestId: string) => {
    const text = replies[requestId]?.trim() || 'Ustadh reviewed and noted your message. Jazakallahu Khair.';
    acknowledgeParentUpdateRequest(requestId, text);
    setSuccessId(requestId);
    setTimeout(() => {
      setSuccessId(null);
    }, 1500);
  };

  const pendingRequests = parentUpdateRequests.filter(r => r.status === 'pending');
  const addressedRequests = parentUpdateRequests.filter(r => r.status === 'addressed');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
              <MessageSquare className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Parent Progress Inquiries & Notes
                {pendingRequests.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    {pendingRequests.length} Pending
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                Review polite questions and revision guidance requests submitted by parents.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* Pending Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Awaiting Ustadh Response ({pendingRequests.length})</span>
            </h4>

            {pendingRequests.length === 0 ? (
              <div className="p-5 text-center bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-1.5 text-emerald-600" />
                <p className="font-bold">All parent inquiries have been reviewed!</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  New polite requests from parents will appear here automatically with audio/push notification alerts.
                </p>
              </div>
            ) : (
              pendingRequests.map(req => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-amber-200/60 pb-2">
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">{req.subject}</span>
                      <div className="text-[11px] text-slate-600 flex items-center gap-2 mt-0.5">
                        <span><strong>Student:</strong> {req.studentName}</span>
                        <span>•</span>
                        <span><strong>Parent:</strong> {req.parentName} ({req.parentEmail})</span>
                        <span>•</span>
                        <span>{req.timestamp}</span>
                      </div>
                    </div>

                    <span className="self-start sm:self-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                      {req.urgency === 'urgent' ? 'Priority Attention' : 'Routine Check'}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-800 leading-relaxed whitespace-pre-line">
                    {req.message}
                  </div>

                  {/* Teacher Reply Input */}
                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Ustadh Courteous Response:
                    </label>
                    <textarea
                      rows={3}
                      value={replies[req.id] || ''}
                      onChange={(e) => handleReplyChange(req.id, e.target.value)}
                      placeholder="e.g. Wa Alaikum Assalam. MashaAllah Abdullah is progressing well. Please have him repeat Juz 13 pages 5 to 8 tonight."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-medium leading-relaxed resize-none"
                    />

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const url = buildMailtoUrl(
                            req.parentEmail,
                            `Re: ${req.subject}`,
                            `Assalamu Alaikum ${req.parentName},\n\n${replies[req.id] || ''}\n\nWas-salam,\nUstadh Qari Bilal`
                          );
                          window.location.href = url;
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Reply via Email Client</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAcknowledge(req.id)}
                        className={`px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                          successId === req.id
                            ? 'bg-emerald-700'
                            : 'bg-emerald-800 hover:bg-emerald-900'
                        }`}
                      >
                        {successId === req.id ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Replied & Sent to Parent!</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Send Reply & Acknowledge</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>

          {/* Addressed History */}
          {addressedRequests.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Addressed Inquiries ({addressedRequests.length})</span>
              </h4>

              <div className="space-y-2">
                {addressedRequests.map(req => (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-bold text-slate-800">{req.subject}</span>
                      <span>Resolved {req.repliedAt || req.timestamp}</span>
                    </div>
                    <div className="text-slate-600 italic">
                      "{req.message}"
                    </div>
                    {req.teacherReply && (
                      <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-900">
                        <strong className="text-[11px] block">Ustadh Response:</strong>
                        <p className="text-xs mt-0.5">{req.teacherReply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Ustadh Channel: Replies sync directly to parent app & trigger push notifications.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
