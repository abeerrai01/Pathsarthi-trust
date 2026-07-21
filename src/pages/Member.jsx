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

const isPaid = (m) => {
  const s = (m.status || '').trim().toLowerCase();
  return s === 'completed' || s === 'paid';
};

const Member = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedState, setSelectedState] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const [membersSnap, membershipsSnap] = await Promise.all([
          getDocs(collection(db, 'members')),
          getDocs(collection(db, 'memberships')),
        ]);

        const fromMembers = membersSnap.docs.map(doc => ({
          id: doc.id,
          source: 'members',
          ...doc.data(),
        }));

        const fromMemberships = membershipsSnap.docs
          .map(doc => ({ id: doc.id, source: 'memberships', ...doc.data() }))
          .filter(isPaid)
          .map(m => ({
            ...m,
            // normalise fields to match members collection shape
            name: m.fullName || `${m.firstName || ''} ${m.middleName ? m.middleName + ' ' : ''}${m.lastName || ''}`.trim() || 'Unknown',
            district: m.district || m.city || '',
            state: m.state || '',
            gender: m.gender || '',
            image: m.profilePhotoUrl || m.image || null,
          }));

        // Normalise name: lowercase, trim, collapse spaces, remove punctuation
        const normName = (name) =>
          (name || '').toLowerCase().trim().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ');

        // Build seen sets from existing members collection
        const seenPhones = new Set(fromMembers.map(m => m.phone).filter(Boolean));
        const seenNames = new Set(fromMembers.map(m => normName(m.name)).filter(Boolean));

        const unique = fromMemberships.filter(m => {
          const phone = m.phone || '';
          const name = normName(m.name);
          // Skip if phone matches any existing member
          if (phone && seenPhones.has(phone)) return false;
          // Skip if normalised name matches any existing member
          if (name && seenNames.has(name)) return false;
          // Also deduplicate within memberships themselves
          if (phone) seenPhones.add(phone);
          if (name) seenNames.add(name);
          return true;
        });

        setMembers([...fromMembers, ...unique]);
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
        <h1 className="text-3xl font-bold mb-2 text-center">Member List</h1>
        <p className="text-center text-gray-500 mb-8 text-sm">
          Showing all registered members including paid membership holders
          {!loading && <span className="ml-1 font-semibold text-indigo-600">({filteredMembers.length} total)</span>}
        </p>
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
              <tr className="bg-indigo-50">
                <th className="py-3 px-4 border-b text-left">Avatar</th>
                <th className="py-3 px-4 border-b text-left">Name</th>
                <th className="py-3 px-4 border-b text-left">Gender</th>
                <th className="py-3 px-4 border-b text-left">District / City</th>
                <th className="py-3 px-4 border-b text-left">State</th>
                <th className="py-3 px-4 border-b text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">Loading members...</td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">No members found.</td>
                </tr>
              ) : (
                filteredMembers.map((member, idx) => (
                  <tr key={member.id || idx} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">
                      {member.image ? (
                        <img src={member.image} alt={member.name} className="h-12 w-12 rounded-full object-cover" />
                      ) : (
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold text-white ${member.gender === 'Female' ? 'bg-pink-500' : 'bg-indigo-500'}`}>
                          {getInitials(member.name)}
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b font-medium">{member.name}</td>
                    <td className="py-2 px-4 border-b">{member.gender || '—'}</td>
                    <td className="py-2 px-4 border-b">{member.district || '—'}</td>
                    <td className="py-2 px-4 border-b">{member.state || '—'}</td>
                    <td className="py-2 px-4 border-b">
                      {member.source === 'memberships' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                          ✓ Paid Member
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">
                          Member
                        </span>
                      )}
                    </td>
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