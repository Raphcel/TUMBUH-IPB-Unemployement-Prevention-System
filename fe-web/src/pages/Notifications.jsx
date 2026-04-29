import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Bell, CheckCircle, Info, AlertTriangle, Check } from 'lucide-react';
import { notificationsApi } from '../api/notifications';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';

import { motion, AnimatePresence } from 'framer-motion';

export function Notifications() {
    const { user } = useAuth();
    const { lang } = useTranslation();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const copy = lang === 'id'
        ? {
            title: 'Notifikasi',
            subtitle: 'Tetap update dengan aktivitas terbaru Anda.',
            markAll: 'Tandai semua dibaca',
            empty: 'Belum ada notifikasi.',
          }
        : {
            title: 'Notifications',
            subtitle: 'Stay up to date with your latest activity.',
            markAll: 'Mark all as read',
            empty: 'No notifications yet.',
          };

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        notificationsApi
            .list()
            .then((data) => {
                setNotifications(data.items || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    const handleMarkAllRead = async () => {
        try {
            await notificationsApi.markAllRead();
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        } catch (err) {
            console.error('Failed to mark all read', err);
        }
    };

    const markAsRead = async (id) => {
        try {
            await notificationsApi.markRead(id);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));
        } catch (err) {
            console.error('Failed to mark as read', err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle size={20} className="text-green-500" />;
            case 'warning': return <AlertTriangle size={20} className="text-yellow-500" />;
            default: return <Info size={20} className="text-blue-500" />;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-3xl mx-auto space-y-6 min-h-screen pb-20"
        >
            <div className="flex justify-between items-center border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-primary tracking-tight flex items-center gap-2">
                        <Bell className="text-accent fill-current" size={24} /> {copy.title}
                    </h1>
                    <p className="text-secondary mt-1">
                        {copy.subtitle}
                    </p>
                </div>
                {notifications.some(n => !n.is_read) && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-2"
                    >
                        <Check size={16} /> {copy.markAll}
                    </Button>
                )}
            </div>

            <motion.div
                className="space-y-3"
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.1 }
                    }
                }}
            >
                <AnimatePresence>
                    {notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <motion.div
                                key={notification.id}
                                variants={{
                                    hidden: { y: 20, opacity: 0 },
                                    visible: { y: 0, opacity: 1 }
                                }}
                                exit={{ opacity: 0, x: -100 }}
                                layout
                            >
                                <Card
                                    className={`border-l-4 transition-all hover:shadow-sm cursor-pointer ${!notification.is_read ? 'border-l-accent bg-white' : 'border-l-gray-200 bg-gray-50/50'
                                        }`}
                                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                                >
                                    <CardBody className="p-4 flex gap-4">
                                        <div className="mt-1 flex-shrink-0">
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start gap-4">
                                                <h3 className={`font-semibold ${!notification.is_read ? 'text-primary' : 'text-gray-600'}`}>
                                                    {notification.title}
                                                </h3>
                                                <span className="text-xs text-secondary whitespace-nowrap">
                                                    {new Date(notification.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric', month: 'short', year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-secondary mt-1">
                                                {notification.message}
                                            </p>
                                        </div>
                                        {!notification.is_read && (
                                            <div className="flex items-center">
                                                <span className="w-2 h-2 rounded-full bg-accent"></span>
                                            </div>
                                        )}
                                    </CardBody>
                                </Card>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200"
                        >
                            <Bell size={32} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-secondary">{copy.empty}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}
