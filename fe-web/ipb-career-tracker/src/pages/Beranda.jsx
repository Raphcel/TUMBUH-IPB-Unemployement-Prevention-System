import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { opportunitiesApi } from '../api/opportunities';
import { companiesApi } from '../api/companies';
import { MapPin, DollarSign, ArrowRight, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export function Beranda() {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([opportunitiesApi.list(0, 3), companiesApi.list(0, 100)])
      .then(([oppData, compData]) => {
        setJobs(Array.isArray(oppData) ? oppData : oppData.items || []);
        setCompanies(Array.isArray(compData) ? compData : compData.items || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const allCompanies = [...companies, ...companies]; // duplicate for scroll effect

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <>
      <section className="relative pt-32 pb-20 sm:pt-48 sm:pb-32 overflow-hidden flex items-center min-h-[85vh]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1549757521-4160565ff3de?q=80&w=1674&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="University Campus"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-[#0f2854]/80 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 w-full">
          <div className="mx-auto max-w-3xl lg:mx-0">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-5xl sm:text-7xl font-bold tracking-tight text-white font-sans text-balance drop-shadow-md"
            >
              Growing Talent,
              <br />
              Shaping Futures.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="mt-6 text-lg leading-8 text-white/90 drop-shadow-sm max-w-2xl"
            >
              A thoughtful transition from university to professional life. Find
              internships, jobs, and scholarships, and organize your
              applications in one personal workspace.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="mt-10 mb-8 w-full max-w-lg"
            >
              <form action="/lowongan" className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-gray-400 transition-colors" />
                </div>
                <input
                  type="text"
                  name="q"
                  className="w-full border-transparent pl-4 py-4 rounded-xl placeholder:text-gray-400 sm:text-lg sm:leading-6 shadow-2xl bg-white backdrop-blur-md text-primary transition-all focus:outline-none focus:ring-0 focus:border-transparent"
                  placeholder="Search for jobs, internships, or scholarships..."
                />
                <div className="absolute inset-y-2 right-2">
                  <button type="submit" className="h-full px-6 bg-[#0f2854] hover:bg-[#1a3a70] text-white font-semibold rounded-lg shadow-md transition-colors">
                    Search
                  </button>
                </div>
              </form>
              <Link
                to="/panduan"
                className="text-sm font-semibold leading-6 text-white hover:text-white/80 transition-colors items-center gap-1 border-b border-transparent hover:border-white pb-0.5 mt-4 inline-block"
              >
                Read the Guides
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex justify-between items-end mb-12 border-b border-gray-100 pb-4"
          >
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-primary">
                Latest Opportunities
              </h2>
              <p className="mt-2 text-secondary">
                Curated openings for students and fresh graduates.
              </p>
            </div>
            <Link
              to="/lowongan"
              className="text-sm font-medium text-primary hover:text-accent mb-1 flex items-center gap-1"
            >
              View all <ArrowRight size={16} />
            </Link>
          </motion.div>

          {loading ? (
            <div className="col-span-full text-center py-12 text-secondary">
              Loading...
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {jobs.map((job) => (
                <motion.div
                  key={job.id}
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card
                    className="hover:border-primary/30 transition-all duration-300 group h-full hover:shadow-lg"
                  >
                    <CardBody className="p-5 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium text-lg text-primary line-clamp-1 group-hover:text-primary/80 transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-secondary text-sm">
                            {job.company?.name}
                          </p>
                        </div>
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
                      <div className="space-y-3 mb-6 flex-1">
                        <div className="flex items-center text-sm text-secondary gap-2">
                          <MapPin size={16} className="text-accent" />
                          {job.location}
                        </div>
                        <div className="flex items-center text-sm text-secondary gap-2">
                          <DollarSign size={16} className="text-accent" />
                          {job.salary}
                        </div>
                      </div>
                      <Button
                        to={`/lowongan/${job.id}`}
                        className="w-full text-xs py-2 bg-[#0f2854] hover:bg-[#183a6d] text-white font-semibold rounded border-none shadow-sm transition-colors focus:ring-2 focus:ring-accent/30 mt-auto"
                      >
                        Details
                      </Button>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <section className="py-10 relative bg-gradient-to-r from-[#0f2854] to-[#1a3a70] relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-semibold tracking-tight text-white/90 text-center mb-12"
          >
            Join 50+ Partner Companies
          </motion.h2>

          {/* Scrolling Banner Implementation */}
          <div className="flex overflow-hidden space-x-12 group">
            <div className="flex space-x-12 animate-scroll">
              {allCompanies.map((company, index) => (
                <motion.div
                  key={`${company.id}-${index}`}
                  whileHover={{ scale: 1.1, opacity: 1 }}
                  className="flex items-center justify-center min-w-[150px] opacity-70 transition-opacity"
                >
                  <Link
                    to={`/perusahaan/${company.id}`}
                    className="flex flex-col items-center"
                  >
                    <div className="h-16 w-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-white/50 text-xs font-bold mb-2">
                      {company.logo ? (
                        <img src={company.logo} alt={company.name} className="w-full h-full object-contain p-2" />
                      ) : "Logo"}
                    </div>
                    <span className="text-white font-medium text-sm">
                      {company.name}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
