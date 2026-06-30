import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close menu on route change
    setIsMenuOpen(false);
    setExpandedItems({});
  }, [location.pathname]);

  const toggleExpand = (label) => {
    setExpandedItems(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/gallery', label: 'Gallery' },
    { to: '/media', label: 'Media' },
    { 
      label: 'Projects', 
      items: [
        { to: '/contest', label: 'Contest' },
        { to: '/mission', label: 'Mission' },
        { to: '/contribution', label: 'Contribution' }
      ]
    },
    { 
      label: 'Fuel a Dream', 
      items: [
        { to: '/donate', label: 'Donate' },
        { to: '/sponsor-notebooks', label: 'Sponsor Us' }
      ]
    },
    { 
      label: 'Pillars',
      items: [
        { to: '/trust-members', label: 'Board of Trustee' },
        { to: '/member', label: 'Member' },
        { to: '/supporters', label: 'Supporters' },
        {
          label: 'Advisory Volunteers',
          items: [
            { to: '/legal', label: 'Legal Advisory Volunteers' },
            { to: '/doctor', label: 'Health Advisory Volunteers' }
          ]
        }
      ]
    },
    { 
      label: 'Who are we', 
      items: [
        { to: '/about', label: 'About Us' },
        { to: '/social-media', label: 'Social Media' },
        { to: '/join-us', label: 'Join Us' },
        { to: '/feedback', label: 'Feedback' }
      ]
    },
    { to: '/membership', label: 'Membership' },
    { to: '/jan-sampark', label: 'Jan Sampark' },
    { to: '/education-support', label: 'Education Support Program' },
    { to: '/internship', label: 'Internship' },
    { to: '/blog', label: 'Blog' },
    { 
      label: 'Others', 
      items: [
        { to: '/login', label: 'Login' }
      ]
    }
  ];

  const renderNavItems = (items, depth = 0) => {
    return items.map((item, index) => {
      const isExpanded = expandedItems[item.label];
      const hasSubItems = item.items && item.items.length > 0;
      const isLink = item.to;

      return (
        <div key={item.label + index} className="w-full">
          {isLink ? (
            <Link
              to={item.to}
              className={`block w-full text-left px-6 py-4 text-xl font-semibold border-b border-gray-100 transition-colors ${
                location.pathname === item.to ? 'text-indigo-600 bg-indigo-50' : 'text-gray-800 hover:bg-gray-50'
              }`}
              style={{ paddingLeft: `${1.5 + depth * 1.5}rem` }}
            >
              {item.label}
            </Link>
          ) : (
            <div className="w-full">
              <button
                onClick={() => toggleExpand(item.label)}
                className={`flex items-center justify-between w-full text-left px-6 py-4 text-xl font-semibold border-b border-gray-100 transition-colors ${
                  isExpanded ? 'text-indigo-600 bg-gray-50' : 'text-gray-800 hover:bg-gray-50'
                }`}
                style={{ paddingLeft: `${1.5 + depth * 1.5}rem` }}
              >
                <span>{item.label}</span>
                <svg
                  className={`w-6 h-6 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {isExpanded && hasSubItems && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden bg-gray-50/50"
                  >
                    {renderNavItems(item.items, depth + 1)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <>
      <nav
        className={`fixed w-full z-[100] transition-all duration-300 top-0 left-0 bg-white ${
          isScrolled ? 'shadow-md h-20' : 'h-24'
        }`}
        style={{ borderBottom: '1px solid #e5e7eb' }}
      >
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          {/* Left spacer to balance the right menu button and keep brand centered */}
          <div className="flex-1"></div>

          {/* Centered Logo and Title */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <Link to="/" className="flex flex-col items-center group">
              <div className="flex items-center">
                <img
                  src="/PathSarthi logo.png"
                  alt="PathSarthi Trust Logo"
                  className="h-10 w-auto mr-2 md:h-14 md:mr-3 transition-transform duration-300 group-hover:scale-105"
                  style={{ background: 'transparent' }}
                />
                <h1 className="text-xl xs:text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 whitespace-nowrap">
                  Path Sarthi Trust
                </h1>
              </div>
              <p className="text-[10px] xs:text-xs md:text-sm italic font-medium mt-0.5 text-indigo-600 tracking-wider">
                Hope • Heal • Humanity
              </p>
            </Link>
          </div>

          {/* Burger Menu Button on Right */}
          <div className="flex-1 flex justify-end">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 xs:p-3 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Toggle menu"
            >
              <div className="w-6 h-5 xs:w-8 xs:h-6 flex flex-col justify-between items-end overflow-hidden">
                <motion.span
                  animate={isMenuOpen ? { rotate: 45, y: 8, width: '100%' } : { rotate: 0, y: 0, width: '100%' }}
                  className="w-full h-0.5 xs:h-1 bg-gray-900 rounded-full origin-right"
                />
                <motion.span
                  animate={isMenuOpen ? { opacity: 0, x: 20 } : { opacity: 1, x: 0, width: '75%' }}
                  className="w-3/4 h-0.5 xs:h-1 bg-gray-900 rounded-full"
                />
                <motion.span
                  animate={isMenuOpen ? { rotate: -45, y: -8, width: '100%' } : { rotate: 0, y: 0, width: '100%' }}
                  className="w-full h-0.5 xs:h-1 bg-gray-900 rounded-full origin-right"
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Fullscreen Overlay Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-[120] shadow-2xl flex flex-col overflow-y-auto"
            >
              <div className="p-4 flex justify-end items-center h-24 border-b border-gray-100">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-3 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 flex flex-col pb-12">
                {renderNavItems(navItems)}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;