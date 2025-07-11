import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

function renderDropdownItems(items, handleNavClick, activeDropdownPath, setActiveDropdownPath, parentPath = [], isMobile = false, closeDropdownTimerRef) {
  return items.map((item, idx) => {
    const currentPath = [...parentPath, item.label];
    const isOpen = activeDropdownPath.length >= currentPath.length && activeDropdownPath.slice(0, currentPath.length).join('>') === currentPath.join('>');
    const isNested = parentPath.length > 0;
    if (item.type === 'dropdown') {
      return (
        <div
          key={item.label + currentPath.join('-')}
          className={`relative group ${isMobile ? 'w-full' : ''}`}
          onMouseEnter={!isMobile ? () => {
            if (closeDropdownTimerRef && closeDropdownTimerRef.current) clearTimeout(closeDropdownTimerRef.current);
            setActiveDropdownPath(currentPath);
          } : undefined}
          onMouseLeave={!isMobile ? () => {
            if (closeDropdownTimerRef) {
              closeDropdownTimerRef.current = setTimeout(() => setActiveDropdownPath(parentPath), 150);
            } else {
              setActiveDropdownPath(parentPath);
            }
          } : undefined}
        >
          <button
            onClick={e => {
              e.stopPropagation();
              if (isMobile) {
                if (isOpen) {
                  setActiveDropdownPath(parentPath);
                } else {
                  setActiveDropdownPath(currentPath);
                }
              }
            }}
            className={`px-4 py-2 rounded-lg text-base font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center ${isOpen ? 'bg-indigo-600 text-white shadow' : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'} ${isNested || isMobile ? 'justify-center w-full text-center' : ''}`}
            style={(isNested || isMobile) ? { justifyContent: 'center', width: '100%', textAlign: 'center' } : {}}
            type="button"
            tabIndex={0}
          >
            {item.label}
            <svg
              className={`ml-1 inline-block w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isOpen && (
            isMobile ? (
              <div className="w-full flex flex-col items-center">
                {renderDropdownItems(item.items, handleNavClick, activeDropdownPath, setActiveDropdownPath, currentPath, true, closeDropdownTimerRef)}
              </div>
            ) : (
              <div
                className={`absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 ${parentPath.length > 0 ? 'ml-48 -mt-8' : ''}`}
                onMouseEnter={() => {
                  if (closeDropdownTimerRef && closeDropdownTimerRef.current) clearTimeout(closeDropdownTimerRef.current);
                  setActiveDropdownPath(currentPath);
                }}
                onMouseLeave={() => {
                  if (closeDropdownTimerRef) {
                    closeDropdownTimerRef.current = setTimeout(() => setActiveDropdownPath(parentPath), 150);
                  } else {
                    setActiveDropdownPath(parentPath);
                  }
                }}
              >
                {renderDropdownItems(item.items, handleNavClick, activeDropdownPath, setActiveDropdownPath, currentPath, false, closeDropdownTimerRef)}
              </div>
            )
          )}
        </div>
      );
    } else {
      return (
        <Link
          key={item.to + currentPath.join('-')}
          to={item.to}
          className={`block px-4 py-2 text-sm transition-colors duration-150 ${isMobile ? 'text-center w-full text-gray-800 hover:bg-indigo-50 hover:text-indigo-700' : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'}`}
          onClick={() => handleNavClick(item.to)}
        >
          {item.label}
        </Link>
      );
    }
  });
}

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdownPath, setActiveDropdownPath] = useState([]);
  const closeDropdownTimerRef = useRef();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (path) => {
    setIsMobileMenuOpen(false);
    setActiveDropdownPath([]);
    if (location.pathname !== path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isActive = (path) => location.pathname === path;

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
        { to: '/member', label: 'Member' },
        { to: '/supporters', label: 'Supporters' },
        {
          label: 'Advisory Volunteers',
          type: 'dropdown',
          items: [
            { to: '/legal', label: 'Legal Advisory Volunteers' },
            { to: '/doctor', label: 'Health Advisory Volunteers' }
          ]
        }
      ]
    },
    { 
      label: 'Who are we', 
      type: 'dropdown',
      items: [
        { to: '/about', label: 'About Us' },
        { to: '/social-media', label: 'Social Media' },
        { to: '/join-us', label: 'Join Us' },
        { to: '/feedback', label: 'Feedback' }
      ]
    },
    { 
      to: '/internship',
      label: 'Internship',
      type: 'link'
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
                  renderDropdownItems([item], handleNavClick, activeDropdownPath, setActiveDropdownPath, [], false, closeDropdownTimerRef)
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
            <div className="flex flex-col gap-2 mt-20 px-6 items-center text-center">
              {navItems.map((item, index) => (
                <div key={index} className="w-full">
                  {item.type === 'link' ? (
                    <Link
                      to={item.to}
                      className={`block px-4 py-3 rounded-lg text-lg font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 w-full text-center mx-auto ${
                        isActive(item.to)
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-gray-800 hover:bg-indigo-50 hover:text-indigo-700'
                      }`}
                      onClick={() => handleNavClick(item.to)}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    renderDropdownItems([item], handleNavClick, activeDropdownPath, setActiveDropdownPath, [], true)
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