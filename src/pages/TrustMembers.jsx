import React from 'react';
import { motion } from 'framer-motion';

const TrustMembers = () => {
  const members = [
    { name: 'Ravi Prakash Rai', gender: 'Male', designation: 'Chairman', joinedDate: '2022-02-23', image: '/Chairman.jpg' },
    { name: 'Om Prakash Rai', gender: 'Male', designation: 'Accountant', joinedDate: '2022-02-23' },
    { name: 'Arun Kumar Singh', gender: 'Male', designation: 'Secretary', joinedDate: '2022-02-23' },
    { name: 'Rupesh Kumar Chauhan', gender: 'Male', designation: 'Vice-President', joinedDate: '2022-06-27' },
    { name: 'Sanjay Sharma', gender: 'Male', designation: 'District President', joinedDate: '2024-10-01' },
    { name: 'Satya Prakash Rai', gender: 'Male', designation: 'Member', joinedDate: '2022-07-14' },
    { name: 'Mridul Manas Rai', gender: 'Male', designation: 'Trustee', joinedDate: '2023-01-01' },
    { name: 'Priyansh Manas Rai', gender: 'Male', designation: 'Co-Secretary', joinedDate: '2022-07-14' },
    { name: 'Deepansh Manas Rai', gender: 'Male', designation: 'Trustee', joinedDate: '2023-01-01' },
    { name: 'Mehair Tripathi', gender: 'Male', designation: 'Trustee', joinedDate: '2025-06-01' },
    { name: 'Sandeep Bharti', gender: 'Male', designation: 'Health Advisor', joinedDate: '2023-04-01' },
    { name: 'Swechha Rai', gender: 'Female', designation: 'Trustee', joinedDate: '2023-01-01', image: '/Swechha.jpg' },
    { name: 'Pramila Rai', gender: 'Female', designation: 'Trustee', joinedDate: '2025-04-01', image: '/Pramila.jpg' },
    { name: 'Abeer Rai', gender: 'Male', designation: 'Board Member', joinedDate: '2025-04-01', image: '/abeer.jpg' },
    { name: 'Srinivas Rai', gender: 'Male', designation: 'State President', district: 'Manali', state: 'Himachal Pradesh', joinedDate: '2024-06-01', image: '/Srinavas.jpg' },
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
            Meet the dedicated individuals who lead PathSarthi Trust in its mission to create positive change.
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
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
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
      </div>
    </div>
  );
};

export default TrustMembers; 