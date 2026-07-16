import React from 'react';
import { useInternAuth } from '../../contexts/InternAuthContext';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, GraduationCap, Briefcase,
  Calendar, CheckCircle, Clock, Hash, MessageSquare
} from 'lucide-react';

const InfoRow = ({ icon: Icon, label, value, color = 'text-blue-500' }) => (
  <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
    <div className={`mt-0.5 shrink-0 ${color}`}>
      <Icon size={18} />
    </div>
    <div className="min-w-0">
      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
      <p className="text-slate-900 font-semibold text-sm leading-relaxed">{value || '—'}</p>
    </div>
  </div>
);

const InternProfile = () => {
  const { internProfile, internUser } = useInternAuth();

  if (!internProfile) return null;

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
  };
  const statusIcons = {
    pending: <Clock size={14} />,
    approved: <CheckCircle size={14} />,
    rejected: <CheckCircle size={14} />,
  };

  const status = internProfile.status || 'pending';
  const createdDate = internProfile.createdAt?.toDate
    ? internProfile.createdAt.toDate().toLocaleDateString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric'
      })
    : '—';

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
  };

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 sm:p-8 relative overflow-hidden bg-white border border-slate-200 shadow-sm"
      >
        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-black text-white shrink-0 bg-blue-600 shadow-md">
            {internProfile.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="text-center sm:text-left mt-2 sm:mt-0">
            <h2 className="text-2xl font-black text-slate-900">{internProfile.name}</h2>
            <p className="text-blue-600 font-bold mt-1">{internProfile.field}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border capitalize ${statusColors[status] || statusColors.pending}`}>
                {statusIcons[status]} {status}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                <Calendar size={12} /> Applied: {createdDate}
              </span>
              {internProfile.internId && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-600 text-white border border-indigo-700 shadow-sm shadow-indigo-200 tracking-wider">
                  <Hash size={11} /> {internProfile.internId}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Personal Details */}
      <motion.div
        custom={0} variants={cardVariants} initial="hidden" animate="visible"
        className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm"
      >
        <h3 className="text-slate-900 font-bold text-lg mb-5 flex items-center gap-2">
          <User size={20} className="text-blue-500" /> Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow icon={Mail} label="Email" value={internProfile.email} color="text-slate-600" />
          <InfoRow icon={Phone} label="Phone" value={internProfile.phone} color="text-slate-600" />
          <InfoRow icon={User} label="Age" value={internProfile.age} color="text-slate-600" />
          <InfoRow icon={GraduationCap} label="Education" value={internProfile.education} color="text-slate-600" />
          <InfoRow icon={MapPin} label="City" value={internProfile.city} color="text-slate-600" />
          <InfoRow icon={MapPin} label="State" value={internProfile.state} color="text-slate-600" />
        </div>
      </motion.div>

      {/* Department & Motivation */}
      <motion.div
        custom={1} variants={cardVariants} initial="hidden" animate="visible"
        className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm"
      >
        <h3 className="text-slate-900 font-bold text-lg mb-5 flex items-center gap-2">
          <Briefcase size={20} className="text-blue-500" /> Internship Details
        </h3>
        <div className="space-y-4">
          <InfoRow icon={Briefcase} label="Department / Field" value={internProfile.field} color="text-blue-600" />
          {internProfile.message && (
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MessageSquare size={14} /> Motivation Statement
              </p>
              <p className="text-slate-700 text-sm leading-relaxed italic font-medium">"{internProfile.message}"</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Portal Account Info */}
      <motion.div
        custom={2} variants={cardVariants} initial="hidden" animate="visible"
        className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm"
      >
        <h3 className="text-slate-900 font-bold text-lg mb-5 flex items-center gap-2">
          <Hash size={20} className="text-blue-500" /> Portal Account
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow icon={Mail} label="Login Email" value={internUser?.email} color="text-slate-600" />
          <InfoRow
            icon={CheckCircle}
            label="Access Status"
            value={internProfile.credActive ? 'Active' : 'Revoked'}
            color={internProfile.credActive ? 'text-green-600' : 'text-red-600'}
          />
          {internProfile.internId && (
            <InfoRow icon={Hash} label="Intern ID" value={internProfile.internId} color="text-indigo-600" />
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default InternProfile;
