import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

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
          // ISO YYYY-MM-DD
          const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
          if (isoMatch) {
            return { month: parseInt(isoMatch[2], 10), day: parseInt(isoMatch[3], 10) };
          }
          // Indian DD/MM/YYYY or DD-MM-YYYY
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
            const photo =
              data.profilePhotoUrl ||
              data.photoUrl ||
              data.photo ||
              data.image ||
              data.avatarUrl ||
              null;

            matched.push({
              id: doc.id,
              name: name || 'Valued Member',
              email: data.email || '',
              photo,
              city: data.city || data.state || 'Moradabad',
            });
          }
        });

        setBirthdayMembers(matched);
      } catch (err) {
        console.error('[BirthdayCard] Error fetching birthday members:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBirthdayMembers();
  }, []);

  // Demo fallback member if no DB record matches today (ensures card design is previewable)
  const displayMembers =
    birthdayMembers.length > 0
      ? birthdayMembers
      : [
          {
            id: 'demo-bday',
            name: 'PathSarthi Member',
            photo: null,
            city: 'Path Sarthi Trust',
            isDemo: true,
          },
        ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mt-12 max-w-3xl mx-auto px-4"
    >
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm text-slate-800 relative overflow-hidden text-center space-y-6">
        {/* Minimal Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold">
          <span>🎂 Birthday Celebration</span>
        </div>

        {/* Member Birthday Cards */}
        <div className="space-y-6">
          {displayMembers.map((member) => (
            <div key={member.id} className="space-y-4">
              {/* Profile Image / Avatar */}
              <div className="flex justify-center">
                {member.photo ? (
                  <div className="relative">
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-slate-50 shadow-sm"
                    />
                    <span className="absolute bottom-0 right-0 text-xl">🎉</span>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-100 text-slate-700 font-bold text-3xl flex items-center justify-center border-4 border-slate-50 shadow-xs">
                      {member.name.charAt(0)}
                    </div>
                    <span className="absolute bottom-0 right-0 text-xl">🎉</span>
                  </div>
                )}
              </div>

              {/* Header Wishes */}
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Happy Birthday, {member.name}! 🎉
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  Warmest wishes from the PathSarthi Trust Team
                </p>
              </div>

              {/* Minimal Wish Message Box */}
              <div className="max-w-xl mx-auto bg-slate-50/80 border border-slate-100 rounded-2xl p-4 text-slate-600 text-sm leading-relaxed">
                "On behalf of the entire PathSarthi Trust family, we wish you a joyful, healthy, and blessed birthday! 🌟 Thank you for being a part of our journey and supporting community welfare. May your day be filled with warm smiles and sweet moments! 🎂🎈✨"
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default BirthdayCard;
