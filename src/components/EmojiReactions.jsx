import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJIS = ["❤️", "😍", "😂", "😢", "😮", "💪"];

const EmojiReactions = ({ show, onSelect, onClose, anchorRef, selectedEmoji }) => {
  if (!show) return null;
  // Position bar above anchorRef if provided, else center on mobile
  let style = { position: 'absolute', zIndex: 50 };
  if (anchorRef && anchorRef.current) {
    const rect = anchorRef.current.getBoundingClientRect();
    style.left = rect.left + rect.width / 2;
    style.top = rect.top - 60;
    style.transform = 'translate(-50%, 0)';
    // On mobile, use fixed and center
    if (window.innerWidth < 640) {
      style = {
        position: 'fixed',
        left: '50vw',
        top: Math.max(rect.top - 80, 16),
        transform: 'translateX(-50%)',
        zIndex: 9999,
        width: 'max-content',
        maxWidth: '96vw',
        margin: '0 auto',
      };
    }
  } else if (window.innerWidth < 640) {
    style = {
      position: 'fixed',
      left: '50vw',
      top: 16,
      transform: 'translateX(-50%)',
      zIndex: 9999,
      width: 'max-content',
      maxWidth: '96vw',
      margin: '0 auto',
    };
  }
  return (
    <AnimatePresence>
      <motion.div
        key="emoji-bar"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        style={style}
        className="flex gap-3 bg-white shadow-lg rounded-full px-4 py-2 border border-orange-200"
        onMouseLeave={onClose}
      >
        {EMOJIS.map((emoji) => (
          <motion.button
            key={emoji}
            whileTap={{ scale: 1.4 }}
            whileHover={{ scale: 1.2 }}
            onClick={() => onSelect(emoji)}
            className="text-2xl focus:outline-none"
            style={{
              filter: selectedEmoji === emoji ? 'drop-shadow(0 0 8px #f37735)' : undefined,
              transition: 'filter 0.2s',
            }}
          >
            {emoji}
          </motion.button>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

export default EmojiReactions; 