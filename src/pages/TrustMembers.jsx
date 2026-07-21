import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

const TrustMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const DESIGNATION_ORDER = [
    'chairman',
    'vice-president',
    'vice president',
    'accountant',
    'secretary',
    'technical director',
    'technical head',
    'co-secretary',
    'co secretary',
    'internship coordinator',
    'internship cordinator',
  ];

  const NAMED_ORDER = ['sanjay sharma'];

  const getSortKey = (member) => {
    const designation = (member.designation || '').trim().toLowerCase();
    const name = (member.name || '').trim().toLowerCase();

    const dIdx = DESIGNATION_ORDER.indexOf(designation);
    if (dIdx !== -1) return dIdx;

    const nIdx = NAMED_ORDER.indexOf(name);
    if (nIdx !== -1) return DESIGNATION_ORDER.length + nIdx;

    return DESIGNATION_ORDER.length + NAMED_ORDER.length;
  };

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'board_of_trustees'));
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        fetched.sort((a, b) => getSortKey(a) - getSortKey(b));
        setMembers(fetched);
      } catch (err) {
        console.error("Error fetching board of trustees:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    if (dateValue.toDate) {
      return dateValue.toDate().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateValue).toLocaleDateString('en-IN', options);
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
          {loading ? (
            <div className="col-span-full text-center text-gray-500 py-10">Loading members...</div>
          ) : members.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-10">No trust members found.</div>
          ) : (
            members.map((member, index) => (
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
                    Member since {formatDate(member.joinedDate || member.createdAt)}
                  </div>
                </div>
              </div>
            </motion.div>
          )))}
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
              <div className="text-gray-600 mb-2">Member since {formatDate(selectedMember.joinedDate || selectedMember.createdAt)}</div>
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