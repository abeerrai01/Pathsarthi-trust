import React, { useState } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { uploadToCloudinary } from '../utils/cloudinary';

const AdminUpload = () => {
  const [heading, setHeading] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!heading || !image) {
      setMessage('Please provide both a heading and an image.');
      return;
    }
    setUploading(true);
    try {
      // Upload image to Cloudinary
      const imageUrl = await uploadToCloudinary(image);
      // Add to Firestore
      await addDoc(collection(db, 'galleryFeed'), {
        heading,
        imageUrl,
        likes: 0,
        likeUserIds: [],
        timestamp: serverTimestamp(),
      });
      setMessage('Upload successful!');
      setHeading('');
      setImage(null);
    } catch (err) {
      setMessage('Upload failed: ' + err.message);
    }
    setUploading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow p-6 mt-8">
      <h2 className="text-2xl font-bold mb-4">Upload to Path Sarthi Media</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Heading / Caption</label>
          <input type="text" value={heading} onChange={e => setHeading(e.target.value)} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-semibold mb-1">Photo</label>
          <input type="file" accept="image/*" onChange={handleImageChange} className="w-full" required />
        </div>
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded font-semibold" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        {message && <div className="mt-2 text-center text-sm text-red-600">{message}</div>}
      </form>
    </div>
  );
};

export default AdminUpload; 