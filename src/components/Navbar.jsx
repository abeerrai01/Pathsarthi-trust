import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (path) => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    if (location.pathname !== path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isActive = (path) => location.pathname === path;

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const navItems = [
    { to: '/', label: 'Home', type: 'link' },
    { 
      label: 'Gallery', 
      type: 'link', 
      to: '/gallery' 
    },
    { 
      label: 'Projects', 
      type: 'dropdown',
      items: [
        { to: '/contest', label: 'Contest' },
        { to: '/mission', label: 'Mission' },
        { to: '/contribution', label: 'Contribution' }
      ]
    },
    { 
      label: 'Fuel a Dream', 
      type: 'dropdown',
      items: [
        { to: '/donate', label: 'Donate' },
        { to: '/sponsor-notebooks', label: 'Sponsor Us' }
      ]
    },
    { 
      label: 'Pillars', 
      type: 'dropdown',
      items: [
        { to: '/trust-members', label: 'Board of Trustee' },
        { to: '/member', label: 'Member' }
      ]
    },
    { 
      label: 'Who are we', 
      type: 'dropdown',
      items: [
        { to: '/about', label: 'About Us' },
        { to: '/social-media', label: 'Social Media' },
        { to: '/join-us', label: 'Join Us' }
      ]
    },
    { 
      label: 'Others', 
      type: 'dropdown',
      items: [
        { to: '/login', label: 'Login' }
      ]
    }
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 top-0 left-0 ${
        isScrolled ? 'bg-white shadow-lg' : 'bg-white'
      }`}
      style={{ borderBottom: '1px solid #e5e7eb' }}
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 w-full">
          {/* Logo and site name */}
          <div className="flex items-center flex-shrink-0 mr-4">
            <Link to="/" className="flex items-center" onClick={() => handleNavClick('/')} aria-label="Go to home page">
              <img
                src="/PathSarthi logo.png"
                alt="PathSarthi Trust Logo"
                className="h-10 w-auto mr-3 drop-shadow"
                style={{ background: 'transparent' }}
              />
              <span className="text-gray-900 font-extrabold text-2xl tracking-tight">Path Sarthi Trust</span>
            </Link>
          </div>
          
          {/* Desktop nav links */}
          <div className="hidden md:flex gap-2 items-center flex-grow justify-end">
            {navItems.map((item, index) => (
              <div key={index} className="relative">
                {item.type === 'link' ? (
                  <Link
                    to={item.to}
                    className={`px-4 py-2 rounded-lg text-base font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      isActive(item.to)
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                    }`}
                    onClick={() => handleNavClick(item.to)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(item.label)}
                      className={`px-4 py-2 rounded-lg text-base font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        activeDropdown === item.label
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                      }`}
                    >
                      {item.label}
                      <svg
                        className={`ml-1 inline-block w-4 h-4 transition-transform duration-200 ${
                          activeDropdown === item.label ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {activeDropdown === item.label && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        {item.items.map((subItem, subIndex) => (
                          <Link
                            key={subIndex}
                            to={subItem.to}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-150"
                            onClick={() => handleNavClick(subItem.to)}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Hamburger for mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-700 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              aria-label="Open main menu"
            >
              <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex md:hidden">
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-xl flex flex-col overflow-y-auto max-h-screen">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-700 hover:bg-gray-200 focus:outline-none"
              aria-label="Close menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex flex-col gap-2 mt-20 px-6">
              {navItems.map((item, index) => (
                <div key={index}>
                  {item.type === 'link' ? (
                    <Link
                      to={item.to}
                      className={`block px-4 py-3 rounded-lg text-lg font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        isActive(item.to)
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-gray-800 hover:bg-indigo-50 hover:text-indigo-700'
                      }`}
                      onClick={() => handleNavClick(item.to)}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <div>
                      <button
                        onClick={() => toggleDropdown(item.label)}
                        className={`w-full text-left px-4 py-3 rounded-lg text-lg font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                          activeDropdown === item.label
                            ? 'bg-indigo-600 text-white shadow'
                            : 'text-gray-800 hover:bg-indigo-50 hover:text-indigo-700'
                        }`}
                      >
                        {item.label}
                        <svg
                          className={`ml-2 inline-block w-5 h-5 transition-transform duration-200 ${
                            activeDropdown === item.label ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {activeDropdown === item.label && (
                        <div className="ml-4 mt-2 space-y-1">
                          {item.items.map((subItem, subIndex) => (
                            <Link
                              key={subIndex}
                              to={subItem.to}
                              className="block px-4 py-2 text-base text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-150 rounded"
                              onClick={() => handleNavClick(subItem.to)}
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Click outside to close */}
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)}></div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;