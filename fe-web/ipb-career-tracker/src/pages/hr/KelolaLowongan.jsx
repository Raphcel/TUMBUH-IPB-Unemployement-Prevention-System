import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { opportunitiesApi } from '../../api/opportunities';

import { motion } from 'framer-motion';

export function KelolaLowongan() {
  const { user } = useAuth();
  const companyId = user?.company_id;
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    async function fetchJobs() {
      try {
        const data = await opportunitiesApi.listByCompany(companyId);
        setMyJobs(Array.isArray(data) ? data : data.items || []);
      } catch (err) {
        console.error('Failed to load jobs', err);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, [companyId]);

  const handleClose = async (jobId) => {
    try {
      await opportunitiesApi.update(jobId, { is_active: false });
      setMyJobs(
        myJobs.map((j) => (j.id === jobId ? { ...j, is_active: false } : j))
      );
    } catch (err) {
      console.error('Failed to close job', err);
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
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Lowongan</h1>
        <Button
          variant="primary"
          className="text-white"
          onClick={() => navigate('/hr/lowongan/baru')}
        >+ Buat Lowongan Baru</Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">Posisi</th>
                  <th className="px-6 py-3">Tipe</th>
                  <th className="px-6 py-3">Lokasi</th>
                  <th className="px-6 py-3">Pelamar</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {myJobs.map((job) => (
                  <motion.tr
                    key={job.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    layout
                    className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {job.title}
                    </td>
                    <td className="px-6 py-4">{job.type}</td>
                    <td className="px-6 py-4">{job.location}</td>
                    <td className="px-6 py-4">{job.applicants_count}</td>
                    <td className="px-6 py-4">
                      <Badge variant={job.is_active ? 'success' : 'error'}>
                        {job.is_active ? 'Active' : 'Closed'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button className="font-medium text-blue-600 hover:underline">
                        Edit
                      </button>
                      {job.is_active && (
                        <button
                          onClick={() => handleClose(job.id)}
                          className="font-medium text-red-600 hover:underline"
                        >
                          Tutup
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
