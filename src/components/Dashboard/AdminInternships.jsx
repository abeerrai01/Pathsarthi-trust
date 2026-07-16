import React, { useState, useEffect, useRef } from 'react';
import {
  collection, onSnapshot, doc, updateDoc, deleteDoc,
  getDocs, query, where, orderBy
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, CheckCircle, XCircle, Clock, Trash2, Mail,
  Phone, MapPin, User, GraduationCap, Key, Eye, EyeOff,
  ShieldOff, ShieldCheck, UserX, ListTodo,
  Award, RefreshCw, Copy, Check,
  AlertTriangle, Info, Trophy, Youtube, Instagram, Linkedin,
  CreditCard, Users, Image as ImageIcon, Play, CheckCircle2,
  X, Hash, Zap
} from 'lucide-react';

const functions = getFunctions();
const createInternCredentialsFn = httpsCallable(functions, 'createInternCredentials');
const expireInternCredentialsFn = httpsCallable(functions, 'expireInternCredentials');
const reinstateInternCredentialsFn = httpsCallable(functions, 'reinstateInternCredentials');
const deleteInternCredentialsFn = httpsCallable(functions, 'deleteInternCredentials');

// ─── Copy-to-clipboard button ─────────────────────────────────────────────────
const CopyBtn = ({ value }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={copy}
      className="ml-2 p-1 rounded text-slate-400 hover:text-indigo-500 transition-colors"
      title="Copy"
    >
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
};

