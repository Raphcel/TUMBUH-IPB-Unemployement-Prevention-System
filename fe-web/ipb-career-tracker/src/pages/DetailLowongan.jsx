import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { opportunitiesApi } from '../api/opportunities';
import { applicationsApi } from '../api/applications';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Briefcase,
  Lock,
  X,
  CheckCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/ui/Modal';

export function DetailLowongan() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applyError, setApplyError] = useState('');

  useEffect(() => {
    opportunitiesApi
      .get(id)
      .then((data) => setJob(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setApplying(true);
    setApplyError('');
    try {
      await applicationsApi.apply(job.id);
      setApplied(true);
      addToast({
        title: 'Application Sent!',
        message: `You ran successfully applied to ${job.title} at ${job.company?.name || 'the company'}.`,
        type: 'success',
      });
    } catch (err) {
      setApplyError(err.message || 'Failed to apply');
      addToast({
        title: 'Application Failed',
        message: err.message || 'Something went wrong. Please try again.',
        type: 'error',
      });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f2854]" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="py-20 text-center text-secondary">
        Opportunity not found
      </div>
    );
  }

  const company = job.company || {};
  const requirements = Array.isArray(job.requirements) ? job.requirements : [];
  const deadlineStr = job.deadline
    ? new Date(job.deadline).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    : '-';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white min-h-screen pb-20 relative"
    >
      {/* Auth Modal Overlay */}
      <Modal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Authentication Required"
        size="sm"
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-primary" size={24} />
          </div>
          <p className="text-secondary mt-2">
            You need to sign in to apply for this position.
          </p>
        </div>
        <div className="space-y-3">
          <Button to="/login" variant="primary" className="text-white w-full justify-center">
            Log In
          </Button>
          <Button
            to="/register"
            variant="outline"
            className="w-full justify-center"
          >
            Create Account
          </Button>
        </div>
      </Modal>

      <div className="bg-gradient-to-r from-[#0f2854] to-[#1a3a70] pt-24 pb-12 px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Link
            to="/lowongan"
            className="text-white hover:text-white mb-6 inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Opportunities
          </Link>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row gap-6 items-start"
          >
            <div className="w-20 h-20 rounded-xl bg-white p-2 flex items-center justify-center shadow-lg">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-2xl font-bold text-gray-400" href={`/perusahaan/${company.id}`}>
                  {company.name?.[0]}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">
                {job.title}
              </h1>
              <div className="flex items-center gap-4 text-white">
                <span className="font-medium text-white">{company.name}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin size={14} /> {job.location}
                </span>
              </div>
            </div>
            {applied ? (
              <div className="flex items-center gap-2 text-white bg-green-500/80 px-4 py-2 rounded-lg font-semibold">
                <CheckCircle size={18} /> Applied
              </div>
            ) : (
              <Button
                onClick={handleApply}
                disabled={applying}
                variant='secondary'
                className="bg-accent hover:bg-highlight text-primary font-semibold w-full md:w-auto shadow-lg shadow-accent/20 border-none"
              >
                {applying ? 'Applying...' : 'Apply Now'}
              </Button>
            )}
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-2 space-y-6"
          >
            <Card className="shadow-lg border-gray-100/50">
              <CardBody className="p-8">
                <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                  <Briefcase size={20} className="text-accent" /> Job
                  Description
                </h2>
                <p className="text-secondary whitespace-pre-line leading-relaxed">
                  {job.description}
                </p>

                {requirements.length > 0 && (
                  <>
                    <h3 className="text-lg font-bold text-primary mt-8 mb-4">
                      Requirements
                    </h3>
                    <ul className="space-y-3">
                      {requirements.map((req, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 text-secondary"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                          <span className="leading-relaxed">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            <Card className="shadow-lg border-gray-100/50">
              <CardBody className="p-6">
                <h3 className="font-semibold text-primary mb-4 border-b border-gray-100 pb-2">
                  Overview
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-secondary uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Briefcase size={12} /> Job Type
                    </p>
                    <p className="font-medium text-gray-900">{job.type}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-secondary uppercase tracking-wider mb-1 flex items-center gap-1">
                      <DollarSign size={12} /> Salary
                    </p>
                    <p className="font-medium text-gray-900">
                      {job.salary || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-secondary uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Calendar size={12} /> Deadline
                    </p>
                    <p className="font-medium text-gray-900">{deadlineStr}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="shadow-lg border-gray-100/50">
              <CardBody className="p-6">
                <h3 className="font-semibold text-primary mb-4 border-b border-gray-100 pb-2">
                  About Company
                </h3>
                <p className="text-secondary text-sm mb-4 leading-relaxed line-clamp-4">
                  {company.description}
                </p>
                <Link
                  to={`/perusahaan/${company.id}`}
                  className="text-primary text-sm font-medium hover:text-accent transition-colors flex items-center gap-1"
                >
                  View Company Profile &rarr;
                </Link>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
