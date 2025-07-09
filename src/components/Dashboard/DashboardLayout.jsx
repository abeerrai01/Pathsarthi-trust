import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import MultiPhotoUpload from "./MultiPhotoUpload";
import PhotoUpload from "./PhotoUpload";
import GalleryManager from "./GalleryManager";
import { onSnapshot, doc, collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Button = ({ children, onClick, className = "", variant = "ghost" }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-2 rounded transition font-medium ${
      variant === "outline"
        ? "border border-white text-white hover:bg-gray-700"
        : "bg-transparent hover:bg-gray-700 text-white"
    } ${className}`}
  >
    {children}
  </button>
);

const TeamMembers = () => <div>Team Members Section (Coming Soon)</div>;
const UpdateMission = () => <div>Update Mission Section (Coming Soon)</div>;
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

  if (!analytics) return <div>Loading analytics...</div>;

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
        fill: false,
        borderColor: "#6366f1",
        backgroundColor: "#6366f1",
        tension: 0.3,
      },
    ],
  };
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Visits Per Day (Line)' },
    },
    scales: {
      x: { title: { display: true, text: 'Date' } },
      y: { title: { display: true, text: 'Visits' }, beginAtZero: true },
    },
  };

  // Bar chart data
  const barChartData = {
    labels: filteredDaily.map(d => d.date),
    datasets: [
      {
        label: "Daily Visits",
        data: filteredDaily.map(d => d.views),
        backgroundColor: "#818cf8",
      },
    ],
  };
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Visits Per Day (Bar)' },
    },
    scales: {
      x: { title: { display: true, text: 'Date' } },
      y: { title: { display: true, text: 'Visits' }, beginAtZero: true },
    },
  };

  // Pie chart data
  const pieChartData = {
    labels: ['Unique Visitors', 'Other Visitors'],
    datasets: [
      {
        data: [analytics.uniqueVisitors?.length ?? 0, (analytics.visitors ?? 0) - (analytics.uniqueVisitors?.length ?? 0)],
        backgroundColor: ['#6366f1', '#a5b4fc'],
        hoverOffset: 4,
      },
    ],
  };
  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Unique vs Total Visitors' },
    },
  };

  // Device/browser pie chart for selected page
  const devicePieData = pageStats ? {
    labels: Object.keys(pageStats.devices || {}),
    datasets: [{
      data: Object.values(pageStats.devices || {}),
      backgroundColor: ['#6366f1', '#818cf8', '#a5b4fc'],
    }],
  } : null;
  const browserPieData = pageStats ? {
    labels: Object.keys(pageStats.browsers || {}),
    datasets: [{
      data: Object.values(pageStats.browsers || {}),
      backgroundColor: ['#6366f1', '#818cf8', '#a5b4fc', '#fbbf24', '#f87171'],
    }],
  } : null;

  // CSV export logic
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

  // Prepare daily and per-page CSV data
  const dailyCSV = (analytics.daily || []).map(d => ({ ...d }));
  const pagesCSV = pages.map(p => ({ page: p.id, views: p.pageViews, uniqueVisitors: p.uniqueVisitors?.length || 0 }));

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Live Website Analytics</h2>
      <div className="mb-2 flex justify-between">
        <span className="font-semibold">Total Visitors:</span>
        <span>{analytics.visitors ?? 0}</span>
      </div>
      <div className="mb-2 flex justify-between">
        <span className="font-semibold">Total Page Views:</span>
        <span>{analytics.pageViews ?? 0}</span>
      </div>
      <div className="mb-2 flex justify-between">
        <span className="font-semibold">Unique Visitors:</span>
        <span>{analytics.uniqueVisitors?.length ?? 0}</span>
      </div>
      <div className="mb-2 flex justify-between">
        <span className="font-semibold">Today's Visits:</span>
        <span>{todayData ? todayData.views : 0}</span>
      </div>
      <div className="text-xs text-gray-500 mt-4 mb-4">Live updates from Firestore</div>
      {/* Date Range Filter */}
      <div className="flex gap-4 mb-6 items-center">
        <label className="text-sm">From:
          <input type="date" className="ml-2 border rounded px-2 py-1" value={dateRange.from} onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))} />
        </label>
        <label className="text-sm">To:
          <input type="date" className="ml-2 border rounded px-2 py-1" value={dateRange.to} onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))} />
        </label>
        <button className="ml-2 px-3 py-1 bg-gray-200 rounded text-sm" onClick={() => setDateRange({ from: '', to: '' })}>Reset</button>
      </div>
      {filteredDaily.length > 0 && (
        <div className="mt-6">
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
      )}
      {filteredDaily.length > 0 && (
        <div className="mt-6">
          <Bar data={barChartData} options={barChartOptions} />
        </div>
      )}
      <div className="mt-6">
        <Pie data={pieChartData} options={pieChartOptions} />
      </div>
      {/* Per-page stats table */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-2">Per-Page Stats</h3>
        <table className="w-full text-sm mb-4 border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Page</th>
              <th className="p-2 border">Views</th>
              <th className="p-2 border">Unique Visitors</th>
              <th className="p-2 border">Select</th>
            </tr>
          </thead>
          <tbody>
            {pages.map(p => (
              <tr key={p.id} className={selectedPage === p.id ? 'bg-indigo-50' : ''}>
                <td className="p-2 border">{p.id}</td>
                <td className="p-2 border">{p.pageViews}</td>
                <td className="p-2 border">{p.uniqueVisitors?.length || 0}</td>
                <td className="p-2 border"><button className="px-2 py-1 bg-indigo-100 rounded" onClick={() => setSelectedPage(p.id)}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Device/browser breakdown for selected page */}
      {pageStats && (
        <div className="flex flex-wrap gap-8 mt-6">
          <div className="w-64">
            <Pie data={devicePieData} options={{ plugins: { title: { display: true, text: 'Device Type' }, legend: { position: 'bottom' } } }} />
          </div>
          <div className="w-64">
            <Pie data={browserPieData} options={{ plugins: { title: { display: true, text: 'Browser' }, legend: { position: 'bottom' } } }} />
          </div>
        </div>
      )}
      {/* Export buttons */}
      <div className="flex gap-4 mt-8">
        <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={() => exportCSV(dailyCSV, 'daily-analytics.csv')}>Export Daily CSV</button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => exportCSV(pagesCSV, 'per-page-analytics.csv')}>Export Per-Page CSV</button>
      </div>
    </div>
  );
};

const DashboardLayout = () => {
  const [activeSection, setActiveSection] = useState("multi-upload");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // or your auth logic
    navigate("/login");
  };

  const handleMenuClick = () => setSidebarOpen((open) => !open);
  const handleNav = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  return (
    <div className="flex flex-col h-screen">
      <AdminNavbar onLogout={handleLogout} onMenuClick={handleMenuClick} />
      <div className="flex flex-1 relative">
        {/* Sidebar as drawer on mobile */}
        <div>
          {/* Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
              onClick={() => setSidebarOpen(false)}
            ></div>
          )}
          <div
            className={`fixed z-40 top-0 left-0 h-full w-64 bg-gray-800 text-white p-4 space-y-4 transform transition-transform duration-200 md:static md:translate-x-0 md:block ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            }`}
          >
            <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
            <Button onClick={() => handleNav("multi-upload")}>🖼️ Multi-Image Upload</Button>
            <Button onClick={() => handleNav("single-upload")}>📷 Single Photo Upload</Button>
            <Button onClick={() => handleNav("gallery-manager")}>🗑️ Manage Gallery</Button>
            <Button onClick={() => handleNav("team")}>🧑‍🤝‍🧑 Team Members</Button>
            <Button onClick={() => handleNav("mission")}>🎯 Update Mission</Button>
            <Button onClick={() => handleNav("analytics")}>📊 Website Analytics</Button>
            <Link
              to="/admin/certificates"
              className="block w-full text-left px-4 py-2 rounded transition font-medium bg-green-600 hover:bg-green-700 text-white mt-2"
            >
              🏅 Certificate Generator
            </Link>
            <Link
              to="/admin/certificates-list"
              className="block w-full text-left px-4 py-2 rounded transition font-medium bg-blue-600 hover:bg-blue-700 text-white mt-2"
            >
              📋 Certificate List
            </Link>
            {/* Logout button for mobile */}
            <Button
              variant="outline"
              className="mt-10 md:hidden"
              onClick={handleLogout}
            >
              🔒 Logout
            </Button>
          </div>
        </div>
        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8 overflow-auto">
          {activeSection === "multi-upload" && <MultiPhotoUpload />}
          {activeSection === "single-upload" && <PhotoUpload />}
          {activeSection === "gallery-manager" && <GalleryManager />}
          {activeSection === "team" && <TeamMembers />}
          {activeSection === "mission" && <UpdateMission />}
          {activeSection === "analytics" && <AnalyticsPanel />}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout; 