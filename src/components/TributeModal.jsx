import React from 'react';

const TributeModal = ({ open, onClose, type }) => {
  if (!open) return null;
  // Handler to close when clicking the overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Color classes for each tribute type
  const color = type === 'education'
    ? {
        accent: 'text-sky-600',
        accentBg: 'bg-sky-50',
        accentBorder: 'border-sky-200',
        accentStrong: 'text-orange-500',
        accentTitle: 'text-orange-600',
        accentBgInner: 'bg-orange-50',
      }
    : {
        accent: 'text-accent-600',
        accentBg: 'bg-accent-50',
        accentBorder: 'border-accent-200',
        accentStrong: 'text-accent-500',
        accentTitle: 'text-accent-700',
        accentBgInner: 'bg-accent-50',
      };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 animate-fade-in px-2"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl max-h-[90vh] overflow-y-auto relative border-4 animate-slide-in ${color.accentBorder}`}
        onClick={e => e.stopPropagation()}
        style={{ boxSizing: 'border-box' }}
      >
        <button
          onClick={onClose}
          className={`absolute top-3 right-4 ${color.accent} hover:text-orange-600 text-3xl font-extrabold focus:outline-none`}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="flex flex-col items-center text-center">
          <div className={`text-4xl md:text-5xl font-extrabold mb-2 font-serif ${color.accent}`}>🌸</div>
          {type === 'education' ? (
            <>
              <h2 className={`text-2xl md:text-3xl font-bold mb-4 font-serif tracking-wide drop-shadow-lg ${color.accentTitle}`}>
                Tribute to Gunjan Gururani – A Voice of Strength, Compassion & Change
              </h2>
              <p className="text-lg md:text-xl text-gray-700 font-medium mb-6 leading-relaxed font-sans">
                At Pathsarthi Trust, we take pride in recognizing individuals who turn compassion into action — and Gunjan Gururani is one such remarkable young woman.
              </p>
              <p className={`italic mb-4 font-serif text-lg ${color.accent}`}>
                Captured in this heartfelt moment, Gunjan is seen doing what true empowerment looks like — sitting with children, not above them but among them, sharing knowledge, laughter, and light. 🌞📚 Her presence reflects the kind of leadership that doesn’t need a stage — just a notebook, a warm smile, and a heart full of intent.
              </p>
              <p className="text-gray-800 mb-4 font-sans">
                This image speaks louder than any words. It tells the story of a girl who chose to step into the real world, to connect, teach, and uplift — embodying the core spirit of Pathsarthi’s Education Support initiative.
              </p>
              <p className={`font-semibold mb-4 font-serif ${color.accentStrong}`}>
                Her contribution is rooted in kindness, driven by purpose, and full of humility. Gunjan’s efforts remind us that change begins when we sit down, listen, and lift others up.
              </p>
              <div className={`rounded-xl p-4 mb-4 border shadow-inner ${color.accentBg} ${color.accentBorder}`}>
                <span className={`block text-lg md:text-xl font-bold mb-2 font-serif ${color.accentTitle}`}>Dear Gunjan,</span>
                <span className="block text-gray-700 font-medium font-sans">
                  Your actions speak volumes.<br/>
                  Your impact is real.<br/>
                  <span className={`font-bold ${color.accentStrong}`}>And your story now lives through Pathsarthi as a beacon for others. 🌱</span>
                </span>
              </div>
            </>
          ) : (
            <>
              <h2 className={`text-2xl md:text-3xl font-bold mb-4 font-serif tracking-wide drop-shadow-lg ${color.accentTitle}`}>
                Tribute to Gunjan Gururani – A Voice of Strength and Creativity
              </h2>
              <p className="text-lg md:text-xl text-gray-700 font-medium mb-6 leading-relaxed font-sans">
                At Pathsarthi Trust, we believe in uplifting voices that spark change — voices like Gunjan Gururani's.
              </p>
              <p className={`italic mb-4 font-serif text-lg ${color.accent}`}>
                Through her past work, Gunjan has shown us that empowerment isn’t always loud. Sometimes, it’s found in the quiet courage of sharing your journey, your art, and your truth with the world.
              </p>
              <p className="text-gray-800 mb-4 font-sans">
                Her contribution is more than just a showcase of talent — it’s a reflection of resilience, grace, and a deep sense of purpose. Her work speaks of a young woman who dares to dream, not just for herself, but for a brighter, more compassionate society.
              </p>
              <p className={`font-semibold mb-4 font-serif ${color.accent}`}>
                We are proud to feature her in our Women Empowerment section — not just as a contributor, but as a symbol of inspiration for every girl waiting for her moment to shine. 🌟
              </p>
              <div className={`rounded-xl p-4 mb-4 border shadow-inner ${color.accentBg} ${color.accentBorder}`}>
                <span className={`block text-lg md:text-xl font-bold mb-2 font-serif ${color.accentTitle}`}>Dear Gunjan,</span>
                <span className="block text-gray-700 font-medium font-sans">
                  Thank you for letting us be a part of your story.<br/>
                  May your creativity continue to move hearts and open minds.<br/>
                  <span className={`font-bold ${color.accentStrong}`}>You are seen. You are valued. You are celebrated. 💖</span>
                </span>
              </div>
            </>
          )}
          <span className="text-xs text-gray-400 mt-2">Tap/click outside this note to close</span>
        </div>
      </div>
    </div>
  );
};

export default TributeModal; 