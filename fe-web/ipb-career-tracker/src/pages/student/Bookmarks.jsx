import React, { useState } from 'react';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Link } from 'react-router-dom';
import {
    Bookmark,
    MapPin,
    Clock,
    Briefcase,
    Search,
    Filter,
    ArrowUpDown,
    Building,
} from 'lucide-react';
import { Input } from '../../components/ui/Input';

import { motion } from 'framer-motion';

export function Bookmarks() {
    // ... (keep state)
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('deadline'); // 'deadline', 'title', 'company'

    // Mock Data for Bookmarks (since we don't have an API yet)
    const [bookmarks, setBookmarks] = useState([
        {
            id: 1,
            title: 'Frontend Developer Intern',
            company: { name: 'Tokopedia', logo: null, id: 1 },
            location: 'Jakarta (Remote)',
            type: 'Internship',
            deadline: '2024-05-15',
            salary: 'Paid',
            bookmarkedAt: '2024-04-10',
        },
        {
            id: 2,
            title: 'UI/UX Designer',
            company: { name: 'Gojek', logo: null, id: 2 },
            location: 'Jakarta Selatan',
            type: 'Full-time',
            deadline: '2024-06-01',
            salary: 'Competitive',
            bookmarkedAt: '2024-04-12',
        },
        {
            id: 3,
            title: 'Data Analyst Entry Level',
            company: { name: 'Traveloka', logo: null, id: 3 },
            location: 'Tangerang',
            type: 'Full-time',
            deadline: '2024-04-30',
            salary: 'Rp 8.000.000',
            bookmarkedAt: '2024-04-05',
        },
    ]);

    const handleRemoveBookmark = (id) => {
        setBookmarks(bookmarks.filter((item) => item.id !== id));
    };

    const filteredBookmarks = bookmarks
        .filter((item) => {
            const lowerTerm = searchTerm.toLowerCase();
            return (
                item.title.toLowerCase().includes(lowerTerm) ||
                item.company.name.toLowerCase().includes(lowerTerm)
            );
        })
        .sort((a, b) => {
            if (sortBy === 'deadline') {
                return new Date(a.deadline) - new Date(b.deadline);
            } else if (sortBy === 'title') {
                return a.title.localeCompare(b.title);
            } else if (sortBy === 'company') {
                return a.company.name.localeCompare(b.company.name);
            }
            return 0;
        });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-5xl space-y-8 min-h-screen pb-20"
        >
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-3xl font-semibold text-primary tracking-tight flex items-center gap-2">
                        <Bookmark className="text-accent fill-current" size={28} /> Saved Opportunities
                    </h1>
                    <p className="text-secondary mt-1 text-lg">
                        Manage your bookmarked jobs and internships.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                    {bookmarks.length} Saved Items
                </div>
            </motion.div>

            {/* Controls */}
            <motion.div variants={itemVariants} className="sticky top-4 z-30">
                <Card className="border-gray-100 shadow-sm bg-white">
                    <CardBody className="p-4 flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search saved jobs..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 min-w-[200px]">
                            <ArrowUpDown size={18} className="text-secondary" />
                            <select
                                className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="deadline">Sort by Deadline</option>
                                <option value="title">Sort by Title</option>
                                <option value="company">Sort by Company</option>
                            </select>
                        </div>
                    </CardBody>
                </Card>
            </motion.div>

            {/* List */}
            <div className="grid gap-4">
                {filteredBookmarks.length > 0 ? (
                    filteredBookmarks.map((job) => (
                        <motion.div
                            key={job.id}
                            variants={itemVariants}
                            whileHover={{ scale: 1.01 }}
                        >
                            <Card
                                className="group border border-gray-100 hover:border-primary/30 transition-all hover:shadow-md"
                            >
                                <CardBody className="p-6">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Logo */}
                                        <div className="w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                                            <span className="text-xl font-bold text-gray-400">
                                                {job.company.name[0]}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-primary group-hover:text-[#0f2854] transition-colors">
                                                        <Link to={`/lowongan/${job.id}`}>
                                                            {job.title}
                                                        </Link>
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-primary font-medium mt-1">
                                                        <Building size={14} />
                                                        {job.company.name}
                                                    </div>
                                                </div>
                                                <Badge variant={job.type === 'Internship' ? 'info' : 'success'}>
                                                    {job.type}
                                                </Badge>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm text-secondary">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin size={14} />
                                                    {job.location}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={14} />
                                                    Deadline: {new Date(job.deadline).toLocaleDateString('id-ID')}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Briefcase size={14} />
                                                    {job.salary}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-row md:flex-col gap-3 justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 mt-4 md:mt-0">
                                            <Button
                                                to={`/lowongan/${job.id}`}
                                                variant="primary"
                                                className="whitespace-nowrap w-full md:w-auto text-white justify-center"
                                            >
                                                Apply Now
                                            </Button>
                                            <Button
                                                onClick={() => handleRemoveBookmark(job.id)}
                                                variant="ghost"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50 w-full md:w-auto justify-center"
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </motion.div>
                    ))
                ) : (
                    <motion.div variants={itemVariants} className="text-center py-20 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200">
                        <Bookmark className="mx-auto text-gray-300 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-primary">No bookmarks found</h3>
                        <p className="text-secondary mt-1">
                            {searchTerm ? "Try adjusting your search terms." : "You haven't saved any opportunities yet."}
                        </p>
                        {!searchTerm && (
                            <Button to="/lowongan" variant="outline" className="mt-6">
                                Browse Opportunities
                            </Button>
                        )}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
