import React, { useState } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { uploadToCloudinary } from '../utils/cloudinary';
import { UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';

const AdminUpload = () => {
  const [heading, setHeading] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    if (!heading || !image) {
      setMessage({ text: 'Please provide both a heading and an image.', type: 'error' });
      return;
    }
    setUploading(true);
    try {
      // Upload image to Cloudinary
      const { imageUrl, publicId } = await uploadToCloudinary(image);
      
      // Add to Firestore with emoji reactions model
      await addDoc(collection(db, 'galleryFeed'), {
        heading,
        imageUrl,
        publicId,
        reactions: {},
        reactedUsers: {},
        timestamp: serverTimestamp(),
      });

      setMessage({ text: 'News post uploaded successfully!', type: 'success' });
      setHeading('');
      setImage(null);
    } catch (err) {
      setMessage({ text: 'Upload failed: ' + err.message, type: 'error' });
    }
    setUploading(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <UploadCloud className="w-8 h-8" />
          Create News & Media Post
        </h2>
        <p className="text-orange-100 mt-1 opacity-90 font-medium">Post updates, impact stories or media buzz instantly.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Heading / Caption</label>
          <input 
            type="text" 
            value={heading} 
            onChange={e => setHeading(e.target.value)} 
            placeholder="What's the update about?"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400" 
            required 
          />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Upload Photo</label>
          <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-orange-500 transition-colors group cursor-pointer bg-slate-50">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              required 
            />
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud className="text-orange-500 w-6 h-6" />
              </div>
              {image ? (
                <span className="text-slate-900 font-bold">{image.name}</span>
              ) : (
                <>
                  <span className="text-slate-600 font-bold mb-1">Click to select or drag & drop</span>
                  <span className="text-slate-400 text-sm font-medium italic">PNG, JPG, WEBP (Max 5MB)</span>
                </>
              )}
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={uploading}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-black text-lg transition-all shadow-lg shadow-orange-600/20 disabled:bg-orange-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Uploading to Website...
            </>
          ) : 'Publish Post Now'}
        </button>

        {message.text && (
          <div className={`p-4 rounded-xl flex items-center gap-3 font-bold border ${
            message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
};

export default AdminUpload; 