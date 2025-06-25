import React, { useState } from "react";
import axios from "axios";
import { db } from "../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const MultiPhotoUpload = () => {
  const [heading, setHeading] = useState("");
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      for (const img of images) {
        const formData = new FormData();
        formData.append("file", img);
        formData.append("upload_preset", "admin-uploads");

        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/dgmhz64fs/image/upload",
          formData
        );

        const imageUrl = response.data.secure_url;

        await addDoc(collection(db, "gallery"), {
          heading,
          imageUrl,
          createdAt: serverTimestamp(),
        });
      }

      alert("All images uploaded successfully!");
      setHeading("");
      setImages([]);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload images.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2">Upload Gallery Photos</h2>
      <input
        type="text"
        placeholder="Enter heading"
        className="border p-2 w-full mb-3"
        value={heading}
        onChange={(e) => setHeading(e.target.value)}
      />
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageChange}
        className="mb-3"
      />
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

export default MultiPhotoUpload; 