import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Users, Search, Trash2, Phone, MapPin, Download, FileText, FileSpreadsheet, CheckCircle, XCircle, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AdminJanSampark = () => {
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState('All'); // All | Completed | Pending
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'jan_sampark'), (snapshot) => {
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
      setEntries(list);
      setLoading(false);
    }, (error) => {
      console.error("Error reading jan_sampark collection:", error);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this Jan Sampark record?')) {
      try {
        await deleteDoc(doc(db, 'jan_sampark', id));
      } catch (err) {
        console.error(err);
        alert('Failed to delete.');
      }
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'jan_sampark', id), { status: newStatus });
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    }
  };

  const isCompleted = (member) => {
    if (!member || !member.status) return false;
    const s = member.status.trim().toLowerCase();
    return s === 'completed' || s === 'paid';
  };

  const filteredEntries = entries.filter(member => {
    // Status Filter
    const matchesStatus = filter === 'All' 
      ? true 
      : filter === 'Completed' 
        ? isCompleted(member)
        : !isCompleted(member);

    // Search Filter
    const fullName = (member.fullName || '').toLowerCase();
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      (member.phone || '').includes(searchTerm) ||
      (member.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.state || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.paymentId || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    if (dateValue.toDate) {
      return dateValue.toDate().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    return new Date(dateValue).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // --- Export Functions --- //

  const getExportData = () => {
    return filteredEntries.map(e => ({
      'Name': e.fullName || 'N/A',
      'Phone': e.phone || 'N/A',
      'Gender': e.gender || 'N/A',
      'DOB': e.dob || 'N/A',
      'Amount Paid': `₹${e.amount || 5}`,
      'Location': `${e.city || 'N/A'}, ${e.state || 'N/A'} - ${e.pincode || ''}`,
      'Reference': e.reference || 'N/A',
      'Status': e.status || 'pending',
      'Payment ID': e.paymentId || 'N/A',
      'Applied On': formatDate(e.createdAt)
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
    a.setAttribute('download', 'jan_sampark_database.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const exportToDOC = () => {
    const data = getExportData();
    if (data.length === 0) return alert('No data to export.');

    const headers = Object.keys(data[0]);
    let html = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>";
    html += "<head><meta charset='utf-8'><title>Jan Sampark Database</title>";
    html += "<style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 5px; text-align: left; } th { background-color: #f2f2f2; }</style>";
    html += "</head><body>";
    html += "<h2>Jan Sampark Database</h2>";
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
    a.setAttribute('download', 'jan_sampark_database.doc');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const exportToPDF = () => {
    const data = getExportData();
    if (data.length === 0) return alert('No data to export.');

    const doc = new jsPDF('landscape');
    doc.text("Jan Sampark Database", 14, 15);
    
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => row[h]));

    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
    });

    doc.save('jan_sampark_database.pdf');
  };

  // --- Render --- //

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const counts = {
    all: entries.length,
    completed: entries.filter(m => isCompleted(m)).length,
    pending: entries.filter(m => !isCompleted(m)).length,
  };

  const totalCollected = entries
    .filter(m => isCompleted(m))
    .reduce((sum, m) => sum + (parseFloat(m.amount) || 5), 0);

  const totalPending = entries
    .filter(m => !isCompleted(m))
    .reduce((sum, m) => sum + (parseFloat(m.amount) || 5), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Widget */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
        <div className="absolute top-0 right-0 p-32 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10"></div>
        <div className="relative z-10 space-y-2 text-center md:text-left mb-6 md:mb-0">
          <h1 className="text-3xl font-black flex items-center justify-center md:justify-start gap-3">
            <Users size={32} />
            Jan Sampark Database
          </h1>
          <p className="text-indigo-100 font-medium max-w-xl">
            View and manage all Jan Sampark connections, check payment status, and export the database.
          </p>
        </div>
      </div>

      {/* Amount Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-5 shadow-md flex items-center gap-4">
          <div className="bg-white/20 rounded-xl p-3">
            <IndianRupee size={24} />
          </div>
          <div>
            <p className="text-green-100 text-xs font-semibold uppercase tracking-widest">Total Collected</p>
            <p className="text-3xl font-black">₹{totalCollected.toLocaleString('en-IN')}</p>
            <p className="text-green-100 text-xs mt-0.5">{counts.completed} paid entries</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-400 to-orange-400 text-white rounded-2xl p-5 shadow-md flex items-center gap-4">
          <div className="bg-white/20 rounded-xl p-3">
            <IndianRupee size={24} />
          </div>
          <div>
            <p className="text-yellow-100 text-xs font-semibold uppercase tracking-widest">Pending Amount</p>
            <p className="text-3xl font-black">₹{totalPending.toLocaleString('en-IN')}</p>
            <p className="text-yellow-100 text-xs mt-0.5">{counts.pending} pending entries</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-2xl p-5 shadow-md flex items-center gap-4">
          <div className="bg-white/20 rounded-xl p-3">
            <IndianRupee size={24} />
          </div>
          <div>
            <p className="text-indigo-100 text-xs font-semibold uppercase tracking-widest">Total Expected</p>
            <p className="text-3xl font-black">₹{(totalCollected + totalPending).toLocaleString('en-IN')}</p>
            <p className="text-indigo-100 text-xs mt-0.5">{counts.all} total entries</p>
          </div>
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
              className={`p-4 rounded-2xl border-2 transition-all font-bold flex flex-col items-center justify-center gap-1 ${filter === tab.label ? 'ring-2 ring-offset-2 ring-indigo-500 shadow-md ' + tab.color : 'bg-white border-transparent text-slate-500 hover:bg-slate-50 opacity-70'}`}
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
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium placeholder:text-slate-400 bg-white"
          />
        </div>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredEntries.length === 0 ? (
            <motion.div 
              initial={{opacity: 0}} animate={{opacity: 1}}
              className="col-span-full py-20 text-center text-slate-400 font-medium"
            >
              No {filter.toLowerCase()} entries found.
            </motion.div>
          ) : (
            filteredEntries.map(member => {
              const fullName = member.fullName || 'Unknown';
              const initials = fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
              const isPaid = isCompleted(member);

              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={member.id} 
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-shadow flex flex-col overflow-hidden relative"
                >
                  <button 
                    onClick={() => handleDelete(member.id)}
                    className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors z-10"
                    title="Delete Record"
                  >
                    <Trash2 size={18} />
                  </button>

                  {/* Header Status Bar */}
                  <div className={`h-2 w-full ${isPaid ? 'bg-green-500' : 'bg-yellow-400'}`}></div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Top: Identity */}
                    <div className="flex gap-4 items-start mb-4 pr-6">
                      <div className={`w-14 h-14 rounded-full text-white flex justify-center items-center font-bold text-xl shrink-0 ${member.gender === 'Female' ? 'bg-pink-500' : 'bg-indigo-500'}`}>
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-lg text-slate-800 leading-snug truncate" title={fullName}>{fullName}</h3>
                        <p className="text-xs text-slate-400 font-semibold mt-1">DOB: {member.dob || 'N/A'} • {member.gender}</p>
                      </div>
                    </div>

                    {/* Body: Details */}
                    <div className="space-y-2.5 text-sm text-slate-600 mb-6 flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex gap-2 items-center"><Phone size={15} className="shrink-0 text-slate-400" /> <a href={`tel:${member.phone}`} className="hover:text-indigo-600 hover:underline font-medium">{member.phone}</a></div>
                      <div className="flex gap-2 items-start"><MapPin size={15} className="shrink-0 text-slate-400 mt-0.5" /> <span className="leading-snug">{member.city}, {member.state} <span className="text-slate-400 block">{member.pincode}</span></span></div>
                      
                      <div className="pt-2.5 mt-2.5 border-t border-slate-200 text-xs flex flex-col gap-1 text-slate-500">
                        <div className="flex justify-between">
                          <span>Amount Paid:</span>
                          <span className="font-semibold text-slate-700">₹{member.amount || 5}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reference:</span>
                          <span className="font-semibold text-indigo-700">{member.reference || 'None'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Applied On:</span>
                          <span className="font-semibold text-slate-700">{formatDate(member.createdAt)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Payment ID:</span>
                          <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700 select-all truncate max-w-[120px]">{member.paymentId || 'N/A'}</span>
                        </div>
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
                            onClick={() => handleUpdateStatus(member.id, 'completed')}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-green-700 bg-green-50 border border-green-100 hover:bg-green-100 transition-colors flex items-center gap-1"
                            title="Mark as Paid"
                          >
                            Mark Paid
                          </button>
                        )}
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

export default AdminJanSampark;
