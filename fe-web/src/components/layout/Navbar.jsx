import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, matchPath } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { UserMenu } from './UserMenu';

// Tumbuh SVG Logo (layered leaves)
function TumbuhLogo({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#1a8754" />
      <path d="M2 17L12 22L22 17" stroke="#1a8754" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d="M2 12L12 17L22 12" stroke="#1a8754" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

const NAV_LINKS = [
  { name: 'Cari Lowongan', path: '/lowongan' },
  { name: 'Perusahaan', path: '/perusahaan' },
  { name: 'Karier Advice', path: '/panduan' },
];

export function Navbar() {
  const [openNav, setOpenNav] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const location = useLocation();
  const { user } = useAuth();

  // Paths where the navbar starts transparent (over dark hero)
  const transparentPaths = ['/'];
  const isTransparent = transparentPaths.some((p) =>
    matchPath({ path: p, end: true }, location.pathname)
  ) && !scrolled && !openNav;

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isTransparent
          ? 'bg-transparent'
          : 'bg-white border-b border-gray-100 shadow-sm'
      }`}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16"
        aria-label="Global"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <TumbuhLogo className="w-6 h-6" />
          <span className={`text-xl font-bold tracking-tight transition-colors ${isTransparent ? 'text-white' : 'text-gray-900'}`}>
            Tumbuh
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-medium transition-colors pb-0.5 border-b-2 ${
                isActive(link.path)
                  ? 'text-brand border-brand'
                  : isTransparent
                    ? 'text-white/90 border-transparent hover:text-white'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              {link.name}
            </Link>
          ))}
          {/* Dropdown placeholders removed */}
        </div>

        {/* Auth actions */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <UserMenu isTransparent={isTransparent} />
          ) : (
            <>
              <Link
                to="/login"
                className={`text-sm font-medium px-4 py-2 border rounded-md transition-all ${
                  isTransparent
                    ? 'border-white/50 text-white hover:bg-white/10'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-md transition-colors"
              >
                Daftar
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className={`lg:hidden p-2 rounded-md transition-colors ${isTransparent ? 'text-white' : 'text-gray-700'}`}
          onClick={() => setOpenNav(!openNav)}
        >
          <span className="sr-only">Buka menu</span>
          {openNav ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {openNav && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-white border-t border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setOpenNav(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-brand/10 text-brand font-semibold'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-brand'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-3 border-t border-gray-100 mt-3 flex flex-col gap-2">
                {user ? (
                  <UserMenu isMobile />
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpenNav(false)} className="text-center py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50">
                      Masuk
                    </Link>
                    <Link to="/register" onClick={() => setOpenNav(false)} className="text-center py-2 text-sm font-medium text-white bg-brand hover:bg-brand-dark rounded-md">
                      Daftar
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
