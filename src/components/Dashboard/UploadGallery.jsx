import React, { useState } from 'react';
import axios from 'axios';

const UploadGallery = () => {
  const [images, setImages] = useState([]);
  const [heading, setHeading] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState([]);

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    const uploaded = [];
    for (let i = 0; i < images.length; i++) {
      const formData = new FormData();
      formData.append("file", images[i]);
      formData.append("upload_preset", "admin-uploads"); // Your preset
      formData.append("cloud_name", "dgmhz64fs");
      try {
        const res = await axios.post(
          "https://api.cloudinary.com/v1_1/dgmhz64fs/image/upload",
          formData
        );
        uploaded.push(res.data.secure_url);
      } catch (err) {
        console.error("❌ Upload failed", err);
      }
    }
    setUploadedUrls(uploaded);
    setUploading(false);
    if (uploaded.length > 0) alert("Upload successful! 🔥");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">📸 Upload Weekly Event Photos</h2>
      <form onSubmit={handleUpload}>
        <input
          type="text"
          placeholder="Enter heading for these photos"
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          className="p-2 border rounded mb-2 w-full"
        />
        <input
          type="file"
          multiple
          onChange={(e) => setImages(e.target.files)}
          className="p-2 border rounded mb-2 w-full"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {uploadedUrls.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium">Uploaded Images:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            {uploadedUrls.map((url, idx) => (
              <img key={idx} src={url} alt={`Uploaded ${idx}`} className="w-full rounded" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadGallery; 