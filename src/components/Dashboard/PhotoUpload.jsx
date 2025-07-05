import React, { useState } from 'react';
import axios from 'axios';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import imageCompression from 'browser-image-compression';

const PhotoUpload = () => {
  const [heading, setHeading] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file || !heading) return alert("Heading and file required!");

    setUploading(true);
    try {
      // Compress the image
      const compressedImg = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1080,
        useWebWorker: true
      });
      const formData = new FormData();
      formData.append('file', compressedImg);
      formData.append('upload_preset', 'admin-uploads'); // your Cloudinary preset

      const cloudRes = await axios.post(
        'https://api.cloudinary.com/v1_1/dgmhz64fs/image/upload',
        formData
      );

      const imageUrl = cloudRes.data.secure_url;

      await addDoc(collection(db, 'gallery'), {
        heading,
        imageUrl,
        createdAt: serverTimestamp(),
      });

      alert("Uploaded ✅");
      setHeading('');
      setFile(null);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed ❌");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <input
        type="text"
        placeholder="Enter heading"
        value={heading}
        onChange={(e) => setHeading(e.target.value)}
        className="border p-2 w-full"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
        className="w-full"
      />
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {uploading ? "Uploading..." : "Upload Photo"}
      </button>
    </div>
  );
};

export default PhotoUpload; 