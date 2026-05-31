import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  Building,
  Calendar,
  Clock,
  Download,
  Edit3,
  FileText,
  Paperclip,
  Plus,
  Target,
  Trash2,
  Upload,
  User,
} from 'lucide-react';
import { logbooksApi } from '../../api/logbooks';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from '../../context/LanguageContext';

const MotionDiv = motion.div;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

const CATEGORIES = [
  { value: 'Development', dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  { value: 'Meeting', dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
  { value: 'Training', dot: 'bg-violet-500', bg: 'bg-violet-50', text: 'text-violet-700' },
  { value: 'Research', dot: 'bg-cyan-500', bg: 'bg-cyan-50', text: 'text-cyan-700' },
  { value: 'Documentation', dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  { value: 'Presentation', dot: 'bg-rose-500', bg: 'bg-rose-50', text: 'text-rose-700' },
  { value: 'Administration', dot: 'bg-slate-500', bg: 'bg-slate-50', text: 'text-slate-700' },
  { value: 'Other', dot: 'bg-gray-500', bg: 'bg-gray-50', text: 'text-gray-700' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120, damping: 16 } },
};

const emptyEntryForm = {
  activity_date: new Date().toISOString().slice(0, 10),
  title: '',
  category: 'Development',
  hours: '',
  description: '',
  file: null,
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

function formatFileSize(bytes) {
  if (!bytes) return '0 KB';
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function progressPercent(logbook) {
  if (!logbook?.target_hours) return 0;
  return Math.min(100, Math.round((numberValue(logbook.total_hours) / logbook.target_hours) * 100));
}

function getCategoryConfig(category) {
  return CATEGORIES.find((item) => item.value === category) || CATEGORIES[CATEGORIES.length - 1];
}

function groupEntriesByDate(entries = []) {
  const groups = {};
  entries
    .slice()
    .sort((a, b) => b.activity_date.localeCompare(a.activity_date))
    .forEach((entry) => {
      if (!groups[entry.activity_date]) groups[entry.activity_date] = [];
      groups[entry.activity_date].push(entry);
    });
  return Object.entries(groups);
}

function validateFile(file, t) {
  if (!file) return null;
  if (file.size > MAX_FILE_SIZE) return t('logbook_file_too_large');
  if (!ALLOWED_TYPES.includes(file.type)) return t('logbook_file_type_invalid');
  return null;
}

function logbookPayload(form) {
  return {
    title: form.title.trim(),
    role: form.role.trim(),
    company: form.company.trim(),
    mentor_name: form.mentor_name.trim() || null,
    start_date: form.start_date || null,
    end_date: form.end_date || null,
    target_hours: form.target_hours ? Number(form.target_hours) : null,
    notes: form.notes.trim() || null,
  };
}

function entryPayload(form) {
  return {
    activity_date: form.activity_date,
    title: form.title.trim(),
    category: form.category || null,
    hours: Number(form.hours),
    description: form.description.trim() || null,
  };
}

function ProgressBar({ percent }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-text">{percent}%</span>
        <span className="text-text-muted">100%</span>
      </div>
      <div className="h-2 rounded-full bg-surface-muted">
        <div className="h-2 rounded-full bg-brand transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <MotionDiv variants={itemVariants} className="rounded-xl border border-surface-border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">{label}</p>
        {React.createElement(icon, { size: 17, className: 'text-brand' })}
      </div>
      <p className="mt-3 text-2xl font-bold text-text">{value}</p>
    </MotionDiv>
  );
}

function WeeklyChart({ entries, locale, t }) {
  const weeklyData = useMemo(() => {
    const weeks = {};
    entries.forEach((entry) => {
      const d = new Date(`${entry.activity_date}T00:00:00`);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().slice(0, 10);
      weeks[key] = (weeks[key] || 0) + numberValue(entry.hours);
    });
    return Object.entries(weeks)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([week, hours]) => ({ week, hours }));
  }, [entries]);

  const maxHours = Math.max(...weeklyData.map((item) => item.hours), 1);

  if (weeklyData.length === 0) {
    return <div className="rounded-lg border border-dashed border-surface-border p-8 text-center text-sm text-text-muted">{t('logbook_no_weekly_data')}</div>;
  }

  return (
    <div className="flex h-36 items-end gap-2">
      {weeklyData.map(({ week, hours }) => (
        <div key={week} className="flex min-w-0 flex-1 flex-col items-center gap-1">
          <span className="text-xs font-medium text-text-muted">{hours.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
          <div className="relative w-full overflow-hidden rounded-t-md bg-brand/15" style={{ height: `${Math.max((hours / maxHours) * 100, 8)}%` }}>
            <div className="absolute inset-0 rounded-t-md bg-brand" />
          </div>
          <span className="max-w-full truncate text-[10px] text-text-light">
            {new Date(`${week}T00:00:00`).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
          </span>
        </div>
      ))}
    </div>
  );
}

function EntryCard({ entry, locale, t, onEdit, onDelete, onDownload, onDeleteAttachment, onUpload }) {
  const config = getCategoryConfig(entry.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-xl border border-surface-border bg-white p-4 shadow-sm transition-colors hover:border-brand/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${config.dot}`} />
          <div className="min-w-0">
            <h4 className="break-words font-semibold text-text">{entry.title}</h4>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {entry.category && (
                <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>
                  {entry.category}
                </span>
              )}
              <span className="text-xs text-text-muted">{formatDate(entry.activity_date, locale)}</span>
            </div>
          </div>
        </div>
        <span className="shrink-0 whitespace-nowrap text-sm font-bold text-brand">{formatHours(entry.hours, t)}</span>
      </div>

      {entry.description && (
        <p className="mt-3 break-words pl-5 text-sm leading-6 text-text-muted">{entry.description}</p>
      )}

      {entry.attachments?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 pl-5">
          {entry.attachments.map((attachment) => (
            <div key={attachment.id} className="flex max-w-full items-center rounded-lg border border-surface-border bg-surface-muted">
              <button
                type="button"
                onClick={() => onDownload(attachment)}
                className="flex min-w-0 items-center gap-1.5 px-2.5 py-1.5 text-xs text-text-muted transition hover:text-brand"
              >
                <Paperclip size={12} />
                <span className="max-w-[150px] truncate">{attachment.original_filename}</span>
                <span className="shrink-0 text-text-light">{formatFileSize(attachment.file_size)}</span>
              </button>
              <button
                type="button"
                onClick={() => onDeleteAttachment(attachment.id)}
                className="border-l border-surface-border px-2 py-1.5 text-text-light transition hover:text-red-600"
                aria-label={t('logbook_delete_attachment')}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 pl-5">
        <Button type="button" size="sm" variant="ghost" onClick={() => onEdit(entry)} className="gap-1">
          <Edit3 size={14} />
          {t('logbook_edit')}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => onDelete(entry.id)} className="gap-1">
          <Trash2 size={14} />
          {t('logbook_delete')}
        </Button>
        <label className="inline-flex cursor-pointer items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-text-muted transition hover:bg-surface-muted hover:text-brand">
          <Upload size={14} />
          {t('logbook_attach')}
          <input
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={(event) => {
              onUpload(entry.id, event.target.files?.[0]);
              event.target.value = '';
            }}
          />
        </label>
      </div>
    </motion.div>
  );
}

export function LogbookDetail() {
  const { logbookId } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useTranslation();
  const { addToast } = useToast();
  const locale = lang === 'id' ? 'id-ID' : 'en-US';
  const [logbook, setLogbook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showLogbookModal, setShowLogbookModal] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [logbookForm, setLogbookForm] = useState(null);
  const [entryForm, setEntryForm] = useState(emptyEntryForm);

  const entries = useMemo(() => logbook?.entries || [], [logbook]);
  const groupedEntries = useMemo(() => groupEntriesByDate(entries), [entries]);
  const percent = progressPercent(logbook);
  const categoryOptions = useMemo(
    () => CATEGORIES.map((category) => ({ value: category.value, label: category.value })),
    []
  );

  const loadLogbook = useCallback(async () => {
    try {
      const data = await logbooksApi.get(logbookId);
      setLogbook(data);
      setLogbookForm({
        title: data.title || '',
        role: data.role || '',
        company: data.company || '',
        mentor_name: data.mentor_name || '',
        start_date: data.start_date || '',
        end_date: data.end_date || '',
        target_hours: data.target_hours || '',
        notes: data.notes || '',
      });
    } catch (err) {
      addToast({ type: 'error', title: t('logbook_load_failed'), message: err.message });
    } finally {
      setLoading(false);
    }
  }, [addToast, logbookId, t]);

  useEffect(() => {
    loadLogbook();
  }, [loadLogbook]);

  function updateLogbookForm(field, value) {
    setLogbookForm((current) => ({ ...current, [field]: value }));
  }

  function updateEntryForm(field, value) {
    setEntryForm((current) => ({ ...current, [field]: value }));
  }

  function openCreateEntry() {
    setEditingEntry(null);
    setEntryForm(emptyEntryForm);
    setShowEntryModal(true);
  }

  function openEditEntry(entry) {
    setEditingEntry(entry);
    setEntryForm({
      activity_date: entry.activity_date,
      title: entry.title || '',
      category: entry.category || 'Development',
      hours: entry.hours || '',
      description: entry.description || '',
      file: null,
    });
    setShowEntryModal(true);
  }

  async function handleSaveLogbook(event) {
    event.preventDefault();
    const payload = logbookPayload(logbookForm);
    if (!payload.title || !payload.role || !payload.company) {
      addToast({ type: 'error', title: t('logbook_form_invalid'), message: t('logbook_required_manual') });
      return;
    }

    setSubmitting(true);
    try {
      const updated = await logbooksApi.update(logbook.id, payload);
      setLogbook(updated);
      setShowLogbookModal(false);
      addToast({ type: 'success', title: t('logbook_updated'), message: updated.title });
    } catch (err) {
      addToast({ type: 'error', title: t('logbook_update_failed'), message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveEntry(event) {
    event.preventDefault();
    const payload = entryPayload(entryForm);
    const fileError = validateFile(entryForm.file, t);

    if (!payload.title || !payload.activity_date || payload.hours <= 0) {
      addToast({ type: 'error', title: t('logbook_form_invalid'), message: t('logbook_entry_required') });
      return;
    }
    if (payload.activity_date > new Date().toISOString().slice(0, 10)) {
      addToast({ type: 'error', title: t('logbook_form_invalid'), message: t('logbook_future_date_invalid') });
      return;
    }
    if (fileError) {
      addToast({ type: 'error', title: t('logbook_file_invalid'), message: fileError });
      return;
    }

    setSubmitting(true);
    try {
      const saved = editingEntry
        ? await logbooksApi.updateEntry(editingEntry.id, payload)
        : await logbooksApi.createEntry(logbook.id, payload);
      if (!editingEntry && entryForm.file) {
        await logbooksApi.uploadAttachment(saved.id, entryForm.file);
      }
      setShowEntryModal(false);
      await loadLogbook();
      addToast({ type: 'success', title: editingEntry ? t('logbook_entry_updated') : t('logbook_entry_created'), message: payload.title });
    } catch (err) {
      addToast({ type: 'error', title: t('logbook_entry_save_failed'), message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteLogbook() {
    if (!window.confirm(t('logbook_delete_confirm'))) return;
    setSubmitting(true);
    try {
      await logbooksApi.delete(logbook.id);
      addToast({ type: 'success', title: t('logbook_deleted'), message: logbook.title });
      navigate('/student/logbook');
    } catch (err) {
      addToast({ type: 'error', title: t('logbook_delete_failed'), message: err.message });
      setSubmitting(false);
    }
  }

  async function handleDeleteEntry(entryId) {
    if (!window.confirm(t('logbook_entry_delete_confirm'))) return;
    try {
      await logbooksApi.deleteEntry(entryId);
      await loadLogbook();
      addToast({ type: 'success', title: t('logbook_entry_deleted'), message: t('logbook_entry_deleted_message') });
    } catch (err) {
      addToast({ type: 'error', title: t('logbook_delete_failed'), message: err.message });
    }
  }

  async function handleUploadAttachment(entryId, file) {
    const error = validateFile(file, t);
    if (error) {
      addToast({ type: 'error', title: t('logbook_file_invalid'), message: error });
      return;
    }
    try {
      await logbooksApi.uploadAttachment(entryId, file);
      await loadLogbook();
      addToast({ type: 'success', title: t('logbook_attachment_uploaded'), message: file.name });
    } catch (err) {
      addToast({ type: 'error', title: t('logbook_upload_failed'), message: err.message });
    }
  }

  async function handleDownloadAttachment(attachment) {
    try {
      await logbooksApi.downloadAttachment(attachment.id, attachment.original_filename);
    } catch (err) {
      addToast({ type: 'error', title: t('logbook_download_failed'), message: err.message });
    }
  }

  async function handleDeleteAttachment(attachmentId) {
    if (!window.confirm(t('logbook_attachment_delete_confirm'))) return;
    try {
      await logbooksApi.deleteAttachment(attachmentId);
      await loadLogbook();
      addToast({ type: 'success', title: t('logbook_attachment_deleted'), message: t('logbook_attachment_deleted_message') });
    } catch (err) {
      addToast({ type: 'error', title: t('logbook_delete_failed'), message: err.message });
    }
  }

  async function handleExportPdf() {
    try {
      await logbooksApi.exportPdf(logbook.id, `${logbook.title}.pdf`);
    } catch (err) {
      addToast({ type: 'error', title: t('logbook_export_failed'), message: err.message });
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-brand" />
      </div>
    );
  }

  if (!logbook) {
    return (
      <div className="rounded-xl border border-dashed border-surface-border bg-white p-12 text-center">
        <BookOpen size={44} className="mx-auto mb-4 text-surface-border" />
        <p className="font-semibold text-text">{t('logbook_not_found')}</p>
        <Button to="/student/logbook" variant="outline" className="mt-5 gap-2">
          <ArrowLeft size={16} />
          {t('logbook_back')}
        </Button>
      </div>
    );
  }

  return (
    <MotionDiv variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 pb-10">
      <MotionDiv variants={itemVariants} className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <Link to="/student/logbook" className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-text-muted transition hover:text-brand">
            <ArrowLeft size={16} />
            {t('logbook_back')}
          </Link>
          <h1 className="break-words text-2xl font-bold tracking-tight text-text">{logbook.title}</h1>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-text-muted">
            <span className="inline-flex items-center gap-1.5"><Building size={14} />{logbook.company}</span>
            <span className="inline-flex items-center gap-1.5"><User size={14} />{logbook.role}</span>
            {(logbook.start_date || logbook.end_date) && (
              <span className="inline-flex items-center gap-1.5"><Calendar size={14} />{formatDate(logbook.start_date, locale)} - {formatDate(logbook.end_date, locale)}</span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setShowLogbookModal(true)} className="gap-2">
            <Edit3 size={16} />
            {t('logbook_edit')}
          </Button>
          <Button variant="outline" onClick={handleExportPdf} className="gap-2">
            <Download size={16} />
            {t('logbook_export_pdf')}
          </Button>
          <Button variant="danger" onClick={handleDeleteLogbook} disabled={submitting} className="gap-2">
            <Trash2 size={16} />
            {t('logbook_delete')}
          </Button>
        </div>
      </MotionDiv>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard icon={Clock} label={t('logbook_total_hours')} value={formatHours(logbook.total_hours, t)} />
        <StatCard icon={FileText} label={t('logbook_total_entries')} value={entries.length} />
        <StatCard icon={Paperclip} label={t('logbook_total_files')} value={logbook.attachment_count || 0} />
        <StatCard icon={Target} label={t('logbook_progress')} value={`${percent}%`} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <MotionDiv variants={itemVariants} className="rounded-xl border border-surface-border bg-white p-5 shadow-sm xl:col-span-1">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-text"><Target size={18} className="text-brand" />{t('logbook_progress')}</h2>
          <ProgressBar percent={percent} />
          <div className="mt-4 text-sm text-text-muted">
            {logbook.target_hours ? `${formatHours(logbook.total_hours, t)} / ${formatHours(logbook.target_hours, t)}` : t('logbook_no_target')}
          </div>
          {logbook.notes && <p className="mt-4 break-words rounded-lg bg-surface-muted p-3 text-sm text-text-muted">{logbook.notes}</p>}
        </MotionDiv>

        <MotionDiv variants={itemVariants} className="rounded-xl border border-surface-border bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-text"><Calendar size={18} className="text-brand" />{t('logbook_weekly_hours')}</h2>
          <WeeklyChart entries={entries} locale={locale} t={t} />
        </MotionDiv>
      </div>

      <MotionDiv variants={itemVariants} className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-text">{t('logbook_activity_log')}</h2>
          <Button onClick={openCreateEntry} className="gap-2">
            <Plus size={16} />
            {t('logbook_add_entry')}
          </Button>
        </div>

        {groupedEntries.length > 0 ? (
          <div className="space-y-6">
            {groupedEntries.map(([date, dateEntries]) => (
              <div key={date}>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-text-muted">{formatDate(date, locale)}</span>
                  <div className="h-px flex-1 bg-surface-border" />
                </div>
                <div className="mt-3 space-y-3 sm:ml-4">
                  {dateEntries.map((entry) => (
                    <EntryCard
                      key={entry.id}
                      entry={entry}
                      locale={locale}
                      t={t}
                      onEdit={openEditEntry}
                      onDelete={handleDeleteEntry}
                      onDownload={handleDownloadAttachment}
                      onDeleteAttachment={handleDeleteAttachment}
                      onUpload={handleUploadAttachment}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-surface-border bg-white p-12 text-center">
            <FileText size={42} className="mx-auto mb-4 text-surface-border" />
            <p className="font-semibold text-text">{t('logbook_no_entries')}</p>
            <Button onClick={openCreateEntry} className="mt-5 gap-2">
              <Plus size={16} />
              {t('logbook_add_entry')}
            </Button>
          </div>
        )}
      </MotionDiv>

      <Modal
        isOpen={showLogbookModal}
        onClose={() => !submitting && setShowLogbookModal(false)}
        title={t('logbook_edit_title')}
        size="lg"
        footer={(
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowLogbookModal(false)} disabled={submitting}>{t('logbook_cancel')}</Button>
            <Button type="submit" form="logbook-edit-form" disabled={submitting}>{submitting ? t('logbook_saving') : t('logbook_save')}</Button>
          </ModalFooter>
        )}
      >
        {logbookForm && (
          <form id="logbook-edit-form" onSubmit={handleSaveLogbook} className="space-y-4">
            <Input label={t('logbook_field_title')} value={logbookForm.title} onChange={(e) => updateLogbookForm('title', e.target.value)} required />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label={t('logbook_field_role')} value={logbookForm.role} onChange={(e) => updateLogbookForm('role', e.target.value)} required />
              <Input label={t('logbook_field_company')} value={logbookForm.company} onChange={(e) => updateLogbookForm('company', e.target.value)} required />
            </div>
            <Input label={t('logbook_field_mentor')} value={logbookForm.mentor_name} onChange={(e) => updateLogbookForm('mentor_name', e.target.value)} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input type="date" label={t('logbook_field_start')} value={logbookForm.start_date} onChange={(e) => updateLogbookForm('start_date', e.target.value)} />
              <Input type="date" label={t('logbook_field_end')} value={logbookForm.end_date} onChange={(e) => updateLogbookForm('end_date', e.target.value)} />
              <Input type="number" min="0.5" step="0.5" label={t('logbook_field_target')} value={logbookForm.target_hours} onChange={(e) => updateLogbookForm('target_hours', e.target.value)} />
            </div>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">{t('logbook_field_notes')}</span>
              <textarea
                rows={4}
                value={logbookForm.notes}
                onChange={(e) => updateLogbookForm('notes', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/20"
              />
            </label>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={showEntryModal}
        onClose={() => !submitting && setShowEntryModal(false)}
        title={editingEntry ? t('logbook_edit_entry') : t('logbook_add_entry')}
        size="lg"
        footer={(
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowEntryModal(false)} disabled={submitting}>{t('logbook_cancel')}</Button>
            <Button type="submit" form="logbook-entry-form" disabled={submitting}>{submitting ? t('logbook_saving') : t('logbook_save')}</Button>
          </ModalFooter>
        )}
      >
        <form id="logbook-entry-form" onSubmit={handleSaveEntry} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input type="date" label={t('logbook_entry_date')} value={entryForm.activity_date} onChange={(e) => updateEntryForm('activity_date', e.target.value)} required />
            <Input type="number" min="0.5" step="0.5" label={t('logbook_entry_hours')} value={entryForm.hours} onChange={(e) => updateEntryForm('hours', e.target.value)} required />
          </div>
          <Input label={t('logbook_entry_title')} value={entryForm.title} onChange={(e) => updateEntryForm('title', e.target.value)} required />
          <Select
            label={t('logbook_entry_category')}
            value={entryForm.category}
            onChange={(e) => updateEntryForm('category', e.target.value)}
            options={categoryOptions}
          />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">{t('logbook_entry_desc')}</span>
            <textarea
              rows={4}
              value={entryForm.description}
              onChange={(e) => updateEntryForm('description', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/20"
            />
          </label>
          {!editingEntry && (
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">{t('logbook_entry_file_optional')}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(event) => updateEntryForm('file', event.target.files?.[0] || null)}
                className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand-muted file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand"
              />
              <span className="mt-1 block text-xs text-text-light">{t('logbook_file_hint')}</span>
            </label>
          )}
        </form>
      </Modal>
    </MotionDiv>
  );
}
