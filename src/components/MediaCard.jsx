import React, { useRef, useState } from 'react';
import { db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { getFingerprint } from '../utils/fingerprint';
import CommentModal from './CommentModal';
import { motion } from 'framer-motion';

const MediaCard = ({ photo, isDark }) => {
  const [copied, setCopied] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [popEmoji, setPopEmoji] = useState(null);
  const likeBtnRef = useRef();

  // Dominant emoji and total count
  const getDominantEmoji = (reactions = {}) => {
    let max = 0, emoji = '❤️', total = 0;
    Object.entries(reactions).forEach(([k, v]) => {
      total += v;
      if (v > max) { max = v; emoji = k; }
    });
    return { emoji, total };
  };
  const { emoji, total } = getDominantEmoji(photo.reactions);

  // Like (❤️) logic
  const handleLike = async () => {
    const fingerprint = await getFingerprint();
    const ref = doc(db, 'galleryFeed', photo.id);
    const prevEmoji = photo.reactedUsers?.[fingerprint];
    let newReactions = { ...photo.reactions };
    let newReactedUsers = { ...photo.reactedUsers };
    if (prevEmoji) {
      newReactions[prevEmoji] = (newReactions[prevEmoji] || 1) - 1;
      if (newReactions[prevEmoji] <= 0) delete newReactions[prevEmoji];
    }
    newReactions['❤️'] = (newReactions['❤️'] || 0) + 1;
    newReactedUsers[fingerprint] = '❤️';
    await updateDoc(ref, {
      reactions: newReactions,
      reactedUsers: newReactedUsers,
    });
    setPopEmoji('❤️');
    setTimeout(() => setPopEmoji(null), 900);
  };

  // Share logic
  const handleShare = () => {
    const url = `https://pathsarthi.in/media?id=${photo.id}`;
    if (navigator.share) {
      navigator.share({ url });
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  // Icon animation classes
  const iconBase = 'transition-transform duration-150';
  const iconHover = 'hover:scale-125 active:scale-90';

  return (
    <div
      className={`border-4 rounded-2xl shadow-md p-4 flex flex-col items-center ${isDark ? 'bg-[#232323] border-[#fcd8b1]' : 'bg-white border-[#fcd8b1]'} group`}
      style={{ minHeight: 340 }}
    >
      <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 border-2 border-[#fcd8b1]">
        <img
          src={photo.imageUrl}
          alt={photo.heading}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          style={{ background: isDark ? '#232323' : '#fff' }}
        />
        {popEmoji && (
          <motion.div
            initial={{ scale: 0, y: 40, opacity: 0 }}
            animate={{ scale: 1.6, y: -30, opacity: 1 }}
            exit={{ scale: 0, y: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="absolute left-1/2 top-1/2 text-5xl pointer-events-none"
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            {popEmoji}
          </motion.div>
        )}
      </div>
      <div className={`font-bold text-center text-lg mb-2 ${isDark ? 'text-white' : 'text-[#f47920]'}`}>{photo.heading}</div>
      <div className="flex gap-8 items-center mt-auto w-full justify-center">
        <button
          ref={likeBtnRef}
          className={`flex items-center gap-1 px-3 py-1 rounded-full font-medium ${iconBase} ${iconHover}`}
          style={{ color: '#f47920' }}
          onClick={handleLike}
        >
          <span role="img" aria-label="like" className="text-xl">{emoji}</span> {total}
        </button>
        <button
          className={`flex items-center gap-1 px-3 py-1 rounded-full font-medium ${iconBase} ${iconHover}`}
          style={{ color: '#00a9b7' }}
          onClick={() => setShowComments(true)}
        >
          <span role="img" aria-label="comments" className="text-xl">💬</span> {photo.commentCount || 0}
        </button>
        <button
          className={`flex items-center gap-1 px-3 py-1 rounded-full font-medium ${iconBase} ${iconHover}`}
          style={{ color: '#00a9b7' }}
          onClick={handleShare}
        >
          <span role="img" aria-label="share" className="text-xl">🔗</span> {copied ? 'Copied!' : 'Share'}
        </button>
      </div>
      <CommentModal open={showComments} onClose={() => setShowComments(false)} photoId={photo.id} isDark={isDark} />
    </div>
  );
};

export default MediaCard; 