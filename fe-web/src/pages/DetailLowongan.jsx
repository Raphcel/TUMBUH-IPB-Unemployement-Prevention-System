import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { opportunitiesApi } from '../api/opportunities';
import { applicationsApi } from '../api/applications';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, MapPin, Bookmark, Briefcase, Building2, Clock, Tag, Lock, CheckCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { resolveUploadUrl } from '../api/client';

const TABS = ['Deskripsi', 'Kualifikasi', 'Keuntungan', 'Tentang Perusahaan'];

export function DetailLowongan() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('Deskripsi');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applyStep, setApplyStep] = useState(1);

  useEffect(() => {
    opportunitiesApi
      .get(id)
      .then((data) => setJob(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = () => {
    if (!user) { setShowAuthModal(true); return; }
    setApplyStep(1);
    setShowApplyModal(true);
  };

  const handleSubmitApplication = async () => {
    setApplying(true);
    try {
      await applicationsApi.apply(job.id, { cover_letter: coverLetter || null });
      setApplied(true);
      setShowApplyModal(false);
      addToast({ title: 'Lamaran Terkirim!', message: `Berhasil melamar di ${job.title}.`, type: 'success' });
    } catch (err) {
      addToast({ title: 'Lamaran Gagal', message: err.message || 'Terjadi kesalahan.', type: 'error' });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
      </div>
    );
  }

  if (!job) {
    return <div className="py-20 text-center text-gray-500">Lowongan tidak ditemukan.</div>;
  }

  const company = job.company || {};
  const requirements = Array.isArray(job.requirements) ? job.requirements : [];
  const benefits = Array.isArray(job.benefits) ? job.benefits : [];
  const deadlineStr = job.deadline
    ? new Date(job.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '-';

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* ── Auth Modal ── */}
      <Modal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} title="Login Diperlukan" size="sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-brand" size={24} />
          </div>
          <p className="text-gray-500 mt-2">Kamu perlu login untuk melamar posisi ini.</p>
        </div>
        <div className="space-y-3">
          <Button to="/login" variant="primary" className="w-full justify-center">Masuk</Button>
          <Button to="/register" variant="outline" className="w-full justify-center">Buat Akun</Button>
        </div>
      </Modal>

      {/* ── Apply Modal ── */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => { setShowApplyModal(false); setApplyStep(1); }}
        title="Lamar Pekerjaan"
        size="md"
      >
        {/* Stepper */}
        <div className="flex items-center justify-center gap-6 mb-6">
          {[{ n: 1, label: 'Data Diri' }, { n: 2, label: 'Dokumen' }, { n: 3, label: 'Review' }].map(({ n, label }) => (
            <div key={n} className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
                applyStep === n
                  ? 'bg-brand border-brand text-white'
                  : applyStep > n
                    ? 'bg-brand/20 border-brand text-brand'
                    : 'bg-white border-gray-300 text-gray-400'
              }`}>
                {n}
              </div>
              <span className={`text-xs font-medium ${applyStep === n ? 'text-brand' : 'text-gray-400'}`}>{label}</span>
            </div>
          ))}
        </div>

        {/* Job summary */}
        <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
          <div className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center bg-white shrink-0">
            {company.logo
              ? <img src={company.logo} alt={company.name} className="w-full h-full object-contain p-1" />
              : <span className="font-bold text-gray-400 text-sm">{company.name?.[0]}</span>
            }
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{job.title}</p>
            <p className="text-xs text-gray-500">{company.name}</p>
          </div>
        </div>

        {applyStep === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Surat Lamaran (opsional)</p>
            <textarea
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand min-h-[120px] resize-y"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Tulis surat lamaran Anda..."
            />
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500">
                {user?.cv_url ? (
                  <>CV Anda: <a href={resolveUploadUrl(user.cv_url)} target="_blank" rel="noreferrer" className="text-brand font-medium hover:underline">Lihat CV</a></>
                ) : (
                  <>Belum ada CV. <Link to="/student/profile" className="text-brand font-medium hover:underline">Upload di halaman profil</Link>.</>
                )}
              </p>
            </div>
          </div>
        )}

        {applyStep === 2 && (
          <div className="py-4 text-center text-gray-500 text-sm">
            Periksa kembali dokumen-dokumen Anda sebelum mengirimkan lamaran.
          </div>
        )}

        {applyStep === 3 && (
          <div className="py-4 space-y-3">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700">Posisi: <span className="text-gray-900">{job.title}</span></p>
              <p className="text-sm font-medium text-gray-700 mt-1">Perusahaan: <span className="text-gray-900">{company.name}</span></p>
            </div>
            <p className="text-xs text-gray-400 text-center">Dengan menekan Kirim, kamu menyetujui syarat dan ketentuan Tumbuh.</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
          <button
            onClick={() => applyStep > 1 ? setApplyStep(applyStep - 1) : setShowApplyModal(false)}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {applyStep > 1 ? 'Kembali' : 'Batal'}
          </button>
          {applyStep < 3 ? (
            <button
              onClick={() => setApplyStep(applyStep + 1)}
              className="px-6 py-2 bg-brand hover:bg-brand-dark text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Lanjutkan
            </button>
          ) : (
            <button
              onClick={handleSubmitApplication}
              disabled={applying}
              className="px-6 py-2 bg-brand hover:bg-brand-dark text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
            >
              {applying ? 'Mengirim...' : 'Kirim Lamaran'}
            </button>
          )}
        </div>
      </Modal>

      {/* ── Main Content ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back navigation */}
        <Link
          to="/lowongan"
          className="inline-flex items-center text-sm text-gray-500 hover:text-brand transition-colors mb-6 group"
        >
          <ArrowLeft className="mr-2 text-lg group-hover:-translate-x-1 transition-transform" size={16} />
          Kembali ke hasil pencarian
        </Link>

        {/* Job header card */}
        <section className="bg-white rounded-xl mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Company logo */}
            <div className="w-20 h-20 rounded-xl border border-gray-200 flex items-center justify-center p-2 bg-white shrink-0 shadow-sm">
              {company.logo
                ? <img alt={company.name} className="w-full h-auto object-contain" src={company.logo} />
                : <span className="text-2xl font-bold text-gray-400">{company.name?.[0]}</span>
              }
            </div>

            <div className="flex-1 w-full">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h1>
                  <p className="text-lg text-gray-600 mb-3">{company.name}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-5">
                <div className="flex items-center gap-1.5">
                  <MapPin className="text-gray-400" size={16} />
                  <span>{job.location}</span>
                </div>
                {job.work_mode && (
                  <><div className="w-1 h-1 rounded-full bg-gray-300" /><span>{job.work_mode}</span></>
                )}
                <div className="w-1 h-1 rounded-full bg-gray-300" />
                <span>{job.type}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {job.created_at && (
                    <span>Diposting {Math.round((Date.now() - new Date(job.created_at)) / 86400000)} hari yang lalu</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    aria-label="Simpan lowongan"
                    className="hidden sm:flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 text-gray-500 hover:text-brand hover:border-brand transition-colors"
                  >
                    <Bookmark size={18} />
                  </button>
                  {user?.role !== 'hr' && (
                    applied ? (
                      <div className="flex items-center gap-2 text-white bg-brand px-4 py-2 rounded-lg font-semibold text-sm">
                        <CheckCircle size={16} /> Sudah Dilamar
                      </div>
                    ) : (
                      <button
                        onClick={handleApply}
                        disabled={applying}
                        className="bg-brand hover:bg-brand-dark text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
                      >
                        Lamar Sekarang
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <nav className="border-b border-gray-200 mb-8 overflow-x-auto">
          <ul className="flex whitespace-nowrap min-w-full">
            {TABS.map((tab) => (
              <li key={tab} className="mr-8">
                <button
                  onClick={() => setActiveTab(tab)}
                  className={`inline-block py-4 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === tab
                      ? 'text-brand border-brand font-semibold'
                      : 'text-gray-500 border-transparent hover:text-gray-800'
                  }`}
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
          {/* Left: main content */}
          <div className="lg:col-span-2 space-y-10">
            {(activeTab === 'Deskripsi' || activeTab === 'Kualifikasi' || activeTab === 'Keuntungan') && (
              <>
                {activeTab === 'Deskripsi' && (
                  <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Deskripsi Pekerjaan</h2>
                    <div className="text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</div>
                  </section>
                )}

                {activeTab === 'Kualifikasi' && (
                  <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Kualifikasi</h2>
                    {requirements.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-2 text-gray-600">
                        {requirements.map((req, idx) => <li key={idx}>{req}</li>)}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic text-sm">Tidak ada kualifikasi yang dicantumkan.</p>
                    )}
                  </section>
                )}

                {activeTab === 'Keuntungan' && (
                  <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Keuntungan</h2>
                    {benefits.length > 0 ? (
                      <div className="flex flex-wrap gap-2.5">
                        {benefits.map((b, idx) => (
                          <span key={idx} className="inline-flex items-center px-4 py-2 rounded-full border border-gray-200 bg-white text-sm text-gray-600 font-medium">
                            {b}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic text-sm">Tidak ada keuntungan yang dicantumkan.</p>
                    )}
                  </section>
                )}
              </>
            )}

            {activeTab === 'Tentang Perusahaan' && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Tentang {company.name}</h2>
                <p className="text-gray-600 leading-relaxed">{company.description}</p>
                <Link
                  to={`/perusahaan/${company.id}`}
                  className="inline-flex items-center text-sm font-semibold text-brand hover:text-brand-dark mt-4 group transition-colors"
                >
                  Lihat Profil Perusahaan <ArrowLeft className="ml-1 rotate-180 group-hover:translate-x-1 transition-transform" size={14} />
                </Link>
              </section>
            )}
          </div>

          {/* Right: sidebar */}
          <div className="space-y-6">
            {/* Job info card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-5">Informasi Pekerjaan</h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <Briefcase className="text-gray-400 shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Tipe Pekerjaan</p>
                    <p className="text-sm font-medium text-gray-900">{job.type}</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <MapPin className="text-gray-400 shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Lokasi</p>
                    <p className="text-sm font-medium text-gray-900">{job.location}</p>
                  </div>
                </li>
                {job.work_mode && (
                  <li className="flex gap-3">
                    <Building2 className="text-gray-400 shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Model Kerja</p>
                      <p className="text-sm font-medium text-gray-900">{job.work_mode}</p>
                    </div>
                  </li>
                )}
                {job.salary && (
                  <li className="flex gap-3">
                    <Tag className="text-gray-400 shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Gaji</p>
                      <p className="text-sm font-medium text-gray-900">{job.salary}</p>
                    </div>
                  </li>
                )}
                {job.deadline && (
                  <li className="flex gap-3">
                    <Clock className="text-gray-400 shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Deadline</p>
                      <p className="text-sm font-medium text-gray-900">{deadlineStr}</p>
                    </div>
                  </li>
                )}
              </ul>
            </div>

            {/* Company profile card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg border border-gray-100 flex items-center justify-center p-1 bg-white shrink-0">
                  {company.logo
                    ? <img alt={company.name} className="w-full h-auto object-contain" src={company.logo} />
                    : <span className="font-bold text-gray-400">{company.name?.[0]}</span>
                  }
                </div>
                <h3 className="text-base font-bold text-gray-900">{company.name}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-4">{company.description}</p>
              <Link
                to={`/perusahaan/${company.id}`}
                className="inline-flex items-center text-sm font-semibold text-brand hover:text-brand-dark group transition-colors"
              >
                Lihat Profil Perusahaan
                <ArrowLeft className="ml-1 rotate-180 group-hover:translate-x-1 transition-transform" size={14} />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
