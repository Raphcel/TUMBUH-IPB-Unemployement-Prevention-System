import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { companiesApi } from '../api/companies';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Filter } from 'lucide-react';
import { X } from 'lucide-react';
import { Search, Star, Award, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Perusahaan() {
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filterLocation, setFilterLocation] = useState('All');
  const [filterIndustry, setFilterIndustry] = useState('All');

  const [allLocations, setAllLocations] = useState([]);
  const [allIndustries, setAllIndustries] = useState([]);

  useEffect(() => {
    companiesApi
      .list(0, 100)
      .then((data) => {
        const comps = Array.isArray(data) ? data : data.items || [];
        setCompanies(comps);

        setAllLocations([...new Set(comps.map(c => c.location).filter(Boolean))]);
        setAllIndustries([...new Set(comps.map(c => c.industry).filter(Boolean))]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const locations = React.useMemo(() => [
    'All',
    ...[...new Set((allLocations || []).filter(Boolean))]
  ], [allLocations]);

  const industries = React.useMemo(() => [
    'All',
    ...[...new Set((allIndustries || []).filter(Boolean))]
  ], [allIndustries]);

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-semibold tracking-tight text-primary">
              Partner Companies
            </h1>
            <p className="mt-2 text-secondary text-lg">
              Connect with industry leaders and top employers.
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
                  placeholder="Search by name or industry..."
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      Industry
                    </label>
                    <Select
                      value={filterIndustry}
                      onChange={(e) => setFilterIndustry(e.target.value)}
                      options={industries.map((ind) => ({
                        value: ind,
                        label: ind,
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
                      setFilterLocation('All');
                      setFilterIndustry('All');
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f2854]" />
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredCompanies.length > 0 ? (
              filteredCompanies.map((company, index) => (
                <motion.div
                  key={company.id}
                  initial="hidden"
                  animate="visible"
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Link
                    to={`/perusahaan/${company.id}`}
                    className="group h-full block"
                  >
                    <Card className="h-full hover:border-primary/30 hover:shadow-lg transition-all duration-300 relative overflow-hidden bg-white border-gray-100">
                      {/* Decorative background accent */}
                      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-[#0f2854]/8 to-[#727272]/5 -z-10" />

                      {/* Top Badge for specific items (simulating 'Award') */}
                      {index % 3 === 0 && (
                        <div
                          className="absolute top-4 right-4 bg-yellow-100 text-yellow-700 p-1.5 rounded-full"
                          title="Top Employer"
                        >
                          <Award size={16} />
                        </div>
                      )}

                      <CardBody className="flex flex-col items-center text-center p-6 pt-10 h-full">
                        <div className="w-24 h-24 rounded-2xl mb-5 bg-white shadow-sm border border-gray-100 flex items-center justify-center p-4">
                          <img
                            src={company.logo}
                            alt={company.name}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <h3 className="text-xl font-semibold text-primary group-hover:text-accent transition-colors mb-2">
                          {company.name}
                        </h3>

                        <div className="flex items-center gap-2 mb-4">
                          <Badge
                            variant="outline"
                            className="text-xs border-accent/20 text-accent bg-accent/5"
                          >
                            {company.industry}
                          </Badge>
                          <span className="flex items-center text-xs font-medium text-yellow-500 gap-1 bg-yellow-50 px-2 py-0.5 rounded-full">
                            <Star size={12} fill="currentColor" />{' '}
                            {4 + (index % 10) / 10}
                          </span>
                        </div>

                        <p className="text-sm text-secondary line-clamp-2 mb-6 h-10">
                          {company.description}
                        </p>

                        <div className="mt-auto w-full pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-secondary">
                          <div className="flex items-center gap-1">
                            <MapPin size={14} /> Jakarta, ID
                          </div>
                          <span className="group-hover:translate-x-1 transition-transform text-primary font-medium">
                            View Profile &rarr;
                          </span>
                        </div>
                      </CardBody>
                    </Card>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-secondary">
                <p>No companies found matching "{searchTerm}".</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
