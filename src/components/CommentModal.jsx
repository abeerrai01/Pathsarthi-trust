import React, { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getFingerprint } from '../utils/fingerprint';

const COMMENT_LIMIT_MS = 30000;

const CommentModal = ({ open, onClose, photoId, isDark }) => {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!open) return;
    const q = query(collection(db, 'galleryFeed', photoId, 'comments'), orderBy('timestamp', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [open, photoId]);

  const handleComment = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!commentText.trim()) return;
    setLoading(true);
    try {
      const fingerprint = await getFingerprint();
      const key = `comment_${photoId}_${fingerprint}`;
      const last = localStorage.getItem(key);
      if (last && Date.now() - parseInt(last, 10) < COMMENT_LIMIT_MS) {
        setMessage('Please wait before commenting again.');
        setLoading(false);
        return;
      }
      await addDoc(collection(db, 'galleryFeed', photoId, 'comments'), {
        comment: commentText.trim(),
        timestamp: serverTimestamp(),
      });
      setCommentText('');
      localStorage.setItem(key, Date.now().toString());
      setMessage('Comment added!');
    } catch (err) {
      setMessage('Failed to add comment.');
    }
    setLoading(false);
  };

  if (!open) return null;
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 ${isDark ? 'dark' : ''}`}
      onClick={onClose}
    >
      <div
        className={`bg-white dark:bg-[#232323] rounded-2xl shadow-lg p-6 max-w-md w-full relative`}
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl font-bold"
          onClick={onClose}
        >×</button>
        <h3 className="text-xl font-bold mb-4 text-center" style={{ color: isDark ? '#fff' : '#f47920' }}>Comments</h3>
        <form onSubmit={handleComment} className="flex gap-2 mb-4">
          <input
            type="text"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            className="flex-1 border rounded px-3 py-2 dark:bg-[#232323] dark:text-white"
            placeholder="Add a comment..."
            disabled={loading}
            maxLength={300}
          />
          <button
            type="submit"
            className="bg-[#00a9b7] text-white px-4 py-2 rounded font-semibold"
            disabled={loading}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </form>
        {message && <div className="mb-2 text-center text-sm text-red-600">{message}</div>}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {comments.length === 0 && <div className="text-gray-400 text-sm">No comments yet.</div>}
          {comments.map(c => (
            <div key={c.id} className="bg-gray-50 dark:bg-[#333] rounded p-2 text-sm">
              {c.comment}
              <span className="block text-xs text-gray-400 mt-1">{c.timestamp?.toDate ? c.timestamp.toDate().toLocaleString() : ''}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommentModal; 