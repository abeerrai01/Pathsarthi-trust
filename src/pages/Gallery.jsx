import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  const images = [
    {
      id: 1,
      src: '/images/gallery/education-1.jpg',
      title: 'Education Program',
      description: 'Students participating in our after-school learning program.',
    },
    {
      id: 2,
      src: '/images/gallery/healthcare-1.jpg',
      title: 'Healthcare Camp',
      description: 'Free medical checkup camp in rural community.',
    },
    {
      id: 3,
      src: '/images/gallery/women-1.jpg',
      title: 'Women Empowerment',
      description: 'Skill development workshop for women entrepreneurs.',
    },
    {
      id: 4,
      src: '/images/gallery/community-1.jpg',
      title: 'Community Service',
      description: 'Volunteers helping in community development project.',
    },
    {
      id: 5,
      src: '/images/gallery/education-2.jpg',
      title: 'Digital Learning',
      description: 'Computer education program for underprivileged children.',
    },
    {
      id: 6,
      src: '/images/gallery/healthcare-2.jpg',
      title: 'Health Awareness',
      description: 'Health awareness session in local community.',
    },
    {
      id: 7,
      src: '/images/gallery/women-2.jpg',
      title: 'Women Leadership',
      description: 'Women leadership development program.',
    },
    {
      id: 8,
      src: '/images/gallery/community-2.jpg',
      title: 'Environmental Initiative',
      description: 'Tree plantation drive with community participation.',
    },
    {
      id: 9,
      src: '/images/gallery/education-3.jpg',
      title: 'Art Workshop',
      description: 'Creative arts workshop for children.',
    },
  ];

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12">Our Gallery</h1>
        
        {/* Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden">
                <img
                  src={image.src}
                  alt={image.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4">
                  <h3 className="text-lg font-semibold mb-2">{image.title}</h3>
                  <p className="text-sm">{image.description}</p>
                </div>
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