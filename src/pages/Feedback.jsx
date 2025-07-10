import React, { useState } from 'react';

const Feedback = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Here you could send the feedback to your backend or a service
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50 py-12 px-2">
      {/* Responsive video above the form */}
      <div className="w-full flex flex-col items-center mb-8">
        <div className="w-full max-w-3xl flex flex-col items-center">
          <div className="w-full" style={{ position: 'relative' }}>
            <video
              src="/FEEDBACK-1.mp4"
              className="w-full h-auto rounded-lg shadow"
              controls
              style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
            />
          </div>
          <div className="mt-2 text-center text-gray-700 text-base max-w-2xl">
            <span className="font-semibold">Feedback from our community:</span> Watch this video to see what people are saying about Path Sarthi Trust!
          </div>
        </div>
      </div>
      {/* Feedback form card */}
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-indigo-800 mb-6">Feedback</h1>
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