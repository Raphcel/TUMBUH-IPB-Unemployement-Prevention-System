import { React, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, matchPath } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Menu, X, LogOut, ChevronDown, LayoutDashboard, FileText, User, Briefcase, Users, Building } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const [openNav, setOpenNav] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Lowongan', path: '/lowongan' },
    { name: 'Perusahaan', path: '/perusahaan' },
    { name: 'Panduan', path: '/panduan' },
  ];

  const transparentPaths = ['/', '/perusahaan/:id', '/lowongan/:id'];

  const isTransparent = transparentPaths.some(path =>
    matchPath({ path: path, end: true }, location.pathname)
  ) && !scrolled && !openNav;


  const handleLogout = () => {
    logout();
    navigate('/');
    setOpenNav(false);
    setDropdownOpen(false);
  };

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: <LayoutDashboard size={16} /> },
    { name: 'Lamaran Saya', path: '/student/applications', icon: <FileText size={16} /> },
    { name: 'Profil Saya', path: '/student/profile', icon: <User size={16} /> },
  ];

  const hrLinks = [
    { name: 'Dashboard', path: '/hr/dashboard', icon: <LayoutDashboard size={16} /> },
    { name: 'Kelola Lowongan', path: '/hr/opportunities', icon: <Briefcase size={16} /> },
    { name: 'Pelamar', path: '/hr/applicants', icon: <Users size={16} /> },
    { name: 'Profil Perusahaan', path: '/hr/company', icon: <Building size={16} /> },
  ];

  const currentLinks = user?.role === 'hr' ? hrLinks : studentLinks;
  const dashboardPath = user?.role === 'hr' ? '/hr/dashboard' : '/student/dashboard';

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
            <span className="sr-only">Open main menu</span>
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
            <>
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors focus:outline-none ${isTransparent ? 'text-white' : 'text-[#0f2854]'
                    }`}
                >
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=0f2854&color=fff`
                    }
                    alt="Avatar"
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-white cursor-pointer"
                  />
                  <span className="hidden md:inline">{user.first_name}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setDropdownOpen(false)}
                      />
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-4 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 origin-top-right overflow-hidden ring-1 ring-black/5"
                      >
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                          <p className="text-sm font-bold text-gray-900">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {user.email}
                          </p>
                          <span className="inline-block mt-2 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-full">
                            {user.role}
                          </span>
                        </div>

                        <div className="py-1">
                          {currentLinks.map((link) => (
                            <Link
                              key={link.path}
                              to={link.path}
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                            >
                              <span className="text-gray-400 group-hover:text-primary">
                                {link.icon}
                              </span>
                              {link.name}
                            </Link>
                          ))}
                        </div>

                        <div className="border-t border-gray-100 py-1 mt-1">
                          <button
                            onClick={handleLogout}
                            className="bg-red flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut size={16} />
                            Keluar
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`text-sm font-semibold leading-6 py-2 transition-colors ${isTransparent ? 'text-white hover:text-white/80' : 'text-[#0f2854]/80 hover:text-[#0f2854]'
                  }`}
              >
                <motion.span whileHover={{ scale: 1.05 }} className="inline-block">Masuk</motion.span>
              </Link>
              <Button
                to="/register"
                className={`font-semibold px-5 py-2 rounded shadow-sm transition-all border-none focus:ring-2 ${isTransparent
                  ? 'bg-white text-[#0f2854] hover:bg-white/90 focus:ring-white/40'
                  : 'bg-[#0f2854] hover:bg-[#1a3a70] text-white focus:ring-[#0f2854]/40'
                  }`}
                size="sm"
              >
                Daftar Sekarang
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
              <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col gap-3">
                {user ? (
                  <>
                    <Link
                      to={dashboardPath}
                      className="text-center font-medium text-[#0f2854]"
                      onClick={() => setOpenNav(false)}
                    >
                      Dashboard
                    </Link>
                    <Button
                      onClick={handleLogout}
                      className="w-full justify-center bg-red-50 text-red-600 hover:bg-red-100 border-none"
                    >
                      <LogOut size={16} className="mr-1" /> Keluar
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-center font-medium text-[#0f2854] hover:text-[#2e4f7f]"
                      onClick={() => setOpenNav(false)}
                    >
                      Masuk
                    </Link>
                    <Button
                      to="/register"
                      className="w-full justify-center bg-[#0f2854] hover:bg-[#2e4f7f] text-white"
                      onClick={() => setOpenNav(false)}
                    >
                      Daftar Sekarang
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
