import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../config/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { Camera, Maximize2, X, ChevronRight, LayoutGrid } from 'lucide-react';
import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Gallery = () => {
  const [photos, setPhotos] = useState([]);
  const [expandedHeadings, setExpandedHeadings] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPhotos(data);
    };
    fetchPhotos();
  }, []);

  const grouped = {};
  photos.forEach(doc => {
    let images = Array.isArray(doc.images) ? [...doc.images] : [];
    if (doc.imageUrl) {
      if (!images.some(img => img.imageUrl === doc.imageUrl)) {
        images.unshift({ imageUrl: doc.imageUrl });
      }
    }
    if (!grouped[doc.heading]) grouped[doc.heading] = [];
    images.forEach(img => grouped[doc.heading].push({ ...img, docId: doc.id }));
  });

  const toggleHeading = (heading) => {
    setExpandedHeadings(prev =>
      prev.includes(heading) ? prev.filter(h => h !== heading) : [...prev, heading]
    );
  };

  return (
    <div className="bg-background">
      <Section title="Weekly Event Gallery" subtitle="Captured Moments" className="pt-32">
        <div className="max-w-6xl mx-auto">
          {Object.keys(grouped).map((heading, idx) => {
            const isExpanded = expandedHeadings.includes(heading);
            const displayImages = isExpanded ? grouped[heading] : grouped[heading].slice(0, 3);
            const hasMore = grouped[heading].length > 3;

            return (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-20 last:mb-0"
              >
                {/* Event Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-accent border-2 border-foreground rounded-xl flex items-center justify-center shadow-pop rotate-3">
                    <Camera className="w-6 h-6 text-foreground" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-heading font-black text-foreground">{heading}</h2>
                  <div className="flex-grow h-1 bg-foreground/10 rounded-full hidden md:block" />
                  <span className="hidden md:block font-black text-sm text-mutedForeground uppercase tracking-tighter">
                    {grouped[heading].length} Photos
                  </span>
                </div>

                {/* Image Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  <AnimatePresence>
                    {displayImages.map((img, index) => (
                      <motion.div
                        key={img.imageUrl + index}
                        layout
                        initial={{ opacity: 0, scale: 0.8, rotate: index % 2 === 0 ? -2 : 2 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group relative cursor-zoom-in"
                        onClick={() => setSelectedImage(img)}
                      >
                        <Card variant="default" className="p-3 bg-white hover:rotate-0 transition-transform duration-300">
                          <div className="aspect-[4/3] overflow-hidden rounded-lg border-2 border-foreground mb-4">
                            <img
                              src={img.imageUrl.replace('/upload/', '/upload/q_auto,f_auto,c_fill,w_600/')}
                              alt={heading}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                          <div className="flex justify-between items-center px-1">
                            <span className="text-xs font-black uppercase tracking-widest text-mutedForeground">Path Sarthi • {idx + 1}</span>
                            <Maximize2 className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {hasMore && !isExpanded && (
                    <motion.div 
                      layout
                      className="flex items-center justify-center h-full"
                    >
                      <button 
                        onClick={() => toggleHeading(heading)}
                        className="group flex flex-col items-center gap-4 p-8 border-4 border-dashed border-foreground/20 rounded-2xl hover:border-accent hover:bg-accent/5 transition-all w-full h-full"
                      >
                        <div className="w-16 h-16 bg-white border-2 border-foreground rounded-full flex items-center justify-center shadow-pop group-hover:-translate-y-2 transition-transform">
                          <ChevronRight className="w-8 h-8 text-accent" />
                        </div>
                        <span className="font-heading font-black text-foreground uppercase">View {grouped[heading].length - 3} More</span>
                      </button>
                    </motion.div>
                  )}
                </div>

                {isExpanded && (
                  <div className="mt-8 flex justify-center">
                    <Button variant="secondary" onClick={() => toggleHeading(heading)}>Show Less</Button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </Section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 bg-foreground/95 z-[200] flex items-center justify-center p-4 md:p-10 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-5xl w-full bg-white border-4 border-foreground p-4 md:p-8 rounded-3xl shadow-pop-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-6 -right-6 p-3 bg-secondary border-4 border-foreground rounded-full shadow-pop hover:scale-110 transition-transform z-10"
              >
                <X className="w-6 h-6 text-foreground" strokeWidth={3} />
              </button>
              
              <img
                src={selectedImage.imageUrl.replace('/upload/', '/upload/q_auto,f_auto/')}
                alt="Preview"
                className="w-full h-auto max-h-[70vh] object-contain rounded-xl border-2 border-foreground"
              />
              
              <div className="mt-6 flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-2xl font-heading font-black text-foreground">Memory Capsule</h3>
                  <p className="text-mutedForeground font-bold uppercase tracking-widest text-xs">Path Sarthi Archive • © 2024</p>
                </div>
                <div className="hidden md:flex gap-4">
                  <div className="bg-tertiary/20 p-3 rounded-xl border-2 border-foreground shadow-pop">
                    <LayoutGrid className="w-6 h-6 text-foreground" />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery; 
 