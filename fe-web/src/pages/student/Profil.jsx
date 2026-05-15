import React, { useEffect, useState } from 'react';
import {
  BriefcaseBusiness,
  Code2,
  FolderKanban,
  Globe,
  Linkedin,
  MapPin,
} from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { externshipsApi } from '../../api/externships';
import { resolveUploadUrl } from '../../api/client';
import { useTranslation } from '../../context/LanguageContext';
import { motion } from 'framer-motion';

function Pill({ children, accent = false }) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium ${
        accent
          ? 'border-brand/20 bg-brand/10 text-brand-dark'
          : 'border-surface-border bg-surface-muted text-text'
      }`}
    >
      {children}
    </span>
  );
}

function TimelineEntry({ entry }) {
  return (
    <div className="relative border-l-2 border-surface-border pl-6">
      <span className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-4 border-white bg-brand shadow-sm" />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text">{entry.title}</h3>
          <p className="mt-1 text-sm text-text-muted">{entry.company}</p>
        </div>
        {entry.duration && (
          <span className="rounded bg-surface-muted px-2 py-1 text-xs text-text-muted">
            {entry.duration}
          </span>
        )}
      </div>
      {entry.description && (
        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-text-muted">
          {entry.description}
        </p>
      )}
    </div>
  );
}

function ProjectCard({ entry }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#becabe] bg-[#f7f9fb]">
      <div className="flex h-32 items-end justify-end bg-gradient-to-br from-brand/20 to-transparent p-4">
        <FolderKanban className="text-brand/60" />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-text">{entry.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-text-muted">
          {entry.description || entry.company}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {entry.company && <Pill>{entry.company}</Pill>}
          {entry.duration && <Pill>{entry.duration}</Pill>}
        </div>
      </div>
    </div>
  );
}

export function ProfilStudent() {
  const { user } = useAuth();
  const { lang } = useTranslation();
  const isId = lang === 'id';
  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);

  useEffect(() => {
    async function fetchEntries() {
      try {
        const data = await externshipsApi.mine();
        setEntries(data.items || []);
      } catch (err) {
        console.error('Failed to load profile entries', err);
      } finally {
        setLoadingEntries(false);
      }
    }

    fetchEntries();
  }, []);

  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || '-';
  const avatarUrl =
    resolveUploadUrl(user?.avatar) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0f2854&color=fff`;

  const experienceEntries = entries.filter((entry) => entry.entry_type === 'Experience');
  const projectEntries = entries.filter((entry) => entry.entry_type === 'Project');
  const technicalSkills = [
    user?.major,
    user?.gpa ? `${isId ? 'IPK' : 'GPA'} ${user.gpa}` : null,
    'Data Analysis',
    'UI Design',
  ].filter(Boolean);
  const interpersonalSkills = ['Leadership', 'Public Speaking', 'Agile'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(300px,380px)_minmax(0,1fr)]"
    >
      <aside className="space-y-6">
        <Card className="border-[#becabe]">
          <div className="h-24 bg-[#e6e8ea]" />
          <CardBody className="-mt-20 flex flex-col items-center text-center">
            <img
              src={avatarUrl}
              alt={fullName}
              className="h-32 w-32 rounded-full border-4 border-white bg-gray-200 object-cover shadow-lg"
            />
            <h1 className="mt-4 text-2xl font-semibold text-text">{fullName}</h1>
            <p className="mt-1 text-sm text-text-muted">
              {user?.major || (isId ? 'Mahasiswa' : 'Student')}
            </p>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-text-muted">
              <MapPin size={14} />
              {user?.university || 'IPB University'}
            </p>

            <div className="mt-5 flex w-full gap-3 border-b border-surface-border pb-6">
              <Button className="flex-1">{isId ? 'Pesan' : 'Message'}</Button>
              {user?.cv_url && (
                <Button
                  href={resolveUploadUrl(user.cv_url)}
                  target="_blank"
                  rel="noreferrer"
                  variant="outline"
                  className="flex-1"
                >
                  Resume
                </Button>
              )}
            </div>

            <div className="mt-6 flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-text-muted">
                <BriefcaseBusiness size={18} />
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-text-muted">
                <Code2 size={18} />
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-text-muted">
                <Globe size={18} />
              </span>
            </div>
          </CardBody>
        </Card>

        <Card className="border-[#becabe]">
          <CardBody>
            <h2 className="text-xl font-semibold text-text">{isId ? 'Tentang Saya' : 'About Me'}</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-6 text-text-muted">
              {user?.bio ||
                (isId
                  ? 'Tambahkan ringkasan profesional di halaman pengaturan.'
                  : 'Add a professional summary from the settings page.')}
            </p>
          </CardBody>
        </Card>

        <Card className="border-[#becabe]">
          <CardBody>
            <h2 className="text-xl font-semibold text-text">
              {isId ? 'Keahlian & Ekspertise' : 'Skills & Expertise'}
            </h2>
            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-muted">
                Technical
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {technicalSkills.map((skill, index) => (
                  <Pill key={skill} accent={index > 1}>
                    {skill}
                  </Pill>
                ))}
              </div>
            </div>
            <div className="mt-5">
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-muted">
                Interpersonal
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {interpersonalSkills.map((skill) => (
                  <Pill key={skill}>{skill}</Pill>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </aside>

      <section className="space-y-6">
        <Card className="border-[#becabe]">
          <CardBody>
            <div className="flex items-center gap-2">
              <BriefcaseBusiness size={20} className="text-brand" />
              <h2 className="text-2xl font-semibold text-text">
                {isId ? 'Pengalaman' : 'Experience'}
              </h2>
            </div>
            <div className="mt-6 space-y-8">
              {loadingEntries ? (
                <p className="text-sm text-text-muted">{isId ? 'Memuat...' : 'Loading...'}</p>
              ) : experienceEntries.length > 0 ? (
                experienceEntries.map((entry) => <TimelineEntry key={entry.id} entry={entry} />)
              ) : (
                <p className="text-sm text-text-muted">
                  {isId ? 'Belum ada pengalaman yang ditampilkan.' : 'No experience to display yet.'}
                </p>
              )}
            </div>
          </CardBody>
        </Card>

        <Card className="border-[#becabe]">
          <CardBody>
            <div className="flex items-center gap-2">
              <FolderKanban size={20} className="text-brand" />
              <h2 className="text-2xl font-semibold text-text">
                {isId ? 'Proyek Unggulan' : 'Featured Projects'}
              </h2>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {loadingEntries ? (
                <p className="text-sm text-text-muted">{isId ? 'Memuat...' : 'Loading...'}</p>
              ) : projectEntries.length > 0 ? (
                projectEntries.map((entry) => <ProjectCard key={entry.id} entry={entry} />)
              ) : (
                <p className="text-sm text-text-muted md:col-span-2">
                  {isId ? 'Belum ada proyek yang ditampilkan.' : 'No projects to display yet.'}
                </p>
              )}
            </div>
          </CardBody>
        </Card>
      </section>
    </motion.div>
  );
}
