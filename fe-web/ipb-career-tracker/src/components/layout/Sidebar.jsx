import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, User, Briefcase, Users, Building, LogOut } from 'lucide-react';

export function Sidebar({ role = 'student' }) {
  const location = useLocation();

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: Home },
    { name: 'Lamaran Saya', path: '/student/applications', icon: FileText },
    { name: 'Profil Saya', path: '/student/profile', icon: User },
  ];

  const hrLinks = [
    { name: 'Dashboard', path: '/hr/dashboard', icon: Home },
    { name: 'Kelola Lowongan', path: '/hr/opportunities', icon: Briefcase },
    { name: 'Pelamar', path: '/hr/applicants', icon: Users },
    { name: 'Profil Perusahaan', path: '/hr/company', icon: Building },
  ];

  const links = role === 'hr' ? hrLinks : studentLinks;

  const isActive = (path) => {
    return location.pathname === path 
      ? "bg-highlight/30 text-primary font-semibold" 
      : "text-secondary hover:text-primary hover:bg-highlight/10";
  };

  return (
    <div className="flex h-screen flex-col justify-between border-e border-gray-100 bg-white w-64 fixed left-0 top-0 bottom-0 z-40">
      <div className="px-4 py-6">
        <Link to="/" className="flex items-center gap-2 mb-8 px-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-white font-bold text-xl">
            T
            </div>
            <span className="text-xl font-bold text-primary tracking-tight">Tumbuh <span className="text-xs font-normal text-secondary uppercase ml-1 tracking-wider">{role}</span></span>
        </Link>

        <ul className="mt-6 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className={`flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium ${isActive(link.path)}`}
                >
                  <Icon size={18} />
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="sticky inset-x-0 bottom-0 border-t border-gray-100">
        <div className="flex items-center gap-2 bg-white p-4 hover:bg-gray-50">
          <img
            alt="Profile"
            src={`https://ui-avatars.com/api/?name=${role === 'hr' ? 'HR Staff' : 'Student'}&background=random`}
            className="h-9 w-9 rounded-full object-cover"
          />

          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500">View Profile</p>
            <div className="flex items-center gap-1 text-xs text-gray-700 pt-1 hover:text-red-500 cursor-pointer">
              <LogOut size={12} />
              <span>Logout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
