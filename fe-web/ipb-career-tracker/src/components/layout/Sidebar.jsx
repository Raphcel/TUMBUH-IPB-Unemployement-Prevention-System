import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  FileText,
  User,
  Briefcase,
  Users,
  Building,
  LogOut,
  Calendar,
  Bookmark,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export function Sidebar({ role = 'student', isCollapsed, toggleSidebar }) {
  const location = useLocation();
  const { user } = useAuth(); // We still use user for avatar, but logout moved to TopLayout or passed down if needed (but TopLayout handles it now)
  // Actually sidebar doesn't need logout anymore as it's in TopLayout, but we can keep it for collapsed mobile view if needed, 
  // but per requirement TopLayout has profile/logout. Let's keep Sidebar focused on navigation.
  // The request says "Right side: Profile avatar... Logout". 
  // The Sidebar bottom part had profile and logout. We should probably remove it from Sidebar to avoid duplication or simplify it.
  // The instruction said "TopLayout... Right side: Profile avatar...".
  // Let's remove the bottom user section from Sidebar to clean it up, or maybe just keep a small logo?
  // Use user input: "When the sidebar is closed, the page content should adjust width... Support both expanded... and collapsed".

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: Home },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Lamaran Saya', path: '/student/applications', icon: FileText },
    { name: 'Bookmarks', path: '/student/bookmarks', icon: Bookmark },
    { name: 'Profil Saya', path: '/student/profile', icon: User },
  ];

  const hrLinks = [
    { name: 'Dashboard', path: '/hr/dashboard', icon: Home },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Kelola Lowongan', path: '/hr/opportunities', icon: Briefcase },
    { name: 'Pelamar', path: '/hr/applicants', icon: Users },
    { name: 'Profil Perusahaan', path: '/hr/company', icon: Building },
  ];

  const links = role === 'hr' ? hrLinks : studentLinks;

  const isActive = (path) => {
    return location.pathname === path
      ? 'bg-[#0f2854] text-white shadow-md'
      : 'text-primary hover:bg-[#0f2854]/5 hover:text-[#0f2854]';
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      className="flex h-screen flex-col border-e border-gray-200 bg-white fixed left-0 top-0 bottom-0 z-40 shadow-sm transition-all duration-300 ease-in-out overflow-hidden"
    >
      <div className="px-4 py-6 flex-1">
        <div className={`flex items-center pb-2 border-b border-gray-300 ${isCollapsed ? 'justify-center' : 'justify-between'} mb-8 px-2 transition-all relative`}>
          {!isCollapsed && (
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-[#0f2854] flex items-center justify-center text-white font-bold text-xl">
                T
              </div>
              <span className="text-xl font-bold text-[#0f2854] tracking-tight">
                Tumbuh
              </span>
            </Link>
          )}
          {isCollapsed && (
            <div className="h-8 w-8 rounded-md bg-[#0f2854] flex items-center justify-center text-white font-bold text-xl mb-4">
              T
            </div>
          )}

          <button
            onClick={toggleSidebar}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 absolute w-6 h-6 border border-gray-200 bg-white shadow-sm flex items-center justify-center -right-3 top-9 z-50"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <ul className="mt-6 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isLinkActive = location.pathname === link.path;
            return (
              <li key={link.path} className="relative">
                <Link
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 relative overflow-hidden group ${isLinkActive ? 'text-primary font-medium' : 'text-gray-500 hover:text-primary'
                    }`}
                  title={isCollapsed ? link.name : ''}
                >
                  {isLinkActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-secondary/10 rounded-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                  {/* Hover background */}
                  <div className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg -z-10" />

                  <div className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${isLinkActive ? 'text-primary' : 'text-gray-400 group-hover:text-primary'}`}>
                    <Icon size={20} />
                  </div>

                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="whitespace-nowrap z-10"
                    >
                      {link.name}
                    </motion.span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Removed Bottom User Section as it is now in TopLayout */}
      {/* kept only a small footer or version if needed, or nothing */}
    </motion.div>
  );
}
