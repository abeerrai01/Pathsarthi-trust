import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import GalleryManager from "./GalleryManager";
import PhotoUploadAdmin from '../PhotoUploadAdmin';
import EditGalleryHeadings from '../EditGalleryHeadings';
import { onSnapshot, doc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { LayoutDashboard, Images, UploadCloud, Users, Target, Activity, Type, Award, ListChecks, LogOut, ChevronRight, Newspaper, GraduationCap } from 'lucide-react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import AdminUpload from '../AdminUpload';
import MediaFeed from '../MediaFeed';
import TeamManager from './TeamManager';
import MissionManager from './MissionManager';
import AnalyticsPanel from './AnalyticsPanel';
import AdminEducation from './AdminEducation';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Button = ({ children, onClick, className = "", variant = "ghost" }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-2 rounded transition font-medium ${
      variant === "outline"
        ? "border border-slate-300 text-slate-700 hover:bg-slate-50"
        : "bg-transparent hover:bg-slate-100 text-slate-700"
    } ${className}`}
  >
    {children}
  </button>
);


// AnalyticsPanel is now imported from its own file


const DashboardLayout = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleMenuClick = () => setSidebarOpen((open) => !open);
  const handleNav = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  const menuItems = [
    { id: "overview", label: "Overview Home", icon: <LayoutDashboard size={20} /> },
    { id: "education-applications", label: "Education Requests", icon: <GraduationCap size={20} /> },
    { id: "analytics", label: "Website Analytics", icon: <Activity size={20} /> },
    { id: "team", label: "Team & Supporters", icon: <Users size={20} /> },
    { id: "gallery-group-upload", label: "Upload New Photos", icon: <UploadCloud size={20} /> },
    { id: "gallery-manager", label: "Manage Existing Photos", icon: <Images size={20} /> },
    { id: "media-upload", label: "News & Media Posts", icon: <Newspaper size={20} /> },
    { id: "edit-gallery-headings", label: "Edit Section Headings", icon: <Type size={20} /> },
    { id: "mission", label: "Update Mission", icon: <Target size={20} /> },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      <AdminNavbar onLogout={handleLogout} onMenuClick={handleMenuClick} />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        
        {/* Modern Sidebar */}
        <div
          className={`fixed z-40 top-0 left-0 h-full w-72 bg-white border-r border-slate-200 shadow-xl md:shadow-none transform transition-transform duration-300 md:static md:translate-x-0 flex flex-col ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-6 pb-2">
            <h2 className="text-xs font-black tracking-widest text-slate-400 uppercase mb-4">Admin Menu</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto px-4 space-y-1.5 custom-scrollbar">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                  activeSection === item.id 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-indigo-600"
                }`}
              >
                <div className="flex items-center gap-3 font-semibold">
                  {item.icon}
                  {item.label}
                </div>
                {activeSection === item.id && <ChevronRight size={16} className="opacity-70" />}
              </button>
            ))}

            <div className="pt-6 pb-2">
              <h2 className="text-xs font-black tracking-widest text-slate-400 uppercase mb-4 px-2">Certificates</h2>
            </div>
            
            <Link
              to="/admin/certificates"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 font-semibold"
            >
              <Award size={20} /> Generate Certificate
            </Link>
            <Link
              to="/admin/certificates-list"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 font-semibold"
            >
              <ListChecks size={20} /> Certificate Database
            </Link>
          </div>

          <div className="p-4 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold md:hidden"
            >
              <LogOut size={20} /> Logout
            </button>
            <div className="hidden md:flex text-xs text-center text-slate-400 justify-center font-medium py-3">
              Pathsarthi Trust © {new Date().getFullYear()}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto bg-slate-50 p-4 md:p-8 lg:p-10 relative">
          
          <div className="max-w-6xl mx-auto">
            {/* Overview / Welcome Dash */}
            {activeSection === "overview" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-32 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse"></div>
                  <h1 className="text-4xl md:text-5xl font-black mb-4 relative z-10">Welcome Admin! 👋</h1>
                  <p className="text-indigo-100 text-lg md:text-xl max-w-2xl relative z-10 font-medium">Select an action below or from the menu to manage the Path Sarthi Trust website. Your updates go live instantly.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Quick Action Cards */}
                  <div onClick={() => handleNav("education-applications")} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
                    <div className="bg-amber-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-500 group-hover:text-white transition-colors text-amber-600">
                      <GraduationCap size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Education Requests</h3>
                    <p className="text-slate-500 font-medium text-sm">Review & approve student applications for public showcase.</p>
                  </div>
                  
                  <div onClick={() => handleNav("team")} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
                    <div className="bg-indigo-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors text-indigo-600">
                      <Users size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Team & Supporters</h3>
                    <p className="text-slate-500 font-medium text-sm">Add or edit Trustees, Members, Advisors, and Supporters easily.</p>
                  </div>
                  
                  <div onClick={() => handleNav("gallery-group-upload")} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
                    <div className="bg-emerald-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-colors text-emerald-600">
                      <UploadCloud size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Upload Photos</h3>
                    <p className="text-slate-500 font-medium text-sm">Post new pictures of events directly to the website gallery.</p>
                  </div>

                  <div onClick={() => handleNav("analytics")} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
                    <div className="bg-sky-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-sky-500 group-hover:text-white transition-colors text-sky-600">
                      <Activity size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Website Traffic</h3>
                    <p className="text-slate-500 font-medium text-sm">See how many people are visiting the website right now.</p>
                  </div>
                  
                  <div onClick={() => handleNav("media-upload")} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
                    <div className="bg-orange-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-500 group-hover:text-white transition-colors text-orange-600">
                      <Newspaper size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">News & Media</h3>
                    <p className="text-slate-500 font-medium text-sm">Create posts for Trust News, Impact Stories and Media buzz.</p>
                  </div>
                  
                  <Link to="/admin/certificates" className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group block">
                    <div className="bg-purple-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors text-purple-600">
                      <Award size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Create Certificate</h3>
                    <p className="text-slate-500 font-medium text-sm">Generate beautiful new certificates for volunteers and donors.</p>
                  </Link>

                </div>
              </div>
            )}

            {/* Component Renders */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {activeSection === "gallery-manager" && <GalleryManager />}
              {activeSection === "gallery-group-upload" && <PhotoUploadAdmin />}
              {activeSection === "media-upload" && (
                <div className="space-y-10">
                  <AdminUpload />
                  <MediaFeed isAdmin={true} />
                </div>
              )}
              {activeSection === "team" && <TeamManager />}
              {activeSection === "mission" && <MissionManager />}
              {activeSection === "analytics" && <AnalyticsPanel />}
              {activeSection === "edit-gallery-headings" && <EditGalleryHeadings />}
              {activeSection === "education-applications" && <AdminEducation />}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout; 