import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PAGE_SIZE = 12;

export function Lowongan() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobs, setSavedJobs] = useState([]);

  const [filterType, setFilterType] = useState(
    searchParams.get('type') || 'All'
  );
  const [filterLocation, setFilterLocation] = useState(
    searchParams.get('location') || 'All'
  );
  const [filterCompany, setFilterCompany] = useState(
    searchParams.get('company') || 'All'
  );

  const [page, setPage] = useState(0);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const params = {};
    if (searchTerm) params.q = searchTerm;
    if (filterType !== 'All') params.type = filterType;
    if (filterLocation !== 'All') params.location = filterLocation;
    if (filterCompany !== 'All') params.company = filterCompany;
    setSearchParams(params, { replace: true });
  }, [searchTerm, filterType, filterLocation, filterCompany, setSearchParams]);

  const [allOpportunities, setAllOpportunities] = useState([]);
  const [totalOpportunities, setTotalOpportunities] = useState(0);
  const [allCompanies, setAllCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch companies once
  useEffect(() => {
    companiesApi.list(0, 100)
      .then((compData) => {
        const comps = Array.isArray(compData) ? compData : compData.items || [];
        setAllCompanies(comps);
      })
      .catch(console.error);
  }, []);

  // Fetch opportunities with server-side filters
  useEffect(() => {
    setLoading(true);
    opportunitiesApi
      .list(page * PAGE_SIZE, PAGE_SIZE, {
        search: debouncedSearch || undefined,
        type: filterType !== 'All' ? filterType : undefined,
        location: filterLocation !== 'All' ? filterLocation : undefined,
      })
      .then((oppData) => {
        const opps = Array.isArray(oppData) ? oppData : oppData.items || [];
        const total = oppData.total ?? opps.length;
        setAllOpportunities(opps);
        setTotalOpportunities(total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [debouncedSearch, filterType, filterLocation, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, filterType, filterLocation, filterCompany]);

  // Load bookmarks for logged-in students only
  useEffect(() => {
    if (!user || user.role !== 'student') return;
    bookmarksApi
      .mine()
      .then((bks) => {
        const ids = (Array.isArray(bks) ? bks : bks.items || []).map(
          (b) => b.opportunity_id ?? b.id
        );
        setSavedJobs(ids);
      })
      .catch(() => {});
  }, [user]);

  const locations = [
    'All',
    ...new Set(allOpportunities.map((job) => job.location).filter(Boolean)),
  ];
  const companyOptions = ['All', ...allCompanies.map((c) => c.name)];

  // Client-side company filter (since backend doesn't support company filter)
  const filteredJobs = filterCompany === 'All'
    ? allOpportunities
    : allOpportunities.filter((job) => {
        const jobCompany =
          job.company?.name ||
          allCompanies.find((c) => c.id === job.company_id)?.name || '';
        return jobCompany === filterCompany;
      });

  const totalPages = Math.ceil(totalOpportunities / PAGE_SIZE);

  const toggleSave = async (id) => {
    if (!user || user.role !== 'student') return;
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
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
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl font-semibold tracking-tight text-primary">
                  Explore Opportunities
                </h1>
                <p className="mt-2 text-secondary text-lg">
                  Browse roles that match your ambition.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full md:w-96"
              >
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <Input
                      className="pl-10 bg-gray-50 border-gray-200 focus:border-primary focus:ring-primary/20"
                      placeholder="Search position or company..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
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
            </div>

            {/* Expandable Filter Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden mb-8"
                >
                  <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-primary">
                        Refine Search
                      </h3>
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
                    whileHover={{ y: -5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Card className="hover:border-primary/20 transition-all duration-300 group relative flex flex-col h-full border-gray-200">
                      <CardBody className="p-6 flex flex-col h-full">
                        {user?.role === 'student' && (
                        <div className="absolute top-6 right-6 z-10">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              toggleSave(job.id);
                            }}
                            className={`transition-all duration-200 ${savedJobs.includes(job.id) ? 'text-accent fill-accent' : 'text-gray-300 hover:text-accent'}`}
                            title={
                              savedJobs.includes(job.id) ? 'Unsave' : 'Save'
                            }
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
                        )}

                        <Link
                          to={`/lowongan/${job.id}`}
                          className="block flex-1"
                        >
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
                  <p>Tidak ada lowongan yang sesuai dengan pencarian Anda.</p>
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
                    Hapus Filter
                  </Button>
                </div>
              )}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-10">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft size={16} /> Sebelumnya
                </Button>
                <span className="text-sm text-secondary">
                  Halaman {page + 1} dari {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                  className="flex items-center gap-1"
                >
                  Selanjutnya <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
