import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Mail, Send, User, Type, FileText, MessageSquare, CheckCircle, XCircle, Loader, Sparkles, ChevronDown } from 'lucide-react';

const QUICK_TEMPLATES = [
  {
    label: "🎉 Thank You Message",
    subject: "Thank You from Path Sarthi Trust",
    preview: "We are truly grateful for your support.",
    message: "Dear {name},\n\nWe want to extend our heartfelt gratitude for your continued support and trust in Path Sarthi Trust. Your contribution is making a real and lasting difference in the lives of children, elders, and families across our communities.\n\nBecause of people like you, we are able to continue our mission of service, education, and social welfare.",
    additionalMessage: "We look forward to sharing more updates about our work and impact. Thank you once again for being a valued member of the Path Sarthi Trust family.",
    status: "Thank You",
  },
  {
    label: "📢 Important Update",
    subject: "Important Update from Path Sarthi Trust",
    preview: "A new update from our team.",
    message: "Dear {name},\n\nWe are reaching out with an important update from Path Sarthi Trust. Please read the following carefully.",
    additionalMessage: "If you have any questions or concerns, please do not hesitate to contact us at pathsarthi2022@gmail.com. We are always here to assist you.",
    status: "Update",
  },
  {
    label: "📅 Event Invitation",
    subject: "You Are Invited — Path Sarthi Trust Event",
    preview: "Join us for an upcoming event!",
    message: "Dear {name},\n\nWe are delighted to invite you to an upcoming event organized by Path Sarthi Trust. Your presence would mean a great deal to us and to the community we serve together.",
    additionalMessage: "Kindly confirm your attendance at your earliest convenience. We look forward to seeing you!",
    status: "Invitation",
  },
  {
    label: "💳 Membership Reminder",
    subject: "Your Path Sarthi Trust Membership — A Gentle Reminder",
    preview: "Renew your membership and continue making an impact.",
    message: "Dear {name},\n\nThis is a gentle reminder regarding your membership with Path Sarthi Trust. Your membership plays a vital role in sustaining our programs and helping us reach more beneficiaries.\n\nWe invite you to renew your membership and continue being a part of our growing family of change-makers.",
    additionalMessage: "For any assistance with your membership renewal, please contact us directly. Thank you for your unwavering commitment to our mission.",
    status: "Reminder",
  },
];

