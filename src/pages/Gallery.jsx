import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../config/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

const Gallery = () => {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const fetchPhotos = async () => {
      const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPhotos(data);
    };

    fetchPhotos();
  }, []);

  // Group photos by heading
  const grouped = photos.reduce((acc, photo) => {
    if (!acc[photo.heading]) acc[photo.heading] = [];
    acc[photo.heading].push(photo);
    return acc;
  }, {});

  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-center mb-6">
          <img 
            src="/PathSarthi logo.png" 
            alt="PathSarthi Logo" 
            className="h-24 w-auto object-contain" 
            style={{ maxWidth: '200px' }}
          />
        </div>
        <h1 className="text-4xl font-bold text-center mb-12">📸 Weekly Event Gallery</h1>

        {Object.keys(grouped).map((heading, idx) => (
          <div key={idx} className="mb-10">
            <div className="text-xl font-semibold mb-2 text-center">{heading}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {grouped[heading].map((photo, index) => (
                <div key={photo.id} className="bg-white p-2 rounded shadow">
                  <img
                    src={photo.imageUrl}
                    alt={heading}
                    className="w-full h-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Lightbox */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="relative max-w-4xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-12 right-0 text-white hover:text-gray-300"
                >
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <img
                  src={selectedImage.imageUrl}
                  alt={selectedImage.title}
                  className="w-full rounded-lg"
                />
                <div className="mt-4 text-white">
                  <h3 className="text-xl font-semibold mb-2">{selectedImage.title}</h3>
                  <p>{selectedImage.description}</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Gallery; 