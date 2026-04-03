import React, { useEffect, useState } from 'react';
import { db } from '../../config/firebase';
import { collection, getDocs, updateDoc, doc, arrayRemove } from 'firebase/firestore';
import { Trash2, Image as ImageIcon, Filter, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const GalleryManager = () => {
  const [galleryData, setGalleryData] = useState([]);
  const [selectedHeading, setSelectedHeading] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null); // Track specific image deletion

  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, 'gallery'));
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          heading: doc.data().heading,
          images: doc.data().images || [],
        }));
        setGalleryData(data);
        if (data.length > 0) setSelectedHeading(data[0].heading);
      } catch (error) {
        console.error("Error fetching gallery:", error);
      }
      setLoading(false);
    };
    fetchGallery();
  }, []);

  const handleDelete = async (docId, imageObj) => {
    const confirmed = window.confirm('Are you absolutely sure you want to delete this photo from the website? This cannot be undone.');
    if (!confirmed) return;
    
    setDeleteLoading(imageObj.imageUrl);
    try {
      const ref = doc(db, 'gallery', docId);
      await updateDoc(ref, {
        images: arrayRemove(imageObj),
      });
      
      setGalleryData(prev =>
        prev.map(item =>
          item.id === docId
            ? { ...item, images: item.images.filter(img => img.imageUrl !== imageObj.imageUrl) }
            : item
        )
      );
    } catch (error) {
      console.error('❌ Error deleting image:', error);
      alert('Delete failed. Please check your internet connection and try again.');
    }
    setDeleteLoading(null);
  };

  const headings = galleryData.map(g => g.heading);
  const selectedGroup = galleryData.find(g => g.heading === selectedHeading);

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black flex items-center gap-3">
              <ImageIcon className="w-10 h-10" />
              Manage Gallery Photos
            </h2>
            <p className="text-blue-50 mt-2 opacity-90 font-medium text-lg">Remove or organize photos from existing website categories.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex flex-col sm:flex-row items-center gap-4 min-w-[300px]">
             <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider">
               <Filter size={16} /> Filter Gallery:
             </div>
             <select
              value={selectedHeading}
              onChange={e => setSelectedHeading(e.target.value)}
              className="flex-1 bg-white text-slate-800 px-4 py-2.5 rounded-xl font-bold focus:ring-4 focus:ring-blue-500/30 outline-none transition-all cursor-pointer shadow-sm w-full"
            >
              {headings.map((heading, idx) => (
                <option key={idx} value={heading}>{heading}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="p-8 md:p-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
            <span className="font-bold text-lg">Fetching your photos...</span>
          </div>
        ) : galleryData.length === 0 ? (
          <div className="text-center py-32 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
             <ImageIcon size={64} className="mx-auto text-slate-300 mb-6" />
             <h3 className="text-2xl font-black text-slate-600 mb-2">Your Gallery is Empty</h3>
             <p className="text-slate-500 font-medium italic">Upload some photos first from the "Upload New Photos" tab.</p>
          </div>
        ) : selectedGroup ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
               <div>
                  <h3 className="text-2xl font-black text-slate-800">{selectedGroup.heading}</h3>
                  <p className="text-slate-500 font-bold mt-1 uppercase text-xs tracking-widest">{selectedGroup.images.length} Photos in this category</p>
               </div>
            </div>

            {selectedGroup.images.length === 0 ? (
              <div className="text-center py-24 bg-slate-50 rounded-2xl border border-slate-100">
                 <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
                 <p className="text-slate-500 font-bold italic">This category contains no photos yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {selectedGroup.images.map((img, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300">
                    <img
                      src={img.imageUrl}
                      alt="Gallery"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                        <button
                          disabled={deleteLoading === img.imageUrl}
                          onClick={() => handleDelete(selectedGroup.id, img)}
                          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 font-bold disabled:bg-red-400"
                        >
                          {deleteLoading === img.imageUrl ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <Trash2 size={20} />
                              <span className="text-sm">Delete Forever</span>
                            </>
                          )}
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default GalleryManager; 