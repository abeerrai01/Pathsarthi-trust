import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';
import Button from './ui/Button';

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setExpandedItems({});
  }, [location.pathname]);

  const toggleExpand = (label) => {
    setExpandedItems(prev => ({ ...prev, [label]: !prev[label] }));
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
        { to: '/trust-members', label: 'Board' },
        { to: '/member', label: 'Member' },
        { to: '/supporters', label: 'Supporters' },
        {
          label: 'Advisory',
          items: [
            { to: '/legal', label: 'Legal' },
            { to: '/doctor', label: 'Health' }
          ]
        }
      ]
    },
    { 
      label: 'Who are we', 
      items: [
        { to: '/about', label: 'About Us' },
        { to: '/social-media', label: 'Social' },
        { to: '/join-us', label: 'Join' },
        { to: '/feedback', label: 'Feedback' },
        { to: '/membership', label: 'Membership' },
      ]
    },
    { to: '/internship', label: 'Internship' },
    { to: '/blog', label: 'Blog' },
    { to: '/login', label: 'Login' }
  ];

  const renderNavItems = (items, depth = 0) => {
    return items.map((item, index) => {
      const isExpanded = expandedItems[item.label];
      const hasSubItems = item.items && item.items.length > 0;
      const isActive = location.pathname === item.to;

      return (
        <div key={item.label + index} className="w-full">
          {item.to ? (
            <Link
              to={item.to}
              className={`block w-full text-left px-8 py-4 font-heading font-bold border-b border-foreground/10 transition-colors ${
                isActive ? 'text-accent bg-accent/5' : 'text-foreground hover:bg-muted'
              }`}
              style={{ paddingLeft: `${2 + depth * 1.5}rem` }}
            >
              {item.label}
            </Link>
          ) : (
            <div className="w-full">
              <button
                onClick={() => toggleExpand(item.label)}
                className={`flex items-center justify-between w-full text-left px-8 py-4 font-heading font-bold border-b border-foreground/10 transition-colors ${
                  isExpanded ? 'text-accent bg-muted/50' : 'text-foreground hover:bg-muted'
                }`}
                style={{ paddingLeft: `${2 + depth * 1.5}rem` }}
              >
                <span>{item.label}</span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isExpanded && hasSubItems && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-muted/30"
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
        className={`fixed w-full z-[100] transition-all duration-500 top-0 left-0 flex justify-center pt-4 px-4 pointer-events-none`}
      >
        <div className={`
          max-w-7xl w-full h-16 md:h-20 flex items-center justify-between px-6 
          bg-white border-2 border-foreground transition-all duration-500 pointer-events-auto
          ${isScrolled ? 'rounded-full shadow-pop-lg translate-y-0' : 'rounded-2xl shadow-pop'}
        `}>
          {/* Logo Section */}
          <div className="flex-1 flex items-center">
            <Link to="/" className="flex items-center group">
              <motion.img
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                src="/PathSarthi logo.png"
                alt="Logo"
                className="h-10 w-auto md:h-12 mr-3"
              />
              <div className="hidden xs:block">
                <h1 className="text-lg md:text-xl font-heading font-extrabold text-foreground tracking-tight leading-none">
                  Path Sarthi Trust
                </h1>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-accent mt-1">
                  Hope • Heal • Humanity
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Items (Partial or Just Burger for Cleanliness) */}
          <div className="hidden lg:flex items-center gap-6">
            {navItems.slice(0, 3).map(item => (
              <Link key={item.label} to={item.to} className="font-heading font-bold text-sm text-foreground hover:text-accent transition-colors">
                {item.label}
              </Link>
            ))}
            <Link to="/donate">
              <Button variant="primary" className="px-5 py-2 text-sm shadow-pop">Donate</Button>
            </Link>
          </div>

          {/* Burger Menu Button */}
          <div className="flex lg:flex-1 justify-end items-center gap-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 border-2 border-foreground rounded-full hover:bg-tertiary transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
              className="fixed inset-0 bg-foreground/60 backdrop-blur-md z-[110]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-screen w-full max-w-sm bg-background border-l-4 border-foreground z-[120] shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-8 flex justify-between items-center bg-white border-b-4 border-foreground">
                <span className="font-heading font-black text-2xl uppercase tracking-tighter">Menu</span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-full border-2 border-foreground hover:bg-secondary transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto bg-dots">
                {renderNavItems(navItems)}
              </div>
              <div className="p-8 bg-white border-t-4 border-foreground">
                <Link to="/donate" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="primary" className="w-full py-4 text-xl">Donate Now</Button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;