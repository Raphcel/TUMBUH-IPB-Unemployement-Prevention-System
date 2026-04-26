import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { opportunitiesApi } from '../../api/opportunities';
import { applicationsApi } from '../../api/applications';
import { resolveUploadUrl } from '../../api/client';
import {
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  XCircle,
  Users,
  FileDown,
  GraduationCap,
  Mail,
  Building,
  BookOpen,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const STATUS_OPTIONS = [
  { value: 'Applied', label: 'Applied' },
  { value: 'Screening', label: 'Screening' },
  { value: 'Interview', label: 'Interview' },
  { value: 'Accepted', label: 'Accepted' },
  { value: 'Rejected', label: 'Rejected' },
];

const STATUS_COLORS = {
  Applied: 'bg-blue-50 text-blue-700',
  Screening: 'bg-yellow-50 text-yellow-700',
  Interview: 'bg-purple-50 text-purple-700',
  Accepted: 'bg-green-50 text-green-700',
  Rejected: 'bg-red-50 text-red-700',
};

export function KelolaLowongan() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const companyId = user?.company_id;

  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Expand / applicant state
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [applicantsByJob, setApplicantsByJob] = useState({});
  const [loadingApplicants, setLoadingApplicants] = useState({});

  // Bulk selection
  const [selectedApps, setSelectedApps] = useState(new Set());
  const [bulkStatus, setBulkStatus] = useState('');
  const [exceptNames, setExceptNames] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const exceptInputRef = useRef(null);

  // Modals
  const [selectedApp, setSelectedApp] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // ── Fetch jobs ──────────────────────────────────────────
  useEffect(() => {
    if (!companyId) { setLoading(false); return; }
    opportunitiesApi.listByCompany(companyId)
      .then((data) => setMyJobs(Array.isArray(data) ? data : data.items || []))
      .catch(() => addToast({ type: 'error', title: 'Error', message: 'Gagal memuat lowongan.' }))
      .finally(() => setLoading(false));
  }, [companyId]);

  // ── Fetch applicants for a job ──────────────────────────
  const fetchApplicants = async (jobId) => {
    if (applicantsByJob[jobId]) return;
    setLoadingApplicants((p) => ({ ...p, [jobId]: true }));
    try {
      const data = await applicationsApi.listByOpportunity(jobId);
      const apps = (data.items || []).map((app) => ({
        ...app,
        applicantName: app.student
          ? `${app.student.first_name} ${app.student.last_name}`
          : `Student #${app.student_id}`,
      }));
      setApplicantsByJob((p) => ({ ...p, [jobId]: apps }));
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Gagal memuat pelamar.' });
    } finally {
      setLoadingApplicants((p) => ({ ...p, [jobId]: false }));
    }
  };

  // ── Toggle expand ───────────────────────────────────────
  const toggleExpand = (jobId) => {
    if (expandedJobId === jobId) {
      setExpandedJobId(null);
      setSelectedApps(new Set());
      setExceptNames('');
      setBulkStatus('');
    } else {
      setExpandedJobId(jobId);
      setSelectedApps(new Set());
      setExceptNames('');
      setBulkStatus('');
      fetchApplicants(jobId);
    }
  };

  // ── Close opportunity ──────────────────────────────────
  const handleClose = async (jobId) => {
    try {
      await opportunitiesApi.update(jobId, { is_active: false });
      setMyJobs(myJobs.map((j) => (j.id === jobId ? { ...j, is_active: false } : j)));
      addToast({ type: 'success', title: 'Berhasil', message: 'Lowongan ditutup.' });
    } catch {
      addToast({ type: 'error', title: 'Gagal', message: 'Gagal menutup lowongan.' });
    }
  };

  // ── Delete opportunity ─────────────────────────────────
  const handleDelete = async (jobId) => {
    try {
      await opportunitiesApi.delete(jobId);
      setMyJobs(myJobs.filter((j) => j.id !== jobId));
      if (expandedJobId === jobId) setExpandedJobId(null);
      addToast({ type: 'success', title: 'Berhasil', message: 'Lowongan berhasil dihapus.' });
    } catch {
      addToast({ type: 'error', title: 'Gagal', message: 'Gagal menghapus lowongan.' });
    }
    setDeleteConfirmId(null);
  };

  // ── Individual status update ───────────────────────────
  const handleStatusChange = async (appId, newStatus) => {
    try {
      await applicationsApi.updateStatus(appId, newStatus);
      setApplicantsByJob((prev) => ({
        ...prev,
        [expandedJobId]: prev[expandedJobId].map((a) =>
          a.id === appId ? { ...a, status: newStatus } : a
        ),
      }));
    } catch {
      addToast({ type: 'error', title: 'Gagal', message: 'Gagal mengubah status.' });
    }
  };

  // ── Bulk selection helpers ─────────────────────────────
  const currentApplicants = applicantsByJob[expandedJobId] || [];

  const handleSelectAll = () => {
    const exceptionList = exceptNames
      .split(',')
      .map((n) => n.trim().toLowerCase())
      .filter(Boolean);
    const ids = currentApplicants
      .filter((a) => !exceptionList.includes(a.applicantName.toLowerCase()))
      .map((a) => a.id);
    setSelectedApps(new Set(ids));
  };

  const toggleAppSelection = (appId) => {
    setSelectedApps((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) next.delete(appId);
      else next.add(appId);
      return next;
    });
  };

  const handleBulkUpdate = async () => {
    if (selectedApps.size === 0 || !bulkStatus) return;
    try {
      await applicationsApi.bulkUpdateStatus([...selectedApps], bulkStatus);
      setApplicantsByJob((prev) => ({
        ...prev,
        [expandedJobId]: prev[expandedJobId].map((a) =>
          selectedApps.has(a.id) ? { ...a, status: bulkStatus } : a
        ),
      }));
      addToast({ type: 'success', title: 'Berhasil', message: `${selectedApps.size} pelamar diperbarui.` });
      setSelectedApps(new Set());
      setBulkStatus('');
    } catch {
      addToast({ type: 'error', title: 'Gagal', message: 'Bulk update gagal.' });
    }
  };

  // ── Autocomplete for exception names ───────────────────
  const currentFragment = exceptNames.split(',').pop().trim().toLowerCase();
  const autocompleteSuggestions = currentFragment
    ? currentApplicants
        .filter((a) => a.applicantName.toLowerCase().includes(currentFragment))
        .slice(0, 5)
    : [];

  const selectSuggestion = (name) => {
    const parts = exceptNames.split(',');
    parts[parts.length - 1] = ` ${name}`;
    setExceptNames(parts.join(','));
    setShowAutocomplete(false);
    exceptInputRef.current?.focus();
  };

  // ── Loading state ──────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Lowongan</h1>
        <Button variant="primary" className="text-white flex items-center gap-2" onClick={() => navigate('/hr/lowongan/baru')}>
          <Plus size={16} /> Buat Lowongan Baru
        </Button>
      </div>

      {/* Opportunities table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 w-8"></th>
                <th className="px-6 py-3">Posisi</th>
                <th className="px-6 py-3">Tipe</th>
                <th className="px-6 py-3">Lokasi</th>
                <th className="px-6 py-3">Pelamar</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {myJobs.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">Belum ada lowongan. Buat lowongan baru untuk mulai.</td></tr>
              )}
              {myJobs.map((job) => (
                <React.Fragment key={job.id}>
                  {/* Opportunity row */}
                  <tr
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${expandedJobId === job.id ? 'bg-blue-50/40' : 'bg-white'}`}
                    onClick={() => toggleExpand(job.id)}
                  >
                    <td className="px-4 py-4">
                      <ChevronDown
                        size={16}
                        className={`text-gray-400 transition-transform duration-200 ${expandedJobId === job.id ? 'rotate-180' : ''}`}
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {job.title}
                    </td>
                    <td className="px-6 py-4">{job.type}</td>
                    <td className="px-6 py-4">{job.location}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1">
                        <Users size={14} className="text-gray-400" />
                        {job.applicants_count ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={job.is_active ? 'success' : 'error'}>
                        {job.is_active ? 'Aktif' : 'Ditutup'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => navigate(`/hr/opportunities/${job.id}/edit`)} className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium">
                        <Pencil size={14} /> Edit
                      </button>
                      <button onClick={() => setDeleteConfirmId(job.id)} className="inline-flex items-center gap-1 text-red-600 hover:underline font-medium">
                        <Trash2 size={14} /> Hapus
                      </button>
                      {job.is_active && (
                        <button onClick={() => handleClose(job.id)} className="inline-flex items-center gap-1 text-orange-600 hover:underline font-medium">
                          <XCircle size={14} /> Tutup
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* Expanded applicant panel */}
                  <AnimatePresence>
                    {expandedJobId === job.id && (
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <td colSpan={7} className="p-0 bg-gray-50/60">
                          <ApplicantPanel
                            applicants={currentApplicants}
                            loading={loadingApplicants[job.id]}
                            selectedApps={selectedApps}
                            toggleAppSelection={toggleAppSelection}
                            handleSelectAll={handleSelectAll}
                            exceptNames={exceptNames}
                            setExceptNames={setExceptNames}
                            showAutocomplete={showAutocomplete}
                            setShowAutocomplete={setShowAutocomplete}
                            autocompleteSuggestions={autocompleteSuggestions}
                            selectSuggestion={selectSuggestion}
                            exceptInputRef={exceptInputRef}
                            bulkStatus={bulkStatus}
                            setBulkStatus={setBulkStatus}
                            handleBulkUpdate={handleBulkUpdate}
                            handleStatusChange={handleStatusChange}
                            onViewDetail={setSelectedApp}
                          />
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Konfirmasi Hapus"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>Batal</Button>
            <Button className="bg-red-600 text-white hover:bg-red-700" onClick={() => handleDelete(deleteConfirmId)}>Hapus</Button>
          </>
        }
      >
        <p className="text-gray-600">Apakah Anda yakin ingin menghapus lowongan ini? Semua data pelamar terkait juga akan dihapus. Tindakan ini tidak dapat dibatalkan.</p>
      </Modal>

      {/* Applicant detail modal */}
      <ApplicantDetailModal
        app={selectedApp}
        onClose={() => setSelectedApp(null)}
        onStatusChange={(appId, newStatus) => {
          handleStatusChange(appId, newStatus);
          setSelectedApp((prev) => prev ? { ...prev, status: newStatus } : null);
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Applicant Panel (shown in expanded row)
// ═══════════════════════════════════════════════════════════
function ApplicantPanel({
  applicants,
  loading,
  selectedApps,
  toggleAppSelection,
  handleSelectAll,
  exceptNames,
  setExceptNames,
  showAutocomplete,
  setShowAutocomplete,
  autocompleteSuggestions,
  selectSuggestion,
  exceptInputRef,
  bulkStatus,
  setBulkStatus,
  handleBulkUpdate,
  handleStatusChange,
  onViewDetail,
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  if (applicants.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Users size={32} className="mx-auto mb-2 opacity-30" />
        <p>Belum ada pelamar untuk lowongan ini.</p>
      </div>
    );
  }

  const allSelected = applicants.length > 0 && applicants.every((a) => selectedApps.has(a.id));

  return (
    <div className="p-4 space-y-3">
      {/* Bulk action bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white rounded-lg border border-gray-200 p-3">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer whitespace-nowrap">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={() => {
              if (allSelected) setSelectedApps(new Set());
              else handleSelectAll();
            }}
            className="rounded border-gray-300"
          />
          Pilih Semua
        </label>

        {/* Exception names input with autocomplete */}
        <div className="relative flex-1 min-w-[200px]">
          <input
            ref={exceptInputRef}
            type="text"
            placeholder="Kecualikan nama (pisahkan koma)..."
            value={exceptNames}
            onChange={(e) => {
              setExceptNames(e.target.value);
              setShowAutocomplete(true);
            }}
            onFocus={() => setShowAutocomplete(true)}
            onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
            className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          {showAutocomplete && autocompleteSuggestions.length > 0 && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
              {autocompleteSuggestions.map((a) => (
                <button
                  key={a.id}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors"
                  onMouseDown={() => selectSuggestion(a.applicantName)}
                >
                  {a.applicantName}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            options={[{ value: '', label: 'Ubah status...' }, ...STATUS_OPTIONS]}
            className="min-w-[140px]"
          />
          <Button
            variant="primary"
            className="text-white text-sm whitespace-nowrap"
            disabled={selectedApps.size === 0 || !bulkStatus}
            onClick={handleBulkUpdate}
          >
            Terapkan ({selectedApps.size})
          </Button>
        </div>
      </div>

      {/* Applicants sub-table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-2 w-10"></th>
              <th className="px-4 py-2 text-left">Nama Pelamar</th>
              <th className="px-4 py-2 text-left">Tanggal Melamar</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map((app) => (
              <tr key={app.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedApps.has(app.id)}
                    onChange={() => toggleAppSelection(app.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-4 py-3">
                  <button
                    className="font-medium text-primary hover:text-accent hover:underline transition-colors flex items-center gap-2"
                    onClick={() => onViewDetail(app)}
                  >
                    <img
                      src={resolveUploadUrl(app.student?.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.applicantName)}&background=0f2854&color=fff&size=32`}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    {app.applicantName}
                  </button>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(app.applied_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-600'}`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    options={STATUS_OPTIONS}
                    className="text-xs w-32"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Applicant Detail Modal
// ═══════════════════════════════════════════════════════════
function ApplicantDetailModal({ app, onClose, onStatusChange }) {
  if (!app) return null;
  const student = app.student || {};
  const avatarUrl = resolveUploadUrl(student.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.applicantName || 'U')}&background=0f2854&color=fff`;
  const history = app.history || [];

  return (
    <Modal isOpen={!!app} onClose={onClose} title="Detail Pelamar" size="lg">
      <div className="space-y-6">
        {/* Profile header */}
        <div className="flex items-center gap-4">
          <img src={avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-100" />
          <div>
            <h3 className="text-lg font-bold text-gray-900">{app.applicantName}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-1"><Mail size={14} /> {student.email || '-'}</p>
          </div>
          <div className="ml-auto">
            <span className={`text-sm font-medium px-3 py-1.5 rounded-full ${STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-600'}`}>
              {app.status}
            </span>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-4">
          <InfoItem icon={<Building size={14} />} label="Universitas" value={student.university || '-'} />
          <InfoItem icon={<BookOpen size={14} />} label="Jurusan" value={student.major || '-'} />
          <InfoItem icon={<GraduationCap size={14} />} label="IPK" value={student.gpa ? String(student.gpa) : '-'} />
          <InfoItem icon={<Users size={14} />} label="NIM" value={student.nim || '-'} />
        </div>

        {/* Bio */}
        {student.bio && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Bio</p>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{student.bio}</p>
          </div>
        )}

        {/* Cover Letter */}
        {app.cover_letter && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Cover Letter</p>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">{app.cover_letter}</p>
          </div>
        )}

        {/* CV download */}
        {student.cv_url && (
          <a
            href={resolveUploadUrl(student.cv_url)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-accent transition-colors bg-blue-50 rounded-lg px-4 py-2"
          >
            <FileDown size={16} /> Download CV
          </a>
        )}

        {/* Status history */}
        {history.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Riwayat Status</p>
            <div className="space-y-2">
              {history.map((h, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full ${h.status === 'Rejected' ? 'bg-red-400' : h.status === 'Accepted' ? 'bg-green-400' : 'bg-blue-400'}`} />
                  <span className="font-medium text-gray-700">{h.status}</span>
                  <span className="text-gray-400">{new Date(h.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status changer */}
        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <span className="text-sm font-medium text-gray-600">Ubah Status:</span>
          <Select
            value={app.status}
            onChange={(e) => onStatusChange(app.id, e.target.value)}
            options={STATUS_OPTIONS}
            className="w-40"
          />
        </div>
      </div>
    </Modal>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-gray-400 mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
}
