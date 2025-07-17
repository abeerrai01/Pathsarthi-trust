import React from 'react';

const SkeletonCard = () => (
  <div className="bg-white dark:bg-[#232323] border-4 border-[#fcd8b1] rounded-2xl shadow-md p-4 flex flex-col items-center animate-pulse min-h-[340px]">
    <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
    <div className="h-5 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
    <div className="flex gap-6 w-full justify-center mt-auto">
      <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
      <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
      <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
    </div>
  </div>
);

export default SkeletonCard; 