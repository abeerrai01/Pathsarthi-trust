import React, { useEffect, useState } from 'react';
import { db } from '../../config/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const GalleryManager = () => {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const fetchPhotos = async () => {
      const snapshot = await getDocs(collection(db, 'gallery'));
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPhotos(items);
    };
    fetchPhotos();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this gallery item? This cannot be undone.');
    if (!confirmed) return;
    try {
      await deleteDoc(doc(db, 'gallery', id));
      setPhotos((prev) => prev.filter((photo) => photo.id !== id));
      alert('Deleted successfully ✅');
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('Delete failed ❌');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">🗑️ Manage Gallery</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map(({ id, imageUrl, heading }) => (
          <div key={id} className="border p-2 rounded shadow-sm">
            <img src={imageUrl} alt={heading} className="w-full object-contain h-64" />
            <p className="font-semibold mt-2">{heading}</p>
            <button
              onClick={() => handleDelete(id)}
              className="mt-2 text-red-500 hover:underline"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GalleryManager; 