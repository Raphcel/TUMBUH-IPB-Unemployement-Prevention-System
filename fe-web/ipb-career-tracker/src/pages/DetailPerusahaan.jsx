import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { companiesApi } from '../api/companies';
import { opportunitiesApi } from '../api/opportunities';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  MapPin,
  Globe,
  ArrowLeft,
  Briefcase,
  Building2,
  Linkedin,
  Instagram,
  Star,
  Award,
  CheckCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

export function DetailPerusahaan() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [companyJobs, setCompanyJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([companiesApi.get(id), opportunitiesApi.listByCompany(id)])
      .then(([compData, oppData]) => {
        setCompany(compData);
        setCompanyJobs(Array.isArray(oppData) ? oppData : oppData.items || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f2854]" />
      </div>
    );
  }

  if (!company)
    return (
      <div className="py-20 text-center text-secondary">Company not found</div>
    );

  // Mock Awards & Trust Signals
  const awards = [
    { year: '2025', title: 'Top Employer Indonesia' },
    { year: '2024', title: 'Best Workplace for Gen Z' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="h-80 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f2854] to-[#1a3a70]" />
        <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 -mt-32 relative z-10">
        <Link
          to="/perusahaan"
          className="text-white/80 hover:text-white mb-6 inline-flex items-center gap-2 absolute -top-16 left-6 lg:left-8 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} /> Back to Companies
        </Link>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 flex flex-col md:flex-row gap-8 items-start"
        >
          <div className="w-32 h-32 rounded-xl bg-white shadow-md border border-gray-100 flex items-center justify-center p-4 shrink-0 -mt-16 md:mt-0">
            {company.logo ? (
              <img
                src={company.logo}
                alt={company.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-3xl font-bold text-gray-400">
                {company.name?.[0]}
              </span>
            )}
          </div>
          <div className="flex-1 pt-2 md:pt-0">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-primary mb-2">
                  {company.name}
                </h1>
                <p className="text-secondary text-lg mb-4">
                  {company.tagline || 'Innovating for a better future.'}
                </p>
              </div>
              <div className="flex gap-2">
                {company.linkedin_url && (
                  <motion.a
                    whileHover={{ scale: 1.1 }}
                    href={company.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-gray-400 hover:text-[#0077b5] bg-gray-50 rounded-full transition-colors"
                  >
                    <Linkedin size={20} />
                  </motion.a>
                )}
                {company.instagram_url && (
                  <motion.a
                    whileHover={{ scale: 1.1 }}
                    href={company.instagram_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-gray-400 hover:text-[#E1306C] bg-gray-50 rounded-full transition-colors"
                  >
                    <Instagram size={20} />
                  </motion.a>
                )}
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-gray-400 hover:text-primary bg-gray-50 rounded-full transition-colors"
                >
                  <Globe size={20} />
                </motion.a>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-secondary text-sm">
              <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full text-primary font-medium border border-gray-100">
                <Building2 size={14} className="text-accent" />{' '}
                {company.industry}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={14} /> {company.location}
              </span>
              <span className="flex items-center gap-1.5 text-yellow-500 font-medium">
                <Star size={14} fill="currentColor" /> {company.rating || 4.5}{' '}
                Rating
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8"
        >
          <div className="lg:col-span-2 space-y-8">
            <motion.section variants={itemVariants}>
              <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                About Us
              </h2>
              <Card className="shadow-sm border-gray-100">
                <CardBody className="p-6">
                  <p className="text-secondary leading-relaxed">
                    {company.description}
                  </p>
                </CardBody>
              </Card>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                Awards & Recognition
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {awards.map((award, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-4 bg-yellow-50/50 rounded-xl border border-yellow-400/50"
                  >
                    <Award className="text-yellow-600" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 leading-tight">
                        {award.title}
                      </p>
                      <p className="text-xs text-yellow-700">{award.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          </div>

          <div className="space-y-6">
            <motion.section variants={itemVariants}>
              <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                <Briefcase className="text-accent" size={20} /> Open Positions (
                {companyJobs.length})
              </h2>
              <div className="space-y-4">
                {companyJobs.length > 0 ? (
                  companyJobs.map((job) => (
                    <div
                      key={job.id}
                      className="group flex flex-col p-5 bg-white border border-gray-100 rounded-xl hover:border-primary/20 hover:shadow-md transition-all duration-300"
                    >
                      <div className="mb-3">
                        <h3 className="font-semibold text-primary group-hover:text-accent transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-xs text-secondary mt-1 flex items-center gap-2">
                          <span>{job.type}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full" />
                          <span>{job.location}</span>
                        </p>
                      </div>
                      <Button
                        to={`/lowongan/${job.id}`}
                        size="sm"
                        className="w-full mt-auto text-xs h-8 bg-[#0f2854] hover:bg-[#183a6d] text-white font-semibold rounded border-none shadow-sm transition-colors focus:ring-2 focus:ring-accent/30"
                      >
                        View Details
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-400 italic text-sm">
                      No active openings.
                    </p>
                  </div>
                )}
              </div>
            </motion.section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
