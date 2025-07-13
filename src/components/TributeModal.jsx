import React from 'react';

const TributeModal = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative border-4 border-accent-200 animate-slide-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-accent-600 hover:text-accent-800 text-3xl font-extrabold focus:outline-none"
          aria-label="Close"
        >
          &times;
        </button>
        <div className="flex flex-col items-center text-center">
          <div className="text-4xl md:text-5xl font-extrabold text-accent-600 mb-2 font-serif">🌸</div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-accent-700 font-serif tracking-wide drop-shadow-lg">
            Tribute to Gunjan Gururani – A Voice of Strength and Creativity
          </h2>
          <p className="text-lg md:text-xl text-gray-700 font-medium mb-6 leading-relaxed font-sans">
            At Pathsarthi Trust, we believe in uplifting voices that spark change — voices like Gunjan Gururani's.
          </p>
          <p className="italic text-accent-700 mb-4 font-serif text-lg">
            Through her past work, Gunjan has shown us that empowerment isn’t always loud. Sometimes, it’s found in the quiet courage of sharing your journey, your art, and your truth with the world.
          </p>
          <p className="text-gray-800 mb-4 font-sans">
            Her contribution is more than just a showcase of talent — it’s a reflection of resilience, grace, and a deep sense of purpose. Her work speaks of a young woman who dares to dream, not just for herself, but for a brighter, more compassionate society.
          </p>
          <p className="text-accent-600 font-semibold mb-4 font-serif">
            We are proud to feature her in our Women Empowerment section — not just as a contributor, but as a symbol of inspiration for every girl waiting for her moment to shine. 🌟
          </p>
          <div className="bg-accent-50 rounded-xl p-4 mb-4 border border-accent-200 shadow-inner">
            <span className="block text-lg md:text-xl font-bold text-accent-700 mb-2 font-serif">Dear Gunjan,</span>
            <span className="block text-gray-700 font-medium font-sans">
              Thank you for letting us be a part of your story.<br/>
              May your creativity continue to move hearts and open minds.<br/>
              <span className="text-accent-500 font-bold">You are seen. You are valued. You are celebrated. 💖</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TributeModal; 