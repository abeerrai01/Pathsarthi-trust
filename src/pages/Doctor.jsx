import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Doctor = () => {
  const members = [
    { name: 'Dr. Sandeep Kumar Bharti', gender: 'Male', designation: 'Health Advisor', joinedDate: '2023-04-01' }
  ];

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const [selectedMember, setSelectedMember] = useState(null);

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold mb-6">Health Advisory Volunteers</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Meet our health advisory volunteers who support Path Sarthi Trust in health and medical matters.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {members.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedMember(member)}
            >
              <div className="p-6">
                <div className="flex justify-center mb-4">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-indigo-200 shadow"
                    />
                  ) : (
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold text-white ${
                      member.gender === 'Female' ? 'bg-pink-500' : 'bg-indigo-500'
                    }`}>
                      {getInitials(member.name)}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <div className="text-indigo-600 font-bold mb-2">
                    {member.designation}
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    {member.gender}
                  </div>
                  <div className="text-sm text-gray-600">
                    Member since {formatDate(member.joinedDate)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {selectedMember && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50" onClick={e => { if (e.target === e.currentTarget) setSelectedMember(null); }}>
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full relative">
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold z-10"
                aria-label="Close"
              >
                ×
              </button>
              <div className="flex flex-col items-center">
                {selectedMember.image && (
                  <img
                    src={selectedMember.modalImage ? selectedMember.modalImage : selectedMember.image}
                    alt={selectedMember.name}
                    className={selectedMember.modalImage ? "w-full max-w-md max-h-72 object-contain border-4 border-indigo-200 shadow mb-4 mx-auto" : "w-full max-w-md h-auto object-contain border-4 border-indigo-200 shadow mb-4 mx-auto"}
                    style={{ borderRadius: '1rem' }}
                  />
                )}
                <h2 className="text-2xl font-bold mb-2">{selectedMember.name}</h2>
                <div className="text-indigo-600 font-bold mb-1">{selectedMember.designation}</div>
                <div className="text-gray-600 mb-2">{selectedMember.gender}</div>
                <div className="text-gray-600 mb-2">Member since {formatDate(selectedMember.joinedDate)}</div>
                {selectedMember.fatherName && (
                  <div className="mb-1"><span className="font-semibold">Father's Name:</span> {selectedMember.fatherName}</div>
                )}
                {selectedMember.address && (
                  <div className="mb-1"><span className="font-semibold">Address:</span> {selectedMember.address}</div>
                )}
                {selectedMember.barCouncilNo && (
                  <div className="mb-1"><span className="font-semibold">Bar Council No:</span> {selectedMember.barCouncilNo}</div>
                )}
                {selectedMember.email && (
                  <div className="mb-1"><span className="font-semibold">Email:</span> <a href={`mailto:${selectedMember.email}`} className="text-blue-600 underline">{selectedMember.email}</a></div>
                )}
                {selectedMember.mobile && (
                  <div className="mb-1"><span className="font-semibold">Mobile:</span> <a href={`tel:${selectedMember.mobile}`} className="text-blue-600 underline">{selectedMember.mobile}</a></div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="mt-12 text-center text-xs text-gray-500 max-w-2xl mx-auto">
        Disclaimer: All professionals listed under this section are independent experts volunteering their time to provide general guidance for Pathsarthi Trust members. Pathsarthi Trust does not charge any fees, nor guarantee or control the advice given. Any consultation is purely voluntary and should not be considered as official or paid service by the Trust. Always verify with a certified professional for legal or medical decisions.
      </div>
    </div>
  );
};

export default Doctor; 