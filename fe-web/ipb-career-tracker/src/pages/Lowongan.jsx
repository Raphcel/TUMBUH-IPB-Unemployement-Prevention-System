import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input, Select } from '../components/ui/Input';
import { opportunitiesApi } from '../api/opportunities';
import { companiesApi } from '../api/companies';
import { bookmarksApi } from '../api/bookmarks';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  DollarSign,
  Bookmark,
  Filter,
  X,
  Search,
  Briefcase,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Lowongan() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobs, setSavedJobs] = useState([]);

  const [filterType, setFilterType] = useState('All');
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterCompany, setFilterCompany] = useState('All');

  const [allOpportunities, setAllOpportunities] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([opportunitiesApi.list(0, 100), companiesApi.list(0, 100)])
      .then(([oppData, compData]) => {
        const opps = Array.isArray(oppData) ? oppData : oppData.items || [];
        const comps = Array.isArray(compData) ? compData : compData.items || [];
        setAllOpportunities(opps);
        setAllCompanies(comps);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Load bookmarks for logged-in users
  useEffect(() => {
    if (!user) return;
    bookmarksApi
      .mine()
      .then((bks) => {
        const ids = (Array.isArray(bks) ? bks : bks.items || []).map(
          (b) => b.opportunity_id ?? b.id
        );
        setSavedJobs(ids);
      })
      .catch(() => { });
  }, [user]);

  const locations = [
    'All',
    ...new Set(allOpportunities.map((job) => job.location)),
  ];
  const companyOptions = ['All', ...allCompanies.map((c) => c.name)];

  const toggleSave = async (id) => {
    if (!user) return;
    try {
      if (savedJobs.includes(id)) {
        await bookmarksApi.remove(id);
        setSavedJobs(savedJobs.filter((jid) => jid !== id));
      } else {
        await bookmarksApi.add(id);
        setSavedJobs([...savedJobs, id]);
      }
    } catch (err) {
      console.error('Bookmark error', err);
    }
  };

  const filteredJobs = allOpportunities.filter((job) => {
    const jobCompany =
      job.company?.name ||
      allCompanies.find((c) => c.id === job.company_id)?.name ||
      '';
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jobCompany.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || job.type === filterType;
    const matchesLocation =
      filterLocation === 'All' || job.location === filterLocation;
    const matchesCompany =
      filterCompany === 'All' || jobCompany === filterCompany;

    return matchesSearch && matchesType && matchesLocation && matchesCompany;
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f2854]" />
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4"
            >
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-primary">
                  Explore Opportunities
                </h1>
                <p className="mt-2 text-secondary text-lg">
                  Browse roles that match your ambition.
                </p>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <Input
                    placeholder="Search position or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-none shadow-sm focus:ring-accent focus:ring-opacity-50"
                  />
                </div>
                <Button
                  variant={showFilters ? 'secondary' : 'outline'}
                  onClick={() => setShowFilters(!showFilters)}
                  className="!border-none flex items-center gap-2"
                >
                  <Filter size={18} /> Filters
                </Button>
              </div>
            </motion.div>

            {/* Expandable Filter Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden mb-8"
                >
                  <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-primary">Refine Search</h3>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="text-secondary hover:text-primary"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-xs font-medium text-secondary mb-1.5 uppercase tracking-wider">
                          Type
                        </label>
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
                        <label className="block text-xs font-medium text-secondary mb-1.5 uppercase tracking-wider">
                          Location
                        </label>
                        <Select
                          value={filterLocation}
                          onChange={(e) => setFilterLocation(e.target.value)}
                          options={locations.map((loc) => ({
                            value: loc,
                            label: loc,
                          }))}
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-secondary mb-1.5 uppercase tracking-wider">
                          Company
                        </label>
                        <Select
                          value={filterCompany}
                          onChange={(e) => setFilterCompany(e.target.value)}
                          options={companyOptions.map((c) => ({
                            value: c,
                            label: c,
                          }))}
                          className="bg-white"
                        />
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <Button
                        variant="ghost"
                        className="text-sm text-secondary hover:text-red-500"
                        onClick={() => {
                          setFilterType('All');
                          setFilterLocation('All');
                          setFilterCompany('All');
                        }}
                      >
                        Reset Filters
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <motion.div
                    key={job.id}
                    initial="hidden"
                    animate="visible"
                    variants={itemVariants}
                    layout
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card
                      className="hover:border-primary/20 transition-all duration-300 group relative flex flex-col h-full border-gray-200"
                    >
                      <CardBody className="p-6 flex flex-col h-full">
                        <div className="absolute top-6 right-6 z-10">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              toggleSave(job.id);
                            }}
                            className={`transition-all duration-200 ${savedJobs.includes(job.id) ? 'text-accent fill-accent' : 'text-gray-300 hover:text-accent'}`}
                            title={savedJobs.includes(job.id) ? 'Unsave' : 'Save'}
                          >
                            <Bookmark
                              size={20}
                              fill={
                                savedJobs.includes(job.id)
                                  ? 'currentColor'
                                  : 'none'
                              }
                            />
                          </button>
                        </div>

                        <Link to={`/lowongan/${job.id}`} className="block flex-1">
                          <div className="mb-4 pr-8">
                            <h3 className="font-semibold text-lg text-primary line-clamp-1 group-hover:text-accent transition-colors">
                              {job.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-2 text-sm text-secondary">
                              <Briefcase size={14} />
                              <span>{job.company?.name}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-6">
                            <Badge
                              variant={
                                job.type === 'Internship'
                                  ? 'info'
                                  : job.type === 'Scholarship'
                                    ? 'success'
                                    : 'neutral'
                              }
                            >
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
                          <Button
                            to={`/lowongan/${job.id}`}
                            className="w-full justify-center bg-[#0f2854] hover:bg-[#183a6d] text-white font-semibold rounded border-none shadow-sm transition-colors focus:ring-2 focus:ring-accent/30"
                          >
                            View Details
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center text-secondary">
                  <p>No opportunities found matching your criteria.</p>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterType('All');
                      setFilterLocation('All');
                      setFilterCompany('All');
                    }}
                    className="mt-2"
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
