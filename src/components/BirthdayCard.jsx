import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Sparkles, Gift, Heart, PartyPopper } from 'lucide-react';

const BirthdayCard = () => {
  const [birthdayMembers, setBirthdayMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBirthdayMembers = async () => {
      try {
        const now = new Date();
        const todayMonth = now.getMonth() + 1; // 1-12
        const todayDay = now.getDate(); // 1-31

        const parseDob = (dob) => {
          if (!dob) return null;
          // Firestore Timestamp
          if (typeof dob?.toDate === 'function') {
            const d = dob.toDate();
            return { month: d.getMonth() + 1, day: d.getDate() };
          }
          const str = String(dob).trim();
          // YYYY-MM-DD
          const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
          if (isoMatch) {
            return { month: parseInt(isoMatch[2], 10), day: parseInt(isoMatch[3], 10) };
          }
          // DD/MM/YYYY or DD-MM-YYYY
          const indMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
          if (indMatch) {
            return { month: parseInt(indMatch[2], 10), day: parseInt(indMatch[1], 10) };
          }
          return null;
        };

        const snapshot = await getDocs(collection(db, 'memberships'));
        const matched = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          const parsed = parseDob(data.dob || data.dateOfBirth || data.birthdate);
          if (parsed && parsed.month === todayMonth && parsed.day === todayDay) {
            let name = data.fullName;
            if (!name && data.firstName) {
              name = `${data.firstName} ${data.lastName || ''}`.trim();
            }
            matched.push({
              id: doc.id,
              name: name || 'Valued Member',
              email: data.email || '',
              city: data.city || data.state || 'Moradabad',
            });
          }
        });

        setBirthdayMembers(matched);
      } catch (err) {
        console.error('[BirthdayCard] Error fetching members:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBirthdayMembers();
  }, []);

  // Demo fallback member if no DB record matches today (ensures card design is previewable)
  const displayMembers = birthdayMembers.length > 0 ? birthdayMembers : [
    {
      id: 'demo-bday',
      name: 'PathSarthi Champion',
      city: 'Community Member',
      isDemo: true,
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 25, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mt-12 max-w-4xl mx-auto px-4"
    >
      <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-amber-500 via-rose-500 to-purple-600 p-[3px]">
        {/* Card Inner Content */}
        <div className="bg-slate-900/95 backdrop-blur-xl rounded-[22px] p-6 sm:p-10 text-white relative overflow-hidden">
          {/* Background Decorative Emojis & Glow Effects */}
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Floating Emoji Decorative Watermarks */}
          <span className="absolute top-3 right-6 text-4xl opacity-20 pointer-events-none select-none">🎈</span>
          <span className="absolute bottom-4 left-6 text-4xl opacity-20 pointer-events-none select-none">🎂</span>

          {/* Header Title Badge */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 font-black text-xs uppercase tracking-widest flex items-center gap-1.5 shadow-md">
              <PartyPopper size={15} />
              Happy Birthday Today!
              <Sparkles size={15} />
            </span>
          </div>

          {/* Birthday Persons List / Cards */}
          <div className="space-y-6">
            {displayMembers.map((member) => (
              <div key={member.id} className="text-center space-y-4">
                {/* Avatar with Animated Ring */}
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-rose-400 to-purple-400 mx-auto shadow-xl animate-pulse">
                    <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-3xl font-extrabold text-amber-300">
                      {member.name.charAt(0)}
                    </div>
                  </div>
                  <span className="absolute -bottom-1 -right-1 text-2xl">🎂</span>
                </div>

                {/* Member Name & Wishes */}
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-200 to-purple-200">
                    Wishing {member.name} a Very Happy Birthday! 🎉
                  </h3>
                  <p className="text-xs uppercase tracking-wider font-semibold text-rose-300 mt-1">
                    Warmest Wishes from PathSarthi Trust Team 💖
                  </p>
                </div>

                {/* Card Message Body */}
                <div className="max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
                  <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed">
                    "On your special day, the entire <strong className="text-amber-300 font-bold">PathSarthi Trust family</strong> sends you our warmest birthday wishes! 🎂✨ Thank you for being a valued part of our community and supporting social welfare & empowerment. May your day be filled with joy, prosperity, good health, and wonderful memories! 🥳🎈🌟"
                  </p>
                </div>

                {/* Wishes Tags */}
                <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold pt-2">
                  <span className="bg-rose-500/20 text-rose-200 border border-rose-400/30 px-3 py-1 rounded-full flex items-center gap-1">
                    <Heart size={13} className="text-rose-400 fill-rose-400" /> Hope & Joy
                  </span>
                  <span className="bg-amber-500/20 text-amber-200 border border-amber-400/30 px-3 py-1 rounded-full flex items-center gap-1">
                    <Gift size={13} className="text-amber-400" /> Success & Health
                  </span>
                  <span className="bg-purple-500/20 text-purple-200 border border-purple-400/30 px-3 py-1 rounded-full flex items-center gap-1">
                    <Sparkles size={13} className="text-purple-300" /> PathSarthi Family
                  </span>
                </div>

                {member.isDemo && (
                  <p className="text-[10px] text-slate-400 pt-2 italic">
                    (Note: Members with a birthday matching today's date in the membership database are automatically showcased here!)
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BirthdayCard;
