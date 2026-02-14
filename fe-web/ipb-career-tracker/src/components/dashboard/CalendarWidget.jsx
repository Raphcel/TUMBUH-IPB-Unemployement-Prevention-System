import React, { useState } from 'react';
import {
    format,
    startOfWeek,
    addDays,
    startOfMonth,
    endOfMonth,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths
} from 'date-fns';
import { Card, CardBody } from '../ui/Card';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '../ui/Modal';

export function CalendarWidget() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState(null); // State for modal

    // Mock data - in a real app this would come from props or context
    const [events] = useState([
        {
            id: 1,
            date: new Date(),
            title: 'Team Sync',
            type: 'Meeting',
            time: '10:00 AM',
            location: 'Conference Room A',
            description: 'Weekly team synchronization meeting to discuss project progress and blockers.'
        },
        {
            id: 2,
            date: addDays(new Date(), 2),
            title: 'Submit Report',
            type: 'Deadline',
            time: '5:00 PM',
            location: 'Online',
            description: 'Submit the monthly financial report to the finance department.'
        },
        {
            id: 3,
            date: addDays(new Date(), 5),
            title: 'Client Call',
            type: 'Meeting',
            time: '2:00 PM',
            location: 'Zoom',
            description: 'Quarterly review call with the client to discuss performance and next steps.'
        },
    ]);

    const renderHeader = () => {
        return (
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-primary flex items-center gap-2">
                    <CalendarIcon size={18} /> {format(currentMonth, 'MMMM yyyy')}
                </h3>
                <div className="flex gap-1">
                    <button
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className="p-1 hover:bg-gray-100 rounded-full text-secondary transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="p-1 hover:bg-gray-100 rounded-full text-secondary transition-colors"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = [];
        const startDate = startOfWeek(currentMonth);

        for (let i = 0; i < 7; i++) {
            days.push(
                <div key={i} className="text-center text-xs font-semibold text-gray-400 py-2">
                    {format(addDays(startDate, i), 'EEE')}
                </div>
            );
        }
        return <div className="grid grid-cols-7 mb-1 bg-gray-50/50 rounded-lg">{days}</div>;
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = '';

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, 'd');
                const cloneDay = day;
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const hasEvent = events.some(e => isSameDay(e.date, day));

                days.push(
                    <motion.div
                        key={day}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`
              relative aspect-square flex items-center justify-center text-sm rounded-full cursor-pointer transition-colors duration-200
              ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-50'}
              ${isSelected ? 'bg-primary text-white font-bold shadow-md hover:bg-gray-200 hover:text-primary' : ''}
              ${hasEvent && !isSelected ? 'font-semibold text-primary' : ''}
            `}
                        onClick={() => setSelectedDate(cloneDay)}
                    >
                        <span>{formattedDate}</span>
                        {hasEvent && !isSelected && (
                            <span className="absolute bottom-1.5 w-1 h-1 bg-accent rounded-full animate-pulse"></span>
                        )}
                    </motion.div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div key={day} className="grid grid-cols-7 gap-1">
                    {days}
                </div>
            );
            days = [];
        }
        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentMonth.toString()}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1"
                >
                    {rows}
                </motion.div>
            </AnimatePresence>
        );
    };

    const selectedEvents = events.filter(e => isSameDay(e.date, selectedDate));

    return (
        <>
            <Card className="border-gray-100 shadow-sm flex flex-col overflow-hidden w-full">
                <CardBody className="p-6 flex flex-col">
                    {renderHeader()}
                    {renderDays()}
                    <div className="mb-6">{renderCells()}</div>

                    <div className="mt-auto pt-5 border-t border-gray-100">
                        <h4 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Clock size={12} /> Schedule for {format(selectedDate, 'MMM d, yyyy')}
                        </h4>

                        <div className="space-y-2 min-h-[100px]">
                            <AnimatePresence mode="wait">
                                {selectedEvents.length > 0 ? (
                                    selectedEvents.map((event) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            key={event.id}
                                            onClick={() => setSelectedEvent(event)}
                                            className="group flex gap-3 p-2.5 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all cursor-pointer"
                                        >
                                            <div className={`w-1 rounded-full ${event.type === 'Deadline' ? 'bg-red-400' : 'bg-accent'}`}></div>
                                            <div className="flex-1">
                                                <p className="font-medium text-sm text-primary">{event.title}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs text-secondary flex items-center gap-1">
                                                        <Clock size={10} /> {event.time}
                                                    </span>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${event.type === 'Deadline' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                                        }`}>
                                                        {event.type}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center justify-center py-6 text-gray-400 border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/50"
                                    >
                                        <CalendarIcon size={24} className="mb-2 opacity-20" />
                                        <p className="text-xs">No events scheduled</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Event Details Modal */}
            <Modal
                isOpen={!!selectedEvent}
                onClose={() => setSelectedEvent(null)}
                title={selectedEvent?.title || 'Event Details'}
                size="sm"
            >
                {selectedEvent && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-secondary">
                            <Clock size={16} />
                            <span>{format(selectedEvent.date, 'EEEE, MMMM d, yyyy')} at {selectedEvent.time}</span>
                        </div>

                        {selectedEvent.location && (
                            <div className="flex items-center gap-2 text-sm text-secondary">
                                <MapPin size={16} />
                                <span>{selectedEvent.location}</span>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${selectedEvent.type === 'Deadline' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                                }`}>
                                {selectedEvent.type}
                            </span>
                        </div>

                        {selectedEvent.description && (
                            <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                                {selectedEvent.description}
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
}
