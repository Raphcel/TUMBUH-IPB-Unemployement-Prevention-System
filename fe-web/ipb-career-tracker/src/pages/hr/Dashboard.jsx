import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '../../components/ui/Card';
import { Users, Briefcase, FileText, BarChart3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { opportunitiesApi } from '../../api/opportunities';
import { applicationsApi } from '../../api/applications';
import { CalendarWidget } from '../../components/dashboard/CalendarWidget';

import { motion } from 'framer-motion';

export function HRDashboard() {
  const { user } = useAuth();
  const companyId = user?.company_id;
  // ... (keep state)
  const [myJobs, setMyJobs] = useState([]);
  const [totalApplicants, setTotalApplicants] = useState(0);
  const [pendingReview, setPendingReview] = useState(0);
  const [loading, setLoading] = useState(true);

  // ... (keep useEffect)
  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    async function fetchData() {
      // ... (keep logic)
      try {
        const jobsData = await opportunitiesApi.listByCompany(companyId);
        const jobs = Array.isArray(jobsData) ? jobsData : jobsData.items || [];
        setMyJobs(jobs);

        // Fetch applicants for each job
        let total = 0;
        let pending = 0;
        await Promise.all(
          jobs.map(async (job) => {
            try {
              const appsData = await applicationsApi.listByOpportunity(job.id);
              const apps = appsData.items || [];
              total += apps.length;
              pending += apps.filter((a) => a.status === 'Applied').length;
            } catch { }
          })
        );
        setTotalApplicants(total);
        setPendingReview(pending);
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [companyId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Applicants',
      value: totalApplicants,
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Active Jobs',
      value: myJobs.length,
      icon: Briefcase,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      title: 'Pending Review',
      value: pendingReview,
      icon: FileText,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
  ];

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
      className="space-y-8 pb-20"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-semibold text-primary tracking-tight">
          Recruitment Dashboard
        </h1>
        <p className="text-secondary mt-2">Overview of your hiring pipeline.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
          // className inside Card won't accept motion directly unless Card forwards ref/props mostly. 
          // Better to wrap Card or use motion.div if Card is simple.
          // Assuming Card accepts className and style or we wrap it.
          >
            <Card className="border-gray-100 shadow-sm transition-all h-full">
              <CardBody className="flex items-center gap-4 p-6">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon size={24} className={stat.color} />
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-primary mt-1">
                    {stat.value}
                  </p>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <motion.div variants={itemVariants} className="space-y-4">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <BarChart3 size={20} /> Recruitment Stats
            </h2>
            <Card className="h-64 flex flex-col items-center justify-center text-secondary bg-gray-50/50 border-dashed border-2 border-gray-200 rounded-xl">
              <BarChart3 size={48} className="text-gray-300 mb-2" />
              <span className="text-sm font-medium">
                Chart visualization would appear here
              </span>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <Briefcase size={20} /> Recent Jobs
            </h2>
            <div className="space-y-3">
              {myJobs.slice(0, 3).map((job) => (
                <motion.div
                  key={job.id}
                  whileHover={{ scale: 1.01 }}
                  className="group"
                >
                  <Card className="border-gray-100 group-hover:border-primary/30 transition-colors">
                    <CardBody className="p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-primary">{job.title}</h3>
                        <p className="text-xs text-secondary mt-1">
                          {job.location} • {job.type}
                        </p>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-green-50 text-green-700">
                        Active
                      </span>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="space-y-6">
          <CalendarWidget />
        </motion.div>
      </div>
    </motion.div>
  );
}
