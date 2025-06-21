import React from 'react';
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
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
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
