import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Heart, MessageCircle, Share2 } from 'lucide-react';

const MediaFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'galleryFeed'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
        likes: docSnap.data().likes || Math.floor(Math.random() * 50),
        comments: docSnap.data().comments || Math.floor(Math.random() * 10),
      })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen py-8 px-2 bg-[#fffaf8] dark:bg-[#181818]">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-[#ff7300] dark:text-orange-300">PathSarthi Media Gallery</h1>
        {loading ? (
          <div className="text-center text-lg py-20 text-gray-400">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.length === 0 ? (
              <div className="col-span-full text-center text-lg text-gray-400">No media yet.</div>
            ) : (
              posts.map(post => (
                <div
                  key={post.id}
                  className="relative group bg-white dark:bg-[#232323] border-4 border-[#ff7300] rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-200 flex flex-col items-center p-4 cursor-pointer"
                >
                  <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 relative">
                    <img
                      src={post.imageUrl}
                      alt={post.heading}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      style={{ background: '#fffaf8' }}
                      loading="lazy"
                    />
                  </div>
                  <div className="font-bold text-center text-lg mb-2 text-[#ff7300] dark:text-orange-200 w-full truncate">{post.heading}</div>
                  <div className="flex gap-8 items-center mt-auto w-full justify-center">
                    <button className="flex items-center gap-1 px-3 py-1 rounded-full font-medium text-[#ff7300] hover:bg-orange-50 dark:hover:bg-orange-900/30 transition">
                      <Heart size={22} className="transition-colors group-hover:text-red-500" />
                      <span className="text-base">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1 rounded-full font-medium text-[#00a9b7] hover:bg-blue-50 dark:hover:bg-blue-900/30 transition">
                      <MessageCircle size={22} className="transition-colors group-hover:text-blue-500" />
                      <span className="text-base">{post.comments}</span>
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1 rounded-full font-medium text-[#00a9b7] hover:bg-blue-50 dark:hover:bg-blue-900/30 transition">
                      <Share2 size={22} className="transition-colors group-hover:text-green-500" />
                      <span className="text-base">Share</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaFeed; 