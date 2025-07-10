import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Internship() {
  const [showPreview, setShowPreview] = useState(false);
  const [showAlert, setShowAlert] = useState(true);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-orange-50 min-h-screen py-12">
      {showAlert && (
        <div className="max-w-xl mx-auto mb-8">
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 p-4 rounded-lg shadow flex flex-col gap-2 relative">
            <div className="font-bold text-lg flex items-center gap-2">
              <span role="img" aria-label="alert">📢</span> Internship Update
            </div>
            <div className="text-gray-800">
              Internship slots for this month are now closed.<br />
              But good news — applications for next month's batch are open!<br />
              Submit the form now to be considered for the next round. 🚀
            </div>
            <button
              onClick={() => setShowAlert(false)}
              className="self-end mt-2 px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-center text-indigo-800 mb-4"
        >
          🌍 PathSarthi Internship Program
        </motion.h1>
        <p className="text-center text-lg md:text-xl text-gray-700 mb-8 font-medium">
          Join the Mission. Lead the Change.<br/>
          <span className="italic text-orange-600">“When one child smiles, a world of change begins.”</span>
        </p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-10"
        >
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">What is the Internship About?</h2>
          <p className="text-gray-700 mb-4">
            At PathSarthi Trust, we believe change begins with action — and our internship program empowers students and young professionals to be a part of that action. Whether you're passionate about social work, creative storytelling, community engagement, or operations — there's a space for you here 💙.
          </p>
          <h3 className="text-xl font-semibold text-orange-600 mb-2">Internship Fields You Can Join:</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border rounded-lg mb-4">
              <thead>
                <tr className="bg-indigo-100">
                  <th className="py-2 px-4">Department</th>
                  <th className="py-2 px-4">Role</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="py-2 px-4">📱 Social Media</td><td className="py-2 px-4">Content creation, Instagram reels, poster design, awareness campaigns</td></tr>
                <tr><td className="py-2 px-4">🎯 Event Organizers</td><td className="py-2 px-4">Plan weekly drives, health camps, notebook distribution</td></tr>
                <tr><td className="py-2 px-4">🧠 College Ambassador</td><td className="py-2 px-4">Identify and invite new volunteers from colleges & society</td></tr>
                <tr><td className="py-2 px-4">💻 Tech Support</td><td className="py-2 px-4">Website, admin panel, or database help</td></tr>
                <tr><td className="py-2 px-4">📝 Content Writers</td><td className="py-2 px-4">Blogs, impact stories, captions, contest ideas</td></tr>
                <tr><td className="py-2 px-4">📷 Media & Photography</td><td className="py-2 px-4">Capture moments from our field programs</td></tr>
              </tbody>
            </table>
          </div>
          <h3 className="text-xl font-semibold text-orange-600 mb-2 mt-6">What You'll Get:</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>✅ Internship Certificate by PathSarthi Trust</li>
            <li>✅ Letter of Appreciation from our Chairperson</li>
            <li>✅ Get featured on our official social media pages</li>
            <li>✅ Real-world project experience</li>
            <li>✅ Priority access to events, kits, contests & badges</li>
            <li>✅ Network with a team of social warriors from all over India 🇮🇳</li>
          </ul>
          <button
            className="bg-gradient-to-r from-indigo-500 to-orange-400 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-white/20 mb-8"
            onClick={() => setShowPreview(true)}
          >
            Preview Certificate
          </button>
          <div className="mb-4 text-green-700 font-semibold">⭐ Bonus: Top performers may be offered long-term volunteering opportunities with official Trust ID.</div>
          <h3 className="text-xl font-semibold text-orange-600 mb-2 mt-6">Who Can Apply?</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>Students (School/College/University)</li>
            <li>Freshers & NGO-enthusiasts</li>
            <li>Freelancers looking to create social impact</li>
            <li>Anyone aged 16+ with a heart for change 💖</li>
          </ul>
          <h3 className="text-xl font-semibold text-orange-600 mb-2 mt-6">Internship Duration</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>📆 Minimum: 2 weeks</li>
            <li>📆 Maximum: 3 months</li>
            <li>📍 Work from anywhere | 📱 Flexible hours</li>
          </ul>
          <h3 className="text-xl font-semibold text-orange-600 mb-2 mt-6">How to Apply</h3>
          <p className="text-gray-700 mb-2">You can apply by filling out our Internship Form or emailing us directly.<br/>(We’ll contact shortlisted interns within 3–5 working days.)</p>
          <div className="mb-2">
            <span className="font-semibold">📩 Email:</span> <a href="mailto:pathsarthi2022@gmail.com" className="text-indigo-700 underline">pathsarthi2022@gmail.com</a><br/>
            <span className="font-semibold">📞 Phone:</span> <a href="tel:+918958421200" className="text-indigo-700 underline">+91 8958421200</a>
          </div>
          <div className="flex justify-center mt-6">
            <Link to="/internship-form">
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-r from-indigo-500 to-orange-400 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-white/20"
              >
                Apply Now
              </motion.button>
            </Link>
          </div>
        </motion.div>
        <div className="text-center text-gray-500 mt-8 text-sm">
          🌈 Together, let’s build a stronger India, one mission at a time.
        </div>
      </div>
      {showPreview && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.85)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={() => setShowPreview(false)}
            style={{
              position: 'absolute',
              top: 24,
              right: 32,
              fontSize: 36,
              color: '#fff',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              zIndex: 1001,
            }}
            aria-label="Close preview"
          >
            ×
          </button>
          <img
            src="/internship.png"
            alt="Internship Certificate Preview"
            style={{
              maxWidth: '90vw',
              maxHeight: '80vh',
              borderRadius: 12,
              boxShadow: '0 4px 32px rgba(0,0,0,0.3)',
              background: '#fff',
            }}
          />
        </div>
      )}
    </div>
  );
} 