const AdminEmailComposer = () => {
  const [form, setForm] = useState({
    recipientEmail: '',
    recipientName: '',
    subject: '',
    preview: '',
    status: 'Message from Path Sarthi Trust',
    message: '',
    additionalMessage: '',
  });

  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null); // 'success' | 'error' | null
  const [errorMsg, setErrorMsg] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setResult(null);
  };

  const applyTemplate = (tmpl) => {
    setForm((prev) => ({
      ...prev,
      subject: tmpl.subject,
      preview: tmpl.preview,
      status: tmpl.status,
      message: tmpl.message,
      additionalMessage: tmpl.additionalMessage,
    }));
    setShowTemplates(false);
    setResult(null);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    setResult(null);
    setErrorMsg('');

    try {
      const functions = getFunctions();
      const sendCustomEmail = httpsCallable(functions, 'sendCustomEmail');
      await sendCustomEmail({
        recipientEmail: form.recipientEmail.trim(),
        recipientName: form.recipientName.trim(),
        subject: form.subject.trim(),
        preview: form.preview.trim() || form.subject.trim(),
        status: form.status.trim(),
        message: form.message.trim(),
        additionalMessage: form.additionalMessage.trim(),
      });
      setResult('success');
    } catch (err) {
      console.error('[AdminEmailComposer] Send failed:', err);
      setErrorMsg(err?.message || 'Failed to send email. Please try again.');
      setResult('error');
    } finally {
      setSending(false);
    }
  };

  const handleReset = () => {
    setForm({
      recipientEmail: '',
      recipientName: '',
      subject: '',
      preview: '',
      status: 'Message from Path Sarthi Trust',
      message: '',
      additionalMessage: '',
    });
    setResult(null);
    setErrorMsg('');
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl" style={{ background: 'linear-gradient(135deg, #009ba2, #00c8d2)' }}>
            <Mail size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Email Composer</h1>
        </div>
        <p className="text-slate-500 text-sm ml-12">
          Compose and send a custom email to any member or contact on behalf of Path Sarthi Trust.
        </p>
      </div>

      {/* Quick Templates */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setShowTemplates((v) => !v)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-teal-300 text-teal-700 bg-teal-50 hover:bg-teal-100 transition text-sm font-medium"
        >
          <Sparkles size={16} />
          Quick Templates
          <ChevronDown size={14} className={`transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
        </button>

        {showTemplates && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUICK_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyTemplate(tmpl)}
                className="text-left px-4 py-3 rounded-xl border border-slate-200 bg-white hover:border-teal-400 hover:shadow-md transition group"
              >
                <div className="font-medium text-slate-700 group-hover:text-teal-700 text-sm">{tmpl.label}</div>
                <div className="text-xs text-slate-400 mt-0.5 truncate">{tmpl.subject}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSend} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

        {/* Recipient */}
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Recipient</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                <span className="flex items-center gap-1.5"><User size={14} /> Recipient Name *</span>
              </label>
              <input
                name="recipientName"
                value={form.recipientName}
                onChange={handleChange}
                required
                placeholder="e.g. Ramesh Sharma"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                <span className="flex items-center gap-1.5"><Mail size={14} /> Recipient Email *</span>
              </label>
              <input
                name="recipientEmail"
                type="email"
                value={form.recipientEmail}
                onChange={handleChange}
                required
                placeholder="e.g. ramesh@example.com"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-400 transition"
              />
            </div>
          </div>
        </div>

        {/* Email Details */}
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Email Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                <span className="flex items-center gap-1.5"><Type size={14} /> Subject Line *</span>
              </label>
              <input
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
                placeholder="e.g. Thank You from Path Sarthi Trust"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-400 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  Preview Text
                  <span className="text-slate-400 font-normal ml-1">(inbox teaser)</span>
                </label>
                <input
                  name="preview"
                  value={form.preview}
                  onChange={handleChange}
                  placeholder="Short preview shown in inbox"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-400 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  Status Badge
                </label>
                <input
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  placeholder="e.g. Thank You / Update / Reminder"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-400 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Message Body */}
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Message Body</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                <span className="flex items-center gap-1.5"><MessageSquare size={14} /> Main Message *</span>
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={6}
                placeholder="Write your main message here. You can use line breaks for paragraphs. HTML is also supported."
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-400 transition resize-y"
              />
              <p className="text-xs text-slate-400 mt-1">Tip: Use &lt;br/&gt; for line breaks, &lt;strong&gt; for bold text.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                <span className="flex items-center gap-1.5"><FileText size={14} /> Additional Note</span>
                <span className="text-slate-400 font-normal ml-1">(shown in "What Happens Next?" section)</span>
              </label>
              <textarea
                name="additionalMessage"
                value={form.additionalMessage}
                onChange={handleChange}
                rows={3}
                placeholder="Optional closing note or next-step instructions for the recipient."
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-400 transition resize-y"
              />
            </div>
          </div>
        </div>

        {/* Feedback Banner */}
        {result === 'success' && (
          <div className="mx-6 mt-4 flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
            <CheckCircle size={18} className="shrink-0" />
            <div>
              <span className="font-semibold">Email sent successfully!</span> It should arrive in the recipient's inbox shortly.
            </div>
          </div>
        )}
        {result === 'error' && (
          <div className="mx-6 mt-4 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            <XCircle size={18} className="shrink-0" />
            <div>
              <span className="font-semibold">Send failed.</span> {errorMsg}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition"
          >
            Clear Form
          </button>

          <button
            type="submit"
            disabled={sending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm transition disabled:opacity-60"
            style={{ background: sending ? '#009ba2aa' : 'linear-gradient(135deg, #009ba2, #007f85)' }}
          >
            {sending ? (
              <><Loader size={16} className="animate-spin" /> Sending...</>
            ) : (
              <><Send size={16} /> Send Email</>
            )}
          </button>
        </div>
      </form>

      {/* Birthday Automation Info Card */}
      <div className="mt-6 p-5 bg-gradient-to-br from-orange-50 to-pink-50 border border-orange-200 rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="text-3xl">🎂</div>
          <div>
            <h3 className="font-bold text-orange-800 mb-1">Birthday Automation is Active</h3>
            <p className="text-sm text-orange-700 leading-relaxed">
              Every day at <strong>12:00 AM IST</strong>, the system automatically scans all membership records and sends personalized birthday wish emails to members whose birthday is today.
              Make sure members have a <code className="bg-orange-100 px-1 rounded text-xs">dob</code> field saved in their membership document (formats supported: <code className="bg-orange-100 px-1 rounded text-xs">YYYY-MM-DD</code>, <code className="bg-orange-100 px-1 rounded text-xs">DD/MM/YYYY</code>).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEmailComposer;
