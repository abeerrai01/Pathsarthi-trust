import React from 'react';
import { Heart, MessageCircle, Share2, Trash2 } from 'lucide-react';

// Sample posts array
const samplePosts = [
  {
    id: '1',
    imageUrl: 'https://res.cloudinary.com/dgmhz64fs/image/upload/v1710000000/sample1.jpg',
    heading: 'Joyful Learning',
    likes: 24,
    comments: 5,
  },
  {
    id: '2',
    imageUrl: 'https://res.cloudinary.com/dgmhz64fs/image/upload/v1710000000/sample2.jpg',
    heading: 'Community Health Camp',
    likes: 12,
    comments: 2,
  },
  {
    id: '3',
    imageUrl: 'https://res.cloudinary.com/dgmhz64fs/image/upload/v1710000000/sample3.jpg',
    heading: 'Empowering Women',
    likes: 31,
    comments: 8,
  },
  // Add more posts as needed
];

const MediaFeed = ({ posts = samplePosts, isAdmin = false, onDelete }) => {
  return (
    <div className="min-h-screen py-8 px-2 bg-[#fffaf8] dark:bg-[#181818]">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-[#ff7300] dark:text-orange-300">PathSarthi Media Gallery</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
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
                {isAdmin && (
                  <button
                    onClick={() => onDelete && onDelete(post.id)}
                    className="absolute top-2 right-2 bg-white/80 dark:bg-[#232323]/80 p-2 rounded-full shadow hover:bg-red-100 hover:text-red-600 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default MediaFeed; 