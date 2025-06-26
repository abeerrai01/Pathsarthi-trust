import React from 'react';

const AdminNavbar = ({ onLogout, onMenuClick }) => (
  <nav className="w-full bg-gray-900 text-white flex items-center justify-between px-4 h-16 shadow">
    <div className="flex items-center gap-4">
      {/* Hamburger for mobile */}
      <button
        className="md:hidden p-2 focus:outline-none"
        onClick={onMenuClick}
        aria-label="Open sidebar"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="text-xl font-bold">Admin Panel</div>
    </div>
    {/* Hide logout on mobile, show in sidebar */}
    <button
      onClick={onLogout}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold hidden md:block"
    >
      Logout
    </button>
  </nav>
);

export default AdminNavbar; 