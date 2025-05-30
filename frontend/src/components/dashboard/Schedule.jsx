import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, Calendar, Users, Clock, Plus, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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
                    className="w-6 h-6 rounded-lg border-2 border-black/50 object-cover ring-2 ring-purple-500/20"
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse" />
            </motion.div>
        ))}
    </div>
);

const EventCard = ({ title, time, color = 'from-blue-500 to-blue-600', attendees = 2, index }) => (
    <Draggable draggableId={`event-${index}`} index={index}>
        {(provided, snapshot) => (
            <motion.div
                ref={provided.innerRef}
                {...provided.draggableProps}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02 }}
                className="flex items-start gap-3 p-4 hover:bg-white/5 rounded-lg transition-all duration-200 group relative"
                style={{
                    ...provided.draggableProps.style,
                    boxShadow: snapshot.isDragging ? '0 8px 24px rgba(0, 0, 0, 0.15)' : 'none'
                }}
            >
                <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-5 h-5 text-white/40 hover:text-white/60 transition-colors" />
                </div>
                <div className={`w-1 h-full rounded-full bg-gradient-to-b ${color} group-hover:scale-y-110 transition-transform duration-200`} />
                <div className="flex-1">
                    <h4 className="text-[15px] font-medium leading-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300">{title}</h4>
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 text-sm text-white/60">
                            <Clock className="w-4 h-4" />
                            <span>{time}</span>
                        </div>
                        <AvatarGroup count={attendees} />
                    </div>
                </div>
            </motion.div>
        )}
    </Draggable>
);

