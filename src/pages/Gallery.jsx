import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Gallery = () => {
  // Health Camp images
  const healthCampImages = [
    { id: 1, src: '/HC1.jpg' },
    { id: 2, src: '/HC2.jpg' },
    { id: 3, src: '/HC3.jpg' },
    { id: 4, src: '/HC4.jpg' },
    { id: 5, src: '/HC5.jpg' },
    { id: 6, src: '/HC6.jpg' },
    { id: 7, src: '/HC7.jpg' },
    { id: 8, src: '/HC8.jpg' },
    { id: 9, src: '/HC9.jpg' },
    { id: 10, src: '/HC10.jpg' },
    { id: 11, src: '/HC11.jpg' },
    { id: 12, src: '/HC12.jpg' },
    { id: 13, src: '/HC13.jpg' },
    { id: 14, src: '/HC14.jpg' },
    { id: 15, src: '/HC15.jpg' },
    { id: 16, src: '/HC16.jpg' },
  ];

  // Meetup images
  const meetupImages = [
    { id: 1, src: '/gallery1.jpg' },
    { id: 2, src: '/gallery4.jpg' },
  ];

  // Combine all images into one array
  const allImages = [
    ...healthCampImages,
    ...meetupImages,
  ];

  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12">Our Gallery</h1>

        {/* Unified Image Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-16">
          {allImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="relative group cursor-pointer flex items-center justify-center bg-transparent"
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image.src}
                alt={image.title}
                className="w-full h-48 object-cover rounded-md shadow-sm"
                style={{ aspectRatio: '4/3' }}
              />
            </motion.div>
          ))}
        </div>

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
                  src={selectedImage.src}
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