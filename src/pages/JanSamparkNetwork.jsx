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
    <div className="min-h-screen bg-paper font-patrick pb-20 overflow-hidden">
      
      {/* Hero Section */}
      <div className="pt-28 pb-16 md:pt-36 md:pb-24 px-4 relative overflow-hidden flex flex-col items-center">
        {/* Engaging Overlay Illustration (Optional but fun) */}
        
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block px-4 py-1.5 bg-[#fff9c4] border-[3px] border-[#2d2d2d] wobbly-sm text-[#2d2d2d] font-bold text-lg uppercase tracking-widest mb-6 shadow-[2px_2px_0_#2d2d2d] rotate-2">
              Community Hub
            </span>
            <h1 className="text-5xl md:text-7xl font-kalam font-bold mb-6 leading-tight tracking-tight text-[#2d2d2d] -rotate-1">
              Our <span className="text-[#ff4d4d] underline decoration-dashed underline-offset-8">Community</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#2d2d2d] max-w-2xl mx-auto font-bold leading-relaxed mb-10">
              Meet the amazing people from across the country who have connected with PathSarthi Trust to spread hope, heal hearts, and serve humanity.
            </p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 md:gap-8 mt-6"
          >
            <div className="bg-white wobbly-sm border-[3px] border-[#2d2d2d] shadow-hard p-4 md:p-6 flex items-center gap-4 min-w-[200px] rotate-1">
              <div className="w-14 h-14 rounded-full bg-[#ff4d4d] border-[3px] border-[#2d2d2d] shadow-[2px_2px_0_#2d2d2d] text-white flex items-center justify-center shrink-0">
                <Users size={28} />
              </div>
              <div className="text-left">
                <div className="text-4xl font-kalam font-bold text-[#2d2d2d]">{loading ? '-' : totalMembers}</div>
                <div className="text-sm font-bold text-[#2d2d2d] uppercase tracking-widest mt-1">People Joined</div>
              </div>
            </div>
            
            <div className="bg-white wobbly-sm border-[3px] border-[#2d2d2d] shadow-hard p-4 md:p-6 flex items-center gap-4 min-w-[200px] -rotate-2">
              <div className="w-14 h-14 rounded-full bg-[#2d5da1] border-[3px] border-[#2d2d2d] shadow-[2px_2px_0_#2d2d2d] text-white flex items-center justify-center shrink-0">
                <Map size={28} />
              </div>
              <div className="text-left">
                <div className="text-4xl font-kalam font-bold text-[#2d2d2d]">{loading ? '-' : totalDistricts}</div>
                <div className="text-sm font-bold text-[#2d2d2d] uppercase tracking-widest mt-1">Districts Reached</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 mt-4">
        
        {/* Filters */}
        <div className="bg-white wobbly-md border-[3px] border-[#2d2d2d] shadow-hard p-3 md:p-4 mb-10 overflow-x-auto custom-scrollbar flex gap-3 -rotate-1 relative z-10">
          <div className="thumbtack"></div>
          {statesList.map(state => (
            <button
              key={state}
              onClick={() => setSelectedState(state)}
              className={`whitespace-nowrap px-6 py-2.5 wobbly-sm font-patrick font-bold text-lg transition-all border-2 ${
                selectedState === state
                  ? 'bg-[#ff4d4d] text-white border-[#2d2d2d] shadow-[2px_2px_0_#2d2d2d]'
                  : 'bg-white text-[#2d2d2d] border-transparent hover:border-[#2d2d2d] hover:shadow-[2px_2px_0_#2d2d2d]'
              }`}
            >
              {state}
            </button>
          ))}
        </div>

        {/* Member Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-[4px] border-[#2d2d2d] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-20 bg-white wobbly-md border-[3px] border-[#2d2d2d] shadow-hard rotate-1">
            <div className="w-20 h-20 bg-[#fff9c4] border-[3px] border-[#2d2d2d] wobbly-sm flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0_#2d2d2d] -rotate-2">
              <Users size={36} className="text-[#2d2d2d]" />
            </div>
            <h3 className="text-3xl font-kalam font-bold text-[#2d2d2d]">No members found</h3>
            <p className="text-lg font-patrick font-bold text-[#2d2d2d]/70 mt-2">Try selecting a different state from the filter above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredMembers.map((member, i) => {
                const displayName = formatName(member.fullName);
                const initials = (displayName[0] || 'U').toUpperCase();
                const gradient = getAvatarGradient(member.id || displayName);

                // Random rotation for each card to look like scattered paper
                const rotationClasses = ['-rotate-1', 'rotate-1', '-rotate-2', 'rotate-2'];
                const randomRotate = rotationClasses[i % rotationClasses.length];

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    key={member.id}
                    className={`bg-white wobbly-md p-6 shadow-hard hover:shadow-hard-hover transition-all border-[3px] border-[#2d2d2d] group relative overflow-hidden flex flex-col items-center text-center ${randomRotate}`}
                  >
                    <div className="tape-strip"></div>
                    
                    {/* Decorative Blob */}
                    <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${gradient} rounded-full mix-blend-multiply filter blur-2xl opacity-10 group-hover:opacity-20 transition-opacity`}></div>

                    <div className="flex flex-col items-center text-center mt-2 w-full">
                      <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${gradient} text-white flex items-center justify-center text-4xl font-kalam font-bold shadow-[4px_4px_0_#2d2d2d] mb-4 border-[3px] border-[#2d2d2d]`}>
                        {initials}
                      </div>
                      
                      <h3 className="text-2xl font-kalam font-bold text-[#2d2d2d] mb-1 line-clamp-1">{displayName}</h3>
                      
                      <div className="flex items-center gap-1.5 text-sm font-patrick font-bold text-[#2d2d2d] bg-[#fff9c4] border-2 border-[#2d2d2d] shadow-[2px_2px_0_#2d2d2d] px-3 py-1.5 wobbly-sm mb-4">
                        <Briefcase size={14} className="text-[#ff4d4d]" />
                        {member.employment || 'Member'}
                      </div>

                      <div className="w-full border-t-2 border-dashed border-[#2d2d2d]/30 mb-4"></div>

                      <div className="flex items-start justify-center gap-2 text-lg font-patrick font-bold text-[#2d2d2d] mb-3">
                        <MapPin size={18} className="shrink-0 mt-0.5 text-[#ff4d4d]" />
                        <span className="line-clamp-2 leading-snug">{member.city}, {member.state}</span>
                      </div>
                      
                      <div className="text-sm font-patrick font-bold bg-[#e5e0d8] border-2 border-[#2d2d2d] wobbly-sm shadow-[2px_2px_0_#2d2d2d] py-2 px-3 w-full text-[#2d2d2d] mt-auto">
                        <span className="text-[#2d5da1]">Ref:</span> {member.reference || 'Direct'}
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
        <h3 className="text-4xl font-kalam font-bold text-[#2d2d2d] mb-4 rotate-1">Want to be part of the change?</h3>
        <p className="text-xl font-patrick font-bold text-[#2d2d2d] mb-8 max-w-xl mx-auto -rotate-1">Join the Jan Sampark Abhiyan and connect with thousands of like-minded individuals working towards a better tomorrow.</p>
        <a href="/jan-sampark" className="inline-block px-8 py-4 bg-white border-[3px] border-[#2d2d2d] wobbly-sm text-[#2d2d2d] font-patrick font-bold text-2xl shadow-hard shadow-hard-hover transition-all hover:bg-[#ff4d4d] hover:text-white rotate-2">
          Join Jan Sampark Today
        </a>
      </div>

    </div>
  );
};

export default JanSamparkNetwork;
