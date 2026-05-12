import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { companiesApi } from '../api/companies';
import { opportunitiesApi } from '../api/opportunities';
import { MapPin, Globe, Users, Star, Bookmark, ChevronRight, Building2 } from 'lucide-react';

const TABS = ['Tentang', 'Lowongan', 'Ulasan'];

export function DetailPerusahaan() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [companyJobs, setCompanyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Tentang');

  useEffect(() => {
    Promise.all([companiesApi.get(id), opportunitiesApi.listByCompany(id)])
      .then(([compData, oppData]) => {
        setCompany(compData);
        setCompanyJobs(Array.isArray(oppData) ? oppData : oppData.items || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
      </div>
    );
  }

  if (!company) {
    return <div className="py-20 text-center text-gray-500">Perusahaan tidak ditemukan.</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/perusahaan" className="hover:text-brand transition-colors">Perusahaan</Link>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium">{company.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ── Company header card ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Logo */}
            <div className="w-24 h-24 rounded-xl border border-gray-200 flex items-center justify-center p-3 bg-white shadow-sm shrink-0">
              {company.logo
                ? <img src={company.logo} alt={company.name} className="w-full h-full object-contain" />
                : <span className="text-3xl font-bold text-gray-400">{company.name?.[0]}</span>
              }
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">{company.name}</h1>
                  <p className="text-gray-500 mb-3">{company.industry}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    {company.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-gray-400" /> {company.location}
                      </span>
                    )}
                    {company.employee_count && (
                      <span className="flex items-center gap-1.5">
                        <Users size={14} className="text-gray-400" /> {company.employee_count}
                      </span>
                    )}
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-brand hover:underline"
                      >
                        <Globe size={14} /> {company.website.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button className="px-4 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-brand hover:text-brand transition-colors">
                    Ikuti
                  </button>
                  {company.rating && (
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <span className="text-2xl font-bold text-gray-900">{company.rating}</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={16}
                              className={s <= Math.round(company.rating) ? 'text-yellow-400' : 'text-gray-200'}
                              fill={s <= Math.round(company.rating) ? 'currentColor' : 'none'}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">98% Merekomendasikan</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 border-t border-gray-100 pt-2">
            <nav className="flex overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`mr-8 pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'text-brand border-brand'
                      : 'text-gray-500 border-transparent hover:text-gray-800'
                  }`}
                >
                  {tab}{tab === 'Lowongan' ? ` (${companyJobs.length})` : ''}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* ── Tab content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left main content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'Tentang' && (
              <>
                {/* About company */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Tentang Perusahaan</h2>
                  <p className="text-gray-600 leading-relaxed">{company.description}</p>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-6 mt-6">
                    {company.industry && (
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Building2 size={12} /> INDUSTRI
                        </p>
                        <p className="text-sm font-medium text-gray-900">{company.industry}</p>
                      </div>
                    )}
                    {company.founded && (
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">DIDIRIKAN</p>
                        <p className="text-sm font-medium text-gray-900">{company.founded}</p>
                      </div>
                    )}
                    {company.employee_count && (
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Users size={12} /> UKURAN PERUSAHAAN
                        </p>
                        <p className="text-sm font-medium text-gray-900">{company.employee_count}</p>
                      </div>
                    )}
                    {company.location && (
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <MapPin size={12} /> LOKASI
                        </p>
                        <p className="text-sm font-medium text-gray-900">{company.location}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Why join */}
                {company.why_join && Array.isArray(company.why_join) && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Mengapa Bergabung dengan {company.name}?</h2>
                    <ul className="space-y-2">
                      {company.why_join.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="text-brand mt-0.5">✓</span> {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {activeTab === 'Lowongan' && (
              <div className="space-y-4">
                {companyJobs.length > 0 ? (
                  companyJobs.map((job) => (
                    <Link
                      key={job.id}
                      to={`/lowongan/${job.id}`}
                      className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-brand hover:shadow-sm transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{job.title}</h3>
                          <p className="text-xs text-gray-500 flex items-center gap-2">
                            <span>{job.location}</span>
                            {job.work_mode && <><span className="w-1 h-1 bg-gray-300 rounded-full" /><span>{job.work_mode}</span></>}
                          </p>
                          <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-brand/10 text-brand rounded-full font-medium">
                            {job.type}
                          </span>
                        </div>
                        <Bookmark size={18} className="text-gray-300 hover:text-gray-500 transition-colors" />
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="bg-white rounded-xl border border-dashed border-gray-200 py-12 text-center">
                    <p className="text-gray-400 italic text-sm">Tidak ada lowongan aktif saat ini.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Ulasan' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Ulasan Karyawan</h2>
                  <button className="text-sm text-brand font-medium hover:underline">Tulis Ulasan</button>
                </div>
                {company.rating && (
                  <div className="flex items-start gap-8 flex-wrap">
                    <div className="text-center">
                      <p className="text-5xl font-bold text-gray-900">{company.rating}</p>
                      <div className="flex justify-center mt-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={16} className={s <= Math.round(company.rating) ? 'text-yellow-400' : 'text-gray-200'} fill={s <= Math.round(company.rating) ? 'currentColor' : 'none'} />
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 italic">Belum ada ulasan yang tersedia.</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right sidebar: active jobs */}
          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Lowongan Aktif</h3>
                <span className="text-brand font-semibold text-sm">{companyJobs.length}</span>
              </div>
              <div className="space-y-4">
                {companyJobs.slice(0, 3).map((job) => (
                  <Link key={job.id} to={`/lowongan/${job.id}`} className="block group">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-brand transition-colors">{job.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{job.location}{job.work_mode ? `, ${job.work_mode}` : ''}</p>
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                          {job.type}
                        </span>
                      </div>
                      <Bookmark size={16} className="text-gray-300 hover:text-gray-500 transition-colors mt-1 shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
              {companyJobs.length > 3 && (
                <button
                  onClick={() => setActiveTab('Lowongan')}
                  className="mt-4 w-full text-center text-sm text-brand font-medium hover:underline"
                >
                  Lihat semua {companyJobs.length} lowongan →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
