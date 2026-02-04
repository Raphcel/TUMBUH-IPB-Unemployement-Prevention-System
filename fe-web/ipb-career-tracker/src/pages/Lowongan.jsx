import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input, Select } from '../components/ui/Input';
import { OPPORTUNITIES, COMPANIES } from '../data/mockData';
import { MapPin, DollarSign, Bookmark, Filter, X, Search, Briefcase } from 'lucide-react';

export function Lowongan() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobs, setSavedJobs] = useState([]); // Mock local state for bookmarks
  
  const [filterType, setFilterType] = useState('All');
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterCompany, setFilterCompany] = useState('All');

  // Extract unique locations and companies for filters
  const locations = ['All', ...new Set(OPPORTUNITIES.map(job => job.location))];
  const companyOptions = ['All', ...COMPANIES.map(c => c.name)];

  const toggleSave = (id) => {
    if (savedJobs.includes(id)) {
        setSavedJobs(savedJobs.filter(jobId => jobId !== id));
    } else {
        setSavedJobs([...savedJobs, id]);
    }
  };

  const filteredJobs = OPPORTUNITIES.filter(job => {
    const jobCompany = COMPANIES.find(c => c.id === job.companyId)?.name;
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          jobCompany?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || job.type === filterType;
    const matchesLocation = filterLocation === 'All' || job.location === filterLocation;
    const matchesCompany = filterCompany === 'All' || jobCompany === filterCompany;

    return matchesSearch && matchesType && matchesLocation && matchesCompany;
  });

  return (
    <div className="bg-white min-h-screen py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-primary">Explore Opportunities</h1>
                    <p className="mt-2 text-secondary text-lg">Browse roles that match your ambition.</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                         <Input 
                            placeholder="Search position or company..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-white border-gray-200 focus:border-primary focus:ring-primary/20"
                        />
                    </div>
                    <Button 
                        variant={showFilters ? "primary" : "outline"} 
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2"
                    >
                        <Filter size={18} /> Filters
                    </Button>
                </div>
            </div>

            {/* Expandable Filter Panel */}
            {showFilters && (
                <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-100 animate-slide-down">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-primary">Refine Search</h3>
                        <button onClick={() => setShowFilters(false)} className="text-secondary hover:text-primary">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-xs font-medium text-secondary mb-1.5 uppercase tracking-wider">Type</label>
                            <Select 
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                options={[
                                    { value: 'All', label: 'All Types' },
                                    { value: 'Internship', label: 'Internship' },
                                    { value: 'Full-time', label: 'Full-time' },
                                    { value: 'Scholarship', label: 'Scholarship' },
                                ]}
                                className="bg-white"
                            />
                        </div>
                         <div>
                            <label className="block text-xs font-medium text-secondary mb-1.5 uppercase tracking-wider">Location</label>
                            <Select 
                                value={filterLocation}
                                onChange={(e) => setFilterLocation(e.target.value)}
                                options={locations.map(loc => ({ value: loc, label: loc }))}
                                className="bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-secondary mb-1.5 uppercase tracking-wider">Company</label>
                            <Select 
                                value={filterCompany}
                                onChange={(e) => setFilterCompany(e.target.value)}
                                options={companyOptions.map(c => ({ value: c, label: c }))}
                                className="bg-white"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                         <Button variant="ghost" className="text-sm text-secondary hover:text-red-500" onClick={() => {
                             setFilterType('All'); 
                             setFilterLocation('All'); 
                             setFilterCompany('All');
                         }}>
                             Reset Filters
                         </Button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.length > 0 ? (
                    filteredJobs.map((job) => (
                        <Card key={job.id} className="hover:border-primary/20 transition-all duration-300 group relative flex flex-col h-full border-gray-200">
                            <CardBody className="p-6 flex flex-col h-full">
                                <div className="absolute top-6 right-6 z-10">
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleSave(job.id);
                                        }}
                                        className={`transition-all duration-200 ${savedJobs.includes(job.id) ? 'text-accent fill-accent' : 'text-gray-300 hover:text-accent'}`}
                                        title={savedJobs.includes(job.id) ? "Unsave" : "Save"}
                                    >
                                        <Bookmark size={20} fill={savedJobs.includes(job.id) ? "currentColor" : "none"} />
                                    </button>
                                </div>

                                <Link to={`/lowongan/${job.id}`} className="block flex-1">
                                    <div className="mb-4 pr-8">
                                        <h3 className="font-semibold text-lg text-primary line-clamp-1 group-hover:text-accent transition-colors">{job.title}</h3>
                                        <div className="flex items-center gap-2 mt-2 text-sm text-secondary">
                                            <Briefcase size={14} />
                                            <span>{COMPANIES.find(c => c.id === job.companyId)?.name}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        <Badge variant={job.type === 'Internship' ? 'info' : job.type === 'Scholarship' ? 'success' : 'neutral'}>
                                            {job.type}
                                        </Badge>
                                    </div>
                                    
                                    <div className="space-y-2 mb-6 text-sm text-secondary">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={14} className="text-gray-400" />
                                            {job.location}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DollarSign size={14} className="text-gray-400" />
                                            {job.salary}
                                        </div>
                                    </div>
                                </Link>
                                
                                <div className="mt-auto pt-4 border-t border-gray-100 w-full">
                                    <Button to={`/lowongan/${job.id}`} variant="outline" className="w-full justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                                        View Details
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center text-secondary">
                        <p>No opportunities found matching your criteria.</p>
                        <Button variant="ghost" onClick={() => {
                            setSearchTerm(''); 
                            setFilterType('All');
                            setFilterLocation('All');
                            setFilterCompany('All');
                        }} className="mt-2">Clear filters</Button>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
