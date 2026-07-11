import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Briefcase, CheckCircle, XCircle, Clock, Trash2, Mail, Phone, MapPin, User, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminInternships = () => {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'internship_applications'), (snapshot) => {
      const apps = [];
      snapshot.forEach((doc) => {
        apps.push({ id: doc.id, ...doc.data() });
      });
      // Sort newest first
      apps.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt?.toMillis?.() - a.createdAt?.toMillis?.();
      });
      setApplications(apps);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'internship_applications', id), {
        status: newStatus
      });
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to permanently delete this application?')) {
      try {
        await deleteDoc(doc(db, 'internship_applications', id));
      } catch (err) {
        console.error(err);
        alert('Failed to delete.');
      }
    }
  };

  const filteredApps = filter === 'All' 
    ? applications 
    : applications.filter(app => (app.status || 'pending') === filter.toLowerCase());

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const counts = {
    all: applications.length,
    pending: applications.filter(a => (a.status || 'pending') === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Widget */}
      <div className="bg-gradient-to-br from-indigo-800 to-indigo-600 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
        <div className="absolute top-0 right-0 p-32 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10"></div>
        <div className="relative z-10 space-y-2 text-center md:text-left mb-6 md:mb-0">
          <h1 className="text-3xl font-black flex items-center justify-center md:justify-start gap-3">
            <Briefcase size={32} />
            Internship Applications
          </h1>
          <p className="text-indigo-100 font-medium max-w-xl">
            Review and manage all incoming applications for internships.
          </p>
        </div>
      </div>

      {/* Stats/Filters Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'All', count: counts.all, color: 'bg-white text-slate-800 border-slate-200' },
          { label: 'Pending', count: counts.pending, color: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
          { label: 'Approved', count: counts.approved, color: 'bg-green-50 text-green-800 border-green-200' },
          { label: 'Rejected', count: counts.rejected, color: 'bg-red-50 text-red-800 border-red-200' }
        ].map(tab => (
          <button 
            key={tab.label}
            onClick={() => setFilter(tab.label)}
            className={`p-4 rounded-2xl border-2 transition-all font-bold flex flex-col items-center justify-center gap-1 ${filter === tab.label ? 'ring-2 ring-offset-2 ring-indigo-500 shadow-md ' + tab.color : 'bg-white border-transparent text-slate-500 hover:bg-slate-50 opacity-70'}`}
          >
            <span className="text-2xl">{tab.count}</span>
            <span className="text-sm uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredApps.length === 0 ? (
            <motion.div 
              initial={{opacity: 0}} animate={{opacity: 1}}
              className="col-span-full py-20 text-center text-slate-400 font-medium"
            >
              No {filter.toLowerCase()} applications found.
            </motion.div>
          ) : (
            filteredApps.map(app => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                key={app.id} 
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-shadow flex flex-col overflow-hidden"
              >
                {/* Header Status Bar */}
                <div className={`h-2 w-full ${(app.status || 'pending') === 'approved' ? 'bg-green-500' : (app.status || 'pending') === 'rejected' ? 'bg-red-500' : 'bg-yellow-400'}`}></div>
                
                <div className="p-6 flex-1 flex flex-col">
                  {/* Top: Identity */}
                  <div className="flex gap-4 items-start mb-4">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-500 flex justify-center items-center font-bold text-xl shrink-0">
                      {app.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-xl text-slate-800 truncate">{app.name}</h3>
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 mt-1">
                        {app.field}
                      </div>
                    </div>
                  </div>

                  {/* Body: Contact & Details */}
                  <div className="space-y-3 text-sm text-slate-600 mb-6 flex-1 drop-shadow-sm bg-slate-50 p-4 rounded-xl">
                    <div className="flex gap-2 items-start"><Mail size={16} className="shrink-0 mt-0.5 text-indigo-400" /> <span className="truncate">{app.email}</span></div>
                    <div className="flex gap-2 items-start"><Phone size={16} className="shrink-0 mt-0.5 text-indigo-400" /> <span>{app.phone}</span></div>
                    <div className="flex gap-2 items-start"><User size={16} className="shrink-0 mt-0.5 text-indigo-400" /> <span>Age: {app.age}</span></div>
                    <div className="flex gap-2 items-start"><GraduationCap size={16} className="shrink-0 mt-0.5 text-indigo-400" /> <span className="line-clamp-2">{app.education}</span></div>
                    <div className="flex gap-2 items-start"><MapPin size={16} className="shrink-0 mt-0.5 text-indigo-400" /> <span className="line-clamp-1">{app.city}, {app.state}</span></div>
                    
                    <div className="pt-3 mt-3 border-t border-slate-200">
                      <p className="font-semibold text-slate-800 mb-1 line-clamp-1 flex items-center justify-between">
                        Motivation
                        <span className="text-[10px] text-slate-400 font-normal ml-2 break-keep">{app.createdAt?.toDate().toLocaleDateString()}</span>
                      </p>
                      <p className="line-clamp-3 italic">"{app.message}"</p>
                    </div>
                  </div>

                  {/* Footer: Actions */}
                  <div className="flex items-center justify-between gap-2 mt-auto">
                    {(app.status || 'pending') === 'pending' ? (
                      <>
                        <button onClick={() => handleUpdateStatus(app.id, 'rejected')} className="flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                          <XCircle size={18} /> Reject
                        </button>
                        <button onClick={() => handleUpdateStatus(app.id, 'approved')} className="flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 font-bold text-green-600 bg-green-50 hover:bg-green-100 transition-colors">
                          <CheckCircle size={18} /> Approve
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <div className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 ${app.status === 'approved' ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
                          {app.status === 'approved' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                          {app.status === 'approved' ? 'Approved' : 'Rejected'}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleUpdateStatus(app.id, 'pending')} className="p-2 rounded-xl text-yellow-600 bg-yellow-50 hover:bg-yellow-100 transition-colors tooltip tooltip-top" data-tip="Move to Pending">
                            <Clock size={20} />
                          </button>
                          <button onClick={() => handleDelete(app.id)} className="p-2 rounded-xl text-slate-400 bg-slate-50 hover:text-red-600 hover:bg-red-50 transition-colors">
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminInternships;
