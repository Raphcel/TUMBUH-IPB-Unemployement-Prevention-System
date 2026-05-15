import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { opportunitiesApi } from '../api/opportunities';
import { bookmarksApi } from '../api/bookmarks';
import { useAuth } from '../context/AuthContext';
import { MapPin, Bookmark, Search, ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { DetailLowongan } from './DetailLowongan';
import { useTranslation } from '../context/LanguageContext';

const PAGE_SIZE = 12;
const JOB_TYPES = ['All', 'Internship', 'Full-time', 'Scholarship'];
const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'deadline', label: 'Deadline soon' },
];
const INDONESIA_PROVINCES = [
  'Aceh',
  'Bali',
  'Banten',
  'Bengkulu',
  'DI Yogyakarta',
  'DKI Jakarta',
  'Gorontalo',
  'Jambi',
  'Jawa Barat',
  'Jawa Tengah',
  'Jawa Timur',
  'Kalimantan Barat',
  'Kalimantan Selatan',
  'Kalimantan Tengah',
  'Kalimantan Timur',
  'Kalimantan Utara',
  'Kepulauan Bangka Belitung',
  'Kepulauan Riau',
  'Lampung',
  'Maluku',
  'Maluku Utara',
  'Nusa Tenggara Barat',
  'Nusa Tenggara Timur',
  'Papua',
  'Papua Barat',
  'Papua Barat Daya',
  'Papua Pegunungan',
  'Papua Selatan',
  'Papua Tengah',
  'Riau',
  'Sulawesi Barat',
  'Sulawesi Selatan',
  'Sulawesi Tengah',
  'Sulawesi Tenggara',
  'Sulawesi Utara',
  'Sumatera Barat',
  'Sumatera Selatan',
  'Sumatera Utara',
];

