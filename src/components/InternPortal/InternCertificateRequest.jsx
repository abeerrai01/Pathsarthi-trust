import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useInternAuth } from '../../contexts/InternAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Send, CheckCircle, Clock, XCircle, AlertCircle, FileText, Plus } from 'lucide-react';

const STATUS_CONFIG = {
  pending: { label: 'Under Review', color: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-200', icon: <Clock size={13} /> },
  approved: { label: 'Approved', color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-200', icon: <CheckCircle size={13} /> },
  rejected: { label: 'Not Approved', color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-200', icon: <XCircle size={13} /> },
  issued: { label: 'Certificate Issued', color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-200', icon: <Award size={13} /> },
};

const InternCertificateRequest = () => {
  const { internUser, internProfile } = useInternAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    internshipDuration: '',
    completionDate: '',
    message: '',
  });

  // Fetch existing requests
  useEffect(() => {
    if (!internUser?.uid) return;

    const q = query(
      collection(db, 'certificate_requests'),
      where('internUid', '==', internUser.uid),
      orderBy('requestedAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error('[CertRequest] Error:', err);
      setLoading(false);
    });

    return () => unsub();
  }, [internUser?.uid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!internProfile) return;
    setSubmitting(true);

    try {
      await addDoc(collection(db, 'certificate_requests'), {
        internUid: internUser.uid,
        internName: internProfile.name,
        internEmail: internProfile.email || internUser.email,
        internDepartment: internProfile.field,
        applicationId: internProfile.id,
        internshipDuration: form.internshipDuration,
        completionDate: form.completionDate,
        message: form.message,
        status: 'pending',
        requestedAt: new Date(),
        adminNote: '',
      });
      setSuccess(true);
      setShowForm(false);
      setForm({ internshipDuration: '', completionDate: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('[CertRequest] Submit error:', err);
      alert('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasPendingRequest = requests.some(r => r.status === 'pending');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 text-sm font-medium">Loading requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                <Award size={24} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Certificate Request</h2>
            </div>
            <p className="text-slate-500 text-sm font-medium ml-1">Request your internship completion certificate</p>
          </div>
          {!hasPendingRequest && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm bg-blue-600 hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
            >
              <Plus size={18} />
              {showForm ? 'Cancel' : 'New Request'}
            </motion.button>
          )}
        </div>
      </div>

      {/* Success notice */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800"
          >
            <CheckCircle size={20} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Request Submitted</p>
              <p className="text-xs text-green-600 mt-0.5">The admin team will review your request and issue the certificate.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warning if pending exists */}
      {hasPendingRequest && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <p className="text-sm font-medium">You already have a pending certificate request. Please wait for it to be reviewed before submitting a new one.</p>
        </div>
      )}

      {/* Request Form */}
      <AnimatePresence>
        {showForm && !hasPendingRequest && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm"
          >
            <h3 className="text-slate-900 font-bold text-lg mb-5 flex items-center gap-2">
              <FileText size={20} className="text-blue-500" /> Fill in your details
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Internship Duration
                </label>
                <input
                  type="text"
                  value={form.internshipDuration}
                  onChange={e => setForm(f => ({ ...f, internshipDuration: e.target.value }))}
                  required
                  placeholder="e.g. 2 months (June - July 2025)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Completion Date
                </label>
                <input
                  type="date"
                  value={form.completionDate}
                  onChange={e => setForm(f => ({ ...f, completionDate: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Message / Details
                </label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  rows={4}
                  placeholder="Mention key tasks completed or any other comments..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 disabled:opacity-60"
              >
                {submitting ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                ) : (
                  <><Send size={18} /> Submit Request</>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      <div className="space-y-4">
        <h3 className="text-slate-900 font-bold text-lg">Request History</h3>
        {requests.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200 border-dashed">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Award size={28} />
            </div>
            <p className="text-slate-500 font-medium">No certificate requests found.</p>
            <p className="text-slate-400 text-sm mt-1">Once you submit a request, it will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => {
              const status = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
              const dateStr = req.requestedAt?.toDate
                ? req.requestedAt.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                : '—';
              const compDateStr = req.completionDate
                ? new Date(req.completionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                : '—';

              return (
                <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <span className="text-xs text-slate-400 font-bold">Requested: {dateStr}</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold border ${status.color} ${status.bg} ${status.border}`}>
                      {status.icon} {status.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Duration</p>
                      <p className="text-slate-900 font-semibold">{req.internshipDuration}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Completion Date</p>
                      <p className="text-slate-900 font-semibold">{compDateStr}</p>
                    </div>
                  </div>

                  {req.message && (
                    <div className="text-sm text-slate-600 mb-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1.5">Your Message</p>
                      <p className="leading-relaxed">{req.message}</p>
                    </div>
                  )}

                  {req.adminNote && (
                    <div className="text-sm text-slate-700 bg-blue-50 border border-blue-100 p-4 rounded-xl">
                      <p className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-1.5">Team Note</p>
                      <p className="leading-relaxed font-medium">{req.adminNote}</p>
                    </div>
                  )}

                  {req.status === 'issued' && req.certificateUrl && (
                    <a
                      href={req.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-sm transition-all"
                    >
                      <Award size={16} /> View Certificate
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InternCertificateRequest;
