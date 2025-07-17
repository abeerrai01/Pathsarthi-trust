import React, { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import useDarkMode from '../hooks/useDarkMode';
import MediaCard from './MediaCard';
import SkeletonCard from './SkeletonCard';

const MediaGrid = () => {
  const [isDark, toggleDarkMode] = useDarkMode();
  const [photos, setPhotos] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'galleryFeed'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setPhotos(snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
    });
    return () => unsub();
  }, []);

  return (
    <div className={`min-h-screen py-8 px-2 ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#fffafa]'}`}>
      <div className="flex justify-between items-center max-w-5xl mx-auto mb-8">
        <h1 className={`text-3xl font-bold text-center flex-1 ${isDark ? 'text-white' : 'text-[#f47920]'}`}>PathSarthi Media Gallery</h1>
        <button
          className={`ml-4 px-4 py-2 rounded-lg font-semibold border-2 ${isDark ? 'bg-[#232323] text-white border-[#00a9b7]' : 'bg-white text-[#00a9b7] border-[#fcd8b1]'} transition`}
          onClick={toggleDarkMode}
        >
          {isDark ? '🌙 Dark' : '☀️ Light'}
        </button>
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