import React from 'react';

const members = [
  { name: 'Sameer Sharma', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh', image: '/Sameer Sharma.jpg' },
  { name: 'Pawan Thakur', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh' },
  { name: 'Ankit Rastogi', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh' },
  { name: 'Amrit Agrawal', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh' },
  { name: 'Vikas Mathur', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh' },
  { name: 'Pradeep Kumar Tripathi', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh' },
  // Add more members as needed
];

const Member = () => {
  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Member List</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead>
              <tr>
                <th className="py-3 px-4 border-b text-left">Photo</th>
                <th className="py-3 px-4 border-b text-left">Name</th>
                <th className="py-3 px-4 border-b text-left">Gender</th>
                <th className="py-3 px-4 border-b text-left">District</th>
                <th className="py-3 px-4 border-b text-left">State</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, idx) => (
                <tr key={idx} className="hover:bg-gray-100">
                  <td className="py-2 px-4 border-b">
                    {member.image ? (
                      <img src={member.image} alt={member.name} className="h-12 w-12 rounded-full object-cover" />
                    ) : null}
                  </td>
                  <td className="py-2 px-4 border-b">{member.name}</td>
                  <td className="py-2 px-4 border-b">{member.gender}</td>
                  <td className="py-2 px-4 border-b">{member.district}</td>
                  <td className="py-2 px-4 border-b">{member.state}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Member; 