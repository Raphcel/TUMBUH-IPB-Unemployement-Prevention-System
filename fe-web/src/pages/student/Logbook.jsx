import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Briefcase,
  Building,
  Calendar,
  Clock,
  FileText,
  Paperclip,
  Plus,
  Target,
} from 'lucide-react';
import { applicationsApi } from '../../api/applications';
import { logbooksApi } from '../../api/logbooks';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from '../../context/LanguageContext';

const MotionDiv = motion.div;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120, damping: 16 } },
};

const emptyForm = {
  application_id: '',
  title: '',
  role: '',
  company: '',
  mentor_name: '',
  start_date: '',
  end_date: '',
  target_hours: '',
  notes: '',
};

function numberValue(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function formatHours(value, t) {
  return `${numberValue(value).toLocaleString(undefined, { maximumFractionDigits: 1 })} ${t('logbook_hours_short')}`;
}

function formatDate(value, locale) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
}

function progressPercent(logbook) {
  if (!logbook.target_hours) return 0;
  return Math.min(100, Math.round((numberValue(logbook.total_hours) / logbook.target_hours) * 100));
}

function appOptionLabel(app) {
  const role = app.opportunity?.title || 'Application';
  const company = app.opportunity?.company?.name || '-';
  return `${role} · ${company}`;
}

function payloadFromForm(form) {
  return {
    application_id: form.application_id ? Number(form.application_id) : null,
    title: form.title.trim() || null,
    role: form.role.trim() || null,
    company: form.company.trim() || null,
    mentor_name: form.mentor_name.trim() || null,
    start_date: form.start_date || null,
    end_date: form.end_date || null,
    target_hours: form.target_hours ? Number(form.target_hours) : null,
    notes: form.notes.trim() || null,
  };
}

function StatCard({ icon, label, value }) {
  return (
    <MotionDiv variants={itemVariants} className="rounded-xl border border-surface-border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">{label}</p>
        {React.createElement(icon, { size: 18, className: 'text-brand' })}
      </div>
      <p className="mt-4 text-3xl font-bold text-text">{value}</p>
    </MotionDiv>
  );
}

function ProgressRing({ percent }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90">
        <circle cx="28" cy="28" r={radius} fill="none" stroke="currentColor" strokeWidth="6" className="text-surface-muted" />
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-brand transition-all"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-text">{percent}%</span>
    </div>
  );
}

function LogbookCard({ logbook, locale, t }) {
  const percent = progressPercent(logbook);
  const latestEntry = logbook.entries?.[0];

  return (
    <MotionDiv variants={itemVariants}>
      <Link
        to={`/student/logbook/${logbook.id}`}
        className="block h-full rounded-xl border border-surface-border bg-white p-5 shadow-sm transition hover:border-brand/30 hover:shadow-md"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-text">{logbook.title}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-text-muted">
              <Building size={14} />
              <span className="truncate">{logbook.company}</span>
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-text-muted">
              <Briefcase size={14} />
              <span className="truncate">{logbook.role}</span>
            </p>
          </div>
          <ProgressRing percent={percent} />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-surface-border pt-4">
          <div>
            <p className="text-xs text-text-light">{t('logbook_total_hours')}</p>
            <p className="mt-1 text-sm font-semibold text-text">{formatHours(logbook.total_hours, t)}</p>
          </div>
          <div>
            <p className="text-xs text-text-light">{t('logbook_entries')}</p>
            <p className="mt-1 text-sm font-semibold text-text">{logbook.entries?.length || 0}</p>
          </div>
          <div>
            <p className="text-xs text-text-light">{t('logbook_files')}</p>
            <p className="mt-1 text-sm font-semibold text-text">{logbook.attachment_count || 0}</p>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-surface-muted/60 px-3 py-2 text-xs text-text-muted">
          {latestEntry
            ? `${t('logbook_latest')}: ${formatDate(latestEntry.activity_date, locale)} · ${latestEntry.title}`
            : t('logbook_no_entries_short')}
        </div>
      </Link>
    </MotionDiv>
  );
}

