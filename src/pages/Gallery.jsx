import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Gallery = () => {
  // Health Camp images
  const healthCampImages = [
    { id: 1, src: '/HC1.jpg', title: 'Healthcare Camp 1', description: 'PathSarthi Trust healthcare outreach event - 1.' },
    { id: 2, src: '/HC2.jpg', title: 'Healthcare Camp 2', description: 'PathSarthi Trust healthcare outreach event - 2.' },
    { id: 3, src: '/HC3.jpg', title: 'Healthcare Camp 3', description: 'PathSarthi Trust healthcare outreach event - 3.' },
    { id: 4, src: '/HC4.jpg', title: 'Healthcare Camp 4', description: 'PathSarthi Trust healthcare outreach event - 4.' },
    { id: 5, src: '/HC5.jpg', title: 'Healthcare Camp 5', description: 'PathSarthi Trust healthcare outreach event - 5.' },
    { id: 6, src: '/HC6.jpg', title: 'Healthcare Camp 6', description: 'PathSarthi Trust healthcare outreach event - 6.' },
    { id: 7, src: '/HC7.jpg', title: 'Healthcare Camp 7', description: 'PathSarthi Trust healthcare outreach event - 7.' },
    { id: 8, src: '/HC8.jpg', title: 'Healthcare Camp 8', description: 'PathSarthi Trust healthcare outreach event - 8.' },
    { id: 9, src: '/HC9.jpg', title: 'Healthcare Camp 9', description: 'PathSarthi Trust healthcare outreach event - 9.' },
    { id: 10, src: '/HC10.jpg', title: 'Healthcare Camp 10', description: 'PathSarthi Trust healthcare outreach event - 10.' },
    { id: 11, src: '/HC11.jpg', title: 'Healthcare Camp 11', description: 'PathSarthi Trust healthcare outreach event - 11.' },
    { id: 12, src: '/HC12.jpg', title: 'Healthcare Camp 12', description: 'PathSarthi Trust healthcare outreach event - 12.' },
    { id: 13, src: '/HC13.jpg', title: 'Healthcare Camp 13', description: 'PathSarthi Trust healthcare outreach event - 13.' },
    { id: 14, src: '/HC14.jpg', title: 'Healthcare Camp 14', description: 'PathSarthi Trust healthcare outreach event - 14.' },
    { id: 15, src: '/HC15.jpg', title: 'Healthcare Camp 15', description: 'PathSarthi Trust healthcare outreach event - 15.' },
    { id: 16, src: '/HC16.jpg', title: 'Healthcare Camp 16', description: 'PathSarthi Trust healthcare outreach event - 16.' },
  ];

  // Meetup images
  const meetupImages = [
    { id: 1, src: '/gallery1.jpg', title: 'Community Outreach', description: 'PathSarthi Trust volunteers engaging with children during a community event.' },
    { id: 2, src: '/gallery4.jpg', title: 'Educational Support', description: 'Distributing notebooks and educational materials to students in need.' },
  ];

  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12">Our Gallery</h1>

        {/* Health Camp Section */}
        <h2 className="text-2xl font-bold mb-8 text-indigo-700 text-center">HEALTH CAMP BY BRIGHTSTAR HOSPITAL WITH PATHSARTHI</h2>
        <div className="grid grid-cols-1 gap-8 mb-16">
          {healthCampImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="relative group cursor-pointer border-2 border-gray-300 rounded-lg p-4 bg-white flex flex-col items-center"
              onClick={() => setSelectedImage(image)}
            >
              <div className="w-full flex justify-center">
                <img
                  src={image.src}
                  alt={image.title}
                  className="max-w-md w-full h-64 object-contain rounded-md bg-gray-50"
                />
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-lg font-semibold mb-2">{image.title}</h3>
                <p className="text-sm text-gray-600">{image.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Meetup Section */}
        <h2 className="text-2xl font-bold mb-8 text-indigo-700 text-center">MEETUP WITH BRIGHTSTAR HOSPITAL</h2>
        <div className="grid grid-cols-1 gap-8 mb-16">
          {meetupImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group cursor-pointer border-2 border-gray-300 rounded-lg p-4 bg-white flex flex-col items-center"
              onClick={() => setSelectedImage(image)}
            >
              <div className="w-full flex justify-center">
                <img
                  src={image.src}
                  alt={image.title}
                  className="max-w-md w-full h-64 object-contain rounded-md bg-gray-50"
                />
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-lg font-semibold mb-2">{image.title}</h3>
                <p className="text-sm text-gray-600">{image.description}</p>
              </div>
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