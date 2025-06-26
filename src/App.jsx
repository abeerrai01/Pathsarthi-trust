import React, { useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Mission from './pages/Mission';
import Contribution from './pages/Contribution';
import Donate from './pages/Donate';
import AboutUs from './pages/AboutUs';
import SponsorNotebooks from './pages/SponsorNotebooks';
import TrustMembers from './pages/TrustMembers';
import CheckoutNotebooks from './pages/CheckoutNotebooks';
import SocialMedia from './pages/SocialMedia';
import Member from './pages/Member';
import JoinUs from './pages/JoinUs';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

function App() {
  const [showMissionPopup, setShowMissionPopup] = useState(true);
  const blipRef = useRef(null);

  const playBlip = () => {
    if (blipRef.current) {
      blipRef.current.currentTime = 0;
      blipRef.current.play();
    }
  };

  const handlePopupCheckout = () => {
    playBlip();
    setTimeout(() => {
      setShowMissionPopup(false);
      window.location.href = '/mission';
    }, 250);
  };
  const handlePopupClose = (e) => {
    if (e.target.id === 'mission-popup-overlay') {
      playBlip();
      setTimeout(() => setShowMissionPopup(false), 250);
    }
  };

  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          {/* Blip sound */}
          <audio ref={blipRef} src="/blip.mp3" preload="auto" />
          {/* Mission Popup with animation */}
          <AnimatePresence>
            {showMissionPopup && (
              <motion.div
                id="mission-popup-overlay"
                onClick={handlePopupClose}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center relative"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25, duration: 0.4 }}
                >
                  <h2 className="text-2xl font-bold text-yellow-700 mb-4">🚀 Check Out Our Upcoming Mission!</h2>
                  <p className="text-gray-700 mb-6">
                    PathSarthi Trust is launching <span className="font-semibold text-indigo-700">'एक किताब, एक भविष्य'</span> — a campaign to put a book in every child's hands. Your support can help shape a child's future and make dreams come true. Join us in this journey of hope and learning!
                  </p>
                  <button
                    onClick={handlePopupCheckout}
                    className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold px-8 py-3 rounded-full shadow-lg text-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2"
                  >
                    Checkout
                  </button>
                  <p className="mt-4 text-xs text-gray-400">Click anywhere outside this box to continue to the site.</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          <Navbar />
          <main className="flex-grow pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/mission" element={<Mission />} />
                <Route path="/contribution" element={<Contribution />} />
                <Route path="/donate" element={<Donate />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/sponsor-notebooks" element={<SponsorNotebooks />} />
                <Route path="/checkout-notebooks" element={<CheckoutNotebooks />} />
                <Route path="/trust-members" element={<TrustMembers />} />
                <Route path="/social-media" element={<SocialMedia />} />
                <Route path="/member" element={<Member />} />
                <Route path="/join-us" element={<JoinUs />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </main>
          <Footer />
        </div>
        <Analytics />
        <SpeedInsights />
      </AuthProvider>
    </Router>
  );
}

export default App;
