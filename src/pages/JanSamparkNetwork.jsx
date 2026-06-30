import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Briefcase, Users, Map } from 'lucide-react';

const JanSamparkNetwork = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedReference, setSelectedReference] = useState('All');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'jan_sampark'));
        const fetched = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          const s = (data.status || '').trim().toLowerCase();
          if (s === 'completed' || s === 'paid') {
            fetched.push({ id: doc.id, ...data });
          }
        });
        
        // Sort newest first
        fetched.sort((a, b) => {
          const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return bDate - aDate;
        });
        
        setMembers(fetched);
      } catch (err) {
        console.error("Error fetching jan_sampark:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  // Compute unique values for filter
  const allStates = Array.from(new Set(members.map(m => m.state).filter(Boolean))).sort();
  
  const availableDistricts = selectedState === 'All'
    ? Array.from(new Set(members.map(m => m.city).filter(Boolean))).sort()
    : Array.from(new Set(members.filter(m => m.state === selectedState).map(m => m.city).filter(Boolean))).sort();

  // Extract first name for reference grouping
  const getFirstName = (name) => {
    if (!name) return '';
    return name.trim().split(' ')[0];
  };

  const allReferences = Array.from(new Set(members.map(m => getFirstName(m.reference)).filter(Boolean))).sort();

  // Reset district if it's no longer available for the selected state
  useEffect(() => {
    if (selectedDistrict !== 'All' && !availableDistricts.includes(selectedDistrict)) {
      setSelectedDistrict('All');
    }
  }, [selectedState]);

  const filteredMembers = members.filter(m => {
    const matchState = selectedState === 'All' || m.state === selectedState;
    const matchDistrict = selectedDistrict === 'All' || m.city === selectedDistrict;
    const matchReference = selectedReference === 'All' || getFirstName(m.reference) === selectedReference;
    return matchState && matchDistrict && matchReference;
  });

  // Stats
  const totalMembers = members.length;
  const totalDistricts = new Set(members.map(m => m.city).filter(Boolean)).size;

  // Mask name: Show First Name + Last Initial (e.g. "Rahul K.")
  const formatName = (fullName) => {
    if (!fullName) return 'Unknown';
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0];
    const firstName = parts[0];
    const lastInitial = parts[parts.length - 1][0];
    return `${firstName} ${lastInitial}.`;
  };

  // Generate a random gradient color based on a string
  const getAvatarGradient = (str) => {
    const colors = [
      'from-blue-500 to-indigo-600',
      'from-emerald-400 to-teal-500',
      'from-orange-400 to-red-500',
      'from-pink-500 to-rose-500',
      'from-purple-500 to-fuchsia-600',
      'from-cyan-500 to-blue-500',
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  return (
    <div className="min-h-screen bg-geom-light font-jakarta pb-20 overflow-hidden relative">
      
      {/* Background Dots */}
      <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>

      {/* Hero Section */}
      <div className="pt-28 pb-16 md:pt-36 md:pb-24 px-4 relative flex flex-col items-center z-10">
        
        <div className="max-w-6xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10">
            <span className="inline-block px-5 py-2 bg-[#FBBF24] border-2 border-[#1E293B] rounded-full text-[#1E293B] font-bold text-sm uppercase tracking-widest mb-6 shadow-geom">
              Community Hub
            </span>
            <h1 className="text-5xl md:text-7xl font-outfit font-extrabold mb-6 leading-tight tracking-tight text-[#1E293B]">
              Our <span className="text-[#8B5CF6] underline decoration-dashed underline-offset-8">Community</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed mb-10">
              Meet the amazing people from across the country who have connected with PathSarthi Trust to spread hope, heal hearts, and serve humanity.
            </p>
          </motion.div>

          {/* Massive yellow circle decoration */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96 bg-[#FBBF24]/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>

          {/* Stats Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-6 mt-6"
          >
            <div className="bg-white rounded-2xl border-2 border-[#1E293B] shadow-geom-soft p-6 flex items-center gap-5 min-w-[220px]">
              <div className="w-16 h-16 rounded-full bg-[#8B5CF6] border-2 border-[#1E293B] shadow-geom text-white flex items-center justify-center shrink-0">
                <Users size={32} />
              </div>
              <div className="text-left">
                <div className="text-4xl font-outfit font-extrabold text-[#1E293B] tracking-tight">{loading ? '-' : totalMembers}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">People Joined</div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl border-2 border-[#1E293B] shadow-geom-soft p-6 flex items-center gap-5 min-w-[220px]">
              <div className="w-16 h-16 rounded-full bg-[#34D399] border-2 border-[#1E293B] shadow-geom text-[#1E293B] flex items-center justify-center shrink-0">
                <Map size={32} />
              </div>
              <div className="text-left">
                <div className="text-4xl font-outfit font-extrabold text-[#1E293B] tracking-tight">{loading ? '-' : totalDistricts}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Districts Reached</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 mt-4">
        
        {/* Filters */}
        <div className="bg-white rounded-2xl border-2 border-[#1E293B] shadow-geom-soft p-6 mb-10 relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-outfit font-bold text-slate-500 uppercase tracking-wide">State</label>
            <select 
              value={selectedState} 
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-4 py-3 geom-input h-auto text-base bg-[#F8FAFC]"
            >
              <option value="All">All States</option>
              {allStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-outfit font-bold text-slate-500 uppercase tracking-wide">District/City</label>
            <select 
              value={selectedDistrict} 
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-4 py-3 geom-input h-auto text-base bg-[#F8FAFC]"
            >
              <option value="All">All Districts</option>
              {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-outfit font-bold text-slate-500 uppercase tracking-wide">Reference</label>
            <select 
              value={selectedReference} 
              onChange={(e) => setSelectedReference(e.target.value)}
              className="w-full px-4 py-3 geom-input h-auto text-base bg-[#F8FAFC]"
            >
              <option value="All">All References</option>
              {allReferences.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Member Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-[#1E293B] shadow-geom-soft">
            <div className="w-24 h-24 bg-[#F1F5F9] border-2 border-[#1E293B] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Users size={40} className="text-[#1E293B]" />
            </div>
            <h3 className="text-3xl font-outfit font-extrabold text-[#1E293B]">No donors found</h3>
            <p className="text-lg font-medium text-slate-500 mt-2">Try selecting a different filter above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredMembers.map((member, i) => {
                const displayName = formatName(member.fullName);
                const initials = (displayName[0] || 'U').toUpperCase();
                const gradient = getAvatarGradient(member.id || displayName);

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    key={member.id}
                    className="bg-white rounded-2xl p-6 shadow-geom-soft hover:shadow-geom hover:-translate-y-1 transition-all duration-300 border-2 border-[#1E293B] group relative overflow-hidden flex flex-col items-center text-center"
                  >
                    {/* Decorative Blob */}
                    <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${gradient} rounded-full filter blur-xl opacity-20 group-hover:opacity-30 transition-opacity`}></div>

                    <div className="flex flex-col items-center text-center mt-2 w-full z-10">
                      <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${gradient} text-white flex items-center justify-center text-3xl font-outfit font-extrabold shadow-geom mb-4 border-2 border-[#1E293B]`}>
                        {initials}
                      </div>
                      
                      <h3 className="text-xl font-outfit font-bold text-[#1E293B] mb-2 line-clamp-1">{displayName}</h3>
                      
                      <div className="flex items-center gap-1.5 text-xs font-jakarta font-bold text-[#1E293B] bg-[#FBBF24] border-2 border-[#1E293B] shadow-sm rounded-full px-3 py-1 mb-5 uppercase tracking-wide">
                        <Briefcase size={12} strokeWidth={3} />
                        {member.employment || 'Donor'}
                      </div>

                      <div className="w-full border-t-2 border-dashed border-slate-200 mb-4"></div>

                      <div className="flex items-start justify-center gap-2 text-sm font-jakarta font-semibold text-slate-600 mb-4">
                        <MapPin size={16} className="shrink-0 mt-0.5 text-[#F472B6]" />
                        <span className="line-clamp-2 leading-snug">{member.city}, {member.state}</span>
                      </div>
                      
                      <div className="text-xs font-jakarta font-bold bg-[#F8FAFC] border-2 border-[#1E293B] rounded-lg shadow-sm py-2 px-3 w-full text-[#1E293B] mt-auto uppercase tracking-wider flex justify-between items-center">
                        <span className="text-slate-500">Ref:</span> 
                        <span className="font-bold font-outfit truncate">{getFirstName(member.reference) || 'None'}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
      
      {/* CTA Section */}
      <div className="max-w-4xl mx-auto mt-24 text-center px-4 relative z-20">
        <h3 className="text-4xl md:text-5xl font-outfit font-extrabold text-[#1E293B] mb-4 tracking-tight">Want to be part of the change?</h3>
        <p className="text-lg md:text-xl font-medium text-slate-600 mb-8 max-w-xl mx-auto">Join the Jan Sampark Abhiyan and connect with thousands of like-minded individuals working towards a better tomorrow.</p>
        <a href="/jan-sampark" className="candy-btn candy-btn-primary px-10 py-5 text-xl shadow-geom inline-block">
          Join Jan Sampark Today
        </a>
      </div>

    </div>
  );
};

export default JanSamparkNetwork;
