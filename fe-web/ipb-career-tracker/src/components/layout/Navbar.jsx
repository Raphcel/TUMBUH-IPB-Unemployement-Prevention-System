import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [openNav, setOpenNav] = React.useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Lowongan', path: '/lowongan' },
    { name: 'Perusahaan', path: '/perusahaan' },
    { name: 'Panduan', path: '/panduan' },
  ];

  const isActive = (path) => {
    return location.pathname === path ? "text-primary font-semibold" : "text-secondary hover:text-primary";
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-white font-bold text-xl">
              T
            </div>
            <span className="text-xl font-bold text-primary tracking-tight">Tumbuh.</span>
          </Link>
        </div>
        
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-secondary"
            onClick={() => setOpenNav(!openNav)}
          >
            <span className="sr-only">Open main menu</span>
            {openNav ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="hidden lg:flex lg:gap-x-8">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.path} className={`text-sm font-medium leading-6 transition-colors ${isActive(link.path)}`}>
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-4 items-center">
          <Link to="/login" className="text-sm font-semibold leading-6 text-primary hover:text-primary/80 py-2">
            Masuk
          </Link>
          <Button to="/register" variant="primary" size="sm">
            Daftar Sekarang
          </Button>
          {/* Mock Dashboard Link for easier access */}
          <div className="flex flex-col text-[10px] ml-4 text-right">
             <Link to="/student/dashboard" className="text-gray-400 hover:text-primary">Student DB</Link>
             <Link to="/hr/dashboard" className="text-gray-400 hover:text-primary">HR DB</Link>
          </div>
        </div>
      </nav>
      
      {/* Mobile menu */}
      {openNav && (
        <div className="lg:hidden bg-white border-t border-gray-100">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`block rounded-md px-3 py-2 text-base font-medium ${
                    location.pathname === link.path ? "bg-highlight/20 text-primary" : "text-secondary hover:bg-gray-50 hover:text-primary"
                }`}
                onClick={() => setOpenNav(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
                <Link to="/login" className="text-center font-medium text-primary" onClick={() => setOpenNav(false)}>Masuk</Link>
                <Button to="/register" className="w-full justify-center" onClick={() => setOpenNav(false)}>Daftar Sekarang</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
