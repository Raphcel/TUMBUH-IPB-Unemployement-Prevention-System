import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, matchPath } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Menu, X, LogOut, ChevronDown, LayoutDashboard, FileText, User, Briefcase, Users, Building } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { UserMenu } from './UserMenu';
import { useTranslation } from '../../context/LanguageContext';

export function Navbar() {
  const [openNav, setOpenNav] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const location = useLocation();
  const { user } = useAuth();
  const { lang } = useTranslation();
  const copy = lang === 'id'
    ? {
        home: 'Beranda',
        opportunities: 'Lowongan',
        companies: 'Perusahaan',
        guide: 'Panduan',
        login: 'Masuk',
        register: 'Daftar Sekarang',
        openMenu: 'Buka menu utama',
      }
    : {
        home: 'Home',
        opportunities: 'Opportunities',
        companies: 'Companies',
        guide: 'Guide',
        login: 'Log In',
        register: 'Register Now',
        openMenu: 'Open main menu',
      };

  const navLinks = [
    { name: copy.home, path: '/' },
    { name: copy.opportunities, path: '/lowongan' },
    { name: copy.companies, path: '/perusahaan' },
    { name: copy.guide, path: '/panduan' },
  ];

  const transparentPaths = ['/', '/perusahaan/:id', '/lowongan/:id'];

  const isTransparent = transparentPaths.some(path =>
    matchPath({ path: path, end: true }, location.pathname)
  ) && !scrolled && !openNav;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${!isTransparent
        ? 'bg-white backdrop-blur border-b border-gray-200 shadow-sm'
        : 'bg-transparent'
        }`}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 10 }}
              className={`h-8 w-8 rounded-md flex items-center justify-center font-bold text-xl transition-colors ${isTransparent ? 'bg-white text-[#0f2854]' : 'bg-[#0f2854] text-white'
                }`}>
              T
            </motion.div>
            <span className={`text-xl font-bold tracking-tight transition-colors ${isTransparent ? 'text-white' : 'text-[#0f2854]'
              }`}>
              Tumbuh.
            </span>
          </Link>
        </div>

        <div className="flex lg:hidden">
          <button
            type="button"
            className={`-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 transition-colors ${isTransparent ? 'text-white hover:text-white/80' : 'text-[#0f2854]/70 hover:text-[#0f2854]'
              }`}
            onClick={() => setOpenNav(!openNav)}
          >
            <span className="sr-only">{copy.openMenu}</span>
            {openNav ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="hidden lg:flex lg:gap-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-medium leading-6 relative group px-1 py-2 ${location.pathname === link.path
                ? (isTransparent ? 'text-white' : 'text-[#0f2854]')
                : (isTransparent ? 'text-white/90 hover:text-white' : 'text-gray-700 hover:text-[#0f2854]')
                } transition-colors`}
            >
              <motion.span whileHover={{ scale: 1.05 }} className="relative z-10 inline-block">
                {link.name}
              </motion.span>
              {location.pathname === link.path && (
                <motion.div
                  layoutId="underline"
                  className={`absolute left-0 right-0 bottom-0 h-0.5 ${isTransparent ? 'bg-white' : 'bg-[#0f2854]'}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-4 items-center">
          {user ? (
            <UserMenu isTransparent={isTransparent} />
          ) : (
            <>
              <Link
                to="/login"
                className={`text-sm font-semibold leading-6 py-2 transition-colors ${isTransparent ? 'text-white hover:text-white/80' : 'text-[#0f2854]/80 hover:text-[#0f2854]'
                  }`}
              >
                <motion.span whileHover={{ scale: 1.05 }} className="inline-block">{copy.login}</motion.span>
              </Link>
              <Button
                to="/register"
                className={`font-semibold px-5 py-2 rounded shadow-sm transition-all border-none focus:ring-2 ${isTransparent
                  ? 'bg-white !text-[#0f2854] hover:bg-white/90 focus:ring-white/40'
                  : 'bg-[#0f2854] hover:bg-[#1a3a70] text-white focus:ring-[#0f2854]/40'
                  }`}
                size="sm"
              >
                {copy.register}
              </Button>
            </>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {openNav && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-gradient-to-r from-white to-gray-100 border-t border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="space-y-1 px-4 pb-3 pt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block rounded-md px-3 py-2 text-base font-medium ${location.pathname === link.path
                    ? 'bg-[#0f2854]/10 text-[#0f2854] font-semibold'
                    : 'text-gray-700 hover:bg-[#0f2854]/5 hover:text-[#0f2854]'
                    }`}
                  onClick={() => setOpenNav(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="mt-4 pt-4 border-t border-surface-border flex flex-col gap-3">
                {user ? (
                  <UserMenu isMobile={true} />
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-center font-medium text-[#0f2854] hover:text-[#2e4f7f]"
                      onClick={() => setOpenNav(false)}
                    >
                      {copy.login}
                    </Link>
                    <Button
                      to="/register"
                      className="w-full justify-center bg-[#0f2854] hover:bg-[#2e4f7f] text-white"
                      onClick={() => setOpenNav(false)}
                    >
                      {copy.register}
                    </Button>
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
