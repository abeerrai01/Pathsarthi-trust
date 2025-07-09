import React from 'react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const TrustMembers = () => {
  const members = [
    { name: 'Ravi Prakash Rai', gender: 'Male', designation: 'Chairman', joinedDate: '2022-02-23', image: '/Chairman.jpg' },
    { name: 'Om Prakash Rai', gender: 'Male', designation: 'Accountant', joinedDate: '2022-02-23' },
    { name: 'Arun Kumar Singh', gender: 'Male', designation: 'Secretary', joinedDate: '2022-02-23' },
    { name: 'Rupesh Kumar Chauhan', gender: 'Male', designation: 'Vice-President', joinedDate: '2022-06-27' },
    { name: 'Sanjay Sharma', gender: 'Male', designation: 'District President', joinedDate: '2024-10-01' },
    { name: 'Adv.Gurbachan Singh Chawla', gender: 'Male', designation: 'Legal Advisor', joinedDate: '2025-07-08', image: '/GURBACHAN SINGH CHAWLA.jpg', fatherName: 'Satnam Singh Chawla', address: 'L/2A, Rampur Garden, Near Agarsen Park, Bareilly', email: 'therajachawla@gmail.com', mobile: '98970 00001', modalImage: '/GURBACHAN SINGH CHAWLA. 1jpg.jpg' },
    { name: 'Srinivas Rai', gender: 'Male', designation: 'State President', district: 'Manali', state: 'Himachal Pradesh', joinedDate: '2024-06-01', image: '/Srinavas.jpg' },
    { name: 'Satya Prakash Rai', gender: 'Male', designation: 'Member', joinedDate: '2022-07-14' },
    { name: 'Mridul Manas Rai', gender: 'Male', designation: 'Trustee', joinedDate: '2023-01-01' },
    { name: 'Priyansh Manas Rai', gender: 'Male', designation: 'Co-Secretary', joinedDate: '2022-07-14' },
    { name: 'Abeer Rai', gender: 'Male', designation: 'Technical Director', joinedDate: '2025-04-01', image: '/abeer.jpg' },
    { name: 'Shreyansh Rai', gender: 'Male', designation: 'Internship Coordinator', joinedDate: '2025-07-01', image: '/Shreyansh.jpg' },
    { name: 'Mehair Tripathi', gender: 'Male', designation: 'Trustee', joinedDate: '2025-06-01' },
    { name: 'Sandeep Bharti', gender: 'Male', designation: 'Health Advisor', joinedDate: '2023-04-01' },
    { name: 'Swechha Rai', gender: 'Female', designation: 'Trustee', joinedDate: '2023-01-01', image: '/Swechha.jpg' },
    { name: 'Pramila Rai', gender: 'Female', designation: 'Trustee', joinedDate: '2025-04-01', image: '/Pramila.jpg' },
    { name: 'Deepansh Manas Rai', gender: 'Male', designation: 'Trustee', joinedDate: '2023-01-01' },
  ];

  // Remove custom sorting, just use members as is
  const sortedMembers = members;

  // Function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  // Function to get initials for avatar
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold mb-6">Our Trust Members</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Meet the dedicated individuals who lead Path Sarthi Trust in its mission to create positive change.
          </p>
        </motion.div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedMember(member)}
            >
              <div className="p-6">
                {/* Avatar */}
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

                {/* Member Info */}
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
      {/* Profile Modal */}
      {selectedMember && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
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
    </div>
  );
};

export default TrustMembers; 