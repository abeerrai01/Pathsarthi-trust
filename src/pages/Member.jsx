import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

function getInitials(name) {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

const Member = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedState, setSelectedState] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'members'));
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMembers(fetched);
      } catch (err) {
        console.error("Error fetching members:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const sortedMembers = members.slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  // Get unique districts and states for filter dropdowns
  const districts = Array.from(new Set(members.map(m => m.district).filter(Boolean))).sort();
  const states = Array.from(new Set(members.map(m => m.state).filter(Boolean))).sort();

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
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">Loading members...</td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">No members found.</td>
                </tr>
              ) : (
                filteredMembers.map((member, idx) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Member; 