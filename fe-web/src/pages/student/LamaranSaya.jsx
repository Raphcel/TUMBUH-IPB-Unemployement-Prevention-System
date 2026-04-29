import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { applicationsApi } from '../../api/applications';
import { useTranslation } from '../../context/LanguageContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Search,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Filter,
  X,
  ChevronDown,
} from 'lucide-react';

const STEPS = ['Applied', 'Interview', 'Accepted'];
const STATUS_NORMALIZATION = {
  Screening: 'Applied',
};
const VISIBLE_STATUSES = ['All', 'Applied', 'Interview', 'Accepted', 'Rejected'];
const SORT_OPTIONS = ['newest', 'oldest', 'company', 'title', 'status'];

const STEP_KEY = {
  Applied:   'step_applied',
  Interview: 'step_interview',
  Accepted:  'step_accepted',
  Rejected:  'step_rejected',
};

const STATUS_CONFIG = {
  Applied:   { variant: 'info',    labelKey: 'status_applied'   },
  Interview: { variant: 'info',    labelKey: 'status_interview' },
  Accepted:  { variant: 'success', labelKey: 'status_accepted'  },
  Rejected:  { variant: 'error',   labelKey: 'status_rejected'  },
};

const containerVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden:  { y: 16, opacity: 0 },
  visible: { y: 0,  opacity: 1, transition: { type: 'spring', stiffness: 120, damping: 14 } },
};

function getDisplayStatus(status) {
  return STATUS_NORMALIZATION[status] ?? status;
}

