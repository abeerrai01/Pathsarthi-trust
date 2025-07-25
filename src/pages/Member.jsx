import React, { useState } from 'react';

const members = [
  { name: 'Sameer Sharma', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh', image: '/Sameer Sharma.jpg' },
  { name: 'Pawan Thakur', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh' },
  { name: 'Ankit Rastogi', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh', image: '/Ankit.jpg' },
  { name: 'Amrit Agrawal', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh' },
  { name: 'Vikas Mathur', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh' },
  { name: 'Pradeep Kumar Tripathi', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh' },
  { name: 'Bhag Singh', gender: 'Male', district: 'Bijnor', state: 'Uttar Pradesh', designation: 'Member', joinedDate: '2023-01-01', image: '/Bhag Singh.jpg' },
  { name: 'Neeraj Gupta', gender: 'Male', district: 'Bareilly', state: 'Uttar Pradesh', designation: 'Member', joinedDate: '2023-01-01' },
  { name: 'Neeraj Chaturvedi', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh', designation: 'Member', joinedDate: '2023-01-01' },
  { name: 'Sanjeev Rastogi', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh', designation: 'Member', joinedDate: '2023-01-01', image: '/Sanjeev Rastogi.jpg' },
  { name: 'Jatadhari Rai', gender: 'Male', district: 'Jaunpur', state: 'Uttar Pradesh' },
  { name: 'Manoj Sinha', gender: 'Male', district: 'Noida', state: 'Uttar Pradesh' },
  { name: 'Shailendra Singh', gender: 'Male', district: 'Chandausi', state: 'Uttar Pradesh' },
  { name: 'Gaurav Kathuriya', gender: 'Male', district: 'Delhi', state: 'Delhi' },
  { name: 'Sanjay Rai', gender: 'Male', district: 'Ghaziabad', state: 'Uttar Pradesh', image: '/Sanjay rai.jpg' },
  { name: 'Sanjay Rai', gender: 'Male', district: 'Mumbai', state: 'Maharashtra' },
  { name: 'Pradeep Rai', gender: 'Male', district: 'Azamgarh', state: 'Uttar Pradesh' },
  { name: 'Navneet Kumar Saxena', gender: 'Male', district: 'Rampur', state: 'Uttar Pradesh' },
  { name: 'Rajendra Prasad Singh', gender: 'Male', district: 'Varanasi', state: 'Uttar Pradesh' },
  { name: 'Madan Singh Negi', gender: 'Male', district: 'Noida', state: 'Uttar Pradesh' },
  { name: 'Nathi Singh Bartwal', gender: 'Male', district: 'Noida', state: 'Uttar Pradesh' },
  { name: 'Yashu Sharma', gender: 'Male', district: 'Guna', state: 'Madhya Pradesh' },
  { name: 'Anil Kumar Sharma', gender: 'Male', district: 'Guna', state: 'Madhya Pradesh' },
  { name: 'Rajendra Kumar Dhingra', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh' },
  { name: 'Kailash Chandra Sharma', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh' },
  { name: 'Parminder Sharma', gender: 'Male', district: 'Ludhiana', state: 'Punjab' },
  { name: 'Amit Kumar Shukla', gender: 'Male', district: 'Barielly', state: 'Uttar Pradesh', image: '/amit kumar.jpg' },
  { name: 'Varun', gender: 'Male', district: 'Barielly', state: 'Uttar Pradesh', image: '/varun.jpg' },
  { name: 'Pradeep Kumar Tripathi', gender: 'Male', district: 'Barielly', state: 'Uttar Pradesh', image: '/pradeep.jpg' },
  // New member
  { name: 'Sachin Mittal', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh', image: '/sachin mittal.jpg' },
  { name: 'Anil Kumar Gupta', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh', image: '/Anil.jpg' },
];

const sortedMembers = members.slice().sort((a, b) => a.name.localeCompare(b.name));

function getInitials(name) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
}

const Member = () => {
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedState, setSelectedState] = useState('');

  // Get unique districts and states for filter dropdowns
  const districts = Array.from(new Set(members.map(m => m.district))).sort();
  const states = Array.from(new Set(members.map(m => m.state))).sort();

  // Filter logic
  const filteredMembers = sortedMembers.filter(member => {
    const districtMatch = selectedDistrict ? member.district === selectedDistrict : true;
    const stateMatch = selectedState ? member.state === selectedState : true;
    return districtMatch && stateMatch;
  });

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Member List</h1>
        {/* Filter Box */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-center">
          <select
            className="border rounded px-3 py-2"
            value={selectedDistrict}
            onChange={e => setSelectedDistrict(e.target.value)}
          >
            <option value="">All Districts</option>
            {districts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
          <select
            className="border rounded px-3 py-2"
            value={selectedState}
            onChange={e => setSelectedState(e.target.value)}
          >
            <option value="">All States</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead>
              <tr>
                <th className="py-3 px-4 border-b text-left">Avatar</th>
                <th className="py-3 px-4 border-b text-left">Name</th>
                <th className="py-3 px-4 border-b text-left">Gender</th>
                <th className="py-3 px-4 border-b text-left">District</th>
                <th className="py-3 px-4 border-b text-left">State</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member, idx) => (
                <tr key={idx} className="hover:bg-gray-100">
                  <td className="py-2 px-4 border-b">
                    {member.image ? (
                      <img src={member.image} alt={member.name} className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold text-white ${member.gender === 'Female' ? 'bg-pink-500' : 'bg-indigo-500'}`}>
                        {getInitials(member.name)}
                      </div>
                    )}
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