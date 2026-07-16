import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  collection, query, where, getDocs, doc, updateDoc, onSnapshot
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useInternAuth } from '../../contexts/InternAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Clock, ExternalLink, Users, CreditCard,
  Upload, X, Trophy, ChevronRight, Youtube,
  Instagram, Linkedin, Star, Loader2, RefreshCw, Play, FileImage,
  AlertCircle, Info, Image as ImageIcon
} from 'lucide-react';

// ─── Cloudinary Config ────────────────────────────────────────────────────────
const CLOUD_NAME = 'dgmhz64fs';
const UPLOAD_PRESET = 'admin-uploads';

// ─── Image Compression (90% = quality 0.10) ───────────────────────────────────
async function compressImage(file, quality = 0.10) {
  if (!file.type.startsWith('image/')) return file; // skip videos
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 1200;
      let { width, height } = img;
      if (width > MAX) { height = Math.round(height * MAX / width); width = MAX; }
      if (height > MAX) { width = Math.round(width * MAX / height); height = MAX; }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

// ─── Upload to Cloudinary ─────────────────────────────────────────────────────
async function uploadToCloudinary(file, folder) {
  const processed = await compressImage(file);
  const isVideo = file.type.startsWith('video/');
  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${isVideo ? 'video' : 'image'}/upload`;
  const fd = new FormData();
  fd.append('file', processed);
  fd.append('upload_preset', UPLOAD_PRESET);
  fd.append('folder', folder);
  const res = await fetch(endpoint, { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Upload failed');
  const data = await res.json();
  return { url: data.secure_url, publicId: data.public_id, type: isVideo ? 'video' : 'image', name: file.name };
}

// ─── Badge Component ──────────────────────────────────────────────────────────
const StatusBadge = ({ completed, inProgress }) => {
  if (completed) return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold bg-green-100 text-green-700 border border-green-200">
      <CheckCircle2 size={12} /> Done
    </span>
  );
  if (inProgress) return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold bg-blue-100 text-blue-700 border border-blue-200">
      <Clock size={12} /> In Progress
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold bg-slate-100 text-slate-500 border border-slate-200">
      <Clock size={12} /> Pending
    </span>
  );
};

// ─── Task Card Wrapper ────────────────────────────────────────────────────────
const TaskCard = ({ number, title, description, completed, inProgress, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: number * 0.08 }}
    className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
      completed ? 'border-green-200' : 'border-slate-200'
    }`}
  >
    <div className={`h-1.5 w-full ${completed ? 'bg-green-500' : inProgress ? 'bg-blue-500' : 'bg-slate-200'}`} />
    <div className="p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black shrink-0 ${
            completed ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
          }`}>
            {completed ? <CheckCircle2 size={22} /> : number}
          </div>
          <div>
            <h3 className="text-slate-900 font-bold text-base">{title}</h3>
            <p className="text-slate-500 text-sm mt-0.5">{description}</p>
          </div>
        </div>
        <StatusBadge completed={completed} inProgress={inProgress} />
      </div>
      {children}
    </div>
  </motion.div>
);

// ─── TASK 1: Premium Membership ───────────────────────────────────────────────
const Task1Card = ({ internProfile, appDocId, internTasks, onTaskUpdate }) => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState('');
  const t1 = internTasks?.task1 || {};
  const completed = t1.completed === true;

  const checkMembership = useCallback(async () => {
    if (!internProfile?.email && !internProfile?.name && !internProfile?.internId) return;
    setChecking(true);
    setStatus('');
    try {
      const email = internProfile.email || '';
      const name = internProfile.name || '';
      const internId = internProfile.internId || null;
      let found = null;

      if (internId) {
        // Fast path: query directly by internId
        const q = query(collection(db, 'memberships'), where('internId', '==', internId));
        const snap = await getDocs(q);
        snap.forEach(d => {
          const s = (d.data().status || '').trim().toLowerCase();
          if (s === 'completed' || s === 'paid') found = d.id;
        });
      }

      if (!found) {
        // Fallback: scan all memberships by email or name (for pre-internId records)
        const snap = await getDocs(collection(db, 'memberships'));
        snap.forEach(d => {
          const data = d.data();
          const s = (data.status || '').trim().toLowerCase();
          if (s !== 'completed' && s !== 'paid') return;
          const memberEmail = (data.email || '').trim().toLowerCase();
          const memberName = (data.fullName || `${data.firstName || ''} ${data.lastName || ''}`).trim();
          if ((email && memberEmail === email.trim().toLowerCase()) ||
              (name && memberName.toLowerCase() === name.toLowerCase())) {
            found = d.id;
          }
        });
      }

      if (found) {
        const updated = {
          ...internTasks,
          task1: { completed: true, membershipId: found, completedAt: new Date().toISOString() }
        };
        await updateDoc(doc(db, 'internship_applications', appDocId), { internTasks: updated });
        onTaskUpdate(updated);
        setStatus('success');
      } else {
        setStatus('not-found');
      }
    } catch (err) {
      console.error('[Task1] Check failed:', err);
      setStatus('error');
    } finally {
      setChecking(false);
    }
  }, [internProfile, appDocId, internTasks, onTaskUpdate]);

  return (
    <TaskCard
      number={1}
      title="Take a Premium Membership"
      description="Get a PathSarthi Trust Premium Membership to show your commitment to the mission."
      completed={completed}
      inProgress={false}
    >
      {completed ? (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-semibold">
          <CheckCircle2 size={18} /> Premium Membership verified successfully!
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3 text-sm text-blue-700">
            <Info size={16} className="shrink-0 mt-0.5" />
            <p>Click below to take a Premium Membership. After payment, return here and click <strong>"Verify Payment"</strong> to complete this task.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/premium-membership')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
            >
              <ExternalLink size={16} /> Go to Membership Page
            </button>
            <button
              onClick={checkMembership}
              disabled={checking}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors disabled:opacity-60"
            >
              {checking ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Verify Payment
            </button>
          </div>
          {status === 'not-found' && (
            <p className="text-sm text-red-600 font-medium flex items-center gap-1.5">
              <AlertCircle size={15} /> No completed membership found for your email. Please complete the payment first.
            </p>
          )}
          {status === 'error' && (
            <p className="text-sm text-red-600 font-medium flex items-center gap-1.5">
              <AlertCircle size={15} /> Verification failed. Please try again.
            </p>
          )}
        </div>
      )}
    </TaskCard>
  );
};

// ─── TASK 2: Add 10 Members via Jan Sampark ───────────────────────────────────
const Task2Card = ({ internProfile }) => {
  const navigate = useNavigate();
  const [count, setCount] = useState(null);
  const TARGET = 10;

  useEffect(() => {
    if (!internProfile?.name) return;
    const q = query(collection(db, 'jan_sampark'));
    const unsub = onSnapshot(q, (snap) => {
      let c = 0;
      snap.forEach(d => {
        const data = d.data();
        const s = (data.status || '').trim().toLowerCase();
        const ref = (data.reference || '').trim().toLowerCase();
        if ((s === 'completed' || s === 'paid') && ref === internProfile.name.trim().toLowerCase()) c++;
      });
      setCount(c);
    });
    return () => unsub();
  }, [internProfile?.name]);

  const completed = count !== null && count >= TARGET;
  const progress = count !== null ? Math.min(count, TARGET) : 0;

  return (
    <TaskCard
      number={2}
      title="Add 10 Members via Jan Sampark"
      description="Bring 10 people to join PathSarthi through the Jan Sampark program (your name must be selected as the reference)."
      completed={completed}
      inProgress={count !== null && count > 0 && !completed}
    >
      <div className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600 text-sm font-bold">
              {count === null ? 'Loading...' : `${count} / ${TARGET} members joined`}
            </span>
            <span className={`text-sm font-black ${completed ? 'text-green-600' : 'text-slate-400'}`}>
              {count !== null ? Math.round((progress / TARGET) * 100) : 0}%
            </span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(progress / TARGET) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${completed ? 'bg-green-500' : 'bg-blue-500'}`}
            />
          </div>
          <div className="flex justify-between mt-1">
            {Array.from({ length: TARGET }, (_, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                  i < progress
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-slate-200 text-slate-300'
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {completed ? (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-semibold">
            <CheckCircle2 size={16} /> You have added {count} members. Task complete!
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-sm flex items-start gap-2">
              <Info size={15} className="shrink-0 mt-0.5" />
              <span>When new people register via Jan Sampark, they must select <strong>"{internProfile?.name}"</strong> as the reference. Their count appears here automatically once payment is confirmed.</span>
            </div>
            <button
              onClick={() => navigate('/jan-sampark')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
            >
              <ExternalLink size={16} /> Open Jan Sampark Page
            </button>
          </div>
        )}
      </div>
    </TaskCard>
  );
};

// ─── TASK 3: Upload Field Work Media ─────────────────────────────────────────
const Task3Card = ({ internProfile, appDocId, internTasks, onTaskUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const fileInputRef = useRef();
  const t3 = internTasks?.task3 || {};
  const files = t3.files || [];
  const MIN = 5;
  const MAX = 7;
  const completed = t3.completed === true;

  const handleFileChange = async (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    const totalAfter = files.length + selected.length;
    if (files.length >= MAX) {
      alert(`Maximum ${MAX} files allowed.`);
      return;
    }
    const allowed = selected.slice(0, MAX - files.length);
    setUploading(true);
    const folder = `interns/${(internProfile?.name || 'unknown').replace(/\s+/g, '_')}`;
    try {
      const uploaded = [];
      for (let i = 0; i < allowed.length; i++) {
        const f = allowed[i];
        setUploadProgress(`Uploading ${i + 1}/${allowed.length}: ${f.name}`);
        const result = await uploadToCloudinary(f, folder);
        uploaded.push({ ...result, uploadedAt: new Date().toISOString() });
      }
      const newFiles = [...files, ...uploaded];
      const isComplete = newFiles.length >= MIN;
      const updated = {
        ...internTasks,
        task3: { files: newFiles, completed: isComplete }
      };
      await updateDoc(doc(db, 'internship_applications', appDocId), { internTasks: updated });
      onTaskUpdate(updated);
    } catch (err) {
      console.error('[Task3] Upload failed:', err);
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      setUploadProgress('');
      e.target.value = '';
    }
  };

  const handleRemove = async (idx) => {
    if (!window.confirm('Remove this file?')) return;
    const newFiles = files.filter((_, i) => i !== idx);
    const isComplete = newFiles.length >= MIN;
    const updated = {
      ...internTasks,
      task3: { files: newFiles, completed: isComplete }
    };
    await updateDoc(doc(db, 'internship_applications', appDocId), { internTasks: updated });
    onTaskUpdate(updated);
  };

  return (
    <TaskCard
      number={3}
      title="Upload 5–7 Field Work Images/Videos"
      description="Share 5 to 7 images or videos from your internship field work. They will be stored under your profile."
      completed={completed}
      inProgress={files.length > 0 && !completed}
    >
      <div className="space-y-4">
        {/* Counter */}
        <div className="flex items-center justify-between">
          <span className="text-slate-600 text-sm font-bold">{files.length} / {MAX} uploaded (min {MIN} required)</span>
          {files.length >= MIN && <span className="text-green-600 text-xs font-bold">Minimum reached!</span>}
        </div>

        {/* Uploaded Media Grid */}
        {files.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {files.map((f, idx) => (
              <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square bg-slate-100 border border-slate-200">
                {f.type === 'video' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-1">
                    <Play size={24} />
                    <span className="text-[10px] font-medium text-center px-1 truncate w-full text-center">{f.name}</span>
                  </div>
                ) : (
                  <img src={f.url} alt={f.name} className="w-full h-full object-cover" />
                )}
                {!completed && (
                  <button
                    onClick={() => handleRemove(idx)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upload area */}
        {!completed && files.length < MAX && (
          <div>
            {uploading ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold">
                <Loader2 size={18} className="animate-spin shrink-0" />
                <span>{uploadProgress || 'Compressing & uploading...'}</span>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                >
                  <Upload size={24} />
                  <span className="font-semibold text-sm">Click to upload images or videos</span>
                  <span className="text-xs text-slate-400">Images are compressed by 90% automatically. Up to {MAX - files.length} more files.</span>
                </button>
              </>
            )}
          </div>
        )}

        {completed && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-semibold">
            <CheckCircle2 size={16} /> {files.length} files uploaded. Task complete!
          </div>
        )}
      </div>
    </TaskCard>
  );
};

// ─── TASK 4: Social Media ─────────────────────────────────────────────────────
const SOCIAL_PLATFORMS = [
  {
    key: 'youtube',
    label: 'Subscribe on YouTube',
    icon: <Youtube size={20} className="text-red-500" />,
    url: 'https://youtube.com/@PathSarthiTrust',
    instruction: 'Subscribe to the PathSarthi Trust YouTube channel, then upload a screenshot.',
    color: 'red',
  },
  {
    key: 'instagram',
    label: 'Follow on Instagram',
    icon: <Instagram size={20} className="text-pink-500" />,
    url: 'https://instagram.com/pathsarthi_trust',
    instruction: 'Follow PathSarthi Trust on Instagram, then upload a screenshot.',
    color: 'pink',
  },
  {
    key: 'linkedin',
    label: 'Follow on LinkedIn',
    icon: <Linkedin size={20} className="text-blue-600" />,
    url: 'https://linkedin.com/company/pathsarthi-trust',
    instruction: 'Follow PathSarthi Trust on LinkedIn, then upload a screenshot.',
    color: 'blue',
  },
];

const SocialItem = ({ platform, data, onUpload, uploading }) => {
  const fileInputRef = useRef();
  const done = data?.done === true;
  const screenshotUrl = data?.screenshotUrl || '';

  return (
    <div className={`rounded-xl p-4 border ${done ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {platform.icon}
          <span className="font-bold text-slate-800 text-sm">{platform.label}</span>
        </div>
        {done
          ? <span className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle2 size={13} /> Done</span>
          : <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Clock size={13} /> Pending</span>
        }
      </div>

      {done && screenshotUrl ? (
        <img src={screenshotUrl} alt={`${platform.label} screenshot`} className="w-full max-h-48 object-contain rounded-lg border border-green-200 bg-white" />
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">{platform.instruction}</p>
          <div className="flex flex-wrap gap-2">
            <a href={platform.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-700 hover:bg-slate-800 transition-colors">
              <ExternalLink size={12} /> Open Platform
            </a>
            {uploading === platform.key ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200">
                <Loader2 size={12} className="animate-spin" /> Uploading...
              </span>
            ) : (
              <>
                <input type="file" ref={fileInputRef} accept="image/*" className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) onUpload(platform.key, e.target.files[0]); e.target.value = ''; }} />
                <button onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors">
                  <Upload size={12} /> Upload Screenshot
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Task4Card = ({ internProfile, appDocId, internTasks, onTaskUpdate }) => {
  const [uploading, setUploading] = useState('');
  const t4 = internTasks?.task4 || {};
  const completed = t4.completed === true;
  const doneCount = SOCIAL_PLATFORMS.filter(p => t4[p.key]?.done).length;

  const handleUpload = async (platformKey, file) => {
    setUploading(platformKey);
    const folder = `interns/${(internProfile?.name || 'unknown').replace(/\s+/g, '_')}/social`;
    try {
      const result = await uploadToCloudinary(file, folder);
      const platformUpdate = { done: true, screenshotUrl: result.url, uploadedAt: new Date().toISOString() };
      const newT4 = { ...t4, [platformKey]: platformUpdate };
      const allDone = SOCIAL_PLATFORMS.every(p => newT4[p.key]?.done);
      newT4.completed = allDone;
      const updated = { ...internTasks, task4: newT4 };
      await updateDoc(doc(db, 'internship_applications', appDocId), { internTasks: updated });
      onTaskUpdate(updated);
    } catch (err) {
      console.error('[Task4] Upload failed:', err);
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading('');
    }
  };

  return (
    <TaskCard
      number={4}
      title="Subscribe & Follow on Social Media"
      description="Subscribe to YouTube, follow on Instagram and LinkedIn, and upload a screenshot for each."
      completed={completed}
      inProgress={doneCount > 0 && !completed}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold text-slate-600">{doneCount}/3 platforms done</span>
          <div className="flex gap-1">
            {SOCIAL_PLATFORMS.map((p, i) => (
              <div key={p.key} className={`w-4 h-4 rounded-full ${t4[p.key]?.done ? 'bg-green-500' : 'bg-slate-200'}`} />
            ))}
          </div>
        </div>
        {SOCIAL_PLATFORMS.map(platform => (
          <SocialItem
            key={platform.key}
            platform={platform}
            data={t4[platform.key]}
            onUpload={handleUpload}
            uploading={uploading}
          />
        ))}
        {completed && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-semibold mt-2">
            <CheckCircle2 size={16} /> All social media tasks completed!
          </div>
        )}
      </div>
    </TaskCard>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const InternTasks = () => {
  const { internUser, internProfile } = useInternAuth();
  const [internTasks, setInternTasks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [janCount, setJanCount] = useState(null);

  const appDocId = internProfile?.id;

  // Load internTasks from profile
  useEffect(() => {
    if (!internProfile) return;
    setInternTasks(internProfile.internTasks || {});
    setLoading(false);
  }, [internProfile]);

  const handleTaskUpdate = useCallback((updated) => {
    setInternTasks(updated);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 text-sm font-medium">Loading tasks...</p>
      </div>
    );
  }

  const t1Done = internTasks?.task1?.completed === true;
  const t3Done = internTasks?.task3?.completed === true;
  const t4Done = internTasks?.task4?.completed === true;
  // Task 2 completion is computed from jan_sampark, not stored — done when count >= 10

  const completedCount = [t1Done, t3Done, t4Done].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
            <Trophy size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">My Tasks</h2>
            <p className="text-slate-500 text-sm font-medium">Complete all 4 milestones to be eligible for your certificate.</p>
          </div>
        </div>

        {/* Overall progress */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600 text-sm font-bold">Overall Progress</span>
            <span className="text-blue-600 text-sm font-black">{completedCount}/4 Tasks</span>
          </div>
          <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / 4) * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-blue-600 rounded-full"
            />
          </div>
          <div className="grid grid-cols-4 gap-2 mt-3">
            {[
              { label: 'Membership', done: t1Done },
              { label: 'Jan Sampark', done: false }, // computed in Task2Card
              { label: 'Field Media', done: t3Done },
              { label: 'Social Media', done: t4Done },
            ].map((item, i) => (
              <div key={i} className={`flex flex-col items-center p-2 rounded-lg text-center ${item.done ? 'bg-green-50' : 'bg-white border border-slate-200'}`}>
                {item.done
                  ? <CheckCircle2 size={16} className="text-green-600 mb-1" />
                  : <Star size={16} className="text-slate-300 mb-1" />
                }
                <span className={`text-[10px] font-bold uppercase tracking-wide ${item.done ? 'text-green-700' : 'text-slate-400'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tasks */}
      <Task1Card
        internProfile={internProfile}
        appDocId={appDocId}
        internTasks={internTasks}
        onTaskUpdate={handleTaskUpdate}
      />
      <Task2Card internProfile={internProfile} />
      <Task3Card
        internProfile={internProfile}
        appDocId={appDocId}
        internTasks={internTasks}
        onTaskUpdate={handleTaskUpdate}
      />
      <Task4Card
        internProfile={internProfile}
        appDocId={appDocId}
        internTasks={internTasks}
        onTaskUpdate={handleTaskUpdate}
      />
    </div>
  );
};

export default InternTasks;
