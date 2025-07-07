import React from 'react';

const SupporterCard = ({ name, description, since, onClick }) => {
  return (
    <div
      className="bg-white shadow-md rounded-lg p-4 text-center cursor-pointer transition transform duration-300 hover:scale-105 hover:ring-4 hover:ring-blue-300 relative group"
      onClick={onClick}
    >
      <div className="w-24 h-24 flex items-center justify-center bg-gray-200 mx-auto mb-2 rounded-full text-3xl font-bold text-gray-600 group-hover:shadow-lg group-hover:ring-4 group-hover:ring-blue-400 transition-all duration-300">
        <span className="bg-black text-white w-full h-full flex items-center justify-center rounded-full">{name.charAt(0)}</span>
      </div>
      <h3 className="text-lg font-bold text-gray-800">{name}</h3>
      {/* Caption on hover */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-24 opacity-0 group-hover:opacity-100 bg-blue-600 text-white text-xs rounded px-3 py-1 shadow transition-all duration-300 pointer-events-none">
        Click to see their impact
      </div>
      <p className="text-sm text-gray-600 mt-2">{description}</p>
      <p className="text-xs text-gray-500 mt-1">{since && `Supporter since ${since}`}</p>
    </div>
  );
};

export default SupporterCard; 