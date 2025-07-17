import React, { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import useDarkMode from '../hooks/useDarkMode';
import MediaCard from './MediaCard';
import SkeletonCard from './SkeletonCard';

const MediaGrid = () => {
  const [isDark] = useDarkMode(); // Only use isDark, toggle is now in Navbar
  const [photos, setPhotos] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'galleryFeed'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setPhotos(snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
    });
    return () => unsub();
  }, []);

  return (
    <div className={`min-h-screen py-8 px-2 relative ${isDark ? 'bg-[#181818]' : 'bg-gradient-to-br from-[#fffafa] via-[#fcd8b1]/60 to-[#e0f7fa]/60'}`}
      style={{
        backgroundImage: `url('/PathSarthi logo.png'), linear-gradient(135deg, ${isDark ? '#232323 60%' : '#fffafa 60%'}, ${isDark ? '#232323' : '#e0f7fa'})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center 10rem',
        backgroundSize: '220px',
        opacity: 1
      }}
    >
      <div className="flex justify-center items-center max-w-5xl mx-auto mb-8">
        <h1 className={`text-3xl font-bold text-center flex-1 ${isDark ? 'text-white' : 'text-[#f47920]'}`}>PathSarthi Media Gallery</h1>
      </div>
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {photos === null
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : photos.length === 0
            ? <div className={`col-span-full text-center text-lg ${isDark ? 'text-white' : 'text-gray-500'}`}>No media yet.</div>
            : photos.map(photo => (
                <MediaCard key={photo.id} photo={photo} isDark={isDark} />
              ))
        }
      </div>
    </div>
  );
};

export default MediaGrid; 