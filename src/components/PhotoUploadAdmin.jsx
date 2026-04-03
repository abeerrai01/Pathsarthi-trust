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
import { UploadCloud, CheckCircle2, AlertCircle, Image as ImageIcon, Plus, X } from 'lucide-react';

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
  const [message, setMessage] = useState({ text: "", type: "" });
  const [previews, setPreviews] = useState([]);

  // Fetch existing headings on mount and after upload
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

  useEffect(() => {
    fetchHeadings();
  }, []);

  // Show image previews
  useEffect(() => {
    if (!files.length) {
      setPreviews([]);
      return;
    }
    const arr = Array.from(files).map(file => URL.createObjectURL(file));
    setPreviews(arr);
    // Cleanup
    return () => arr.forEach(url => URL.revokeObjectURL(url));
  }, [files]);

  const handleUpload = async () => {
    setMessage({ text: "", type: "" });
    if (!files.length) {
      setMessage({ text: "Please select images to upload.", type: "error" });
      return;
    }
    let headingToUse = selectedHeadingId
      ? headings.find((h) => h.id === selectedHeadingId)?.heading
      : newHeading.trim();
    if (!headingToUse) {
      setMessage({ text: "Please select an existing category or enter a new one.", type: "error" });
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
      // Prevent duplicate image URLs in this batch
      const uniqueUploads = uploadResults.filter((img, idx, arr) =>
        arr.findIndex(i => i.imageUrl === img.imageUrl) === idx
      );
      if (selectedHeadingId) {
        // Existing heading: append images (no overwrite)
        const docRef = doc(db, "gallery", selectedHeadingId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) throw new Error("Heading not found");
        const oldImages = docSnap.data().images || [];
        // Prevent duplicate image URLs (old + new)
        const allImages = [...oldImages];
        uniqueUploads.forEach(img => {
          if (!allImages.some(i => i.imageUrl === img.imageUrl)) {
            allImages.push(img);
          }
        });
        await updateDoc(docRef, {
          images: allImages,
        });
      } else {
        // Check for duplicate heading
        const q = query(collection(db, "gallery"), where("heading", "==", headingToUse));
        const qSnap = await getDocs(q);
        if (!qSnap.empty) {
          setMessage({ text: "A gallery with this heading already exists. Please select it from the list above.", type: "error" });
          setLoading(false);
          return;
        }
        // New heading: create doc
        await addDoc(collection(db, "gallery"), {
          heading: headingToUse,
          createdAt: serverTimestamp(),
          images: uniqueUploads,
        });
      }
      setMessage({ text: "Gallery updated successfully!", type: "success" });
      setFiles([]);
      setNewHeading("");
      setSelectedHeadingId("");
      setPreviews([]);
      await fetchHeadings(); // Reload headings
    } catch (err) {
      setMessage({ text: "Error: " + (err.message || err), type: "error" });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-8 text-white">
        <h2 className="text-3xl font-black flex items-center gap-3">
          <UploadCloud className="w-10 h-10" />
          Gallery Group Upload
        </h2>
        <p className="text-emerald-50 mt-2 opacity-90 font-medium text-lg">Upload multiple event photos into a new or existing category.</p>
      </div>

      <div className="p-8 md:p-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Category Selection */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Target Gallery Category</label>
              <select
                className="w-full border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-slate-50 font-bold"
                value={selectedHeadingId}
                onChange={(e) => {
                  setSelectedHeadingId(e.target.value);
                  setNewHeading("");
                }}
              >
                <option value="">✨ Create New Category</option>
                {headings.map((h) => (
                  <option key={h.id} value={h.id}>
                    📂 {h.heading}
                  </option>
                ))}
              </select>
            </div>

            {!selectedHeadingId && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-bold text-slate-700 mb-3">New Category Name</label>
                <input
                  className="w-full border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 font-bold"
                  value={newHeading}
                  onChange={(e) => setNewHeading(e.target.value)}
                  placeholder="e.g. Health Camp April 2026"
                />
              </div>
            )}
          </div>

          {/* File Selection */}
          <div className="space-y-6">
            <label className="block text-sm font-bold text-slate-700 mb-3">Select Event Photos</label>
            <div className="relative border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center hover:border-emerald-500 transition-all group cursor-pointer bg-slate-50">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setFiles(e.target.files)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all">
                  <Plus className="text-emerald-500 w-8 h-8" />
                </div>
                <span className="text-slate-600 font-black mb-1">Click to add photos</span>
                <span className="text-slate-400 text-sm font-medium italic">You can select multiple photos at once</span>
              </div>
            </div>
          </div>
        </div>

        {/* Previews */}
        {previews.length > 0 && (
          <div className="animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-end mb-4">
              <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest">Selected Images ({previews.length})</h4>
              <button onClick={() => setFiles([])} className="text-red-500 text-xs font-bold hover:underline flex items-center gap-1">
                <X size={14} /> Clear All
              </button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 bg-slate-50 p-6 rounded-3xl border border-slate-200 max-h-64 overflow-y-auto custom-scrollbar">
              {previews.map((url, idx) => (
                <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden shadow-sm border-2 border-white">
                  <img src={url} alt="preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-95 disabled:bg-emerald-300 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-xl"
        >
          {loading ? (
            <>
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing Uploads...
            </>
          ) : (
            <>
              <ImageIcon className="w-6 h-6" />
              Upload to Gallery
            </>
          )}
        </button>

        {message.text && (
          <div className={`p-5 rounded-2xl flex items-center gap-4 font-bold border animate-in slide-in-from-top-2 duration-300 ${
            message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoUploadAdmin; 