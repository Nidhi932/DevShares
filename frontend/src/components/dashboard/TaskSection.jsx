import React from 'react';
import { motion } from 'framer-motion';
import { ListTodo, Plus, Clock, CheckCircle2 } from 'lucide-react';

const TaskItem = ({ title, status, dueDate, priority }) => {
    const getPriorityColor = (priority) => {
        switch (priority.toLowerCase()) {
            case 'high':
                return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'medium':
                return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'low':
                return 'text-green-400 bg-green-400/10 border-green-400/20';
            default:
                return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
        }
    };

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center justify-between p-2.5 hover:bg-white/5 rounded-lg cursor-pointer group relative overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300" />
            <div className="flex items-center gap-2 relative">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center ring-2 ring-purple-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white/60" />
                </div>
                <div>
                    <h4 className="text-xs font-medium text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300">{title}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center gap-1 text-[10px] text-white/40">
                            <Clock className="w-3 h-3" />
                            <span>{dueDate}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-1.5">
                <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-lg border ${getPriorityColor(priority)}`}>
                    {priority}
                </span>
                <span className="px-1.5 py-0.5 text-[10px] bg-gradient-to-r from-green-400/10 to-green-500/10 text-green-400 rounded-lg border border-green-400/20">
                    {status}
                </span>
            </div>
        </motion.div>
    );
};

const PieChart = ({ data }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    let currentAngle = 0;

    return (
        <div className="relative w-56 h-56">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {data.map((item, index) => {
                    const angle = (item.value / total) * 360;
                    const largeArcFlag = angle > 180 ? 1 : 0;

                    const startX = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
                    const startY = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
                    const endX = 50 + 40 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
                    const endY = 50 + 40 * Math.sin(((currentAngle + angle) * Math.PI) / 180);

                    const pathData = `
                        M 50 50
                        L ${startX} ${startY}
                        A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY}
                        Z
                    `;

                    currentAngle += angle;

                    return (
                        <motion.path
                            key={index}
                            d={pathData}
                            className={`${item.color} transition-all duration-300`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.05, translateX: 2, translateY: -2 }}
                        />
                    );
                })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">75.5%</div>
                    <div className="text-base text-white/60">Daily Goals</div>
                </div>
            </div>
            <div className="absolute -bottom-2 left-0 right-0">
                <div className="flex items-center justify-center gap-4">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${item.color.replace('fill-', 'bg-')}`} />
                            <span className="text-xs text-white/60">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const TaskSection = () => {
    const tasks = [
        {
            title: 'Complete AWS Lambda Functions Tutorial',
            status: 'In Progress',
            dueDate: 'Today, 6:00 PM',
            priority: 'High'
        },
        {
            title: 'Write Technical Blog Post on React Hooks',
            status: 'Completed',
            dueDate: 'Tomorrow',
            priority: 'Medium'
        },
        {
            title: 'Review Pull Requests for Open Source Project',
            status: 'Pending',
            dueDate: 'Next Week',
            priority: 'Low'
        },
        {
            title: 'Implement Authentication System',
            status: 'In Progress',
            dueDate: 'Today, 8:00 PM',
            priority: 'High'
        }
    ];

    const pieData = [
        { value: 45.5, color: 'fill-blue-500', label: 'Coding' },
        { value: 30.0, color: 'fill-purple-500', label: 'Learning' },
        { value: 24.5, color: 'fill-pink-500', label: 'Documentation' }
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
                        <ListTodo className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-white">My Tasks</h2>
                        <p className="text-xs text-white/40">{tasks.length} tasks pending</p>
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-xs font-medium text-white shadow-lg shadow-purple-500/20"
                >
                    <Plus className="w-3 h-3" />
                    Add Task
                </motion.button>
            </div>

            <div className="grid grid-cols-5 gap-4">
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="col-span-2 flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4"
                >
                    <PieChart data={pieData} />
                </motion.div>
                <motion.div
                    variants={{
                        hidden: { opacity: 0 },
                        show: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.1
                            }
                        }
                    }}
                    initial="hidden"
                    animate="show"
                    className="col-span-3 space-y-1.5 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-3 max-h-[calc(100vh-24rem)] overflow-y-auto"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {tasks.map((task, index) => (
                        <TaskItem key={index} {...task} />
                    ))}
                    <style jsx>{`
                        div::-webkit-scrollbar {
                            display: none;
                        }
                    `}</style>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default TaskSection; 