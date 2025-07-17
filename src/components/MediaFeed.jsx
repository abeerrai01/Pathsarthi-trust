import React, { useEffect, useState, useRef } from 'react';
import { db } from '../config/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getCountFromServer, deleteDoc, getDocs } from 'firebase/firestore';
import { getFingerprint } from '../utils/fingerprint';
import { Link } from 'react-router-dom';
import EmojiReactions from './EmojiReactions';
import { motion } from 'framer-motion';

const MediaFeed = ({ isAdmin }) => {
  const [photos, setPhotos] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [emojiBarPhotoId, setEmojiBarPhotoId] = useState(null);
  const [popEmoji, setPopEmoji] = useState({}); // { [photoId]: emoji }
  const emojiAnchorRefs = useRef({});

  useEffect(() => {
    const q = query(collection(db, 'galleryFeed'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, async (snapshot) => {
      const data = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const commentsSnap = await getCountFromServer(collection(db, 'galleryFeed', docSnap.id, 'comments'));
        return {
          id: docSnap.id,
          ...docSnap.data(),
          commentCount: commentsSnap.data().count || 0,
        };
      }));
      setPhotos(data);
    });
    return () => unsub();
  }, []);

  // Handle tap (quick ❤️) or long-press (emoji bar)
  const handleReaction = async (photo, emoji) => {
    const fingerprint = await getFingerprint();
    const ref = doc(db, 'galleryFeed', photo.id);
    // Remove previous reaction if any
    const prevEmoji = photo.reactedUsers?.[fingerprint];
    let newReactions = { ...photo.reactions };
    let newReactedUsers = { ...photo.reactedUsers };
    if (prevEmoji) {
      newReactions[prevEmoji] = (newReactions[prevEmoji] || 1) - 1;
      if (newReactions[prevEmoji] <= 0) delete newReactions[prevEmoji];
    }
    newReactions[emoji] = (newReactions[emoji] || 0) + 1;
    newReactedUsers[fingerprint] = emoji;
    await updateDoc(ref, {
      reactions: newReactions,
      reactedUsers: newReactedUsers,
    });
    setPopEmoji(pe => ({ ...pe, [photo.id]: emoji }));
    setTimeout(() => setPopEmoji(pe => ({ ...pe, [photo.id]: null })), 900);
  };

  // Long-press logic
  const longPressTimeout = useRef();
  const handlePressStart = (photoId) => {
    longPressTimeout.current = setTimeout(() => setEmojiBarPhotoId(photoId), 400);
  };
  const handlePressEnd = (photo, isTap = false) => {
    clearTimeout(longPressTimeout.current);
    if (isTap) handleReaction(photo, '❤️');
  };

  // Dominant emoji and total count
  const getDominantEmoji = (reactions = {}) => {
    let max = 0, emoji = '❤️', total = 0;
    Object.entries(reactions).forEach(([k, v]) => {
      total += v;
      if (v > max) { max = v; emoji = k; }
    });
    return { emoji, total };
  };

  const handleShare = (photoId) => {
    const url = `${window.location.origin}/media/photo/${photoId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(photoId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleDelete = async (photoId) => {
    const confirm = window.confirm("Are you sure you want to delete this media?");
    if (!confirm) return;
    try {
      // Delete all comments in subcollection
      const commentsRef = collection(db, 'galleryFeed', photoId, 'comments');
      const commentsSnap = await getDocs(commentsRef);
      const deletions = commentsSnap.docs.map(docSnap => deleteDoc(doc(db, 'galleryFeed', photoId, 'comments', docSnap.id)));
      await Promise.all(deletions);
      // Delete the photo doc
      await deleteDoc(doc(db, 'galleryFeed', photoId));
      setPhotos(prev => prev.filter(photo => photo.id !== photoId));
      alert('Photo deleted successfully ✅');
    } catch (err) {
      console.error('Error deleting photo:', err);
      alert('Something went wrong ❌');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-2 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">Path Sarthi Media Feed</h1>
      {photos.length === 0 && <div className="text-center text-gray-500">No media yet.</div>}
      {photos.map(photo => {
        const { emoji, total } = getDominantEmoji(photo.reactions);
        const anchorRef = emojiAnchorRefs.current[photo.id] || (emojiAnchorRefs.current[photo.id] = React.createRef());
        return (
          <div key={photo.id} className="bg-white rounded-xl shadow p-4 flex flex-col items-center relative" style={{ borderColor: '#fbc9a6' }}>
            <div
              ref={anchorRef}
              className="w-full max-w-md rounded-lg object-cover mb-4 shadow relative overflow-hidden"
              style={{ maxHeight: 400, background: '#fffafa' }}
              onPointerDown={() => handlePressStart(photo.id)}
              onPointerUp={() => handlePressEnd(photo, true)}
              onPointerLeave={() => handlePressEnd(photo, false)}
              onContextMenu={e => e.preventDefault()}
            >
              <img
                src={photo.imageUrl}
                alt={photo.heading}
                loading="lazy"
                className="w-full h-full rounded-lg object-cover"
                style={{ maxHeight: 400 }}
              />
              {/* Emoji pop animation */}
              {popEmoji[photo.id] && (
                <motion.div
                  initial={{ scale: 0, y: 40, opacity: 0 }}
                  animate={{ scale: 1.6, y: -30, opacity: 1 }}
                  exit={{ scale: 0, y: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="absolute left-1/2 top-1/2 text-5xl pointer-events-none"
                  style={{ transform: 'translate(-50%, -50%)' }}
                >
                  {popEmoji[photo.id]}
                </motion.div>
              )}
              {/* Emoji bar */}
              <EmojiReactions
                show={emojiBarPhotoId === photo.id}
                onSelect={e => { handleReaction(photo, e); setEmojiBarPhotoId(null); }}
                onClose={() => setEmojiBarPhotoId(null)}
                anchorRef={anchorRef}
                selectedEmoji={photo.reactedUsers && photo.reactedUsers[photo.id]}
              />
            </div>
            <div className="text-lg font-semibold mb-2 text-center" style={{ color: '#f37735' }}>{photo.heading}</div>
            <div className="flex gap-6 items-center mb-2">
              <button
                className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium hover:bg-orange-100"
                style={{ color: '#f37735' }}
                onClick={() => handleReaction(photo, '❤️')}
                onPointerDown={() => handlePressStart(photo.id)}
                onPointerUp={() => handlePressEnd(photo, true)}
                onPointerLeave={() => handlePressEnd(photo, false)}
              >
                <span role="img" aria-label="like" className="text-xl">{emoji}</span> {total}
              </button>
              <Link to={`/media/photo/${photo.id}`} className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium hover:bg-accent-100" style={{ color: '#00bcd4' }}>
                <span role="img" aria-label="comments">💬</span> {photo.commentCount}
              </Link>
              <button
                className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium hover:bg-accent-100"
                style={{ color: '#00bcd4' }}
                onClick={() => handleShare(photo.id)}
              >
                <span role="img" aria-label="share">🔗</span> {copiedId === photo.id ? 'Copied!' : 'Share'}
              </button>
            </div>
            {isAdmin && (
              <button
                onClick={() => handleDelete(photo.id)}
                className="bg-red-500 text-white px-3 py-1 rounded mt-2"
              >
                Delete
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MediaFeed; 