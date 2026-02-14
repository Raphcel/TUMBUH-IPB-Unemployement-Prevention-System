import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Bell,
    User,
    Settings,
    LogOut,
    CheckCircle,
    Info,
    AlertTriangle,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export function TopLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);

    // Mock Notifications
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: 'Application Viewed',
            message: 'Your application for Frontend Developer at Tokopedia was viewed by the HR team.',
            type: 'info',
            date: '2 hours ago',
            read: false
        },
        {
            id: 2,
            title: 'Interview Scheduled',
            message: 'Congratulations! You have been shortlisted for an interview with Gojek. Check your email for details.',
            type: 'success',
            date: '1 day ago',
            read: false
        },
        {
            id: 3,
            title: 'Profile Incomplete',
            message: 'Please complete your profile information to increase your chances of being hired.',
            type: 'warning',
            date: '2 days ago',
            read: true
        }
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleNotificationClick = (notification) => {
        setSelectedNotification(notification);
        // Mark as read mock
        setNotifications(notifications.map(n =>
            n.id === notification.id ? { ...n, read: true } : n
        ));
        setShowNotifications(false);
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle size={16} className="text-green-500" />;
            case 'warning': return <AlertTriangle size={16} className="text-yellow-500" />;
            default: return <Info size={16} className="text-blue-500" />;
        }
    };

    return (
        <>
            <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-8 sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-6">
                    {/* Notifications */}
                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-secondary hover:text-primary transition-colors relative p-1"
                            onClick={() => {
                                setShowNotifications(!showNotifications);
                                setShowProfileMenu(false);
                            }}
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white"
                                >
                                    {unreadCount}
                                </motion.span>
                            )}
                        </motion.button>

                        <AnimatePresence>
                            {showNotifications && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowNotifications(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden origin-top-right"
                                    >
                                        <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center">
                                            <h3 className="font-semibold text-primary text-sm">Notifications</h3>
                                            <Link to="/notifications" className="text-xs text-accent hover:underline">
                                                See all
                                            </Link>
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto">
                                            {notifications.length > 0 ? (
                                                notifications.slice(0, 5).map(notification => (
                                                    <div
                                                        key={notification.id}
                                                        onClick={() => handleNotificationClick(notification)}
                                                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 ${!notification.read ? 'bg-blue-50/30' : ''}`}
                                                    >
                                                        <div className="flex gap-3">
                                                            <div className="mt-1 flex-shrink-0">
                                                                {getIcon(notification.type)}
                                                            </div>
                                                            <div>
                                                                <h4 className={`text-sm ${!notification.read ? 'font-semibold text-primary' : 'font-medium text-gray-700'}`}>
                                                                    {notification.title}
                                                                </h4>
                                                                <p className="text-xs text-secondary mt-1 line-clamp-2">
                                                                    {notification.message}
                                                                </p>
                                                                <p className="text-[10px] text-gray-400 mt-2">
                                                                    {notification.date}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-8 text-center text-sm text-secondary">
                                                    No notifications
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Profile */}
                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-colors"
                            onClick={() => {
                                setShowProfileMenu(!showProfileMenu);
                                setShowNotifications(false);
                            }}
                        >
                            <img
                                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.first_name || 'User')}&background=0f2854&color=fff`}
                                alt="Profile"
                                className="w-8 h-8 rounded-full border border-gray-200"
                            />
                            <div className="text-left hidden md:block">
                                <p className="text-xs font-semibold text-primary">{user?.first_name || 'User'}</p>
                                <p className="text-[10px] text-secondary capitalize">{user?.role || 'Guest'}</p>
                            </div>
                        </motion.button>

                        <AnimatePresence>
                            {showProfileMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowProfileMenu(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50"
                                    >
                                        <Link
                                            to="/student/profile"
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                                            onClick={() => setShowProfileMenu(false)}
                                        >
                                            <User size={16} /> Profile
                                        </Link>
                                        <button
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors text-left"
                                            onClick={() => alert('Settings coming soon')}
                                        >
                                            <Settings size={16} /> Settings
                                        </button>
                                        <div className="h-px bg-gray-100 my-1"></div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                                        >
                                            <LogOut size={16} /> Logout
                                        </button>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Notification Modal */}
            <Modal
                isOpen={!!selectedNotification}
                onClose={() => setSelectedNotification(null)}
                title={selectedNotification?.title || 'Notification'}
                size="sm"
            >
                {selectedNotification && (
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="mt-1 p-2 bg-gray-50 rounded-lg">
                                {getIcon(selectedNotification.type)}
                            </div>
                            <div>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {selectedNotification.message}
                                </p>
                                <p className="text-xs text-secondary mt-3 font-medium">
                                    Received {selectedNotification.date}
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedNotification(null)}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}
