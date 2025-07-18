import React, { useEffect, useState, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getCountFromServer, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getFingerprint } from '../utils/fingerprint';
import { Heart, MessageCircle, Share2, Trash2, Pencil } from 'lucide-react';
import CommentModal from './CommentModal';
import EmojiReactions from './EmojiReactions';
import { motion } from 'framer-motion';
import SkeletonCard from './SkeletonCard';
import { deleteFromCloudinary } from '../utils/cloudinary';

const MediaFeed = ({ isAdmin = false }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [emojiBarPhotoId, setEmojiBarPhotoId] = useState(null);
  const [popEmoji, setPopEmoji] = useState({}); // { [photoId]: emoji }
  const [showCommentsId, setShowCommentsId] = useState(null);
  const emojiAnchorRefs = useRef({});
  const [commentCounts, setCommentCounts] = useState({});
  const [localReactions, setLocalReactions] = useState({}); // { [postId]: { reactions, reactedUsers } }
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [shareId, setShareId] = useState(null);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'galleryFeed'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setPosts(data);
      setLoading(false);
      // Fetch comment counts in the background
      data.forEach(post => {
        getCountFromServer(collection(db, 'galleryFeed', post.id, 'comments')).then(commentsSnap => {
          setCommentCounts(prev => ({ ...prev, [post.id]: commentsSnap.data().count || 0 }));
        });
        // Clear localReactions overlay for this post if Firestore data has changed
        setLocalReactions(prev => {
          if (!prev[post.id]) return prev;
          const firestoreReactions = JSON.stringify(post.reactions || {});
          const overlayReactions = JSON.stringify(prev[post.id].reactions || {});
          if (firestoreReactions !== overlayReactions) {
            const { [post.id]: _, ...rest } = prev;
            return rest;
          }
          return prev;
        });
      });
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
    // Deep clone reactions and reactedUsers
    let newReactions = { ...(post.reactions || {}) };
    let newReactedUsers = { ...(post.reactedUsers || {}) };
    const prevEmoji = newReactedUsers[fingerprint];
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
    // Optimistically update localReactions overlay for instant UI feedback
    setLocalReactions(prev => ({ ...prev, [post.id]: { reactions: { ...newReactions }, reactedUsers: { ...newReactedUsers } } }));
    setPopEmoji(pe => ({ ...pe, [post.id]: emoji }));
    setTimeout(() => setPopEmoji(pe => ({ ...pe, [post.id]: null })), 900);
    console.log('Optimistically updated reactions for post', post.id, newReactions);
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
    setShareId(postId);
    setShareCopied(false);
  };
  const handleShareClose = () => {
    setShareId(null);
    setShareCopied(false);
  };
  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 1500);
  };
  const handleWhatsApp = (url) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(url)}`,'_blank');
  };
  const handleInstagram = (url) => {
    window.open(`https://www.instagram.com/?url=${encodeURIComponent(url)}`,'_blank');
  };
  const handleX = (url) => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,'_blank');
  };

  // Admin delete logic
  const handleDelete = async (post) => {
    if (!window.confirm('Are you sure you want to delete this media? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'galleryFeed', post.id));
      if (post.publicId) {
        try {
          await deleteFromCloudinary(post.publicId);
        } catch (err) {
          // For now, just log; in production, handle via server
          console.warn('Cloudinary delete error (expected on client):', err.message);
        }
      }
      setPosts(prev => prev.filter(p => p.id !== post.id));
      alert('Deleted successfully ✅');
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  // Edit heading logic
  const handleEditClick = (post) => {
    setEditingId(post.id);
    setEditValue(post.heading);
  };
  const handleEditSave = async (post) => {
    try {
      await updateDoc(doc(db, 'galleryFeed', post.id), { heading: editValue });
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, heading: editValue } : p));
      setEditingId(null);
    } catch (err) {
      alert('Failed to update heading: ' + err.message);
    }
  };
  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  return (
    <div className="min-h-screen py-8 px-2 bg-[#fffaf8] dark:bg-[#181818]">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-[#ff7300] dark:text-orange-300">PathSarthi Media Gallery</h1>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.length === 0 ? (
              <div className="col-span-full text-center text-lg text-gray-400">No media yet.</div>
            ) : (
              posts.map(post => {
                // Use localReactions overlay if present, else Firestore data
                const reactionsData = localReactions[post.id]?.reactions || post.reactions;
                const reactedUsersData = localReactions[post.id]?.reactedUsers || post.reactedUsers;
                const { emoji, total } = getDominantEmoji(reactionsData);
                const anchorRef = emojiAnchorRefs.current[post.id] || (emojiAnchorRefs.current[post.id] = React.createRef());
                const fingerprint = window.localStorage.getItem('fingerprint');
                const userEmoji = reactedUsersData && fingerprint && reactedUsersData[fingerprint];
                return (
                  <div
                    key={post.id}
                    className="relative group bg-white dark:bg-[#232323] border-4 border-[#ff7300] rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-200 flex flex-col items-center p-4 cursor-pointer"
                  >
                    {/* Admin Delete Button (top-right) */}
                    {isAdmin && (
                      <button
                        className="absolute top-2 right-2 z-10 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                        title="Delete Media"
                        onClick={() => handleDelete(post)}
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                    {/* Team logo and name */}
                    <div className="flex items-center gap-2 mb-2 self-start group/profile" style={{ textDecoration: 'none' }}>
                      <img
                        src="/Logo-2.png"
                        alt="Team Path Sarthi Trust Logo"
                        className="w-8 h-8 rounded-full border-2 border-[#ff7300] object-cover shadow group-hover/profile:scale-105 transition-transform"
                        style={{ background: '#fff' }}
                      />
                      <span className="text-sm font-semibold text-[#ff7300] hover:underline group-hover/profile:text-orange-600 transition-colors">Team Path Sarthi Trust</span>
                    </div>
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
                    {/* Heading with edit option for admin */}
                    <div className="w-full mb-2 flex items-center gap-2">
                      {editingId === post.id ? (
                        <>
                          <input
                            className="flex-1 border border-orange-400 rounded px-2 py-1 text-lg font-bold text-[#ff7300] dark:text-orange-200 bg-white dark:bg-[#232323]"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            autoFocus
                          />
                          <button className="text-green-600 font-bold px-2" title="Save" onClick={() => handleEditSave(post)}>Save</button>
                          <button className="text-gray-500 px-2" title="Cancel" onClick={handleEditCancel}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <div className="font-bold text-center text-lg text-[#ff7300] dark:text-orange-200 flex-1" style={{wordBreak: 'break-word', maxHeight: '4.5em', overflowY: 'auto', lineHeight: '1.3'}}>{post.heading}</div>
                          {isAdmin && (
                            <button className="ml-1 text-orange-500 hover:text-orange-700" title="Edit Heading" onClick={() => handleEditClick(post)}>
                              <Pencil size={18} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
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
                        <span className="text-base">Share</span>
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
      {/* Share Modal */}
      {shareId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={handleShareClose}>
          <div className="bg-white dark:bg-[#232323] rounded-2xl shadow-lg p-6 max-w-xs w-full relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl font-bold" onClick={handleShareClose}>×</button>
            <h3 className="text-lg font-bold mb-4 text-center text-[#ff7300]">Share Media</h3>
            <div className="flex flex-col gap-3">
              <button onClick={() => handleCopyLink(`${window.location.origin}/media/photo/${shareId}`)} className="flex items-center gap-2 px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 font-medium">
                <span>🔗</span> Copy Link {shareCopied && <span className="text-green-600 ml-2">Copied!</span>}
              </button>
              <button onClick={() => handleWhatsApp(`${window.location.origin}/media/photo/${shareId}`)} className="flex items-center gap-2 px-4 py-2 rounded bg-green-100 hover:bg-green-200 dark:bg-green-900/60 font-medium">
                <span role="img" aria-label="WhatsApp">🟢</span> WhatsApp
              </button>
              <button onClick={() => handleInstagram(`${window.location.origin}/media/photo/${shareId}`)} className="flex items-center gap-2 px-4 py-2 rounded bg-pink-100 hover:bg-pink-200 dark:bg-pink-900/60 font-medium">
                <span role="img" aria-label="Instagram">📸</span> Instagram
              </button>
              <button onClick={() => handleX(`${window.location.origin}/media/photo/${shareId}`)} className="flex items-center gap-2 px-4 py-2 rounded bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/60 font-medium">
                <span role="img" aria-label="X">❌</span> X (Twitter)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaFeed; 