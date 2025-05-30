import React from 'react';
import { motion } from 'framer-motion';
import { Send, Users, Plus, MessageCircle } from 'lucide-react';

const NetworkItem = ({ name, avatar, status = 'online' }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg cursor-pointer group relative overflow-hidden"
    >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300" />
        <div className="flex items-center gap-3 relative">
            <div className="relative">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 overflow-hidden ring-2 ring-purple-500/20">
                    {avatar ? (
                        <img src={avatar} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        <img
                            src={`https://source.unsplash.com/random/100x100?face&${name}`}
                            alt={name}
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>
                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                    } ring-2 ring-black`} />
            </div>
            <div>
                <h4 className="text-sm font-medium text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300">{name}</h4>
                <p className="text-xs text-white/40">{status === 'online' ? 'Online' : 'Offline'}</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
                <MessageCircle className="h-4 w-4 text-white/60" />
            </motion.button>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
                <Send className="h-4 w-4 text-white/60" />
            </motion.button>
        </div>
    </motion.div>
);

const Networks = () => {
    const networks = [
        { name: 'Natali Craig', status: 'online' },
        { name: 'Drew Cano', status: 'offline' },
        { name: 'Andi Lane', status: 'online' },
        { name: 'Koray Okumus', status: 'online' },
        { name: 'Kate Morrison', status: 'offline' },
        { name: 'Melody Macy', status: 'online' }
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
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">My Networks</h2>
                        <p className="text-sm text-white/40">{networks.filter(n => n.status === 'online').length} members online</p>
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-sm font-medium text-white shadow-lg shadow-purple-500/20"
                >
                    <Plus className="w-4 h-4" />
                    Add Member
                </motion.button>
            </div>
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-2"
            >
                {networks.map((network, index) => (
                    <NetworkItem key={index} {...network} />
                ))}
            </motion.div>
        </motion.div>
    );
};

export default Networks; 