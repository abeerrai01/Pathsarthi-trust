import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import Developer from './pages/Developer';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import RefundPolicy from './pages/RefundPolicy';
import DonationDisclaimer from './pages/DonationDisclaimer';
import ContestPage from './components/ContestPage';
import Internship from './pages/Internship';
import InternshipForm from './pages/InternshipForm';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import { lazy, Suspense } from 'react';
import { logVisit } from './utils/logVisit';
const CertificateGenerator = lazy(() => import('./components/Dashboard/CertificateGenerator'));
const CertificateList = lazy(() => import('./components/Dashboard/CertificateList'));
import VerifyCertificate from './pages/VerifyCertificate';
import Supporters from './pages/Supporters';
import TermsInterns from './pages/TermsInterns';

function MissionPopup() {
  const [show, setShow] = useState(false);
  const blipRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    // Only show on first visit to home page in this session
    if (location.pathname === '/' && !sessionStorage.getItem('missionPopupShown')) {
      setShow(true);
      sessionStorage.setItem('missionPopupShown', 'true');
    } else {
      setShow(false);
    }
  }, [location.pathname]);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => setShow(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const playBlip = () => {
    if (blipRef.current) {
      blipRef.current.currentTime = 0;
      blipRef.current.play();
    }
  };

  const handlePopupCheckout = () => {
    playBlip();
    setTimeout(() => {
      setShow(false);
      window.location.href = '/mission';
    }, 250);
  };

  const handlePopupClose = (e) => {
    if (e.target.id === 'mission-popup-overlay') {
      playBlip();
      setTimeout(() => setShow(false), 250);
    }
  };

  return (
    <>
      <audio ref={blipRef} src="/blip.mp3" preload="auto" />
      <AnimatePresence>
        {show && location.pathname === '/' && (
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
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) {
                  playBlip();
                  setShow(false);
                }
              }}
              style={{ touchAction: 'none', cursor: 'grab' }}
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
              <p className="mt-4 text-xs text-gray-400">Click anywhere outside this box or slide down to dismiss.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function GlobalConfetti({ show, onClose }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] pointer-events-none flex items-start justify-center"
        >
          <img src="https://cdn.jsdelivr.net/gh/stevenlei/party-js-confetti/confetti.gif" alt="Confetti" className="w-full max-w-2xl mt-10" />
          {/* Doraemon and Shinchan appear with confetti */}
          <motion.img
            src="/doraemon.png"
            alt="Doraemon"
            className="absolute left-1/4 bottom-10 w-40 h-40 object-contain drop-shadow-xl"
            initial={{ y: 100, opacity: 0, scale: 0.7 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          />
          <motion.img
            src="/shinchan.png"
            alt="Shinchan"
            className="absolute right-1/4 bottom-10 w-40 h-40 object-contain drop-shadow-xl"
            initial={{ y: 100, opacity: 0, scale: 0.7 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function App() {
  useEffect(() => {
    logVisit(window.location.pathname);
  }, []);
  const [globalConfetti, setGlobalConfetti] = useState(false);
  const triggerConfetti = () => {
    setGlobalConfetti(true);
    setTimeout(() => setGlobalConfetti(false), 2500);
  };
  return (
    <Router>
      <AuthProvider>
        <GlobalConfetti show={globalConfetti} />
        {/* <MissionPopup /> */}
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <main className="flex-grow pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/supporters" element={<Supporters />} />
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
                <Route path="/developer" element={<Developer />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsAndConditions />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/donation-disclaimer" element={<DonationDisclaimer />} />
                <Route path="/contest" element={<ContestPage />} />
                <Route path="/internship" element={<Internship />} />
                <Route path="/internship-form" element={<InternshipForm />} />
                <Route path="/terms-interns" element={<TermsInterns />} />
                <Route path="/admin/certificates" element={
                  <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading Certificate Generator...</div>}>
                    <CertificateGenerator />
                  </Suspense>
                } />
                <Route path="/admin/certificates-list" element={
                  <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading Certificate List...</div>}>
                    <CertificateList />
                  </Suspense>
                } />
                <Route path="/verify/:name" element={<VerifyCertificate />} />

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