const CalendarDay = ({ day, isCurrentMonth, event, onDrop }) => {
    const isToday = new Date().getDate() === day.day;

    return (
        <Droppable droppableId={`day-${day.day}`}>
            {(provided, snapshot) => (
                <motion.div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    whileHover={{ scale: 1.02 }}
                    className={`min-h-[120px] p-3 border-t border-white/10 hover:bg-white/5 transition-colors cursor-pointer relative
                        ${!isCurrentMonth ? 'text-white/30 bg-white/5' : ''} 
                        ${isToday ? 'bg-white/5' : ''}`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${isToday ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500' : ''}`}>
                            {day.day}
                        </span>
                        {isToday && (
                            <span className="px-2 py-0.5 text-[10px] bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white">
                                Today
                            </span>
                        )}
                    </div>
                    <div className="space-y-1">
                        {event && (
                            <AnimatePresence>
                                {Array.isArray(event) ? (
                                    event.map((e, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            whileHover={{ scale: 1.05 }}
                                            className={`text-[11px] px-2 py-1 rounded-lg bg-gradient-to-r ${e.color} text-white flex items-center justify-between shadow-lg shadow-purple-500/10`}
                                        >
                                            <span>{e.time}</span>
                                            <AvatarGroup count={e.attendees} startIndex={i * 2} />
                                        </motion.div>
                                    ))
                                ) : event.type === 'range' ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        whileHover={{ scale: 1.05 }}
                                        className={`text-[11px] px-2 py-1 rounded-lg bg-gradient-to-r ${event.color} text-white flex items-center justify-between shadow-lg shadow-purple-500/10`}
                                    >
                                        <span>{event.title}</span>
                                        <div className="flex items-center gap-1">
                                            <span>{event.time}</span>
                                            <AvatarGroup count={event.attendees} />
                                        </div>
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>
                        )}
                        {provided.placeholder}
                    </div>
                    {snapshot.isDraggingOver && (
                        <div className="absolute inset-0 border-2 border-dashed border-blue-500/50 rounded-lg pointer-events-none" />
                    )}
                </motion.div>
            )}
        </Droppable>
    );
};

const Schedule = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date(2025, 2));
    const [events, setEvents] = useState([
        {
            title: 'LeetCode Daily Challenge - Dynamic Programming',
            time: '09:00 AM - 10:00 AM',
            color: 'from-blue-400 to-blue-500',
            attendees: 1
        },
        {
            title: 'System Design Study - Microservices Architecture',
            time: '11:00 AM - 12:30 PM',
            color: 'from-purple-400 to-purple-500',
            attendees: 1
        },
        {
            title: 'Open Source Project Review & Contribution',
            time: '02:00 PM - 04:00 PM',
            color: 'from-green-400 to-green-500',
            attendees: 2
        },
        {
            title: 'Tech Blog Writing - New React Features',
            time: '04:30 PM - 05:30 PM',
            color: 'from-yellow-400 to-yellow-500',
            attendees: 1
        },
        {
            title: 'Code Review & Documentation Update',
            time: '06:00 PM - 07:00 PM',
            color: 'from-pink-400 to-pink-500',
            attendees: 2
        }
    ]);

    // Calendar data with updated gradient colors and developer-focused events
    const calendarEvents = {
        '2025-03-01': [
            { time: '13:00', duration: '60 min', title: 'Algorithm Study', color: 'from-cyan-400 to-cyan-500', attendees: 1 }
        ],
        '2025-03-08': [
            { time: '9:00', duration: '2 hours', title: 'Frontend Workshop', color: 'from-blue-400 to-blue-500', attendees: 1 },
            { time: '13:00', duration: '60 min', title: 'Code Review', color: 'from-blue-400 to-blue-500', attendees: 2 }
        ],
        '2025-03-11': [
            { time: '13:00', title: 'Tech Interview Prep', color: 'from-red-400 to-red-500', attendees: 2 }
        ],
        '2025-03-14-17': {
            title: 'Hackathon Project',
            time: 'Mon - Thu',
            timeDisplay: '10:00 am',
            type: 'range',
            color: 'from-red-400 to-red-500',
            attendees: 3
        },
        '2025-03-27-30': {
            title: 'Cloud Certification Course',
            time: 'Mon - Thu',
            timeDisplay: '11:00 am',
            type: 'range',
            color: 'from-blue-400 to-blue-500',
            attendees: 1
        }
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay() || 7; // Convert Sunday (0) to 7 for easier calculation

        const days = [];
        // Add days from previous month
        const prevMonthDays = new Date(year, month, 0).getDate();
        for (let i = startingDay - 1; i > 0; i--) {
            days.push({
                day: prevMonthDays - i + 1,
                isCurrentMonth: false,
                date: new Date(year, month - 1, prevMonthDays - i + 1)
            });
        }

        // Add days of current month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                day: i,
                isCurrentMonth: true,
                date: new Date(year, month, i)
            });
        }

        // Add days from next month
        const remainingDays = 42 - days.length; // 6 rows × 7 days = 42
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                day: i,
                isCurrentMonth: false,
                date: new Date(year, month + 1, i)
            });
        }

        return days;
    };

    const formatDate = (date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const hasEvent = (date) => {
        const dateStr = formatDate(date);
        return calendarEvents[dateStr] || Object.keys(calendarEvents).some(key => {
            if (key.includes('-')) {
                const [startDate, endDate] = key.split('-').slice(0, 3);
                const currentDate = dateStr.split('-')[2];
                return parseInt(currentDate) >= parseInt(startDate) && parseInt(currentDate) <= parseInt(endDate);
            }
            return false;
        });
    };

    const getEventForDate = (date) => {
        const dateStr = formatDate(date);
        return calendarEvents[dateStr] || Object.entries(calendarEvents).find(([key, value]) => {
            if (key.includes('-')) {
                const [startDate, endDate] = key.split('-').slice(0, 3);
                const currentDate = dateStr.split('-')[2];
                return parseInt(currentDate) >= parseInt(startDate) && parseInt(currentDate) <= parseInt(endDate);
            }
            return false;
        })?.[1];
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(events);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setEvents(items);
    };

    const days = getDaysInMonth(currentMonth);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/50 backdrop-blur-sm rounded-2xl border border-white/10"
        >
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">My Schedule</h2>
                            <p className="text-sm text-white/40">You have {events.length} events today</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                            <Users className="w-4 h-4 text-white/60" />
                            <span className="text-sm text-white/60">Participants</span>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-sm font-medium text-white shadow-lg shadow-purple-500/20"
                        >
                            <Plus className="w-4 h-4" />
                            Add Event
                        </motion.button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {/* Left side - Up next */}
                    <div className="col-span-1 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <h3 className="font-medium text-white">Up next</h3>
                                <span className="px-2 py-0.5 text-xs bg-white/5 rounded-lg text-white/60 border border-white/10">Today</span>
                            </div>
                            <AvatarGroup count={2} startIndex={5} />
                        </div>
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="events">
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="space-y-3 max-h-[calc(100vh-24rem)] overflow-y-auto pr-2"
                                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                    >
                                        {events.map((event, index) => (
                                            <EventCard key={index} {...event} index={index} />
                                        ))}
                                        {provided.placeholder}
                                        <style jsx>{`
                                            div::-webkit-scrollbar {
                                                display: none;
                                            }
                                        `}</style>
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>

                    {/* Right side - Calendar */}
                    <div className="col-span-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                        {/* Calendar header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-xs font-medium text-white shadow-lg shadow-purple-500/20"
                                >
                                    Today
                                </motion.button>
                                <div className="flex items-center gap-1">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4 text-white" />
                                    </motion.button>
                                    <span className="text-sm font-medium text-white">March 2025</span>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4 text-white" />
                                    </motion.button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    className="px-2 py-1 text-xs font-medium hover:bg-white/10 rounded-lg flex items-center gap-1 transition-colors text-white/60 hover:text-white"
                                >
                                    Month <ChevronRight className="w-3 h-3" />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <Search className="w-4 h-4 text-white" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Calendar grid */}
                        <div className="grid grid-cols-7 text-xs gap-px bg-white/5 rounded-lg overflow-hidden">
                            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                                <div key={day} className="text-xs font-medium text-white/60 text-center p-2 bg-white/5">
                                    {day}
                                </div>
                            ))}
                            <DragDropContext onDragEnd={handleDragEnd}>
                                {days.map((day, index) => (
                                    <CalendarDay
                                        key={index}
                                        day={day}
                                        isCurrentMonth={day.isCurrentMonth}
                                        event={getEventForDate(day.date)}
                                    />
                                ))}
                            </DragDropContext>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Schedule;