export function Lowongan() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [savedJobs, setSavedJobs] = useState([]);

  const [filterType, setFilterType] = useState(searchParams.get('type') || 'All');
  const [filterLocation, setFilterLocation] = useState(searchParams.get('location') || 'All');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'latest');

  const [page, setPage] = useState(0);
  const [allOpportunities, setAllOpportunities] = useState([]);
  const [totalOpportunities, setTotalOpportunities] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const params = {};
    if (searchTerm) params.q = searchTerm;
    if (filterType !== 'All') params.type = filterType;
    if (filterLocation !== 'All') params.location = filterLocation;
    if (sortBy !== 'latest') params.sort = sortBy;
    setSearchParams(params, { replace: true });
  }, [searchTerm, filterType, filterLocation, sortBy, setSearchParams]);

  useEffect(() => {
    setLoading(true);
    opportunitiesApi
      .list(page * PAGE_SIZE, PAGE_SIZE, {
        search: debouncedSearch || undefined,
        type: filterType !== 'All' ? filterType : undefined,
        location: filterLocation !== 'All' ? filterLocation : undefined,
        sort: sortBy,
      })
      .then((oppData) => {
        const opps = Array.isArray(oppData) ? oppData : oppData.items || [];
        const total = oppData.total ?? opps.length;
        setAllOpportunities(opps);
        setTotalOpportunities(total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [debouncedSearch, filterType, filterLocation, sortBy, page]);

  // Auto-select first job
  useEffect(() => {
    if (allOpportunities.length > 0) {
      if (!selectedJobId || !allOpportunities.find(j => j.id === selectedJobId)) {
        setSelectedJobId(allOpportunities[0].id);
      }
    } else {
      setSelectedJobId(null);
    }
  }, [allOpportunities]);

  useEffect(() => { setPage(0); }, [debouncedSearch, filterType, filterLocation, sortBy]);

  useEffect(() => {
    if (!user || user.role !== 'student') return;
    bookmarksApi.mine()
      .then((bks) => {
        const ids = (Array.isArray(bks) ? bks : bks.items || []).map((b) => b.opportunity_id ?? b.id);
        setSavedJobs(ids);
      })
      .catch(() => {});
  }, [user]);

  const totalPages = Math.ceil(totalOpportunities / PAGE_SIZE);

  const toggleSave = async (id) => {
    if (!user || user.role !== 'student') return;
    try {
      if (savedJobs.includes(id)) {
        await bookmarksApi.remove(id);
        setSavedJobs(savedJobs.filter((jid) => jid !== id));
      } else {
        await bookmarksApi.add(id);
        setSavedJobs([...savedJobs, id]);
      }
    } catch (err) {
      console.error('Bookmark error', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setDebouncedSearch(searchTerm);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('All');
    setFilterLocation('All');
    setSortBy('latest');
  };

  // Is a listing "new" (posted within 7 days)?
  const isNew = (job) => {
    if (!job.created_at) return false;
    const diff = (Date.now() - new Date(job.created_at)) / 86400000;
    return diff <= 7;
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days <= 0) return t('low_today', 'Today');
    return `${days}d ago`;
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
        {/* Search + Filters */}
        <section className="mb-6 flex-none">
          <form
            onSubmit={handleSearch}
            className="rounded-2xl border border-surface-border bg-surface p-3 shadow-sm"
          >
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(240px,1fr)_220px_auto]">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-light" />
                <input
                  className="h-11 w-full rounded-xl border border-surface-border bg-white pl-10 pr-4 text-sm"
                  placeholder={t('low_search_ph')}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-light" />
                <select
                  className="h-11 w-full appearance-none rounded-xl border border-surface-border bg-white pl-10 pr-4 text-sm"
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                >
                  <option value="All">{t('low_location_ph')}</option>
                  {INDONESIA_PROVINCES.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
              >
                <Search className="h-4 w-4" />
                {t('low_search_btn')}
              </button>
            </div>

            <div className="mt-3 flex flex-col gap-3 border-t border-surface-border pt-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 pr-2 text-sm font-medium text-text-muted">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filter
                </span>
                {JOB_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFilterType(type)}
                    className={`h-9 rounded-lg border px-3 text-sm font-medium transition-colors ${
                      filterType === type
                        ? 'border-brand bg-brand-muted text-brand-dark'
                        : 'border-surface-border bg-white text-text-muted hover:bg-surface-muted'
                    }`}
                  >
                    {type === 'All' ? t('low_type_all') : type}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-9 items-center gap-2 self-start rounded-lg px-3 text-sm font-medium text-text-muted transition-colors hover:bg-surface-muted hover:text-text lg:self-auto"
              >
                <X className="h-4 w-4" />
                {t('reset')}
              </button>
            </div>
          </form>
        </section>

        {/* Master-Detail Layout */}
        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
          {/* Left: Job listings */}
          <div className="w-full lg:w-1/2 flex flex-col min-h-0 border border-gray-200 rounded-xl bg-white overflow-hidden">
            {/* Results info */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-none bg-gray-50/50">
              <h2 className="text-sm font-medium text-gray-500">
                {loading ? t('loading') : `${t('low_found')} ${totalOpportunities} ${t('low_opportunities')}`}
              </h2>
              <label className="flex items-center gap-2 text-sm text-gray-500">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-8 rounded-lg border border-surface-border bg-white px-2 text-sm text-text"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Job listings */}
            <div className="overflow-y-auto flex-1 custom-scrollbar p-3 space-y-3 bg-gray-50/30">
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
                </div>
              ) : allOpportunities.length > 0 ? (
                allOpportunities.map((job) => (
                  <article
                    key={job.id}
                    onClick={() => setSelectedJobId(job.id)}
                    className={`border rounded-lg p-5 bg-white transition-all cursor-pointer hover:shadow-sm ${
                      selectedJobId === job.id ? 'border-brand ring-1 ring-brand bg-brand/5' : 'border-gray-200 hover:border-brand/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg border border-gray-200 flex items-center justify-center p-2 bg-white shrink-0">
                        {job.company?.logo ? (
                          <img alt={job.company?.name} className="w-full h-full object-contain" src={job.company.logo} />
                        ) : (
                          <span className="text-lg font-bold text-gray-400">{job.company?.name?.[0]}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <h3 className="text-base font-bold text-gray-900 truncate pr-2 hover:text-brand transition-colors">
                            {job.title}
                          </h3>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleSave(job.id); }}
                            className={`transition-colors shrink-0 z-10 ${savedJobs.includes(job.id) ? 'text-brand' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                            <Bookmark className="w-5 h-5" fill={savedJobs.includes(job.id) ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-2 truncate">{job.company?.name}</p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> <span className="truncate max-w-[100px]">{job.location}</span>
                          </span>
                          {job.work_mode && (
                            <><span className="w-1 h-1 bg-gray-300 rounded-full" /><span>{job.work_mode}</span></>
                          )}
                          <span className="w-1 h-1 bg-gray-300 rounded-full" />
                          <span>{job.type}</span>
                        </div>
                        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                          {isNew(job) ? (
                            <span className="bg-green-100 text-brand font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                              ✓ {t('new_badge')}
                            </span>
                          ) : (
                            <span />
                          )}
                          <span>{timeAgo(job.posted_at)}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="py-20 text-center text-gray-500">
                  <p>{t('low_no_results')}</p>
                  <button
                    onClick={clearFilters}
                    className="mt-3 text-brand hover:underline text-sm"
                  >
                    {t('low_clear_filters')}
                  </button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 flex justify-center items-center gap-2 flex-none bg-white">
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-40"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i).map((i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium text-sm transition-colors ${
                      page === i ? 'bg-gray-900 text-white' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                {totalPages > 5 && <span className="text-gray-400 px-1">...</span>}
                {totalPages > 5 && (
                  <button
                    onClick={() => setPage(totalPages - 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors"
                  >
                    {totalPages}
                  </button>
                )}
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Right: Job detail pane */}
          <div className="hidden lg:flex lg:w-1/2 bg-white border border-gray-200 rounded-xl overflow-hidden min-h-0 relative flex-col">
            {selectedJobId ? (
              <DetailLowongan jobId={selectedJobId} isEmbedded={true} />
            ) : (
              <div className="flex items-center justify-center h-full flex-1 text-gray-500 flex-col gap-4">
                <Search className="w-12 h-12 text-gray-300" />
                <p>{t('low_select_detail')}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
