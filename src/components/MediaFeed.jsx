import React, { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getCountFromServer, deleteDoc, getDocs } from 'firebase/firestore';
import { getFingerprint } from '../utils/fingerprint';
import { Link } from 'react-router-dom';

const MediaFeed = ({ isAdmin }) => {
  const [photos, setPhotos] = useState([]);
  const [likeLoading, setLikeLoading] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'galleryFeed'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, async (snapshot) => {
      const data = await Promise.all(snapshot.docs.map(async (docSnap) => {
        // Get comment count from subcollection
        const commentsSnap = await getCountFromServer(collection(db, 'galleryFeed', docSnap.id, 'comments'));
        return {
          id: docSnap.id,
          ...docSnap.data(),
          commentCount: commentsSnap.data().count || 0,
        };
      }));
      console.log("Fetched photos:", data);
      setPhotos(data);
    });
    return () => unsub();
  }, []);

  const handleLike = async (photo) => {
    setLikeLoading(l => ({ ...l, [photo.id]: true }));
    try {
      const fingerprint = await getFingerprint();
      if (photo.likeUserIds && photo.likeUserIds.includes(fingerprint)) {
        setLikeLoading(l => ({ ...l, [photo.id]: false }));
        return; // Already liked
      }
      const ref = doc(db, 'galleryFeed', photo.id);
      await updateDoc(ref, {
        likes: (photo.likes || 0) + 1,
        likeUserIds: [...(photo.likeUserIds || []), fingerprint],
      });
    } catch (err) {
      alert('Failed to like photo.');
    }
    setLikeLoading(l => ({ ...l, [photo.id]: false }));
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
      {photos.map(photo => (
        <div key={photo.id} className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <img
            src={photo.imageUrl}
            alt={photo.heading}
            loading="lazy"
            className="w-full max-w-md rounded-lg object-cover mb-4 shadow"
            style={{ maxHeight: 400 }}
          />
          <div className="text-lg font-semibold mb-2 text-center">{photo.heading}</div>
          <div className="flex gap-6 items-center mb-2">
            <button
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${likeLoading[photo.id] ? 'opacity-60' : 'hover:bg-indigo-50'}`}
              onClick={() => handleLike(photo)}
              disabled={likeLoading[photo.id]}
            >
              <span role="img" aria-label="like">👍</span> {photo.likes || 0}
            </button>
            <Link to={`/media/photo/${photo.id}`} className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium hover:bg-indigo-50">
              <span role="img" aria-label="comments">💬</span> {photo.commentCount}
            </Link>
            <button
              className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium hover:bg-indigo-50"
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
      ))}
    </div>
  );
};

export default MediaFeed; 