function getDisplayHistory(history = []) {
  return history.reduce((acc, item) => {
    const normalizedStatus = getDisplayStatus(item.status);
    if (!normalizedStatus || acc.some((entry) => entry.status === normalizedStatus)) {
      return acc;
    }
    acc.push({ ...item, status: normalizedStatus });
    return acc;
  }, []);
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      variants={itemVariants}
      className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex-1 min-w-[140px]"
    >
      <div className={`p-2.5 rounded-xl ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-text">{value}</p>
        <p className="text-xs text-text-muted mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

function ApplicationStepper({ app, t }) {
  const history = getDisplayHistory(app.history);
  const displayStatus = getDisplayStatus(app.status);
  const isRejected = displayStatus === 'Rejected';
  const lastKnownStep = history.find((entry) => STEPS.includes(entry.status))?.status ?? 'Applied';
  const stepsToShow = isRejected
    ? [...STEPS.slice(0, STEPS.indexOf(lastKnownStep) + 1), 'Rejected']
    : STEPS;

  const getStepState = (step) => {
    if (isRejected && step === 'Rejected') return 'rejected';
    const inHistory = history.some((entry) => entry.status === step);
    if (inHistory) return displayStatus === step ? 'current' : 'done';
    return 'pending';
  };

  return (
    <div className="flex items-center gap-0 mt-3">
      {stepsToShow.map((step, idx) => {
        const state = getStepState(step);

        return (
          <React.Fragment key={step}>
            {idx > 0 && (
              <div
                className={`flex-1 h-0.5 min-w-[12px] transition-colors duration-300 ${
                  state === 'rejected' ? 'bg-red-300'
                  : state !== 'pending' ? 'bg-brand'
                  : 'bg-gray-200'
                }`}
              />
            )}
            <div className="flex flex-col items-center shrink-0">
              <div
                className={`w-2.5 h-2.5 rounded-full border-2 transition-all duration-300 ${
                  state === 'rejected'
                    ? 'bg-red-500 border-red-500'
                    : state === 'current'
                    ? 'bg-brand border-brand ring-2 ring-brand/20'
                    : state === 'done'
                    ? 'bg-brand border-brand'
                    : 'bg-white border-gray-300'
                }`}
              />
              <span
                className={`text-[9px] mt-1 font-medium whitespace-nowrap transition-colors ${
                  state === 'rejected' ? 'text-red-500'
                  : state !== 'pending' ? 'text-brand'
                  : 'text-gray-400'
                }`}
              >
                {t(STEP_KEY[step])}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function CompanyLogo({ name }) {
  return (
    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand/10 to-brand/5 border border-brand/10 flex items-center justify-center flex-shrink-0">
      <span className="text-sm font-bold text-brand uppercase">{name?.[0] ?? '?'}</span>
    </div>
  );
}

function ApplicationCard({ app, t, locale }) {
  const job = app.opportunity;
  const company = job?.company;
  const displayStatus = getDisplayStatus(app.status);
  const cfg = STATUS_CONFIG[displayStatus] ?? { variant: 'info', labelKey: `status_${displayStatus?.toLowerCase()}` };
  const hasHistory = app.history && app.history.length > 0;
  const dateStr = new Date(app.applied_at).toLocaleDateString(locale, {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <motion.div variants={itemVariants} layout>
      <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-brand/20 transition-all duration-200 p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-3 flex-1 min-w-0">
            <CompanyLogo name={company?.name} />
            <div className="min-w-0 flex-1">
              <Link
                to={`/lowongan/${job?.id}`}
                className="font-semibold text-text text-base leading-tight hover:text-brand transition-colors line-clamp-1"
              >
                {job?.title ?? '—'}
              </Link>
              <p className="text-sm text-text-muted mt-0.5 flex items-center gap-1">
                <Briefcase size={12} />
                {company?.name ?? '—'}
              </p>
              {hasHistory && <ApplicationStepper app={app} t={t} />}
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
            <Badge variant={cfg.variant}>
              {t(cfg.labelKey)}
            </Badge>
            <span className="text-xs text-text-muted whitespace-nowrap">
              {t('lamaran_applied_on')} {dateStr}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function LamaranSaya() {
  const { t, lang } = useTranslation();
  const locale = lang === 'id' ? 'id-ID' : 'en-US';
  const copy = lang === 'id'
    ? {
        sortButton: 'Urutkan',
        sortNewest: 'Tanggal terbaru',
        sortOldest: 'Tanggal terlama',
        sortCompany: 'Nama perusahaan',
        sortTitle: 'Nama posisi',
        sortStatus: 'Status',
      }
    : {
        sortButton: 'Sort',
        sortNewest: 'Newest date',
        sortOldest: 'Oldest date',
        sortCompany: 'Company name',
        sortTitle: 'Role name',
        sortStatus: 'Status',
      };

  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    applicationsApi.mine()
      .then((data) => setMyApplications(data.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => ({
    total:      myApplications.length,
    accepted:   myApplications.filter((app) => getDisplayStatus(app.status) === 'Accepted').length,
    inProgress: myApplications.filter((app) => !['Accepted', 'Rejected'].includes(getDisplayStatus(app.status))).length,
    rejected:   myApplications.filter((app) => getDisplayStatus(app.status) === 'Rejected').length,
  }), [myApplications]);

  const sortLabels = {
    newest: copy.sortNewest,
    oldest: copy.sortOldest,
    company: copy.sortCompany,
    title: copy.sortTitle,
    status: copy.sortStatus,
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const next = myApplications.filter((app) => {
      const displayStatus = getDisplayStatus(app.status);
      const matchSearch =
        !q ||
        app.opportunity?.title?.toLowerCase().includes(q) ||
        app.opportunity?.company?.name?.toLowerCase().includes(q);
      const matchStatus = filterStatus === 'All' || displayStatus === filterStatus;
      return matchSearch && matchStatus;
    });

    return [...next].sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.applied_at) - new Date(b.applied_at);
      }
      if (sortBy === 'company') {
        return (a.opportunity?.company?.name || '').localeCompare(b.opportunity?.company?.name || '');
      }
      if (sortBy === 'title') {
        return (a.opportunity?.title || '').localeCompare(b.opportunity?.title || '');
      }
      if (sortBy === 'status') {
        return getDisplayStatus(a.status).localeCompare(getDisplayStatus(b.status));
      }
      return new Date(b.applied_at) - new Date(a.applied_at);
    });
  }, [filterStatus, myApplications, search, sortBy]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand" />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl space-y-6 pb-10"
    >
      <motion.div variants={itemVariants} className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight flex items-center gap-2">
            <FileText size={22} className="text-brand" />
            {t('lamaran_title')}
          </h1>
          <p className="text-sm text-text-muted mt-1">{t('lamaran_subtitle')}</p>
        </div>
        <Button variant="outline" size="sm" disabled title={t('lamaran_coming_soon')}>
          {t('lamaran_track_btn')}
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
        <StatCard icon={FileText} label={t('lamaran_total')} value={stats.total} color="bg-brand" />
        <StatCard icon={CheckCircle2} label={t('lamaran_accepted')} value={stats.accepted} color="bg-emerald-500" />
        <StatCard icon={Clock} label={t('lamaran_in_progress')} value={stats.inProgress} color="bg-amber-500" />
        <StatCard icon={XCircle} label={t('lamaran_rejected')} value={stats.rejected} color="bg-red-500" />
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light pointer-events-none" />
            <input
              type="text"
              placeholder={t('lamaran_search_ph')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-text transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="relative">
            <Button
              variant="outline"
              className="w-full sm:w-auto flex items-center justify-center gap-2"
              onClick={() => setShowSortMenu((prev) => !prev)}
            >
              <Filter size={16} />
              {copy.sortButton}
              <ChevronDown size={14} className={`transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
            </Button>
            {showSortMenu && (
              <div className="absolute right-0 mt-2 min-w-[220px] rounded-xl border border-gray-200 bg-white shadow-lg z-20 overflow-hidden">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSortBy(option);
                      setShowSortMenu(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                      sortBy === option
                        ? 'bg-brand/5 text-brand font-semibold'
                        : 'text-text-muted hover:bg-gray-50 hover:text-text'
                    }`}
                  >
                    {sortLabels[option]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {VISIBLE_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                filterStatus === status
                  ? 'bg-brand text-white border-brand shadow-sm'
                  : 'bg-white text-text-muted border-gray-200 hover:border-brand/30 hover:text-brand'
              }`}
            >
              {status === 'All' ? t('lamaran_filter_all') : t(`status_${status.toLowerCase()}`)}
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {filtered.length > 0 ? (
          <motion.div
            key="list"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {filtered.map((app) => (
              <ApplicationCard key={app.id} app={app} t={t} locale={locale} />
            ))}
          </motion.div>
        ) : myApplications.length === 0 ? (
          <motion.div
            key="empty"
            variants={itemVariants}
            className="text-center py-24 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50"
          >
            <FileText size={40} className="mx-auto text-gray-300 mb-4" />
            <p className="font-semibold text-text-muted">{t('lamaran_empty_title')}</p>
            <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">{t('lamaran_empty_sub')}</p>
            <div className="mt-6 flex justify-center gap-3">
              <Button to="/lowongan" variant="primary" className="text-white">
                {t('lamaran_find_opp')}
              </Button>
              <Button variant="outline" disabled>
                {t('lamaran_track_manual')}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="no-results"
            variants={itemVariants}
            className="text-center py-16 rounded-2xl bg-gray-50/50 border border-dashed border-gray-200"
          >
            <Filter size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-text-muted font-medium">{t('lamaran_no_results')}</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 text-brand"
              onClick={() => {
                setSearch('');
                setFilterStatus('All');
                setSortBy('newest');
                setShowSortMenu(false);
              }}
            >
              {t('lamaran_clear')}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
