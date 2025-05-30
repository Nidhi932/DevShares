import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, ChevronRight, Eye, Clock, Users } from 'lucide-react';

const JobCard = ({ role, company, location, years, teamSize = '5-10', type = 'Full-time' }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        className="flex items-start gap-3 p-3 hover:bg-white/5 rounded-lg cursor-pointer group relative overflow-hidden border-b border-white/10 last:border-b-0"
    >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300" />
        <div className="relative">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center ring-2 ring-purple-500/20">
                <Briefcase className="w-5 h-5 text-blue-400" />
            </div>
        </div>
        <div className="flex-1 relative min-w-0">
            <h4 className="font-medium text-sm text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300 truncate">{role}</h4>
            <p className="text-xs text-white/60 truncate">{company}</p>
            <div className="flex flex-wrap gap-2 mt-2">
                <div className="flex items-center gap-1 text-[10px] text-white/40">
                    <MapPin className="h-3 w-3" />
                    <span>{location}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-white/40">
                    <Clock className="h-3 w-3" />
                    <span>Exp: {years}yrs</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-white/40">
                    <Users className="h-3 w-3" />
                    <span>{teamSize}</span>
                </div>
                <span className="px-1.5 py-0.5 text-[10px] bg-white/5 rounded-full text-white/60 border border-white/10">
                    {type}
                </span>
            </div>
        </div>
        <motion.button
            whileHover={{ x: 2, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors self-center shrink-0"
        >
            <ChevronRight className="w-3 h-3 text-white/60" />
        </motion.button>
    </motion.div>
);

const PostingSection = () => {
    const jobs = [
        {
            role: 'Advanced React Patterns Course',
            company: 'Frontend Masters',
            location: 'Online',
            years: 2,
            teamSize: 'Self-paced',
            type: 'Course'
        },
        {
            role: 'System Design Interview Prep',
            company: 'AlgoExpert',
            location: 'Online',
            years: 3,
            teamSize: 'Self-paced',
            type: 'Practice'
        },
        {
            role: 'AWS Solutions Architect',
            company: 'Cloud Guru',
            location: 'Online',
            years: 1,
            teamSize: 'Guided',
            type: 'Certification'
        },
        {
            role: 'Open Source Project: React Library',
            company: 'GitHub',
            location: 'Remote',
            years: 2,
            teamSize: '20+',
            type: 'Contribution'
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Briefcase className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-white">Learning Resources</h2>
                        <p className="text-xs text-white/40">{jobs.length} opportunities available</p>
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-xs font-medium text-white shadow-lg shadow-purple-500/20"
                >
                    <Eye className="w-3 h-3" />
                    View All
                </motion.button>
            </div>
            <motion.div
                initial="hidden"
                animate="show"
                variants={{
                    hidden: { opacity: 0 },
                    show: {
                        opacity: 1,
                        transition: {
                            staggerChildren: 0.1
                        }
                    }
                }}
                className="space-y-2 max-h-[calc(100vh-20rem)] overflow-y-auto pr-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {jobs.map((job, index) => (
                    <JobCard key={index} {...job} />
                ))}
                <style jsx>{`
                    div::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>
            </motion.div>
        </motion.div>
    );
};

export default PostingSection; 