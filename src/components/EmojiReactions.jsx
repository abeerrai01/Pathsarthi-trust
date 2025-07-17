import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJIS = ["❤️", "😍", "😂", "😢", "😮", "💪"];

const EmojiReactions = ({ show, onSelect, onClose, anchorRef, selectedEmoji }) => {
  if (!show) return null;
  // Render the emoji bar inside the card, above the reaction row
  return (
    <AnimatePresence>
      <motion.div
        key="emoji-bar"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="flex gap-3 bg-white shadow-lg rounded-full px-4 py-2 border border-orange-200 mb-2 mx-auto"
        style={{ position: 'relative', zIndex: 10, width: 'max-content', maxWidth: '96vw' }}
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