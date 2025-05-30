import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, ChevronRight, Users, Clock } from 'lucide-react';

const AvatarGroup = ({ count, startIndex = 0 }) => (
    <div className="flex -space-x-2">
        {[...Array(count)].map((_, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative"
            >
                <img
                    src={`https://source.unsplash.com/random/100x100?face&${startIndex + i}`}
                    alt={`Team member ${i + 1}`}
                    className="w-8 h-8 rounded-lg border-2 border-black/50 object-cover ring-2 ring-purple-500/20"
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse" />
            </motion.div>
        ))}
    </div>
);

const ProjectCard = ({ name, orgName, status, teamCount = 1, progress = 75, description }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10 group hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300">{name}</h3>
                    <div className="flex items-center gap-3">
                        <p className="text-base text-white/60">{orgName}</p>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                        <div className="flex items-center gap-2 text-white/60">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">Updated today</span>
                        </div>
                    </div>
                </div>
                <span className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-green-400/10 to-green-500/10 text-green-400 rounded-lg border border-green-400/20 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    {status}
                </span>
            </div>

            <p className="text-sm text-white/60 mb-6">{description}</p>

            <div className="mb-6">
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                </div>
                <div className="flex items-center justify-between mt-3 text-sm text-white/40">
                    <span>Progress</span>
                    <span>{progress}%</span>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <AvatarGroup count={teamCount} />
                    <span className="text-sm text-white/40">
                        {teamCount === 1 ? 'Personal Project' : `${teamCount} Contributors`}
                    </span>
                </div>
                <motion.button
                    whileHover={{ x: 4, scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                >
                    <ChevronRight className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                </motion.button>
            </div>
        </motion.div>
    );
};

const ProjectsGrid = () => {
    const projects = [
        {
            name: 'Full-Stack Development Path',
            orgName: 'Personal Learning Track',
            status: 'In Progress',
            teamCount: 1,
            progress: 65,
            description: 'Modern web development with React, Node.js, and cloud technologies'
        },
        {
            name: 'Open Source Contributions',
            orgName: 'GitHub Community',
            status: 'Active',
            teamCount: 3,
            progress: 45,
            description: 'Contributing to popular open-source projects to gain real-world experience'
        },
        {
            name: 'System Design Practice',
            orgName: 'Architecture Learning',
            status: 'Review',
            teamCount: 1,
            progress: 30,
            description: 'Learning scalable system design patterns and best practices'
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">Your Projects</h2>
                        <p className="text-sm text-white/40">Currently working on {projects.length} projects</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                        <Users className="w-4 h-4 text-white/60" />
                        <span className="text-sm text-white/60">Team Members</span>
                    </div>
                    <div className="flex gap-2">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium text-white border border-white/10 transition-all duration-200"
                        >
                            Create Project
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-sm font-medium text-white shadow-lg shadow-purple-500/20"
                        >
                            Manage Project
                        </motion.button>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
                {projects.map((project, index) => (
                    <ProjectCard key={index} {...project} />
                ))}
            </div>
        </motion.div>
    );
};

export default ProjectsGrid; 