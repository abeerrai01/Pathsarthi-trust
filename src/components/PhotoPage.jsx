import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getFingerprint } from '../utils/fingerprint';

const COMMENT_LIMIT_MS = 30000; // 30 seconds between comments per device per photo

const PhotoPage = () => {
  const { id } = useParams();
  const [photo, setPhoto] = useState(null);
  const [comments, setComments] = useState([]);
  const [likeLoading, setLikeLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ref = doc(db, 'galleryFeed', id);
    getDoc(ref).then(snap => {
      if (snap.exists()) setPhoto({ id: snap.id, ...snap.data() });
    });
    const q = query(collection(db, 'galleryFeed', id, 'comments'), orderBy('timestamp', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [id]);

  const handleLike = async () => {
    if (!photo) return;
    setLikeLoading(true);
    try {
      const fingerprint = await getFingerprint();
      if (photo.likeUserIds && photo.likeUserIds.includes(fingerprint)) {
        setLikeLoading(false);
        return;
      }
      const ref = doc(db, 'galleryFeed', photo.id);
      await updateDoc(ref, {
        likes: (photo.likes || 0) + 1,
        likeUserIds: [...(photo.likeUserIds || []), fingerprint],
      });
      setPhoto(p => ({ ...p, likes: (p.likes || 0) + 1, likeUserIds: [...(p.likeUserIds || []), fingerprint] }));
    } catch (err) {
      setMessage('Failed to like photo.');
    }
    setLikeLoading(false);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      const fingerprint = await getFingerprint();
      // Rate limit: check last comment timestamp in localStorage
      const key = `comment_${id}_${fingerprint}`;
      const last = localStorage.getItem(key);
      if (last && Date.now() - parseInt(last, 10) < COMMENT_LIMIT_MS) {
        setMessage('Please wait before commenting again.');
        setCommentLoading(false);
        return;
      }
      await addDoc(collection(db, 'galleryFeed', id, 'comments'), {
        comment: commentText.trim(),
        timestamp: serverTimestamp(),
      });
      setCommentText('');
      localStorage.setItem(key, Date.now().toString());
      setMessage('Comment added!');
    } catch (err) {
      setMessage('Failed to add comment.');
    }
    setCommentLoading(false);
  };

  if (!photo) return <div className="text-center py-20 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto py-10 px-2">
      <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
        <img
          src={photo.imageUrl}
          alt={photo.heading}
          loading="lazy"
          className="w-full max-w-md rounded-lg object-cover mb-4 shadow"
          style={{ maxHeight: 400 }}
        />
        <div className="text-xl font-semibold mb-2 text-center">{photo.heading}</div>
        <div className="flex gap-6 items-center mb-4">
          <button
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${likeLoading ? 'opacity-60' : 'hover:bg-indigo-50'}`}
            onClick={handleLike}
            disabled={likeLoading || (photo.likeUserIds && photo.likeUserIds.includes(getFingerprint()))}
          >
            <span role="img" aria-label="like">👍</span> {photo.likes || 0}
          </button>
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium">
            <span role="img" aria-label="comments">💬</span> {comments.length}
          </span>
          <button
            className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium hover:bg-indigo-50"
            onClick={handleShare}
          >
            <span role="img" aria-label="share">🔗</span> {copied ? 'Copied!' : 'Share'}
          </button>
        </div>
        <Link to="/media" className="text-indigo-600 text-sm mb-4">← Back to Media Feed</Link>
        <div className="w-full mt-4">
          <h3 className="text-lg font-bold mb-2">Comments</h3>
          <form onSubmit={handleComment} className="flex gap-2 mb-4">
            <input
              type="text"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              className="flex-1 border rounded px-3 py-2"
              placeholder="Add a comment..."
              disabled={commentLoading}
              maxLength={300}
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded font-semibold"
              disabled={commentLoading}
            >
              {commentLoading ? 'Posting...' : 'Post'}
            </button>
          </form>
          {message && <div className="mb-2 text-center text-sm text-red-600">{message}</div>}
          <div className="space-y-2">
            {comments.length === 0 && <div className="text-gray-400 text-sm">No comments yet.</div>}
            {comments.map(c => (
              <div key={c.id} className="bg-gray-50 rounded p-2 text-sm">
                {c.comment}
                <span className="block text-xs text-gray-400 mt-1">{c.timestamp?.toDate ? c.timestamp.toDate().toLocaleString() : ''}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoPage; 