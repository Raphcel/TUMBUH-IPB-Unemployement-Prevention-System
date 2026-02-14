import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { opportunitiesApi } from '../../api/opportunities';
import { applicationsApi } from '../../api/applications';

import { motion } from 'framer-motion';

export function Pelamar() {
  // ... (keep state and effects)
  const { user } = useAuth();
  const companyId = user?.company_id;
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    async function fetchApplicants() {
      try {
        const jobsData = await opportunitiesApi.listByCompany(companyId);
        const jobs = Array.isArray(jobsData) ? jobsData : jobsData.items || [];

        const allApps = [];
        await Promise.all(
          jobs.map(async (job) => {
            try {
              const appsData = await applicationsApi.listByOpportunity(job.id);
              const apps = appsData.items || [];
              apps.forEach((app) => {
                allApps.push({
                  ...app,
                  jobTitle: job.title,
                  applicantName: app.student
                    ? `${app.student.first_name} ${app.student.last_name}`
                    : `Student #${app.student_id}`,
                });
              });
            } catch { }
          })
        );
        setApplicants(allApps);
      } catch (err) {
        console.error('Failed to load applicants', err);
      } finally {
        setLoading(false);
      }
    }
    fetchApplicants();
  }, [companyId]);

  const handleStatusUpdate = async (appId, newStatus) => {
    try {
      await applicationsApi.updateStatus(appId, newStatus);
      setApplicants(
        applicants.map((a) =>
          a.id === appId ? { ...a, status: newStatus } : a
        )
      );
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
      className="space-y-6"
    >
      <motion.h1 variants={itemVariants} className="text-2xl font-bold text-gray-900">Daftar Pelamar</motion.h1>

      <motion.div variants={itemVariants}>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">Nama Pelamar</th>
                  <th className="px-6 py-3">Posisi Dilamar</th>
                  <th className="px-6 py-3">Tanggal Melamar</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((app) => (
                  <motion.tr
                    key={app.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    layout
                    className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {app.applicantName}
                    </td>
                    <td className="px-6 py-4">{app.jobTitle}</td>
                    <td className="px-6 py-4">
                      {new Date(app.applied_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          app.status === 'Rejected'
                            ? 'error'
                            : app.status === 'Accepted'
                              ? 'success'
                              : 'info'
                        }
                      >
                        {app.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {app.status === 'Applied' && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusUpdate(app.id, 'Screening')
                            }
                            className="font-medium text-emerald-600 hover:underline"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(app.id, 'Rejected')}
                            className="font-medium text-red-600 hover:underline"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {app.status !== 'Applied' && (
                        <span className="text-xs text-gray-400">Reviewed</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
                {applicants.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Belum ada pelamar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
