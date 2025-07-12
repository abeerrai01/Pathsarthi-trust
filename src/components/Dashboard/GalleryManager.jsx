import React, { useEffect, useState } from 'react';
import { db } from '../../config/firebase';
import { collection, getDocs, updateDoc, doc, arrayRemove } from 'firebase/firestore';

const GalleryManager = () => {
  const [galleryData, setGalleryData] = useState([]);
  const [selectedHeading, setSelectedHeading] = useState('');

  useEffect(() => {
    const fetchGallery = async () => {
      const snapshot = await getDocs(collection(db, 'gallery'));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        heading: doc.data().heading,
        images: doc.data().images || [],
      }));
      setGalleryData(data);
      if (data.length > 0) setSelectedHeading(data[0].heading); // Default to first heading
    };
    fetchGallery();
  }, []);

  const handleDelete = async (docId, imageObj) => {
    const confirmed = window.confirm('Are you sure you want to delete this image? This cannot be undone.');
    if (!confirmed) return;
    try {
      const ref = doc(db, 'gallery', docId);
      await updateDoc(ref, {
        images: arrayRemove(imageObj),
      });
      alert('Deleted successfully ✅');
      setGalleryData(prev =>
        prev.map(item =>
          item.id === docId
            ? { ...item, images: item.images.filter(img => img.imageUrl !== imageObj.imageUrl) }
            : item
        )
      );
    } catch (error) {
      console.error('❌ Error deleting image:', error);
      alert('Delete failed ❌');
    }
  };

  const headings = galleryData.map(g => g.heading);
  const selectedGroup = galleryData.find(g => g.heading === selectedHeading);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">🗑️ Delete Photos From Gallery</h2>
      <div className="mb-4">
        <label className="mr-2 font-semibold">Select Heading:</label>
        <select
          value={selectedHeading}
          onChange={e => setSelectedHeading(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          {headings.map((heading, idx) => (
            <option key={idx} value={heading}>{heading}</option>
          ))}
        </select>
      </div>
      {selectedGroup && (
        <div className="mb-8 border-b pb-4">
          <h3 className="text-lg font-semibold mb-2">{selectedGroup.heading}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {selectedGroup.images.map((img, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={img.imageUrl}
                  alt="Gallery"
                  className="w-full h-auto rounded shadow"
                />
                <button
                  onClick={() => handleDelete(selectedGroup.id, img)}
                  className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryManager; 