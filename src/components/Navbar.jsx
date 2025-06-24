import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu and scroll to top on navigation
  const handleNavClick = (path) => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getNavLinkClass = (path) => {
    return `text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium ${
      isActive(path) ? 'bg-gray-900 text-white' : ''
    }`;
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-gray-800 shadow-lg' : 'bg-gray-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center" onClick={() => handleNavClick('/')}>
                <img
                  src="/PathSarthi logo.png"
                  alt="PathSarthi Trust"
                  className="h-10 w-auto mr-2"
                />
                <span className="text-white font-bold text-xl">PathSarthi Trust</span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="/" className={getNavLinkClass('/')} onClick={() => handleNavClick('/')}>Home</Link>
                <Link to="/gallery" className={getNavLinkClass('/gallery')} onClick={() => handleNavClick('/gallery')}>Gallery</Link>
                <Link to="/mission" className={getNavLinkClass('/mission')} onClick={() => handleNavClick('/mission')}>Mission</Link>
                <Link to="/contribution" className={getNavLinkClass('/contribution')} onClick={() => handleNavClick('/contribution')}>Contribution</Link>
                <Link to="/donate" className={getNavLinkClass('/donate')} onClick={() => handleNavClick('/donate')}>Donate</Link>
                <Link to="/sponsor-notebooks" className={getNavLinkClass('/sponsor-notebooks')} onClick={() => handleNavClick('/sponsor-notebooks')}>Sponsor Notebooks</Link>
                <Link to="/trust-members" className={getNavLinkClass('/trust-members')} onClick={() => handleNavClick('/trust-members')}>Board of Trustee</Link>
                <Link to="/member" className={getNavLinkClass('/member')} onClick={() => handleNavClick('/member')}>Member</Link>
                <Link to="/join-us" className={getNavLinkClass('/join-us')} onClick={() => handleNavClick('/join-us')}>Join Us</Link>
                <Link to="/social-media" className={getNavLinkClass('/social-media')} onClick={() => handleNavClick('/social-media')}>Social Media</Link>
                <Link to="/about" className={getNavLinkClass('/about')} onClick={() => handleNavClick('/about')}>About Us</Link>
              </div>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${
          isMobileMenuOpen ? 'block' : 'hidden'
        } md:hidden absolute w-full bg-gray-800 shadow-lg`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/')
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
            onClick={() => handleNavClick('/')}
          >
            Home
          </Link>
          <Link
            to="/gallery"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/gallery')
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
            onClick={() => handleNavClick('/gallery')}
          >
            Gallery
          </Link>
          <Link
            to="/mission"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/mission')
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
            onClick={() => handleNavClick('/mission')}
          >
            Mission
          </Link>
          <Link
            to="/contribution"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/contribution')
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
            onClick={() => handleNavClick('/contribution')}
          >
            Contribution
          </Link>
          <Link
            to="/donate"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/donate')
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
            onClick={() => handleNavClick('/donate')}
          >
            Donate
          </Link>
          <Link
            to="/sponsor-notebooks"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/sponsor-notebooks')
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
            onClick={() => handleNavClick('/sponsor-notebooks')}
          >
            Sponsor Notebooks
          </Link>
          <Link
            to="/trust-members"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/trust-members')
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
            onClick={() => handleNavClick('/trust-members')}
          >
            Board of Trustee
          </Link>
          <Link
            to="/member"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/member')
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
            onClick={() => handleNavClick('/member')}
          >
            Member
          </Link>
          <Link
            to="/join-us"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/join-us')
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
            onClick={() => handleNavClick('/join-us')}
          >
            Join Us
          </Link>
          <Link
            to="/social-media"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/social-media')
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
            onClick={() => handleNavClick('/social-media')}
          >
            Social Media
          </Link>
          <Link
            to="/about"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/about')
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
            onClick={() => handleNavClick('/about')}
          >
            About Us
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;