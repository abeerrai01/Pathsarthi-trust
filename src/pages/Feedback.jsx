import React, { useState } from 'react';

const Feedback = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [playing, setPlaying] = useState(false);
  const videoRef = React.useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Here you could send the feedback to your backend or a service
  };

  const handlePlay = () => {
    setPlaying(true);
    videoRef.current.play();
  };

  const handlePause = () => {
    setPlaying(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50 py-12">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-indigo-800 mb-6">Feedback</h1>
        {/* Video with play button overlay */}
        <div className="mb-8 relative w-full aspect-video rounded-lg overflow-hidden shadow">
          <video
            ref={videoRef}
            src="/FEEDBACK-1.mp4"
            className="w-full h-full object-cover rounded-lg"
            controls={playing}
            onPause={handlePause}
            onEnded={handlePause}
            poster="/banner-1.jpg"
          />
          {!playing && (
            <button
              onClick={handlePlay}
              className="absolute inset-0 flex items-center justify-center w-full h-full bg-black bg-opacity-40 hover:bg-opacity-50 transition"
              style={{ cursor: 'pointer' }}
              aria-label="Play video"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" fill="rgba(0,0,0,0.5)" />
                <polygon points="10,8 16,12 10,16" fill="white" />
              </svg>
            </button>
          )}
        </div>
        {submitted ? (
          <div className="text-center text-green-700 font-semibold text-lg">Thank you for your feedback!</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Name</label>
              <input name="name" value={form.name} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Message</label>
              <textarea name="message" value={form.message} onChange={handleChange} required className="w-full border rounded px-3 py-2" rows={4} />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300">Submit</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Feedback; 