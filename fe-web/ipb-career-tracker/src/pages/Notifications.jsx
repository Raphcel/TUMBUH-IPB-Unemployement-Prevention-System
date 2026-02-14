import React, { useState } from 'react';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Bell, CheckCircle, Info, AlertTriangle, Check } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

export function Notifications() {
    // ... (keep state)
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
        },
        {
            id: 4,
            title: 'New Externship Opportunity',
            message: 'A new externship opportunity matching your skills has been posted.',
            type: 'info',
            date: '3 days ago',
            read: true
        },
        {
            id: 5,
            title: 'Application Status Update',
            message: 'Your application status for "Junior Designer" has changed to "Screening".',
            type: 'info',
            date: '1 week ago',
            read: true
        }
    ]);

    const handleMarkAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const markAsRead = (id) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle size={20} className="text-green-500" />;
            case 'warning': return <AlertTriangle size={20} className="text-yellow-500" />;
            default: return <Info size={20} className="text-blue-500" />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-3xl mx-auto space-y-6 min-h-screen pb-20"
        >
            <div className="flex justify-between items-center border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-primary tracking-tight flex items-center gap-2">
                        <Bell className="text-accent fill-current" size={24} /> Notifications
                    </h1>
                    <p className="text-secondary mt-1">
                        Stay updated with your latest activities.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-2"
                >
                    <Check size={16} /> Mark all as read
                </Button>
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
                                    className={`border-l-4 transition-all hover:shadow-sm ${!notification.read ? 'border-l-accent bg-white' : 'border-l-gray-200 bg-gray-50/50'
                                        }`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <CardBody className="p-4 flex gap-4">
                                        <div className="mt-1 flex-shrink-0">
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start gap-4">
                                                <h3 className={`font-semibold ${!notification.read ? 'text-primary' : 'text-gray-600'}`}>
                                                    {notification.title}
                                                </h3>
                                                <span className="text-xs text-secondary whitespace-nowrap">
                                                    {notification.date}
                                                </span>
                                            </div>
                                            <p className="text-sm text-secondary mt-1">
                                                {notification.message}
                                            </p>
                                        </div>
                                        {!notification.read && (
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
                            <p className="text-secondary">No notifications found.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}