// ─── Safe Date Formatter ──────────────────────────────────────────────────────
const formatDateSafe = (timestamp, options = {}) => {
  if (!timestamp) return '—';
  try {
    let date;
    if (typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (timestamp.seconds !== undefined) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    return date.toLocaleDateString('en-IN', options);
  } catch (err) {
    console.error('[AdminInternships] Error formatting date:', err);
    return '—';
  }
};

// ─── Credential Badge ─────────────────────────────────────────────────────────
const CredBadge = ({ active }) =>
  active
    ? <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200"><ShieldCheck size={12} /> Active</span>
    : <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200"><ShieldOff size={12} /> Revoked</span>;

// ─── Intern Profile Modal ─────────────────────────────────────────────────────
const InternProfileModal = ({ app, onClose, onRefresh }) => {
  const [showPass, setShowPass] = useState(false);
  const [generatingCred, setGeneratingCred] = useState(false);
  const [expiringCred, setExpiringCred] = useState(false);
  const [reinstatingCred, setReinstateCred] = useState(false);
  const [deletingCred, setDeletingCred] = useState(false);
  const [credResult, setCredResult] = useState(null);
  const [credError, setCredError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [certRequests, setCertRequests] = useState([]);
  const [janCount, setJanCount] = useState(null);

  // ── Live Jan Sampark count for Task 2 ─────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'tasks' || !app.name) return;
    const fetchCount = async () => {
      try {
        const snap = await getDocs(collection(db, 'jan_sampark'));
        let c = 0;
        snap.forEach(d => {
          const data = d.data();
          const s = (data.status || '').trim().toLowerCase();
          const ref = (data.reference || '').trim().toLowerCase();
          if ((s === 'completed' || s === 'paid') && ref === app.name.trim().toLowerCase()) c++;
        });
        setJanCount(c);
      } catch (e) { console.error(e); }
    };
    fetchCount();
  }, [app.name, activeTab]);

  useEffect(() => {
    if (!app.credUid || activeTab !== 'certificates') return;
    const q = query(
      collection(db, 'certificate_requests'),
      where('internUid', '==', app.credUid),
      orderBy('requestedAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setCertRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [app.credUid, activeTab]);

  // ── Credential Actions ────────────────────────────────────────────────────────
  const handleGenerate = async (isApproval = false) => {
    const msg = isApproval
      ? `Approve application for ${app.name} (${app.email})?\n\nThis will generate credentials and automatically send them an email.`
      : `Generate credentials for ${app.name} (${app.email})?\n\nA Firebase Auth account will be created and an email will be sent automatically.`;
    
    if (!window.confirm(msg)) return;
    setGeneratingCred(true);
    setCredError('');
    setCredResult(null);
    try {
      const res = await createInternCredentialsFn({
        applicationId: app.id,
        email: app.email,
        name: app.name,
      });
      setCredResult(res.data);
      onRefresh();
    } catch (err) {
      setCredError(err.message || 'Failed to generate credentials.');
    } finally {
      setGeneratingCred(false);
    }
  };

  const handleExpire = async () => {
    if (!window.confirm(`Revoke access for ${app.name}?\n\nThey will not be able to log in to the Intern Portal.`)) return;
    setExpiringCred(true);
    setCredError('');
    try {
      await expireInternCredentialsFn({ applicationId: app.id, credUid: app.credUid });
      onRefresh();
    } catch (err) {
      setCredError(err.message || 'Failed to expire credentials.');
    } finally {
      setExpiringCred(false);
    }
  };

  const handleReinstate = async () => {
    if (!window.confirm(`Reinstate access for ${app.name}?\n\nThey will be able to log in again.`)) return;
    setReinstateCred(true);
    setCredError('');
    try {
      await reinstateInternCredentialsFn({ applicationId: app.id, credUid: app.credUid });
      onRefresh();
    } catch (err) {
      setCredError(err.message || 'Failed to reinstate credentials.');
    } finally {
      setReinstateCred(false);
    }
  };

  const handleDeleteCred = async () => {
    if (!window.confirm(`⚠️ PERMANENTLY DELETE auth account for ${app.name}?\n\nThis cannot be undone. The intern will never be able to log in with these credentials.`)) return;
    setDeletingCred(true);
    setCredError('');
    try {
      await deleteInternCredentialsFn({ applicationId: app.id, credUid: app.credUid });
      onRefresh();
    } catch (err) {
      setCredError(err.message || 'Failed to delete credentials.');
    } finally {
      setDeletingCred(false);
    }
  };


  // ── Update cert request status ─────────────────────────────────────────────
  const handleCertStatus = async (certId, newStatus, adminNote) => {
    await updateDoc(doc(db, 'certificate_requests', certId), { status: newStatus, adminNote: adminNote || '' });
  };

  const TABS = [
    { id: 'profile', label: 'Profile', icon: <User size={14} /> },
    { id: 'credentials', label: 'Credentials', icon: <Key size={14} /> },
    { id: 'tasks', label: 'Tasks', icon: <ListTodo size={14} />, disabled: !app.credUid },
    { id: 'certificates', label: 'Certificates', icon: <Award size={14} />, disabled: !app.credUid },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={e => e.target.id === 'modal-overlay' && onClose()}
        id="modal-overlay"
        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col"
        >
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-indigo-700 to-violet-700 p-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white font-black text-2xl">
                {app.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h3 className="font-black text-white text-xl leading-tight">{app.name}</h3>
                <p className="text-indigo-200 text-sm">{app.field}</p>
                {app.credUid && (
                  <div className="mt-1">
                    <CredBadge active={app.credActive} />
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/10"
            >
              <X size={22} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 shrink-0 px-4 pt-2 gap-1 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                disabled={tab.disabled}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed ${
                  activeTab === tab.id
                    ? 'bg-white text-indigo-700 border-b-2 border-indigo-600 -mb-px'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Modal Body */}
          <div className="overflow-y-auto flex-1 p-6 space-y-4">

            {/* ── PROFILE TAB ─────────────────────────────────────────────── */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: 'Email', value: app.email, icon: <Mail size={14} className="text-indigo-400" /> },
                    { label: 'Phone', value: app.phone, icon: <Phone size={14} className="text-green-500" /> },
                    { label: 'Age', value: app.age, icon: <User size={14} className="text-blue-400" /> },
                    { label: 'Education', value: app.education, icon: <GraduationCap size={14} className="text-amber-500" /> },
                    { label: 'City', value: app.city, icon: <MapPin size={14} className="text-pink-400" /> },
                    { label: 'State', value: app.state, icon: <MapPin size={14} className="text-pink-400" /> },
                    { label: 'Department', value: app.field, icon: <Briefcase size={14} className="text-indigo-500" /> },
                    { label: 'Applied On', value: formatDateSafe(app.createdAt, { day: '2-digit', month: 'long', year: 'numeric' }), icon: <Clock size={14} className="text-slate-400" /> },
                  ].map(row => (
                    <div key={row.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="text-slate-400 text-xs font-semibold mb-1 flex items-center gap-1.5">{row.icon} {row.label}</p>
                      <p className="text-slate-800 font-semibold text-sm">{row.value || '—'}</p>
                    </div>
                  ))}
                </div>
                {app.message && (
                  <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                    <p className="text-indigo-600 text-xs font-bold mb-2">Motivation Statement</p>
                    <p className="text-slate-700 text-sm italic">"{app.message}"</p>
                  </div>
                )}
                {/* Status actions */}
                <div className="flex gap-2 pt-2">
                  {(app.status === 'pending' || app.status === 'rejected') && (
                    <button
                      onClick={async () => {
                        if (!app.credUid) {
                          await handleGenerate(true);
                        } else {
                          await updateDoc(doc(db, 'internship_applications', app.id), { status: 'approved' });
                        }
                      }}
                      disabled={generatingCred}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 transition-colors disabled:opacity-50"
                    >
                      {generatingCred ? <><div className="w-4 h-4 border-2 border-green-400/40 border-t-green-600 rounded-full animate-spin" /> Approving...</> : <><CheckCircle size={16} /> Approve Application</>}
                    </button>
                  )}
                  {(app.status === 'pending' || app.status === 'approved') && (
                    <button
                      onClick={() => updateDoc(doc(db, 'internship_applications', app.id), { status: 'rejected' })}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── CREDENTIALS TAB ─────────────────────────────────────────── */}
            {activeTab === 'credentials' && (
              <div className="space-y-4">
                {/* Error */}
                {credError && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5 text-red-500" />
                    {credError}
                  </div>
                )}

                {/* Success result from generation */}
                {credResult && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm">
                    <CheckCircle size={16} className="shrink-0 mt-0.5 text-green-600" />
                    <div>
                      <p className="font-bold mb-1">Credentials Generated Successfully!</p>
                      <p>Email: <strong>{credResult.credEmail}</strong></p>
                      <p>Password: <strong>{credResult.credPassword}</strong></p>
                    </div>
                  </div>
                )}

                {/* No credentials yet */}
                {!app.credUid && !credResult && (
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
                    <Key size={36} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 font-bold mb-1">No Credentials Generated</p>
                    <p className="text-slate-400 text-sm mb-5">Generate a Firebase Auth account for this intern to give them portal access.</p>
                    <button
                      onClick={handleGenerate}
                      disabled={generatingCred}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-200"
                    >
                      {generatingCred
                        ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
                        : <><Key size={16} /> Generate Credentials</>
                      }
                    </button>
                  </div>
                )}

                {/* Credentials exist */}
                {(app.credUid || credResult) && (
                  <div className="space-y-3">
                    {/* Status */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                        <Key size={16} className="text-indigo-400" /> Credential Status
                      </div>
                      <CredBadge active={app.credActive} />
                    </div>

                    {/* Email */}
                    {app.credEmail && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-slate-400 text-xs font-bold uppercase mb-1.5">Login Email</p>
                        <div className="flex items-center justify-between">
                          <code className="text-slate-800 font-semibold text-sm">{app.credEmail}</code>
                          <CopyBtn value={app.credEmail} />
                        </div>
                      </div>
                    )}

                    {/* Password */}
                    {app.credPassword && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-slate-400 text-xs font-bold uppercase mb-1.5">Portal Password</p>
                        <div className="flex items-center justify-between">
                          <code className="text-slate-800 font-mono text-sm font-semibold tracking-widest">
                            {showPass ? app.credPassword : '••••••••••••••'}
                          </code>
                          <div className="flex items-center gap-1">
                            {showPass && <CopyBtn value={app.credPassword} />}
                            <button
                              onClick={() => setShowPass(v => !v)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 transition-colors"
                              title={showPass ? 'Hide password' : 'Reveal password'}
                            >
                              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                      {app.credCreatedAt && (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="text-slate-400 text-xs font-bold uppercase mb-1">Created</p>
                          <p className="text-slate-700 text-xs font-semibold">
                            {app.credCreatedAt?.toDate?.().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      )}
                      {app.credExpiredAt && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                          <p className="text-red-400 text-xs font-bold uppercase mb-1">Revoked</p>
                          <p className="text-red-600 text-xs font-semibold">
                            {app.credExpiredAt?.toDate?.().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Credential action buttons */}
                    <div className="flex flex-col gap-2 pt-2">
                      {app.credActive ? (
                        <button
                          onClick={handleExpire}
                          disabled={expiringCred}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                        >
                          {expiringCred
                            ? <><div className="w-4 h-4 border-2 border-amber-400/40 border-t-amber-600 rounded-full animate-spin" /> Revoking...</>
                            : <><ShieldOff size={16} /> Expire / Revoke Access</>
                          }
                        </button>
                      ) : (
                        <button
                          onClick={handleReinstate}
                          disabled={reinstatingCred}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                        >
                          {reinstatingCred
                            ? <><div className="w-4 h-4 border-2 border-green-400/40 border-t-green-600 rounded-full animate-spin" /> Reinstating...</>
                            : <><ShieldCheck size={16} /> Reinstate Access</>
                          }
                        </button>
                      )}
                      <button
                        onClick={handleDeleteCred}
                        disabled={deletingCred}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                      >
                        {deletingCred
                          ? <><div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" /> Deleting...</>
                          : <><UserX size={16} /> Permanently Delete Auth Account</>
                        }
                      </button>
                    </div>

                    <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-600">
                      <Info size={14} className="shrink-0 mt-0.5" />
                      <p>You can send credentials to the intern manually via the email composer or by copying them above.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TASKS TAB (Read-only progress view) ─────────────────── */}
            {activeTab === 'tasks' && (() => {
              const it = app.internTasks || {};
              const t1 = it.task1 || {};
              const t3 = it.task3 || {};
              const t4 = it.task4 || {};
              const mediaFiles = t3.files || [];
              const socialPlatforms = [
                { key: 'youtube', label: 'YouTube', icon: <Youtube size={14} className="text-red-500" /> },
                { key: 'instagram', label: 'Instagram', icon: <Instagram size={14} className="text-pink-500" /> },
                { key: 'linkedin', label: 'LinkedIn', icon: <Linkedin size={14} className="text-blue-600" /> },
              ];
              const completed = [
                t1.completed, janCount >= 10, t3.completed, t4.completed
              ].filter(Boolean).length;

              return (
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <p className="text-slate-700 font-bold text-sm flex items-center gap-2">
                      <Trophy size={16} className="text-blue-500" />
                      Task Milestones — {completed}/4 Completed
                    </p>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      completed === 4 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {completed === 4 ? 'All Done' : `${completed}/4`}
                    </span>
                  </div>

                  {/* Task 1 — Premium Membership */}
                  <div className={`rounded-xl p-4 border ${ t1.completed ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200' }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard size={15} className={t1.completed ? 'text-green-600' : 'text-slate-400'} />
                      <p className="font-bold text-sm text-slate-800">Task 1: Premium Membership</p>
                      {t1.completed
                        ? <span className="ml-auto text-xs font-bold text-green-700 flex items-center gap-1"><CheckCircle2 size={12} /> Done</span>
                        : <span className="ml-auto text-xs font-bold text-slate-400">Pending</span>}
                    </div>
                    {t1.completed && <p className="text-xs text-green-600 font-medium">Membership verified. ID: {t1.membershipId}</p>}
                  </div>

                  {/* Task 2 — Jan Sampark */}
                  <div className={`rounded-xl p-4 border ${ janCount >= 10 ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200' }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={15} className={janCount >= 10 ? 'text-green-600' : 'text-slate-400'} />
                      <p className="font-bold text-sm text-slate-800">Task 2: Jan Sampark Members</p>
                      {janCount >= 10
                        ? <span className="ml-auto text-xs font-bold text-green-700 flex items-center gap-1"><CheckCircle2 size={12} /> Done</span>
                        : <span className="ml-auto text-xs font-bold text-slate-500">{janCount ?? '...'}/10</span>}
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min(((janCount || 0) / 10) * 100, 100)}%` }} />
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-medium">{janCount ?? '...'} members added with {app.name} as reference</p>
                  </div>

                  {/* Task 3 — Field Media */}
                  <div className={`rounded-xl p-4 border ${ t3.completed ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200' }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon size={15} className={t3.completed ? 'text-green-600' : 'text-slate-400'} />
                      <p className="font-bold text-sm text-slate-800">Task 3: Field Work Media</p>
                      {t3.completed
                        ? <span className="ml-auto text-xs font-bold text-green-700 flex items-center gap-1"><CheckCircle2 size={12} /> Done</span>
                        : <span className="ml-auto text-xs font-bold text-slate-500">{mediaFiles.length}/5 uploaded</span>}
                    </div>
                    {mediaFiles.length > 0 && (
                      <div className="grid grid-cols-4 gap-1.5 mt-2">
                        {mediaFiles.map((f, i) => (
                          <div key={i} className="aspect-square rounded-lg overflow-hidden bg-slate-200 border border-slate-300">
                            {f.type === 'video'
                              ? <div className="w-full h-full flex items-center justify-center text-slate-400"><Play size={16} /></div>
                              : <img src={f.url} alt={f.name} className="w-full h-full object-cover" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Task 4 — Social Media */}
                  <div className={`rounded-xl p-4 border ${ t4.completed ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200' }`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Trophy size={15} className={t4.completed ? 'text-green-600' : 'text-slate-400'} />
                      <p className="font-bold text-sm text-slate-800">Task 4: Social Media</p>
                      {t4.completed
                        ? <span className="ml-auto text-xs font-bold text-green-700 flex items-center gap-1"><CheckCircle2 size={12} /> Done</span>
                        : <span className="ml-auto text-xs font-bold text-slate-500">{socialPlatforms.filter(p => t4[p.key]?.done).length}/3</span>}
                    </div>
                    <div className="space-y-2">
                      {socialPlatforms.map(p => (
                        <div key={p.key} className={`flex items-center gap-2.5 p-2.5 rounded-lg ${ t4[p.key]?.done ? 'bg-green-100' : 'bg-white border border-slate-200' }`}>
                          {p.icon}
                          <span className="text-xs font-semibold text-slate-700">{p.label}</span>
                          {t4[p.key]?.done && (
                            <>
                              <CheckCircle2 size={13} className="text-green-600 ml-auto" />
                              {t4[p.key]?.screenshotUrl && (
                                <a href={t4[p.key].screenshotUrl} target="_blank" rel="noopener noreferrer"
                                  className="text-xs text-blue-600 underline ml-1">Screenshot</a>
                              )}
                            </>
                          )}
                          {!t4[p.key]?.done && <span className="ml-auto text-xs text-slate-400">Pending</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ── CERTIFICATES TAB ────────────────────────────────────────── */}
            {activeTab === 'certificates' && (
              <div className="space-y-3">
                <p className="text-slate-600 font-bold text-sm">Certificate Requests ({certRequests.length})</p>
                {certRequests.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <Award size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="font-medium">No certificate requests</p>
                  </div>
                ) : (
                  certRequests.map(req => (
                    <CertRequestCard key={req.id} req={req} onUpdateStatus={handleCertStatus} />
                  ))
                )}
              </div>
            )}

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Cert Request Card (within modal) ─────────────────────────────────────────
const CertRequestCard = ({ req, onUpdateStatus }) => {
  const [adminNote, setAdminNote] = useState(req.adminNote || '');
  const [saving, setSaving] = useState(false);

  const save = async (status) => {
    setSaving(true);
    await onUpdateStatus(req.id, status, adminNote);
    setSaving(false);
  };

  const statusColors = {
    pending: 'text-amber-600 bg-amber-50 border-amber-200',
    approved: 'text-green-600 bg-green-50 border-green-200',
    rejected: 'text-red-600 bg-red-50 border-red-200',
    issued: 'text-violet-600 bg-violet-50 border-violet-200',
  };

  const date = req.requestedAt?.toDate
    ? req.requestedAt.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${statusColors[req.status] || statusColors.pending}`}>
            {req.status}
          </span>
          <p className="font-bold text-slate-800 text-sm mt-1">{req.internshipDuration}</p>
          <p className="text-slate-400 text-xs">Requested: {date} · Completion: {req.completionDate}</p>
          {req.message && <p className="text-slate-600 text-xs italic mt-1">"{req.message}"</p>}
        </div>
      </div>
      <textarea
        value={adminNote}
        onChange={e => setAdminNote(e.target.value)}
        placeholder="Admin note (visible to intern)..."
        rows={2}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-1 focus:ring-indigo-400 resize-none bg-white"
      />
      <div className="flex gap-2">
        <button onClick={() => save('approved')} disabled={saving} className="flex-1 py-2 rounded-lg text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 transition-all disabled:opacity-60">Approve</button>
        <button onClick={() => save('issued')} disabled={saving} className="flex-1 py-2 rounded-lg text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 transition-all disabled:opacity-60">Mark Issued</button>
        <button onClick={() => save('rejected')} disabled={saving} className="flex-1 py-2 rounded-lg text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-all disabled:opacity-60">Reject</button>
      </div>
    </div>
  );
};

// ─── Main Admin Internships Component ─────────────────────────────────────────
const AdminInternships = () => {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [snapshotError, setSnapshotError] = useState('');
  const [idGenerating, setIdGenerating] = useState(false);
  const [idGenResult, setIdGenResult] = useState(null);
  const selectedAppRef = useRef(null);

  // Keep ref in sync so the snapshot callback can access current selectedApp
  // without being a stale closure
  useEffect(() => { selectedAppRef.current = selectedApp; }, [selectedApp]);

  useEffect(() => {
    setSnapshotError('');
    const unsub = onSnapshot(
      collection(db, 'internship_applications'),
      (snapshot) => {
        const apps = snapshot.docs.map(d => {
          const data = d.data();
          // Normalize: some forms save 'name', some save 'fullName'
          const name = data.name || data.fullName || data.firstName
            ? (data.name || data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim())
            : '';
          return { id: d.id, ...data, name };
        });
        // Sort by createdAt descending — handle both Timestamp and Date
        apps.sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() ?? (a.createdAt instanceof Date ? a.createdAt.getTime() : 0);
          const tb = b.createdAt?.toMillis?.() ?? (b.createdAt instanceof Date ? b.createdAt.getTime() : 0);
          return tb - ta;
        });
        setApplications(apps);
        setLoading(false);
        // Sync selectedApp if modal is open (use ref to avoid stale closure)
        if (selectedAppRef.current) {
          const updated = apps.find(a => a.id === selectedAppRef.current.id);
          if (updated) setSelectedApp(updated);
        }
      },
      (error) => {
        console.error('[AdminInternships] Firestore snapshot error:', error);
        setSnapshotError(`Failed to load applications: ${error.message}`);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [refreshKey]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'internship_applications', id), { status: newStatus });
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this application? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'internship_applications', id));
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  // ─── Generate intern IDs for all applications missing one ────────────────────
  const generateAllInternIds = async () => {
    setIdGenerating(true);
    setIdGenResult(null);
    try {
      const snap = await getDocs(collection(db, 'internship_applications'));
      const withId = [];
      const withoutId = [];
      snap.forEach(docSnap => {
        const data = docSnap.data();
        if (data.internId) withId.push({ id: docSnap.id, internId: data.internId });
        else withoutId.push({ id: docSnap.id, data });
      });

      if (withoutId.length === 0) {
        setIdGenResult({ count: 0, message: 'All applications already have an Intern ID.' });
        setIdGenerating(false);
        return;
      }

      // Sort by createdAt ascending (oldest first = lowest ID)
      withoutId.sort((a, b) => {
        const ta = a.data.createdAt?.toMillis?.() ?? (a.data.createdAt?.seconds || 0) * 1000;
        const tb = b.data.createdAt?.toMillis?.() ?? (b.data.createdAt?.seconds || 0) * 1000;
        return ta - tb;
      });

      // Derive the highest existing sequential number to avoid conflicts
      let maxSeq = withId.reduce((max, item) => {
        const parts = (item.internId || '').split('-');
        const seq = parseInt(parts[parts.length - 1], 10);
        return isNaN(seq) ? max : Math.max(max, seq);
      }, 0);

      const year = new Date().getFullYear();
      const batch = [];
      withoutId.forEach(({ id }) => {
        maxSeq += 1;
        const internId = `PSTI-${year}-${String(maxSeq).padStart(4, '0')}`;
        batch.push(updateDoc(doc(db, 'internship_applications', id), { internId }));
      });

      await Promise.all(batch);
      setIdGenResult({ count: withoutId.length, message: `✅ Assigned ${withoutId.length} new Intern ID${withoutId.length > 1 ? 's' : ''} successfully!` });
    } catch (err) {
      console.error('[AdminInternships] generateAllInternIds error:', err);
      setIdGenResult({ count: 0, message: `❌ Failed: ${err.message}`, error: true });
    } finally {
      setIdGenerating(false);
    }
  };

  const filteredApps = filter === 'All'
    ? applications
    : filter === 'Credentialed'
      ? applications.filter(a => a.credUid)
      : applications.filter(a => (a.status || 'pending') === filter.toLowerCase());

  const counts = {
    all: applications.length,
    pending: applications.filter(a => (a.status || 'pending') === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    credentialed: applications.filter(a => a.credUid).length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-800 to-violet-700 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black flex items-center gap-3 mb-2">
            <Briefcase size={32} /> Internship Management
          </h1>
          <p className="text-indigo-200 font-medium max-w-xl">
            Review applications, manage portal credentials, assign tasks, and handle certificate requests.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="text-xs font-black bg-white/15 backdrop-blur-sm px-3.5 py-1.5 rounded-xl inline-flex items-center gap-2 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Database Sync: {applications.length} applications loaded
            </div>
            <button
              onClick={generateAllInternIds}
              disabled={idGenerating}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-black bg-white text-indigo-700 hover:bg-indigo-50 border border-white/30 transition-all duration-200 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              title="Assign PSTI-YYYY-NNNN IDs to all applications that don't have one yet"
            >
              {idGenerating
                ? <><RefreshCw size={13} className="animate-spin" /> Generating...</>
                : <><Zap size={13} /> Generate All Intern IDs</>}
            </button>
            {idGenResult && (
              <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${
                idGenResult.error ? 'bg-red-500/20 text-red-200' : 'bg-green-500/20 text-green-200'
              }`}>
                {idGenResult.message}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats / Filter tabs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'All', key: 'All', count: counts.all, color: 'border-slate-200 text-slate-800' },
          { label: 'Pending', key: 'Pending', count: counts.pending, color: 'border-yellow-200 text-yellow-700 bg-yellow-50' },
          { label: 'Approved', key: 'Approved', count: counts.approved, color: 'border-green-200 text-green-700 bg-green-50' },
          { label: 'Rejected', key: 'Rejected', count: counts.rejected, color: 'border-red-200 text-red-700 bg-red-50' },
          { label: 'With Creds', key: 'Credentialed', count: counts.credentialed, color: 'border-violet-200 text-violet-700 bg-violet-50' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`p-3 rounded-2xl border-2 transition-all font-bold flex flex-col items-center gap-0.5 ${tab.color} ${filter === tab.key ? 'ring-2 ring-offset-2 ring-indigo-500 shadow-md scale-[1.02]' : 'bg-white opacity-70 hover:opacity-90'}`}
          >
            <span className="text-xl">{tab.count}</span>
            <span className="text-xs">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <AnimatePresence>
          {filteredApps.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="col-span-full py-20 text-center text-slate-400 font-medium"
            >
              No {filter.toLowerCase()} applications found.
            </motion.div>
          ) : filteredApps.map(app => (
            <motion.div
              layout
              key={app.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col overflow-hidden"
            >
              {/* Status stripe */}
              <div className={`h-1.5 w-full ${(app.status || 'pending') === 'approved' ? 'bg-green-500' : (app.status || 'pending') === 'rejected' ? 'bg-red-500' : 'bg-yellow-400'}`} />

              <div className="p-5 flex-1 flex flex-col">
                {/* Identity */}
                <div className="flex gap-3 items-start mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-500 flex justify-center items-center font-black text-xl shrink-0">
                    {app.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg text-slate-800 truncate">{app.name}</h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">{app.field}</span>
                      {app.credUid && <CredBadge active={app.credActive} />}
                    </div>
                  </div>
                </div>

                {/* Quick info */}
                <div className="space-y-2 text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl flex-1">
                  <div className="flex gap-2 items-center"><Mail size={14} className="text-indigo-400 shrink-0" /><span className="truncate">{app.email}</span></div>
                  <div className="flex gap-2 items-center"><Phone size={14} className="text-green-500 shrink-0" /><span>{app.phone}</span></div>
                  <div className="flex gap-2 items-center"><MapPin size={14} className="text-pink-400 shrink-0" /><span>{app.city}, {app.state}</span></div>
                  <div className="flex gap-2 items-center text-xs text-slate-400"><Clock size={13} /><span>{formatDateSafe(app.createdAt)}</span></div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => setSelectedApp(app)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                  >
                    <User size={15} /> View Profile
                  </button>
                  <button
                    onClick={() => handleDelete(app.id)}
                    className="p-2.5 rounded-xl text-slate-400 bg-slate-50 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-colors"
                    title="Delete application"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Intern Profile Modal */}
      {selectedApp && (
        <InternProfileModal
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onRefresh={() => setRefreshKey(k => k + 1)}
        />
      )}
    </div>
  );
};

export default AdminInternships;
