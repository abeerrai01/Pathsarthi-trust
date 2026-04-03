import React, { useEffect, useState } from "react";
import { db } from "../config/firebase";
import {
  getDocs,
  collection,
  doc,
  updateDoc,
} from "firebase/firestore";
import { Type, Search, Edit3, Save, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const EditGalleryHeadings = () => {
  const [gallery, setGallery] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const [successId, setSuccessId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [fetching, setFetching] = useState(true);

  // Fetch all gallery docs
  useEffect(() => {
    const fetchGallery = async () => {
      setFetching(true);
      try {
        const snap = await getDocs(collection(db, "gallery"));
        setGallery(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        setError("Failed to fetch gallery: " + err.message);
      }
      setFetching(false);
    };
    fetchGallery();
  }, []);

  const handleEdit = (id, currentHeading) => {
    setEditingId(id);
    setEditValue(currentHeading);
    setSuccessId(null);
    setError("");
  };

  const handleSave = async (id) => {
    if (!editValue.trim()) {
      setError("Heading cannot be empty.");
      return;
    }
    const original = gallery.find((g) => g.id === id)?.heading;
    if (editValue.trim() === original) {
      setError("No changes to save.");
      return;
    }
    setLoadingId(id);
    setError("");
    try {
      await updateDoc(doc(db, "gallery", id), { heading: editValue.trim() });
      setGallery((prev) =>
        prev.map((g) =>
          g.id === id ? { ...g, heading: editValue.trim() } : g
        )
      );
      setSuccessId(id);
      setEditingId(null);
      setTimeout(() => setSuccessId(null), 3000);
    } catch (err) {
      setError("Update failed: " + err.message);
    }
    setLoadingId(null);
  };

  const filteredGallery = search
    ? gallery.filter((g) =>
        g.heading.toLowerCase().includes(search.toLowerCase())
      )
    : gallery;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 p-8 text-white">
        <h2 className="text-3xl font-black flex items-center gap-3">
          <Type className="w-10 h-10" />
          Edit Section Headings
        </h2>
        <p className="text-purple-50 mt-2 opacity-90 font-medium text-lg">Change the names of your gallery categories instantly.</p>
      </div>

      <div className="p-8 md:p-12 space-y-8">
        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search for a category name..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-5 py-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all placeholder:text-slate-400 font-bold text-slate-800 shadow-inner"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-3 font-bold animate-in shake duration-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-3">
          {fetching ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
              <span className="font-bold">Fetching categories...</span>
            </div>
          ) : filteredGallery.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <div className="text-slate-300 mb-4 inline-block p-4 bg-white rounded-full shadow-sm">
                <Search size={48} />
              </div>
              <h3 className="text-xl font-black text-slate-600 mb-1">No Headings Found</h3>
              <p className="text-slate-500 font-medium italic">Try a different search term or check if headings exist.</p>
            </div>
          ) : (
            filteredGallery.map((g) => (
              <div
                key={g.id}
                className={`flex items-center p-4 md:p-6 rounded-2xl border transition-all duration-300 gap-4 ${
                  successId === g.id 
                    ? "bg-emerald-50 border-emerald-200 shadow-md translate-x-2" 
                    : "bg-white border-slate-100 hover:border-purple-200 hover:shadow-lg hover:-translate-y-1"
                } ${editingId === g.id ? "ring-2 ring-purple-500 ring-offset-2 scale-[1.02]" : ""}`}
              >
                {editingId === g.id ? (
                  <div className="flex flex-1 flex-col md:flex-row gap-4 items-center">
                    <input
                      className="w-full flex-1 border-2 border-purple-200 rounded-xl px-4 py-3 focus:ring-0 focus:border-purple-500 outline-none font-bold text-slate-800 transition-all bg-purple-50/50"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      disabled={loadingId === g.id}
                      autoFocus
                    />
                    <div className="flex gap-2 w-full md:w-auto">
                      <button
                        className="flex-1 md:flex-none px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 font-black shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2"
                        onClick={() => handleSave(g.id)}
                        disabled={loadingId === g.id}
                      >
                        {loadingId === g.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={20} />}
                        {loadingId === g.id ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        className="flex-1 md:flex-none px-6 py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 font-black transition-all flex items-center justify-center gap-2"
                        onClick={() => setEditingId(null)}
                        disabled={loadingId === g.id}
                      >
                        <X size={20} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                       <Type size={24} />
                    </div>
                    <span className="flex-1 text-lg font-bold text-slate-800 truncate">
                      {g.heading}
                    </span>
                    <div className="flex items-center gap-4 shrink-0">
                      {successId === g.id && (
                        <span className="hidden md:flex items-center gap-2 text-emerald-600 font-black text-sm bg-emerald-100 px-3 py-1.5 rounded-full animate-bounce">
                          <CheckCircle2 size={16} /> Updated Successfully!
                        </span>
                      )}
                      <button
                        className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm hover:shadow-md"
                        onClick={() => handleEdit(g.id, g.heading)}
                        title="Edit Heading"
                      >
                        <Edit3 size={20} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EditGalleryHeadings; 