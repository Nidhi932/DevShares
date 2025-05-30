import React from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, Settings } from 'lucide-react';
import ProjectsGrid from './ProjectsGrid';
import Schedule from './Schedule';
import Notifications from './Notifications';
import Actions from './Actions';
import Networks from './Networks';
import PostingSection from './PostingSection';
import TaskSection from './TaskSection';

const Dashboard = () => {
    return (
        <div className="min-h-screen bg-black/95">
            {/* Header - Fixed */}
            <header className="bg-black/50 backdrop-blur-sm border-b border-white/10 fixed top-0 left-0 right-0 z-50">
                <div className="max-w-[1920px] mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">storyvord</h1>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search or type"
                                className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-white/40"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 rounded-lg hover:bg-white/5 text-white/80 hover:text-white transition-colors"
                        >
                            <Settings className="h-6 w-6" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 rounded-lg hover:bg-white/5 text-white/80 hover:text-white transition-colors"
                        >
                            <Bell className="h-6 w-6" />
                        </motion.button>
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10">
                            <img
                                src="https://source.unsplash.com/random/100x100?face"
                                alt="Profile"
                                className="w-full h-full object-cover rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content - Scrollable with Fixed Sidebar */}
            <div className="max-w-[1920px] mx-auto px-4 pt-24">
                <div className="grid grid-cols-12 gap-4 relative">
                    {/* Left Column - Scrollable */}
                    <div className="col-span-9 space-y-4 h-[calc(100vh-6rem)] overflow-y-auto pb-6 pr-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-white">Crew Dashboard</h2>
                                <div className="flex gap-4">
                                </div>
                            </div>
                            <ProjectsGrid />
                        </div>
                        <Schedule />
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1">
                                <PostingSection />
                            </div>
                            <div className="col-span-2">
                                <TaskSection />
                            </div>
                        </div>
                        <style jsx>{`
                            div::-webkit-scrollbar {
                                display: none;
                            }
                        `}</style>
                    </div>

                    {/* Right Column - Fixed */}
                    <div className="col-span-3 space-y-4 h-[calc(100vh-6rem)] overflow-y-auto pb-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        <Notifications />
                        <Actions />
                        <Networks />
                        <style jsx>{`
                            div::-webkit-scrollbar {
                                display: none;
                            }
                        `}</style>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;