import React, { useEffect, useState } from "react";
import { db } from "../config/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import axios from "axios";

// Helper to upload a single image to Cloudinary using Axios
async function uploadToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/dgmhz64fs/image/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "admin-uploads");
  const res = await axios.post(url, formData);
  return res.data;
}

const PhotoUploadAdmin = () => {
  const [headings, setHeadings] = useState([]);
  const [selectedHeadingId, setSelectedHeadingId] = useState("");
  const [newHeading, setNewHeading] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch existing headings on mount
  useEffect(() => {
    const fetchHeadings = async () => {
      const snap = await getDocs(collection(db, "gallery"));
      // Prevent duplicate headings
      const uniqueHeadings = [];
      const seen = new Set();
      snap.docs.forEach((doc) => {
        const heading = doc.data().heading;
        if (heading && !seen.has(heading)) {
          uniqueHeadings.push({ id: doc.id, heading });
          seen.add(heading);
        }
      });
      setHeadings(uniqueHeadings);
    };
    fetchHeadings();
  }, []);

  const handleUpload = async () => {
    setMessage("");
    if (!files.length) {
      setMessage("Please select images to upload.");
      return;
    }
    let headingToUse = selectedHeadingId
      ? headings.find((h) => h.id === selectedHeadingId)?.heading
      : newHeading.trim();
    if (!headingToUse) {
      setMessage("Please select or enter a heading.");
      return;
    }
    setLoading(true);
    try {
      // Upload all images to Cloudinary
      const uploadResults = await Promise.all(
        Array.from(files).map(async (file) => {
          const result = await uploadToCloudinary(file);
          return {
            imageUrl: result.secure_url,
            uploadedAt: Timestamp.now(),
          };
        })
      );
      if (selectedHeadingId) {
        // Existing heading: append images
        const docRef = doc(db, "gallery", selectedHeadingId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) throw new Error("Heading not found");
        const oldImages = docSnap.data().images || [];
        await updateDoc(docRef, {
          images: [...oldImages, ...uploadResults],
        });
      } else {
        // Check for duplicate heading
        const q = query(collection(db, "gallery"), where("heading", "==", headingToUse));
        const qSnap = await getDocs(q);
        if (!qSnap.empty) {
          setMessage("A gallery with this heading already exists. Please select it from the dropdown.");
          setLoading(false);
          return;
        }
        // New heading: create doc
        await addDoc(collection(db, "gallery"), {
          heading: headingToUse,
          createdAt: serverTimestamp(),
          images: uploadResults,
        });
      }
      setMessage("Upload successful!");
      setFiles([]);
      setNewHeading("");
    } catch (err) {
      setMessage("Error: " + (err.message || err));
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-4">Photo Upload Admin</h2>
      <div className="mb-4">
        <label className="block font-medium mb-1">Select Existing Heading</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={selectedHeadingId}
          onChange={(e) => {
            setSelectedHeadingId(e.target.value);
            setNewHeading("");
          }}
        >
          <option value="">-- New Heading --</option>
          {headings.map((h) => (
            <option key={h.id} value={h.id}>
              {h.heading}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">New Heading</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={newHeading}
          onChange={(e) => setNewHeading(e.target.value)}
          disabled={!!selectedHeadingId}
          placeholder="Enter new heading"
        />
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Select Images</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setFiles(e.target.files)}
          className="w-full"
        />
        {files.length > 0 && (
          <ul className="mt-2 text-sm text-gray-700 list-disc list-inside">
            {Array.from(files).map((file, idx) => (
              <li key={idx}>{file.name}</li>
            ))}
          </ul>
        )}
      </div>
      <button
        onClick={handleUpload}
        disabled={loading}
        className="w-full bg-indigo-600 text-white font-bold py-3 rounded shadow hover:bg-indigo-700 transition-all duration-300 disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
      {message && (
        <div className={`mt-4 text-center ${message.startsWith("Error") ? "text-red-600" : "text-green-600"}`}>{message}</div>
      )}
    </div>
  );
};

export default PhotoUploadAdmin; 