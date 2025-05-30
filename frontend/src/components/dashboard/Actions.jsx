import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Circle, Clock, ChevronRight } from 'lucide-react';

const ActionItem = ({ title, time, icon: Icon = Circle, color = 'blue' }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.02 }}
        className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg group relative overflow-hidden"
    >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300" />
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-${color}-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center ring-2 ring-purple-500/20 relative`}>
            <Icon className={`h-4 w-4 text-${color}-400`} />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="flex-1">
            <p className="text-sm font-medium text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300">{title}</p>
            <div className="flex items-center gap-2 mt-1">
                <Clock className="w-3 h-3 text-white/40" />
                <p className="text-xs text-white/40">{time}</p>
            </div>
        </div>
        <motion.div
            whileHover={{ x: 2 }}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
            <ChevronRight className="w-4 h-4 text-white/60" />
        </motion.div>
    </motion.div>
);

const Actions = () => {
    const actions = [
        {
            title: 'New feature deployed to production',
            time: '12 hours ago',
            color: 'green'
        },
        {
            title: 'Database backup completed successfully',
            time: 'Today, 11:59 AM',
            color: 'blue'
        },
        {
            title: 'User authentication system updated',
            time: 'Feb 2, 2024',
            color: 'purple'
        },
        {
            title: 'API documentation generated',
            time: '58 minutes ago',
            color: 'yellow'
        },
        {
            title: 'Code review completed',
            time: 'Just now',
            color: 'pink'
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
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-white">Actions</h2>
                    <p className="text-sm text-white/40">Recent system activities</p>
                </div>
            </div>
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-2"
            >
                {actions.map((action, index) => (
                    <ActionItem key={index} {...action} />
                ))}
            </motion.div>
        </motion.div>
    );
};

export default Actions; 