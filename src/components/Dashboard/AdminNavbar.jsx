import React from 'react';

const AdminNavbar = ({ onLogout }) => (
  <nav className="w-full bg-gray-900 text-white flex items-center justify-between px-8 h-16 shadow">
    <div className="text-xl font-bold">Admin Panel</div>
    <button
      onClick={onLogout}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold"
    >
      Logout
    </button>
  </nav>
);

export default AdminNavbar; 