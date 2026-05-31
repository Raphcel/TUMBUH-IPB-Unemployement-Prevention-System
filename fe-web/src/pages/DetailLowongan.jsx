import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { opportunitiesApi } from '../api/opportunities';
import { applicationsApi } from '../api/applications';
import { bookmarksApi } from '../api/bookmarks';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, MapPin, Bookmark, Briefcase, Building2, Clock, Tag, Lock, CheckCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../context/LanguageContext';

const TAB_KEYS = ['desc', 'qualif', 'benefits', 'company'];

export function DetailLowongan({ jobId, isEmbedded }) {
  const { id: paramId } = useParams();
  const id = jobId || paramId;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { t, lang } = useTranslation();

  const [activeTab, setActiveTab] = useState('desc');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);

  useEffect(() => {
    opportunitiesApi
      .get(id)
      .then((data) => setJob(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setBookmarked(false);
    if (!user || user.role !== 'student' || !id) return;

    bookmarksApi
      .check(id)
      .then((data) => {
        setBookmarked(Boolean(data?.bookmarked ?? data?.is_bookmarked ?? data?.exists));
      })
      .catch(() => {});
  }, [id, user]);

  useEffect(() => {
    setApplied(false);
    if (!user || user.role !== 'student' || !id) return;

    applicationsApi
      .mine()
      .then((data) => {
        const exists = (data.items || []).some((app) => Number(app.opportunity_id) === Number(id));
        setApplied(exists);
      })
      .catch(() => {});
  }, [id, user]);

  const handleApply = () => {
    const applyPath = `/student/applications/apply/${id}`;
    if (!user) {
      navigate('/login', { state: { from: { pathname: applyPath, search: '' } } });
      return;
    }
    navigate(applyPath);
  };

  const handleToggleBookmark = async () => {
    if (!user) { setShowAuthModal(true); return; }
    if (user.role !== 'student') {
      addToast({
        title: lang === 'id' ? 'Khusus mahasiswa' : 'Student only',
        message: lang === 'id' ? 'Hanya akun mahasiswa yang bisa menyimpan lowongan.' : 'Only student accounts can save opportunities.',
        type: 'warning',
      });
      return;
    }

    setBookmarking(true);
    try {
      if (bookmarked) {
        await bookmarksApi.remove(job.id);
        setBookmarked(false);
        window.dispatchEvent(new CustomEvent('opportunity-bookmark-change', {
          detail: { opportunityId: job.id, bookmarked: false },
        }));
        addToast({
          title: lang === 'id' ? 'Dihapus' : 'Removed',
          message: lang === 'id' ? 'Lowongan dihapus dari simpanan.' : 'Opportunity removed from saved list.',
          type: 'success',
        });
      } else {
        await bookmarksApi.add(job.id);
        setBookmarked(true);
        window.dispatchEvent(new CustomEvent('opportunity-bookmark-change', {
          detail: { opportunityId: job.id, bookmarked: true },
        }));
        addToast({
          title: lang === 'id' ? 'Tersimpan' : 'Saved',
          message: lang === 'id' ? 'Lowongan berhasil disimpan.' : 'Opportunity saved.',
          type: 'success',
        });
      }
    } catch (err) {
      addToast({
        title: 'Error',
        message: err.message || (lang === 'id' ? 'Gagal memperbarui simpanan.' : 'Failed to update bookmark.'),
        type: 'error',
      });
    } finally {
      setBookmarking(false);
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
    return <div className="py-20 text-center text-gray-500">{t('det_not_found')}</div>;
  }

  const company = job.company || {};
  const requirements = Array.isArray(job.requirements) ? job.requirements : [];
  const benefits = Array.isArray(job.benefits) ? job.benefits : [];
  const deadlineStr = job.deadline
    ? new Date(job.deadline).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : '-';

  return (
    <div className={isEmbedded ? "h-full bg-[#fcfcfd]" : "min-h-screen bg-surface-muted pb-20"}>
      {/* ── Auth Modal ── */}
      <Modal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} title={t('det_login_to_apply')} size="sm">
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

      {/* ── Main Content ── */}
      <main className={isEmbedded ? "h-full w-full overflow-y-auto p-5 xl:p-6" : "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"}>
        {/* Back navigation */}
        {!isEmbedded && (
        <Link
          to="/lowongan"
          className="inline-flex items-center text-sm text-gray-500 hover:text-brand transition-colors mb-6 group"
        >
          <ArrowLeft className="mr-2 text-lg group-hover:-translate-x-1 transition-transform" size={16} />
          {t('det_back')}
        </Link>
        )}

        {/* Job header card */}
        <section className="mb-6 rounded-2xl border border-surface-border bg-white p-5 shadow-sm xl:p-6">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            {/* Company logo */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-surface-border bg-white p-2 shadow-sm xl:h-20 xl:w-20">
              {company.logo
                ? <img alt={company.name} className="w-full h-auto object-contain" src={company.logo} />
                : <span className="text-2xl font-bold text-gray-400">{company.name?.[0]}</span>
              }
            </div>

            <div className="flex-1 w-full">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="mb-1 text-xl font-bold text-text xl:text-2xl">{job.title}</h1>
                  <p className="mb-3 text-base text-text-muted xl:text-lg">{company.name}</p>
                </div>
              </div>

              <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-muted">
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

              <div className="flex flex-col justify-between gap-4 border-t border-surface-border pt-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {job.created_at && (
                    <span>{t('det_posted')} {Math.round((Date.now() - new Date(job.created_at)) / 86400000)}d</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleToggleBookmark}
                    disabled={bookmarking}
                    aria-label="Simpan lowongan"
                    className={`hidden h-9 w-9 items-center justify-center rounded-lg border transition-colors disabled:opacity-60 sm:flex ${
                      bookmarked
                        ? 'border-brand/20 bg-brand/10 text-brand'
                        : 'border-surface-border text-text-muted hover:border-brand hover:text-brand'
                    }`}
                  >
                    <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
                  </button>
                  {user?.role !== 'hr' && (
                    applied ? (
                      <div className="flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white">
                        <CheckCircle size={16} /> {t('det_applied')}
                      </div>
                    ) : (
                      <button
                        onClick={handleApply}
                        className="h-10 rounded-lg bg-brand px-5 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
                      >
                        {t('det_apply')}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <nav className="mb-6 overflow-x-auto rounded-2xl border border-surface-border bg-white px-4 shadow-sm">
          <ul className="flex whitespace-nowrap min-w-full">
            {TAB_KEYS.map((tabKey) => {
              const tabLabel = t(`det_tab_${tabKey}`);
              return (
              <li key={tabKey} className="mr-6">
                <button
                  onClick={() => setActiveTab(tabKey)}
                  className={`inline-block py-4 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === tabKey
                      ? 'text-brand border-brand font-semibold'
                      : 'text-gray-500 border-transparent hover:text-gray-800'
                  }`}
                >
                  {tabLabel}
                </button>
              </li>
              );
            })}
          </ul>
        </nav>

        {/* Content area */}
        <div className={`grid grid-cols-1 ${isEmbedded ? '' : 'lg:grid-cols-3'} gap-6 pb-8`}>
          {/* Left: main content */}
          <div className={`${isEmbedded ? '' : 'lg:col-span-2'} space-y-6`}>
            {(activeTab === 'desc' || activeTab === 'qualif' || activeTab === 'benefits') && (
              <>
                {activeTab === 'desc' && (
                  <section className="rounded-2xl border border-surface-border bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-text">{t('det_desc')}</h2>
                    <div className="whitespace-pre-line text-sm leading-7 text-text-muted">{job.description}</div>
                  </section>
                )}

                {activeTab === 'qualif' && (
                  <section className="rounded-2xl border border-surface-border bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-text">{t('det_qualifications')}</h2>
                    {requirements.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-2 text-gray-600">
                        {requirements.map((req, idx) => <li key={idx}>{req}</li>)}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic text-sm">{t('det_no_qualifications')}</p>
                    )}
                  </section>
                )}

                {activeTab === 'benefits' && (
                  <section className="rounded-2xl border border-surface-border bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-text">{t('det_benefits')}</h2>
                    {benefits.length > 0 ? (
                      <div className="flex flex-wrap gap-2.5">
                        {benefits.map((b, idx) => (
                          <span key={idx} className="inline-flex items-center px-4 py-2 rounded-full border border-gray-200 bg-white text-sm text-gray-600 font-medium">
                            {b}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic text-sm">{t('det_no_benefits')}</p>
                    )}
                  </section>
                )}
              </>
            )}

            {activeTab === 'company' && (
              <section className="rounded-2xl border border-surface-border bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-text">{t('det_about_company')}: {company.name}</h2>
                <p className="leading-7 text-text-muted">{company.description}</p>
                <Link
                  to={`/perusahaan/${company.id}`}
                  className="inline-flex items-center text-sm font-semibold text-brand hover:text-brand-dark mt-4 group transition-colors"
                >
                  {t('det_view_profile')} <ArrowLeft className="ml-1 rotate-180 group-hover:translate-x-1 transition-transform" size={14} />
                </Link>
              </section>
            )}
          </div>

          {/* Right: sidebar */}
          <div className="space-y-6">
            {/* Job info card */}
            <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h3 className="text-base font-bold text-gray-900">{t('det_overview')}</h3>
                <button
                  type="button"
                  onClick={handleToggleBookmark}
                  disabled={bookmarking}
                  aria-label={lang === 'id' ? 'Simpan lowongan' : 'Save opportunity'}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors disabled:opacity-60 ${
                    bookmarked
                      ? 'border-brand/20 bg-brand/10 text-brand'
                      : 'border-surface-border text-text-muted hover:border-brand hover:text-brand'
                  }`}
                >
                  <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
                </button>
              </div>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <Briefcase className="text-gray-400 shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">{t('det_type')}</p>
                    <p className="text-sm font-medium text-gray-900">{job.type}</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <MapPin className="text-gray-400 shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">{t('det_location')}</p>
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
                      <p className="text-xs text-gray-500 mb-0.5">{t('det_salary')}</p>
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
            <div className="rounded-2xl border border-surface-border bg-white p-5 shadow-sm">
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
                {t('det_view_profile')}
                <ArrowLeft className="ml-1 rotate-180 group-hover:translate-x-1 transition-transform" size={14} />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
