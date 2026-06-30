import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Briefcase, Users, Map } from 'lucide-react';

const JanSamparkNetwork = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState('All');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'jan_sampark'));
        const fetched = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.status === 'completed' || data.status === 'paid') {
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

  // Compute unique states for filter
  const allStates = Array.from(new Set(members.map(m => m.state).filter(Boolean))).sort();
  const statesList = ['All', ...allStates];

  const filteredMembers = selectedState === 'All' 
    ? members 
    : members.filter(m => m.state === selectedState);

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
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-700 via-blue-800 to-indigo-900 text-white py-16 md:py-24 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-[100px] opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-overlay filter blur-[80px] opacity-30"></div>
        
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block px-4 py-1.5 bg-indigo-500/30 border border-indigo-400/30 rounded-full text-indigo-100 font-bold text-xs uppercase tracking-widest mb-6 backdrop-blur-sm">
              Community Hub
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">Community</span>
            </h1>
            <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto font-medium leading-relaxed mb-10">
              Meet the amazing people from across the country who have connected with PathSarthi Trust to spread hope, heal hearts, and serve humanity.
            </p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 md:gap-8"
          >
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 flex items-center gap-4 min-w-[200px]">
              <div className="w-12 h-12 rounded-full bg-orange-400 text-white flex items-center justify-center shrink-0">
                <Users size={24} />
              </div>
              <div className="text-left">
                <div className="text-3xl font-black">{loading ? '-' : totalMembers}</div>
                <div className="text-xs text-indigo-200 font-bold uppercase tracking-widest mt-1">People Joined</div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 flex items-center gap-4 min-w-[200px]">
              <div className="w-12 h-12 rounded-full bg-emerald-400 text-white flex items-center justify-center shrink-0">
                <Map size={24} />
              </div>
              <div className="text-left">
                <div className="text-3xl font-black">{loading ? '-' : totalDistricts}</div>
                <div className="text-xs text-indigo-200 font-bold uppercase tracking-widest mt-1">Districts Reached</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-2 md:p-3 mb-10 overflow-x-auto custom-scrollbar flex gap-2">
          {statesList.map(state => (
            <button
              key={state}
              onClick={() => setSelectedState(state)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                selectedState === state
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {state}
            </button>
          ))}
        </div>

        {/* Member Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700">No members found</h3>
            <p className="text-slate-500 mt-2">Try selecting a different state from the filter above.</p>
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
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    key={member.id}
                    className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-shadow border border-slate-100 group relative overflow-hidden"
                  >
                    {/* Decorative Blob */}
                    <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${gradient} rounded-full mix-blend-multiply filter blur-2xl opacity-10 group-hover:opacity-20 transition-opacity`}></div>

                    <div className="flex flex-col items-center text-center">
                      <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${gradient} text-white flex items-center justify-center text-3xl font-black shadow-lg mb-4 ring-4 ring-white`}>
                        {initials}
                      </div>
                      
                      <h3 className="text-lg font-black text-slate-800 mb-1 line-clamp-1">{displayName}</h3>
                      
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full mb-4">
                        <Briefcase size={12} />
                        {member.employment || 'Member'}
                      </div>

                      <div className="w-full h-px bg-slate-100 mb-4"></div>

                      <div className="flex items-start justify-center gap-2 text-sm font-medium text-slate-500 mb-3">
                        <MapPin size={16} className="shrink-0 mt-0.5 text-slate-400" />
                        <span className="line-clamp-2 leading-snug">{member.city}, {member.state}</span>
                      </div>
                      
                      <div className="text-xs bg-slate-50 border border-slate-100 rounded-lg py-2 px-3 w-full text-slate-500 mt-auto">
                        <span className="font-semibold">Ref:</span> {member.reference || 'Direct'}
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
      <div className="max-w-4xl mx-auto mt-24 text-center px-4">
        <h3 className="text-2xl font-black text-slate-800 mb-4">Want to be part of the change?</h3>
        <p className="text-slate-600 mb-8 max-w-xl mx-auto">Join the Jan Sampark Abhiyan and connect with thousands of like-minded individuals working towards a better tomorrow.</p>
        <a href="/jan-sampark" className="inline-block px-8 py-4 bg-[#ff7300] hover:bg-orange-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-orange-200 transition-all hover:-translate-y-1">
          Join Jan Sampark Today
        </a>
      </div>

    </div>
  );
};

export default JanSamparkNetwork;