export function Logbook() {
  const navigate = useNavigate();
  const { t, lang } = useTranslation();
  const { addToast } = useToast();
  const locale = lang === 'id' ? 'id-ID' : 'en-US';
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [logbooks, setLogbooks] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const acceptedApplications = useMemo(
    () => applications.filter((app) => app.status === 'Accepted'),
    [applications]
  );

  const appOptions = useMemo(() => [
    { value: '', label: t('logbook_no_application') },
    ...acceptedApplications.map((app) => ({ value: String(app.id), label: appOptionLabel(app) })),
  ], [acceptedApplications, t]);

  const summary = useMemo(() => ({
    total: logbooks.length,
    entries: logbooks.reduce((sum, logbook) => sum + (logbook.entries?.length || 0), 0),
    hours: logbooks.reduce((sum, logbook) => sum + numberValue(logbook.total_hours), 0),
    files: logbooks.reduce((sum, logbook) => sum + (logbook.attachment_count || 0), 0),
  }), [logbooks]);

  const loadData = useCallback(async () => {
    try {
      const [logbooksData, applicationsData] = await Promise.all([
        logbooksApi.list(),
        applicationsApi.mine().catch(() => ({ items: [] })),
      ]);
      setLogbooks(logbooksData.items || []);
      setApplications(applicationsData.items || []);
    } catch (err) {
      addToast({ type: 'error', title: t('logbook_load_failed'), message: err.message });
    } finally {
      setLoading(false);
    }
  }, [addToast, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleApplicationChange(event) {
    const applicationId = event.target.value;
    const app = acceptedApplications.find((item) => String(item.id) === applicationId);
    setForm((current) => ({
      ...current,
      application_id: applicationId,
      title: app?.opportunity?.title || current.title,
      role: app?.opportunity?.title || current.role,
      company: app?.opportunity?.company?.name || current.company,
    }));
  }

  async function handleCreate(event) {
    event.preventDefault();
    const payload = payloadFromForm(form);
    if (!payload.title || !payload.role || !payload.company) {
      addToast({ type: 'error', title: t('logbook_form_invalid'), message: t('logbook_required_manual') });
      return;
    }

    setSubmitting(true);
    try {
      const created = await logbooksApi.create(payload);
      addToast({ type: 'success', title: t('logbook_created'), message: created.title });
      setShowCreate(false);
      setForm(emptyForm);
      await loadData();
      navigate(`/student/logbook/${created.id}`);
    } catch (err) {
      addToast({ type: 'error', title: t('logbook_create_failed'), message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-brand" />
      </div>
    );
  }

  return (
    <MotionDiv variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 pb-10">
      <MotionDiv variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-text">
            <BookOpen size={24} className="text-brand" />
            {t('logbook_title')}
          </h1>
          <p className="mt-1 text-sm text-text-muted">{t('logbook_subtitle')}</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus size={16} />
          {t('logbook_new')}
        </Button>
      </MotionDiv>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={BookOpen} label={t('logbook_total_logbooks')} value={summary.total} />
        <StatCard icon={FileText} label={t('logbook_total_entries')} value={summary.entries} />
        <StatCard icon={Clock} label={t('logbook_total_hours')} value={formatHours(summary.hours, t)} />
        <StatCard icon={Paperclip} label={t('logbook_total_files')} value={summary.files} />
      </div>

      {logbooks.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {logbooks.map((logbook) => (
            <LogbookCard key={logbook.id} logbook={logbook} locale={locale} t={t} />
          ))}
        </div>
      ) : (
        <MotionDiv variants={itemVariants} className="rounded-xl border border-dashed border-surface-border bg-white p-12 text-center">
          <BookOpen size={46} className="mx-auto mb-4 text-surface-border" />
          <h2 className="text-lg font-semibold text-text">{t('logbook_empty_title')}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-muted">{t('logbook_empty_subtitle')}</p>
          <Button onClick={() => setShowCreate(true)} className="mt-6 gap-2">
            <Plus size={16} />
            {t('logbook_new')}
          </Button>
        </MotionDiv>
      )}

      <Modal
        isOpen={showCreate}
        onClose={() => !submitting && setShowCreate(false)}
        title={t('logbook_create_title')}
        size="lg"
        footer={(
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)} disabled={submitting}>
              {t('logbook_cancel')}
            </Button>
            <Button type="submit" form="logbook-create-form" disabled={submitting}>
              {submitting ? t('logbook_saving') : t('logbook_save')}
            </Button>
          </ModalFooter>
        )}
      >
        <form id="logbook-create-form" onSubmit={handleCreate} className="space-y-4">
          <Select
            label={t('logbook_application')}
            value={form.application_id}
            onChange={handleApplicationChange}
            options={appOptions}
            placeholder={t('logbook_no_application')}
          />
          <Input label={t('logbook_field_title')} value={form.title} onChange={(e) => updateForm('title', e.target.value)} required />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label={t('logbook_field_role')} value={form.role} onChange={(e) => updateForm('role', e.target.value)} required />
            <Input label={t('logbook_field_company')} value={form.company} onChange={(e) => updateForm('company', e.target.value)} required />
          </div>
          <Input label={t('logbook_field_mentor')} value={form.mentor_name} onChange={(e) => updateForm('mentor_name', e.target.value)} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input type="date" label={t('logbook_field_start')} value={form.start_date} onChange={(e) => updateForm('start_date', e.target.value)} />
            <Input type="date" label={t('logbook_field_end')} value={form.end_date} onChange={(e) => updateForm('end_date', e.target.value)} />
            <Input type="number" min="0.5" step="0.5" label={t('logbook_field_target')} value={form.target_hours} onChange={(e) => updateForm('target_hours', e.target.value)} />
          </div>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">{t('logbook_field_notes')}</span>
            <textarea
              rows={4}
              value={form.notes}
              onChange={(e) => updateForm('notes', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/20"
            />
          </label>
        </form>
      </Modal>
    </MotionDiv>
  );
}
