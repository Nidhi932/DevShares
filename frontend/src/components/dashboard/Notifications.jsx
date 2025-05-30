import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Clock, ChevronRight } from 'lucide-react';

const NotificationItem = ({ avatar, message, time }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className="flex items-start gap-3 p-3 hover:bg-white/5 rounded-lg cursor-pointer group relative overflow-hidden"
    >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300" />
        <div className="relative">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 overflow-hidden ring-2 ring-purple-500/20">
                {avatar ? (
                    <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                    <img
                        src={`https://source.unsplash.com/random/100x100?face&${Math.random()}`}
                        alt="avatar"
                        className="w-full h-full object-cover"
                    />
                )}
            </div>
        </div>
        <div className="flex-1 relative">
            <p className="text-sm text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300">{message}</p>
            <div className="flex items-center gap-2 mt-1">
                <Clock className="w-3 h-3 text-white/40" />
                <p className="text-xs text-white/40">{time}</p>
            </div>
        </div>
        <motion.div
            whileHover={{ x: 2 }}
            className="self-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
            <ChevronRight className="w-4 h-4 text-white/60" />
        </motion.div>
    </motion.div>
);

const Notifications = () => {
    const notifications = [
        {
            message: 'New feature release: Dark mode is now available!',
            time: 'Just now'
        },
        {
            message: 'Your project "Design System" has been approved',
            time: '59 minutes ago'
        },
        {
            message: 'Security update: Two-factor authentication enabled',
            time: '12 hours ago'
        },
        {
            message: 'Andi Lane commented on your recent commit',
            time: 'Today, 11:59 AM'
        }
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Bell className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">Notifications</h2>
                        <p className="text-sm text-white/40">You have {notifications.length} new notifications</p>
                    </div>
                </div>
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center justify-center w-7 h-7 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-lg shadow-purple-500/20"
                >
                    {notifications.length}
                </motion.div>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-2"
            >
                {notifications.map((notification, index) => (
                    <NotificationItem key={index} {...notification} />
                ))}
            </motion.div>
        </motion.div>
    );
};

export default Notifications; 