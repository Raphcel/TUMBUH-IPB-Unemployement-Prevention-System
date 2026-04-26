import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { resolveUploadUrl } from '../../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LogOut,
    ChevronDown,
    LayoutDashboard,
    FileText,
    User,
    Briefcase,
    Users,
    Building,
    Settings
} from 'lucide-react';

export function UserMenu({ isTransparent = false, isMobile = false }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setDropdownOpen(false);
    };

    const studentLinks = [
        { name: 'Dashboard', path: '/student/dashboard', icon: <LayoutDashboard size={16} /> },
        { name: 'My Applications', path: '/student/applications', icon: <FileText size={16} /> },
        { name: 'Profile', path: '/student/profile', icon: <User size={16} /> },
    ];

    const hrLinks = [
        { name: 'Dashboard', path: '/hr/dashboard', icon: <LayoutDashboard size={16} /> },
        { name: 'Opportunities', path: '/hr/opportunities', icon: <Briefcase size={16} /> },
        { name: 'Company Profile', path: '/hr/company', icon: <Building size={16} /> },
    ];

    const currentLinks = user?.role === 'hr' ? hrLinks : studentLinks;

    return (
        <div className="relative">
            <motion.button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 text-sm font-medium transition-colors focus:outline-none p-1.5 rounded-lg ${isTransparent ? 'text-text-inverse hover:bg-white/10' : 'text-text hover:bg-surface-muted'
                    } ${isMobile ? 'w-full justify-center mt-4 border border-surface-border' : ''}`}
            >
                <img
                    src={
                        resolveUploadUrl(user?.avatar) ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.first_name || 'User')}&background=0f2854&color=fff`
                    }
                    alt="Avatar"
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-transparent transition-all"
                />
                <div className="text-left hidden md:block">
                    <p className={`text-sm font-semibold leading-tight ${isTransparent ? 'text-white' : 'text-text'}`}>
                        {user?.first_name || 'User'}
                    </p>
                    <p className={`text-[10px] leading-tight capitalize ${isTransparent ? 'text-white/80' : 'text-text-muted'}`}>
                        {user?.role || 'Guest'}
                    </p>
                </div>
                {!isMobile && (
                    <ChevronDown
                        size={16}
                        className={`transition-transform duration-300 ease-[0.22,1,0.36,1] ${dropdownOpen ? 'rotate-180' : ''
                            }`}
                    />
                )}
            </motion.button>

            <AnimatePresence>
                {dropdownOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setDropdownOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 4, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.98 }}
                            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className={`absolute mt-2 w-64 bg-surface rounded-xl shadow-lg border border-surface-border py-2 z-50 origin-top overflow-hidden ring-1 ring-black/5 ${isMobile ? 'bottom-full mb-2 left-1/2 -translate-x-1/2 origin-bottom' : 'right-0 top-full'
                                }`}
                        >
                            <div className="px-4 py-3 border-b border-surface-border bg-surface-muted/50">
                                <p className="text-sm font-bold text-text">
                                    {user?.first_name} {user?.last_name}
                                </p>
                                <p className="text-xs text-text-muted truncate mt-0.5">
                                    {user?.email}
                                </p>
                                <span className="inline-block mt-2 px-2 py-0.5 bg-brand-muted text-brand text-[10px] font-bold uppercase tracking-wider rounded-full">
                                    {user?.role}
                                </span>
                            </div>

                            <div className="py-1">
                                {currentLinks.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-text-muted hover:bg-surface-muted hover:text-brand transition-colors"
                                    >
                                        <span className="text-text-light group-hover:text-brand transition-colors">
                                            {link.icon}
                                        </span>
                                        {link.name}
                                    </Link>
                                ))}
                            </div>

                            <div className="border-t border-surface-border py-1 mt-1">
                                <Link
                                    to={user?.role === 'hr' ? '/hr/company' : '/student/profile'}
                                    onClick={() => setDropdownOpen(false)}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-muted hover:bg-surface-muted hover:text-text transition-colors text-left"
                                >
                                    <Settings size={16} className="text-text-light" /> Settings
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
