import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Users, CheckCircle, XCircle, Search, Trash2, Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminMemberships = () => {
  const [memberships, setMemberships] = useState([]);
  const [filter, setFilter] = useState('All'); // All | Completed | Pending
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'memberships'), (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      // Sort newest first
      list.sort((a, b) => {
        const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return bDate - aDate;
      });
      setMemberships(list);
      setLoading(false);
    }, (error) => {
      console.error("Error reading memberships collection:", error);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleUpdateStatus = async (id, newStatus, currentMember) => {
    try {
      const updateData = { status: newStatus };
      if (newStatus === 'completed' && !currentMember.validFrom) {
        const validFrom = new Date();
        const validTo = new Date();
        validTo.setFullYear(validFrom.getFullYear() + 1);
        updateData.validFrom = validFrom;
        updateData.validTo = validTo;
      }
      await updateDoc(doc(db, 'memberships', id), updateData);
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this membership record?')) {
      try {
        await deleteDoc(doc(db, 'memberships', id));
      } catch (err) {
        console.error(err);
        alert('Failed to delete.');
      }
    }
  };

  const filteredMemberships = memberships.filter(member => {
    // Status Filter
    const matchesStatus = filter === 'All' 
      ? true 
      : filter === 'Completed' 
        ? member.status === 'completed'
        : member.status !== 'completed';

    // Search Filter
    const fullName = `${member.firstName || ''} ${member.middleName || ''} ${member.lastName || ''}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      (member.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.phone || '').includes(searchTerm) ||
      (member.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.state || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.paymentId || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const counts = {
    all: memberships.length,
    completed: memberships.filter(m => m.status === 'completed').length,
    pending: memberships.filter(m => m.status !== 'completed').length,
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    if (dateValue.toDate) {
      return dateValue.toDate().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    return new Date(dateValue).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getValidityString = (member) => {
    let fromVal = member.validFrom || member.createdAt;
    if (!fromVal) return 'N/A';
    
    let toVal = member.validTo;
    if (!toVal) {
      const fromDate = fromVal.toDate ? fromVal.toDate() : new Date(fromVal);
      const toDate = new Date(fromDate);
      toDate.setFullYear(fromDate.getFullYear() + 1);
      toVal = toDate;
    }
    
    return `${formatDate(fromVal)} - ${formatDate(toVal)}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Widget */}
      <div className="bg-gradient-to-br from-[#ff7300] to-orange-500 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
        <div className="absolute top-0 right-0 p-32 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10"></div>
        <div className="relative z-10 space-y-2 text-center md:text-left mb-6 md:mb-0">
          <h1 className="text-3xl font-black flex items-center justify-center md:justify-start gap-3">
            <Users size={32} />
            Membership Registration Database
          </h1>
          <p className="text-orange-50 font-medium max-w-xl">
            View and manage all registered members, check payment status (Razorpay or manual), and search through applications.
          </p>
        </div>
      </div>

      {/* Stats/Filters Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="grid grid-cols-3 gap-4 w-full md:w-auto flex-1">
          {[
            { label: 'All', count: counts.all, color: 'bg-white text-slate-800 border-slate-200' },
            { label: 'Completed', count: counts.completed, color: 'bg-green-50 text-green-800 border-green-200' },
            { label: 'Pending', count: counts.pending, color: 'bg-yellow-50 text-yellow-800 border-yellow-200' }
          ].map(tab => (
            <button 
              key={tab.label}
              onClick={() => setFilter(tab.label)}
              className={`p-4 rounded-2xl border-2 transition-all font-bold flex flex-col items-center justify-center gap-1 ${filter === tab.label ? 'ring-2 ring-offset-2 ring-orange-500 shadow-md ' + tab.color : 'bg-white border-transparent text-slate-500 hover:bg-slate-50 opacity-70'}`}
            >
              <span className="text-2xl">{tab.count}</span>
              <span className="text-sm uppercase tracking-wider">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, phone, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium placeholder:text-slate-400 bg-white"
          />
        </div>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredMemberships.length === 0 ? (
            <motion.div 
              initial={{opacity: 0}} animate={{opacity: 1}}
              className="col-span-full py-20 text-center text-slate-400 font-medium"
            >
              No {filter.toLowerCase()} memberships found.
            </motion.div>
          ) : (
            filteredMemberships.map(member => {
              const fullName = `${member.firstName || ''} ${member.middleName ? member.middleName + ' ' : ''}${member.lastName || ''}`;
              const initials = `${(member.firstName || 'U')[0]}${(member.lastName || '')[0] || ''}`.toUpperCase();
              const isPaid = member.status === 'completed';

              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={member.id} 
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-shadow flex flex-col overflow-hidden"
                >
                  {/* Header Status Bar */}
                  <div className={`h-2 w-full ${isPaid ? 'bg-green-500' : 'bg-yellow-400'}`}></div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Top: Identity */}
                    <div className="flex gap-4 items-start mb-4">
                      {member.profilePhotoUrl || member.image ? (
                        <img src={member.profilePhotoUrl || member.image} alt="Applicant" className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 shrink-0 shadow" />
                      ) : (
                        <div className={`w-16 h-16 rounded-full text-white flex justify-center items-center font-bold text-xl shrink-0 ${member.gender === 'Female' ? 'bg-pink-500' : 'bg-indigo-500'}`}>
                          {initials}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-bold text-lg text-slate-800 leading-snug truncate" title={fullName}>{fullName}</h3>
                        <p className="text-xs text-slate-400 font-semibold mt-1">Age: {member.age} • {member.gender}</p>
                      </div>
                    </div>

                    {/* Body: Details */}
                    <div className="space-y-2.5 text-sm text-slate-600 mb-6 flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex gap-2 items-center min-w-0"><Mail size={15} className="shrink-0 text-slate-400" /> <a href={`mailto:${member.email}`} className="truncate hover:text-indigo-600 hover:underline">{member.email}</a></div>
                      <div className="flex gap-2 items-center"><Phone size={15} className="shrink-0 text-slate-400" /> <a href={`tel:${member.phone}`} className="hover:text-indigo-600 hover:underline">{member.phone}</a></div>
                      <div className="flex gap-2 items-center"><MapPin size={15} className="shrink-0 text-slate-400" /> <span className="truncate">{member.city}, {member.state}</span></div>
                      <div className="flex gap-2 items-center"><ShieldCheck size={15} className="shrink-0 text-slate-400" /> <span>Aadhaar: <span className="font-mono">{member.aadhaar}</span></span></div>
                      
                      <div className="pt-2.5 mt-2.5 border-t border-slate-200 text-xs flex flex-col gap-1 text-slate-500">
                        <div className="flex justify-between">
                          <span>Applied On:</span>
                          <span className="font-semibold text-slate-700">{formatDate(member.createdAt)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Payment ID:</span>
                          <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700 select-all truncate max-w-[150px]">{member.paymentId || 'N/A'}</span>
                        </div>
                        {isPaid && (
                          <div className="flex justify-between">
                            <span>Validity:</span>
                            <span className="font-semibold text-slate-700">{getValidityString(member)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between gap-2 mt-auto">
                      <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${isPaid ? 'text-green-700 bg-green-50 border-green-100' : 'text-yellow-700 bg-yellow-50 border-yellow-100'}`}>
                        {isPaid ? <CheckCircle size={15} /> : <XCircle size={15} />}
                        {isPaid ? 'Paid' : 'Pending'}
                      </div>
                      <div className="flex gap-2">
                        {isPaid ? (
                          <button 
                            onClick={() => handleUpdateStatus(member.id, 'pending', member)} 
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-yellow-600 bg-yellow-50 hover:bg-yellow-100 transition-colors border border-yellow-100"
                            title="Mark as Pending"
                          >
                            Mark Pending
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleUpdateStatus(member.id, 'completed', member)} 
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 transition-colors border border-green-100"
                            title="Mark as Completed"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(member.id)} 
                          className="p-2 rounded-xl text-slate-400 bg-slate-50 hover:text-red-600 hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
                          title="Delete Record"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminMemberships;
