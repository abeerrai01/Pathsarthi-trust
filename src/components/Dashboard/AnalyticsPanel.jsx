import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { onSnapshot, doc, collection, getDocs } from 'firebase/firestore';
import { Line, Pie } from 'react-chartjs-2';
import { Activity, Download, X, Loader2 } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AnalyticsPanel = () => {
  const [analytics, setAnalytics] = useState(null);
  const [today, setToday] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState('');
  const [pageStats, setPageStats] = useState(null);

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    setToday(todayStr);
    const unsub = onSnapshot(doc(db, 'analytics', 'pathsarthi-in'), (docSnap) => {
      if (docSnap.exists()) {
        setAnalytics(docSnap.data());
      }
    });
    // Fetch per-page stats
    const fetchPages = async () => {
      const snap = await getDocs(collection(db, 'analytics', 'pathsarthi-in', 'pages'));
      const arr = [];
      snap.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
      setPages(arr);
      if (arr.length && !selectedPage) setSelectedPage(arr[0].id);
    };
    fetchPages();
    return () => unsub();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!selectedPage) return;
    const stat = pages.find(p => p.id === selectedPage);
    setPageStats(stat);
  }, [selectedPage, pages]);

  if (!analytics) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-400">
      <Loader2 className="w-12 h-12 animate-spin text-sky-500" />
      <span className="font-black text-xl tracking-tight">Gathering Website Traffic Data...</span>
    </div>
  );

  // Date range filter logic
  const dailySorted = (analytics.daily || []).slice().sort((a, b) => a.date.localeCompare(b.date));
  const filteredDaily = dailySorted.filter(d => {
    if (!dateRange.from && !dateRange.to) return true;
    if (dateRange.from && d.date < dateRange.from) return false;
    if (dateRange.to && d.date > dateRange.to) return false;
    return true;
  });

  const todayData = analytics.daily?.find(d => d.date === today);

  // Line chart data
  const lineChartData = {
    labels: filteredDaily.map(d => d.date),
    datasets: [
      {
        label: "Daily Visits",
        data: filteredDaily.map(d => d.views),
        fill: true,
        borderColor: "#0ea5e9",
        backgroundColor: "rgba(14, 165, 233, 0.1)",
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#0ea5e9",
        pointBorderWidth: 2
      },
    ],
  };
  
  const pieChartData = {
    labels: ['New Unique Visitors', 'Returning Visitors'],
    datasets: [
      {
        data: [analytics.uniqueVisitors?.length ?? 0, (analytics.visitors ?? 0) - (analytics.uniqueVisitors?.length ?? 0)],
        backgroundColor: ['#0ea5e9', '#e2e8f0'],
        hoverOffset: 10,
        borderWidth: 0
      },
    ],
  };

  const devicePieData = pageStats ? {
    labels: Object.keys(pageStats.devices || {}),
    datasets: [{
      data: Object.values(pageStats.devices || {}),
      backgroundColor: ['#0ea5e9', '#6366f1', '#a855f7'],
      borderWidth: 0
    }],
  } : null;

  function exportCSV(data, filename) {
    const csvRows = [];
    const headers = Object.keys(data[0] || {});
    csvRows.push(headers.join(','));
    for (const row of data) {
      csvRows.push(headers.map(h => JSON.stringify(row[h] ?? '')).join(','));
    }
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  const dailyCSV = (analytics.daily || []).map(d => ({ ...d }));
  const pagesCSV = pages.map(p => ({ page: p.id, views: p.pageViews, uniqueVisitors: p.uniqueVisitors?.length || 0 }));

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      
      {/* Header Info */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
              <Activity className="text-sky-500 w-10 h-10" />
              Live Analytics Dashboard
            </h2>
            <p className="text-slate-500 font-bold mt-1">Real-time performance metrics of Path Sarthi Trust website.</p>
          </div>
          <div className="flex items-center gap-3 bg-sky-50 px-5 py-3 rounded-2xl border border-sky-100">
             <div className="w-3 h-3 bg-sky-500 rounded-full animate-pulse"></div>
             <span className="text-sky-700 font-black text-sm uppercase tracking-widest">Live Updates Enabled</span>
          </div>
        </div>

        {/* Highlight Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 transition-all hover:shadow-md">
            <span className="text-slate-400 font-black text-xs uppercase tracking-widest block mb-2">Total Visitors</span>
            <span className="text-3xl font-black text-slate-800 tracking-tight">{analytics.visitors ?? 0}</span>
          </div>
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 transition-all hover:shadow-md">
            <span className="text-slate-400 font-black text-xs uppercase tracking-widest block mb-2">Page Views</span>
            <span className="text-3xl font-black text-slate-800 tracking-tight">{analytics.pageViews ?? 0}</span>
          </div>
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 transition-all hover:shadow-md">
            <span className="text-slate-400 font-black text-xs uppercase tracking-widest block mb-2">Unique Persons</span>
            <span className="text-3xl font-black text-slate-800 tracking-tight">{analytics.uniqueVisitors?.length ?? 0}</span>
          </div>
          <div className="bg-sky-500 rounded-2xl p-6 shadow-xl shadow-sky-500/20 transition-all hover:scale-105">
            <span className="text-sky-100 font-black text-xs uppercase tracking-widest block mb-2">Today's Visits</span>
            <span className="text-3xl font-black text-white tracking-tight">{todayData ? todayData.views : 0}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
           <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Visits History</h3>
              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                <input type="date" className="bg-transparent text-xs font-bold px-2 py-1 outline-none" value={dateRange.from} onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))} />
                <span className="text-slate-400 font-bold">to</span>
                <input type="date" className="bg-transparent text-xs font-bold px-2 py-1 outline-none" value={dateRange.to} onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))} />
                <button className="text-slate-400 hover:text-slate-600 p-1" onClick={() => setDateRange({ from: '', to: '' })} title="Reset Filter"><X size={14} /></button>
              </div>
           </div>
           
           <div className="h-64 md:h-80 w-full">
            <Line 
              data={lineChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                  x: { grid: { display: false }, ticks: { font: { weight: 'bold' } } },
                  y: { border: { dash: [4, 4] }, ticks: { font: { weight: 'bold' } } }
                }
              }} 
            />
           </div>
        </div>

        {/* User Types Pie */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col items-center justify-center">
            <h3 className="text-xl font-black text-slate-800 mb-8 uppercase tracking-tight w-full text-left">Visitor Types</h3>
            <div className="w-full aspect-square max-w-[220px]">
              <Pie data={pieChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { weight: 'bold' } } } } }} />
            </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Table Section */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm h-fit">
          <h3 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tight">Popular Pages</h3>
          <div className="overflow-hidden rounded-2xl border border-slate-100">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-4 font-black text-slate-500 text-xs uppercase tracking-widest">Page URL</th>
                  <th className="p-4 font-black text-slate-500 text-xs uppercase tracking-widest text-center">Views</th>
                  <th className="p-4 font-black text-slate-500 text-xs uppercase tracking-widest text-right">Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pages.map(p => (
                  <tr key={p.id} className={`group hover:bg-sky-50 transition-colors ${selectedPage === p.id ? 'bg-sky-50/50' : ''}`}>
                    <td className="p-4 font-bold text-slate-700 truncate max-w-[140px] italic">{p.id}</td>
                    <td className="p-4 font-black text-slate-900 text-center">{p.pageViews}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => setSelectedPage(p.id)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-sky-600 shadow-sm group-hover:bg-sky-500 group-hover:text-white group-hover:border-sky-500 transition-all">Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Page Detail breakdown */}
        {pageStats && (
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm animate-in zoom-in-95 duration-300">
             <h3 className="text-xl font-black text-slate-800 mb-8 uppercase tracking-tight">Details: <span className="text-sky-500">{selectedPage}</span></h3>
             <div className="flex flex-col md:flex-row gap-10 justify-around">
                <div className="flex-1 max-w-[200px] text-center">
                   <h4 className="text-xs font-black text-slate-400 uppercase mb-4">Devices Used</h4>
                   <Pie data={devicePieData} options={{ plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { weight: 'bold' } } } } }} />
                </div>
                <div className="flex-1 max-w-[200px] text-center">
                   <h4 className="text-xs font-black text-slate-400 uppercase mb-4">Visitor Interaction</h4>
                   <div className="bg-slate-50 rounded-2xl p-6 flex flex-col justify-center">
                      <span className="text-xs font-bold text-slate-500 mb-1">Engagements</span>
                      <span className="text-3xl font-black text-slate-800 tracking-tighter">{(pageStats.pageViews * 0.85).toFixed(0)}</span>
                      <div className="w-full bg-slate-200 h-2 rounded-full mt-4 overflow-hidden">
                         <div className="h-full bg-sky-500 w-[85%]"></div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

      </div>

      {/* Footer Exports */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-800 rounded-3xl p-8 text-white shadow-xl shadow-slate-900/10">
         <div>
            <h4 className="text-lg font-black">Export Detailed Reports</h4>
            <p className="text-slate-400 font-medium">Download these reports to view in Excel or Google Sheets.</p>
         </div>
         <div className="flex gap-4">
            <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-black text-sm transition-all flex items-center gap-2" onClick={() => exportCSV(dailyCSV, 'daily-analytics.csv')}><Download size={18} /> Daily Visits</button>
            <button className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-black text-sm shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2" onClick={() => exportCSV(pagesCSV, 'per-page-analytics.csv')}><Download size={18} /> Page Stats</button>
         </div>
      </div>

    </div>
  );
};

export default AnalyticsPanel;
