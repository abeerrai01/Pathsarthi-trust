import React, { useEffect, useState, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getCountFromServer } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getFingerprint } from '../utils/fingerprint';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import CommentModal from './CommentModal';
import EmojiReactions from './EmojiReactions';
import { motion } from 'framer-motion';

const MediaFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [emojiBarPhotoId, setEmojiBarPhotoId] = useState(null);
  const [popEmoji, setPopEmoji] = useState({}); // { [photoId]: emoji }
  const [showCommentsId, setShowCommentsId] = useState(null);
  const emojiAnchorRefs = useRef({});
  const [commentCounts, setCommentCounts] = useState({});

  useEffect(() => {
    const q = query(collection(db, 'galleryFeed'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, async (snapshot) => {
      const data = await Promise.all(snapshot.docs.map(async (docSnap) => {
        // Get comment count for each post
        const commentsSnap = await getCountFromServer(collection(db, 'galleryFeed', docSnap.id, 'comments'));
        setCommentCounts(prev => ({ ...prev, [docSnap.id]: commentsSnap.data().count || 0 }));
        return {
          id: docSnap.id,
          ...docSnap.data(),
        };
      }));
      setPosts(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Like (❤️) logic
  const handleLike = async (post) => {
    const fingerprint = await getFingerprint();
    const ref = doc(db, 'galleryFeed', post.id);
    const prevEmoji = post.reactedUsers?.[fingerprint];
    let newReactions = { ...post.reactions };
    let newReactedUsers = { ...post.reactedUsers };
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
    setPosts(prevPosts => prevPosts.map(p => p.id === post.id ? { ...p, reactions: newReactions, reactedUsers: newReactedUsers } : p));
    setPopEmoji(pe => ({ ...pe, [post.id]: '❤️' }));
    setTimeout(() => setPopEmoji(pe => ({ ...pe, [post.id]: null })), 900);
  };

  // Emoji reaction logic
  const handleReaction = async (post, emoji) => {
    const fingerprint = await getFingerprint();
    const ref = doc(db, 'galleryFeed', post.id);
    const prevEmoji = post.reactedUsers?.[fingerprint];
    let newReactions = { ...post.reactions };
    let newReactedUsers = { ...post.reactedUsers };
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
    // Update local state immediately for instant UI feedback
    setPosts(prevPosts => prevPosts.map(p => p.id === post.id ? { ...p, reactions: newReactions, reactedUsers: newReactedUsers } : p));
    setPopEmoji(pe => ({ ...pe, [post.id]: emoji }));
    setTimeout(() => setPopEmoji(pe => ({ ...pe, [post.id]: null })), 900);
  };

  // Long-press logic
  const longPressTimeout = useRef();
  const handlePressStart = (postId) => {
    longPressTimeout.current = setTimeout(() => setEmojiBarPhotoId(postId), 400);
  };
  const handlePressEnd = (post, isTap = false) => {
    clearTimeout(longPressTimeout.current);
    if (isTap) handleLike(post);
  };

  // Dominant emoji and total count
  const getDominantEmoji = (reactions = {}) => {
    let max = 0, emoji = '❤️', total = 0;
    Object.entries(reactions || {}).forEach(([k, v]) => {
      total += v;
      if (v > max) { max = v; emoji = k; }
    });
    return { emoji, total };
  };

  const handleShare = (postId) => {
    const url = `${window.location.origin}/media/photo/${postId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(postId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="min-h-screen py-8 px-2 bg-[#fffaf8] dark:bg-[#181818]">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-[#ff7300] dark:text-orange-300">PathSarthi Media Gallery</h1>
        {loading ? (
          <div className="text-center text-lg py-20 text-gray-400">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.length === 0 ? (
              <div className="col-span-full text-center text-lg text-gray-400">No media yet.</div>
            ) : (
              posts.map(post => {
                const { emoji, total } = getDominantEmoji(post.reactions);
                const anchorRef = emojiAnchorRefs.current[post.id] || (emojiAnchorRefs.current[post.id] = React.createRef());
                const fingerprint = window.localStorage.getItem('fingerprint');
                const userEmoji = post.reactedUsers && fingerprint && post.reactedUsers[fingerprint];
                return (
                  <div
                    key={post.id}
                    className="relative group bg-white dark:bg-[#232323] border-4 border-[#ff7300] rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-200 flex flex-col items-center p-4 cursor-pointer"
                  >
                    {/* Profile icon and name */}
                    <a href="/trust-members" className="flex items-center gap-2 mb-2 self-start group/profile" style={{ textDecoration: 'none' }}>
                      <img
                        src="/Chairman.jpg"
                        alt="Chairman Ravi Prakash Rai"
                        className="w-8 h-8 rounded-full border-2 border-[#ff7300] object-cover shadow group-hover/profile:scale-105 transition-transform"
                        style={{ background: '#fff' }}
                      />
                      <span className="text-sm font-semibold text-[#ff7300] hover:underline group-hover/profile:text-orange-600 transition-colors">Chairman - Ravi Prakash Rai</span>
                    </a>
                    <div
                      ref={anchorRef}
                      className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 relative bg-[#fffaf8] dark:bg-[#232323]"
                      onPointerDown={() => handlePressStart(post.id)}
                      onPointerUp={() => handlePressEnd(post, true)}
                      onPointerLeave={() => handlePressEnd(post, false)}
                      onContextMenu={e => e.preventDefault()}
                    >
                      <img
                        src={post.imageUrl}
                        alt={post.heading}
                        className="absolute inset-0 w-full h-full object-contain rounded-xl transition-transform duration-300 group-hover:scale-105 bg-white"
                        loading="lazy"
                        draggable="false"
                        style={{ display: 'block' }}
                      />
                      {/* Emoji pop animation */}
                      {popEmoji[post.id] && (
                        <motion.div
                          initial={{ scale: 0, y: 40, opacity: 0 }}
                          animate={{ scale: 1.6, y: -30, opacity: 1 }}
                          exit={{ scale: 0, y: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                          className="absolute left-1/2 top-1/2 text-5xl pointer-events-none"
                          style={{ transform: 'translate(-50%, -50%)' }}
                        >
                          {popEmoji[post.id]}
                        </motion.div>
                      )}
                      {/* Emoji bar */}
                      <EmojiReactions
                        show={emojiBarPhotoId === post.id}
                        onSelect={e => { handleReaction(post, e); setEmojiBarPhotoId(null); }}
                        onClose={() => setEmojiBarPhotoId(null)}
                        anchorRef={anchorRef}
                        selectedEmoji={userEmoji}
                      />
                    </div>
                    <div className="font-bold text-center text-lg mb-2 text-[#ff7300] dark:text-orange-200 w-full truncate">{post.heading}</div>
                    <div className="flex gap-8 items-center mt-auto w-full justify-center">
                      <button
                        className="flex items-center gap-1 px-3 py-1 rounded-full font-medium text-[#ff7300] hover:bg-orange-50 dark:hover:bg-orange-900/30 transition"
                        onClick={() => handleLike(post)}
                        onPointerDown={() => handlePressStart(post.id)}
                        onPointerUp={() => handlePressEnd(post, true)}
                        onPointerLeave={() => handlePressEnd(post, false)}
                      >
                        <span className="text-xl">{emoji}</span> {total}
                      </button>
                      <button
                        className="flex items-center gap-1 px-3 py-1 rounded-full font-medium text-[#00a9b7] hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
                        onClick={() => setShowCommentsId(post.id)}
                      >
                        <MessageCircle size={22} className="transition-colors group-hover:text-blue-500" />
                        <span className="text-base">{commentCounts[post.id] || 0}</span>
                      </button>
                      <button
                        className="flex items-center gap-1 px-3 py-1 rounded-full font-medium text-[#00a9b7] hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
                        onClick={() => handleShare(post.id)}
                      >
                        <Share2 size={22} className="transition-colors group-hover:text-green-500" />
                        <span className="text-base">{copiedId === post.id ? 'Copied!' : 'Share'}</span>
                      </button>
                    </div>
                    <CommentModal open={showCommentsId === post.id} onClose={() => setShowCommentsId(null)} photoId={post.id} isDark={false} />
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaFeed; 