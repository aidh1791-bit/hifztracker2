import React, { useState } from 'react';
import { useHifz } from '../context/HifzContext';
import {
  MessageSquareShare,
  Mail,
  Send,
  CheckCircle2,
  Copy,
  Clock,
  User,
  HeartHandshake,
  Sparkles,
  X,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { buildMailtoUrl } from '../utils/exportHelpers';

interface ParentRequestUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ParentRequestUpdateModal: React.FC<ParentRequestUpdateModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    selectedStudent,
    parentSettings,
    teacherSettings,
    sendParentUpdateRequest,
    parentUpdateRequests,
    userRole
  } = useHifz();

  const [category, setCategory] = useState<'general' | 'revision' | 'exam' | 'custom'>('general');
  const [urgency, setUrgency] = useState<'routine' | 'urgent'>('routine');
  const [copied, setCopied] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState<'compose' | 'history'>('compose');

  // Pre-composed courteous Islamic templates
  const templates = {
    general: {
      subject: `Polite Progress Inquiry: ${selectedStudent.name} (${selectedStudent.rollNumber})`,
      message: `Assalamu Alaikum wa Rahmatullahi wa Barakatuh respected Ustadh,\n\nI hope this message finds you in good health and high Imaan.\n\nCould you kindly share a brief update on ${selectedStudent.name}'s recitation discipline, focus, and attendance in the circle this week? We want to ensure we support his Hifz effectively at home.\n\nJazakallahu Khairan wa Barakallahu Feek,\n${selectedStudent.parentName}`
    },
    revision: {
      subject: `Guidance for Evening Home Practice & Dawr: ${selectedStudent.name}`,
      message: `Assalamu Alaikum respected Ustadh,\n\nWe are revising with ${selectedStudent.name} every evening after Maghrib and Fajr. Could you kindly advise which specific Juz or Surah currently requires extra repetition and concentration?\n\nThank you for your dedicated guidance.\n\nWas-salam,\n${selectedStudent.parentName}`
    },
    exam: {
      subject: `Term Evaluation & Quarter Readiness: ${selectedStudent.name}`,
      message: `Assalamu Alaikum Ustadh,\n\nAs we approach the term assessments, we would like to ensure ${selectedStudent.name} is thoroughly prepared. Are there any particular Mutashabihat (similar verses) or Tajweed points we should focus on during home revision?\n\nJazakumullahu Khairan,\n${selectedStudent.parentName}`
    },
    custom: {
      subject: `Parent Message regarding ${selectedStudent.name}`,
      message: `Assalamu Alaikum Ustadh,\n\n`
    }
  };

  const [subject, setSubject] = useState(templates.general.subject);
  const [message, setMessage] = useState(templates.general.message);

  const handleSelectTemplate = (cat: 'general' | 'revision' | 'exam' | 'custom') => {
    setCategory(cat);
    setSubject(templates[cat].subject);
    setMessage(templates[cat].message);
  };

  const teacherEmail =
    teacherSettings.madrasahGoogleSetup?.madrasahAdminGmail || 'madrasah.hifz.circle@gmail.com';

  const handleSendAppNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    sendParentUpdateRequest(subject, message, category, urgency);
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setActiveViewTab('history');
    }, 1200);
  };

  const handleLaunchEmail = () => {
    const url = buildMailtoUrl(teacherEmail, subject, message);
    window.location.href = url;
  };

  const handleCopyText = async () => {
    const fullText = `Subject: ${subject}\n\n${message}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  // Filter requests for current student
  const studentRequests = parentUpdateRequests.filter(r => r.studentId === selectedStudent.id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-200">
              <HeartHandshake className="w-5 h-5 text-amber-700" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Politely Request Update from Ustadh
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Direct Channel
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Send a courteous Islamic inquiry to {selectedStudent.teacherName} regarding {selectedStudent.name}.
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

        {/* View Switcher Tabs (Compose vs History) */}
        <div className="flex border-b border-slate-200 px-5 pt-2 gap-4 bg-white text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveViewTab('compose')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeViewTab === 'compose'
                ? 'border-amber-600 text-amber-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquareShare className="w-4 h-4" />
            <span>Compose Polite Request</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveViewTab('history')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeViewTab === 'history'
                ? 'border-amber-600 text-amber-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Past Inquiries & Ustadh Replies ({studentRequests.length})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeViewTab === 'compose' ? (
            <form onSubmit={handleSendAppNotification} className="space-y-4">
              
              {/* Template Selectors */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Select Courteous Pre-Composed Template:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectTemplate('general')}
                    className={`p-2.5 rounded-xl text-left text-xs border transition-all ${
                      category === 'general'
                        ? 'bg-amber-50/80 border-amber-400 text-amber-900 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-[11px] font-bold">General Progress</span>
                    <span className="text-[10px] text-slate-500 block truncate">Discipline & conduct</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectTemplate('revision')}
                    className={`p-2.5 rounded-xl text-left text-xs border transition-all ${
                      category === 'revision'
                        ? 'bg-amber-50/80 border-amber-400 text-amber-900 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-[11px] font-bold">Home Dawr Help</span>
                    <span className="text-[10px] text-slate-500 block truncate">Which Juz to repeat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectTemplate('exam')}
                    className={`p-2.5 rounded-xl text-left text-xs border transition-all ${
                      category === 'exam'
                        ? 'bg-amber-50/80 border-amber-400 text-amber-900 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-[11px] font-bold">Exam Readiness</span>
                    <span className="text-[10px] text-slate-500 block truncate">Term preparation</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectTemplate('custom')}
                    className={`p-2.5 rounded-xl text-left text-xs border transition-all ${
                      category === 'custom'
                        ? 'bg-amber-50/80 border-amber-400 text-amber-900 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-[11px] font-bold">Custom Note</span>
                    <span className="text-[10px] text-slate-500 block truncate">Write own message</span>
                  </button>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Subject Line:
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-amber-600 font-semibold"
                  placeholder="Inquiry Subject"
                  required
                />
              </div>

              {/* Message Body */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Polite Islamic Message to Ustadh:
                </label>
                <textarea
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-amber-600 font-medium leading-relaxed resize-none"
                  placeholder="Type your polite message to the Ustadh..."
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>Delivered to Ustadh's in-app inbox and pushes live notification to teacher.</span>
                  <span>Recipient: {teacherSettings.headTeacherName}</span>
                </p>
              </div>

              {/* Urgency & Channels */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Urgency:</span>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="urgency"
                      checked={urgency === 'routine'}
                      onChange={() => setUrgency('routine')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-slate-600">Routine Check-in</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer ml-2">
                    <input
                      type="radio"
                      name="urgency"
                      checked={urgency === 'urgent'}
                      onChange={() => setUrgency('urgent')}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span className="text-rose-700 font-semibold">Priority Guidance</span>
                  </label>
                </div>

                <span className="text-[11px] text-slate-500">
                  Target Email: <strong className="font-mono">{teacherEmail}</strong>
                </span>
              </div>

              {/* Submit / Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleLaunchEmail}
                    className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    title="Open default email application like Gmail or Outlook"
                  >
                    <Mail className="w-4 h-4 text-slate-600" />
                    <span>Send via Email Client</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="flex-1 sm:flex-initial px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={sentSuccess}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 text-white transition-all shadow-sm ${
                    sentSuccess
                      ? 'bg-emerald-700'
                      : 'bg-amber-700 hover:bg-amber-800'
                  }`}
                >
                  {sentSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Sent to Ustadh!</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Request & App Notification</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          ) : (
            /* History of past requests */
            <div className="space-y-3">
              {studentRequests.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>No previous inquiries logged for {selectedStudent.name}.</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Use the compose tab to send your first polite update request.
                  </p>
                </div>
              ) : (
                studentRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-900 block text-sm">{req.subject}</span>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>Date: {req.timestamp}</span>
                          <span>•</span>
                          <span>Category: {req.templateCategory}</span>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          req.status === 'addressed'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {req.status === 'addressed' ? 'Ustadh Addressed' : 'Pending Review'}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700 whitespace-pre-line leading-relaxed">
                      {req.message}
                    </div>

                    {req.teacherReply && (
                      <div className="p-3 rounded-lg bg-emerald-50/80 border border-emerald-200 space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-emerald-900 font-bold">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                            Ustadh Reply:
                          </span>
                          {req.repliedAt && <span className="text-emerald-700 text-[10px] font-normal">{req.repliedAt}</span>}
                        </div>
                        <p className="text-emerald-950 font-medium whitespace-pre-line">
                          "{req.teacherReply}"
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Islamic etiquette: Respectful communication fosters Quranic barakah.</span>
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
