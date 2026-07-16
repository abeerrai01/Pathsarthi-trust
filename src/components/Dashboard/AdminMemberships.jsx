import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Users, CheckCircle, XCircle, Search, Trash2, Mail, Phone, MapPin, ShieldCheck, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AdminMemberships = () => {
  const [memberships, setMemberships] = useState([]);
  const [filter, setFilter] = useState('All'); // All | Completed | Pending
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);

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
        if (!currentMember.amount) {
          updateData.amount = 201;
        }
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

  const isPaidMember = (member) => {
    if (!member || !member.status) return false;
    const s = member.status.trim().toLowerCase();
    return s === 'completed' || s === 'paid';
  };

  const filteredMemberships = memberships.filter(member => {
    // Status Filter
    const matchesStatus = filter === 'All' 
      ? true 
      : filter === 'Completed' 
        ? isPaidMember(member)
        : !isPaidMember(member);

    // Search Filter
    const fullName = (member.fullName || `${member.firstName || ''} ${member.middleName || ''} ${member.lastName || ''}`).toLowerCase();
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
    completed: memberships.filter(m => isPaidMember(m)).length,
    pending: memberships.filter(m => !isPaidMember(m)).length,
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

  // --- Export Functions --- //

  const getExportData = () => {
    return filteredMemberships.map(e => ({
      'Name': e.fullName || `${e.firstName || ''} ${e.middleName || ''} ${e.lastName || ''}`.trim() || 'N/A',
      'Email': e.email || 'N/A',
      'Phone': e.phone || 'N/A',
      'Age/DOB': e.age || e.dob || 'N/A',
      'Gender': e.gender || 'N/A',
      'Aadhaar': e.aadhaar || 'N/A',
      'Location': `${e.city || 'N/A'}, ${e.state || 'N/A'} - ${e.pincode || ''}`,
      'Reference': e.reference || 'N/A',
      'Amount': e.amount ? `₹${e.amount}` : 'N/A',
      'Status': isPaidMember(e) ? 'Paid' : 'Pending',
      'Payment ID': e.paymentId || 'N/A',
      'Applied On': formatDate(e.createdAt),
      'Validity': isPaidMember(e) ? getValidityString(e) : 'N/A'
    }));
  };

  const exportToCSV = () => {
    const data = getExportData();
    if (data.length === 0) return alert('No data to export.');
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(',')); // Add headers
    
    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header] ? String(row[header]).replace(/"/g, '""') : '';
        return `"${val}"`;
      });
      csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'memberships_database.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const exportToDOC = () => {
    const data = getExportData();
    if (data.length === 0) return alert('No data to export.');

    const headers = Object.keys(data[0]);
    let html = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>";
    html += "<head><meta charset='utf-8'><title>Memberships Database</title>";
    html += "<style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 5px; text-align: left; } th { background-color: #f2f2f2; }</style>";
    html += "</head><body>";
    html += "<h2>Memberships Database</h2>";
    html += "<table><thead><tr>";
    headers.forEach(h => html += `<th>${h}</th>`);
    html += "</tr></thead><tbody>";

    data.forEach(row => {
      html += "<tr>";
      headers.forEach(h => html += `<td>${row[h] || ''}</td>`);
      html += "</tr>";
    });

    html += "</tbody></table></body></html>";

    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'memberships_database.doc');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const exportToPDF = () => {
    const data = getExportData();
    if (data.length === 0) return alert('No data to export.');

    const doc = new jsPDF('landscape');
    doc.text("Memberships Database", 14, 15);
    
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => row[h]));

    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [255, 115, 0] }, // Orange theme
    });

    doc.save('memberships_database.pdf');
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

      {/* Export Bar */}
      <div className="flex flex-wrap gap-3 justify-end items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest mr-auto">Export Data</span>
        <button onClick={exportToCSV} className="flex items-center gap-2 bg-green-50 text-green-700 hover:bg-green-100 px-4 py-2 rounded-xl font-semibold transition-colors text-sm border border-green-200 shadow-sm">
          <FileSpreadsheet size={16} /> Excel (CSV)
        </button>
        <button onClick={exportToDOC} className="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-xl font-semibold transition-colors text-sm border border-blue-200 shadow-sm">
          <FileText size={16} /> Word (DOC)
        </button>
        <button onClick={exportToPDF} className="flex items-center gap-2 bg-red-50 text-red-700 hover:bg-red-100 px-4 py-2 rounded-xl font-semibold transition-colors text-sm border border-red-200 shadow-sm">
          <Download size={16} /> PDF
        </button>
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
              const fullName = member.fullName || `${member.firstName || ''} ${member.middleName ? member.middleName + ' ' : ''}${member.lastName || ''}`;
              const initials = member.fullName 
                ? member.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                : `${(member.firstName || 'U')[0]}${(member.lastName || '')[0] || ''}`.toUpperCase();
              const isPaid = isPaidMember(member);

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
                      {member.aadhaar && (
                        <div className="flex gap-2 items-center">
                          <ShieldCheck size={15} className="shrink-0 text-slate-400" />
                          <span>Aadhaar: <span className="font-mono">{member.aadhaar}</span></span>
                        </div>
                      )}
                      
                      <div className="pt-2.5 mt-2.5 border-t border-slate-200 text-xs flex flex-col gap-1 text-slate-500">
                        <div className="flex justify-between">
                          <span>Amount Paid:</span>
                          <span className="font-bold text-slate-800">₹{member.amount || 'N/A'}</span>
                        </div>
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
                        {!isPaid && (
                          <button
                            onClick={() => handleUpdateStatus(member.id, 'completed', member)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-green-700 bg-green-50 border border-green-100 hover:bg-green-100 transition-colors flex items-center gap-1"
                            title="Mark as Paid"
                          >
                            Mark Paid
                          </button>
                        )}
                        {member.paymentScreenshotUrl && (
                          <button
                            onClick={() => setSelectedScreenshot(member.paymentScreenshotUrl)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-colors flex items-center gap-1"
                            title="View Payment Screenshot"
                          >
                            View Screenshot
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

      {/* Screenshot Preview Modal */}
      {selectedScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full flex flex-col border border-slate-100 animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-orange-50 to-indigo-50">
              <h3 className="text-lg font-black text-slate-800">Payment Screenshot</h3>
              <button
                onClick={() => setSelectedScreenshot(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-white transition-colors shadow-sm border border-slate-100"
              >
                <XCircle size={20} />
              </button>
            </div>
            {/* Modal Body */}
            <div className="p-6 flex items-center justify-center bg-slate-50 max-h-[70vh] overflow-y-auto">
              <img 
                src={selectedScreenshot} 
                alt="Payment Screenshot" 
                className="max-w-full h-auto rounded-2xl shadow-md border border-slate-200 object-contain"
              />
            </div>
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end bg-white">
              <button
                onClick={() => setSelectedScreenshot(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-sm transition-colors shadow animate-in fade-in duration-200"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMemberships;
