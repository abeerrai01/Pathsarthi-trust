import React, { useEffect, useState } from "react";
import { db } from "../config/firebase";
import {
  getDocs,
  collection,
  doc,
  updateDoc,
} from "firebase/firestore";

const EditGalleryHeadings = () => {
  const [gallery, setGallery] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const [successId, setSuccessId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Fetch all gallery docs
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const snap = await getDocs(collection(db, "gallery"));
        setGallery(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        setError("Failed to fetch gallery: " + err.message);
      }
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
      setTimeout(() => setSuccessId(null), 2000);
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
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-4">Edit Gallery Headings</h2>
      <input
        type="text"
        placeholder="Search headings..."
        className="mb-4 w-full border rounded px-3 py-2"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {error && <div className="text-red-600 mb-2 text-center">{error}</div>}
      <div className="divide-y">
        {filteredGallery.length === 0 && (
          <div className="text-gray-500 text-center py-8">No headings found.</div>
        )}
        {filteredGallery.map((g) => (
          <div
            key={g.id}
            className={`flex items-center py-3 gap-2 ${
              successId === g.id ? "bg-green-50" : ""
            }`}
          >
            {editingId === g.id ? (
              <>
                <input
                  className="border rounded px-2 py-1 flex-1"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  disabled={loadingId === g.id}
                  autoFocus
                />
                <button
                  className="ml-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                  onClick={() => handleSave(g.id)}
                  disabled={loadingId === g.id}
                >
                  {loadingId === g.id ? "Saving..." : "Save"}
                </button>
                <button
                  className="ml-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => setEditingId(null)}
                  disabled={loadingId === g.id}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 truncate text-gray-800 font-medium">
                  {g.heading}
                </span>
                <button
                  className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => handleEdit(g.id, g.heading)}
                >
                  Edit
                </button>
                {successId === g.id && (
                  <span className="ml-2 text-green-600 text-sm font-semibold">Updated!</span>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditGalleryHeadings; 