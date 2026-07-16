import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInternAuth } from '../contexts/InternAuthContext';
import InternProfile from '../components/InternPortal/InternProfile';
import InternTasks from '../components/InternPortal/InternTasks';
import InternCertificateRequest from '../components/InternPortal/InternCertificateRequest';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ListTodo, Award, LogOut, Menu, X, Briefcase, ChevronRight } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'tasks', label: 'Tasks Assigned', icon: ListTodo },
  { id: 'certificate', label: 'Request Certificate', icon: Award },
];

const InternDashboard = () => {
  const { internProfile, internLogout } = useInternAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await internLogout();
    navigate('/intern-login', { replace: true });
  };

  const activeItem = NAV_ITEMS.find(n => n.id === activeTab);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 sm:px-6 bg-white border-b border-slate-200 shadow-sm">
        {/* Left: hamburger + brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="md:hidden text-slate-500 hover:text-blue-600 p-2 -ml-2 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="flex items-center gap-2.5">
            <img src="/Logo-2.png" alt="Logo" className="h-8 w-auto hidden sm:block" />
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 sm:hidden">
              <Briefcase size={16} className="text-blue-600" />
            </div>
            <div>
              <span className="text-slate-900 font-black text-sm hidden sm:block">Intern Portal</span>
              <span className="text-slate-500 text-xs font-medium hidden sm:block">PathSarthi Trust</span>
            </div>
          </div>
        </div>

        {/* Center: current page name (mobile) */}
        <span className="text-slate-800 font-semibold text-sm md:hidden">{activeItem?.label}</span>

        {/* Right: user info + logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-slate-900 font-semibold text-sm leading-tight">{internProfile?.name}</span>
            <span className="text-slate-500 text-xs">{internProfile?.field}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-black text-white text-base shrink-0">
            {internProfile?.name?.[0]?.toUpperCase()}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 border border-red-200 hover:border-red-300"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 pt-16">
        {/* Sidebar overlay (mobile) */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 md:hidden bg-slate-900/50 backdrop-blur-sm"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside
          className={`fixed md:static top-16 left-0 h-[calc(100vh-4rem)] z-50 flex flex-col transition-transform duration-300 ease-out bg-white border-r border-slate-200 w-64 shrink-0 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          {/* Intern hero */}
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center font-black text-blue-600 text-xl shrink-0 border border-blue-100">
                {internProfile?.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-slate-900 font-bold text-sm truncate">{internProfile?.name}</p>
                <p className="text-slate-500 text-xs truncate">{internProfile?.field}</p>
                <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold mt-1.5 ${internProfile?.credActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {internProfile?.credActive ? 'Active' : 'Revoked'}
                </span>
              </div>
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex-1 p-3 space-y-1">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                    {item.label}
                  </div>
                  {isActive && <ChevronRight size={14} className="text-blue-600" />}
                </button>
              );
            })}
          </nav>

          {/* Bottom logout */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 border border-red-200 hover:border-red-300"
            >
              <LogOut size={16} />
              Logout
            </button>
            <p className="text-slate-400 text-xs text-center font-medium">PathSarthi Trust © {new Date().getFullYear()}</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {activeTab === 'profile' && <InternProfile />}
                {activeTab === 'tasks' && <InternTasks />}
                {activeTab === 'certificate' && <InternCertificateRequest />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InternDashboard;
