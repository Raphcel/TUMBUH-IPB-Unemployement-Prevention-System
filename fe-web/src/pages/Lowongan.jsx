import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { opportunitiesApi } from '../api/opportunities';
import { companiesApi } from '../api/companies';
import { bookmarksApi } from '../api/bookmarks';
import { useAuth } from '../context/AuthContext';
import { MapPin, Bookmark, Search, ChevronLeft, ChevronRight, SlidersHorizontal, ChevronDown, Banknote } from 'lucide-react';
import { DetailLowongan } from './DetailLowongan';

const PAGE_SIZE = 12;

export function Lowongan() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [locationTerm, setLocationTerm] = useState(searchParams.get('location') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [savedJobs, setSavedJobs] = useState([]);

  const [filterType, setFilterType] = useState(searchParams.get('type') || 'All');
  const [filterLocation, setFilterLocation] = useState(searchParams.get('location') || 'All');
  const [filterCompany, setFilterCompany] = useState(searchParams.get('company') || 'All');

  const [page, setPage] = useState(0);
  const [allOpportunities, setAllOpportunities] = useState([]);
  const [totalOpportunities, setTotalOpportunities] = useState(0);
  const [allCompanies, setAllCompanies] = useState([]);
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
    if (filterCompany !== 'All') params.company = filterCompany;
    setSearchParams(params, { replace: true });
  }, [searchTerm, filterType, filterLocation, filterCompany, setSearchParams]);

  useEffect(() => {
    companiesApi.list(0, 100)
      .then((compData) => {
        const comps = Array.isArray(compData) ? compData : compData.items || [];
        setAllCompanies(comps);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    opportunitiesApi
      .list(page * PAGE_SIZE, PAGE_SIZE, {
        search: debouncedSearch || undefined,
        type: filterType !== 'All' ? filterType : undefined,
        location: filterLocation !== 'All' ? filterLocation : undefined,
      })
      .then((oppData) => {
        const opps = Array.isArray(oppData) ? oppData : oppData.items || [];
        const total = oppData.total ?? opps.length;
        setAllOpportunities(opps);
        setTotalOpportunities(total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [debouncedSearch, filterType, filterLocation, page]);

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

  useEffect(() => { setPage(0); }, [debouncedSearch, filterType, filterLocation, filterCompany]);

  useEffect(() => {
    if (!user || user.role !== 'student') return;
    bookmarksApi.mine()
      .then((bks) => {
        const ids = (Array.isArray(bks) ? bks : bks.items || []).map((b) => b.opportunity_id ?? b.id);
        setSavedJobs(ids);
      })
      .catch(() => {});
  }, [user]);

  const filteredJobs = filterCompany === 'All'
    ? allOpportunities
    : allOpportunities.filter((job) => {
        const jobCompany = job.company?.name || allCompanies.find((c) => c.id === job.company_id)?.name || '';
        return jobCompany === filterCompany;
      });

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
    if (locationTerm) setFilterLocation(locationTerm);
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
    if (days <= 0) return 'Hari ini';
    return `${days} Hari yang lalu`;
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
        {/* Search + Filters */}
        <section className="mb-6 flex-none">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm"
                placeholder="Cari lowongan..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm"
                placeholder="Lokasi"
                type="text"
                value={locationTerm}
                onChange={(e) => setLocationTerm(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="bg-gray-900 text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" /> Cari
            </button>
          </form>

          {/* Filter chips */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {}}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filter
              </button>
              {['All', 'Internship', 'Full-time', 'Part-time', 'Remote'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-medium transition-colors ${
                    filterType === type
                      ? 'border-brand bg-brand/5 text-brand'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {type === 'All' ? 'Tipe Pekerjaan' : type} {filterType === type && type !== 'All' ? null : <ChevronDown className="w-3 h-3" />}
                </button>
              ))}
            </div>
            <button
              onClick={() => { setFilterType('All'); setFilterLocation('All'); setFilterCompany('All'); setSearchTerm(''); setLocationTerm(''); }}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Reset
            </button>
          </div>
        </section>

        {/* Master-Detail Layout */}
        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
          {/* Left: Job listings */}
          <div className="w-full lg:w-1/2 flex flex-col min-h-0 border border-gray-200 rounded-xl bg-white overflow-hidden">
            {/* Results info */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-none bg-gray-50/50">
              <h2 className="text-sm font-medium text-gray-500">
                {loading ? 'Memuat...' : `Ditemukan ${totalOpportunities} peluang`}
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Terbaru</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {/* Job listings */}
            <div className="overflow-y-auto flex-1 custom-scrollbar p-3 space-y-3 bg-gray-50/30">
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
                </div>
              ) : filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
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
                              ✓ Baru
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
                  <p>Tidak ada lowongan yang sesuai.</p>
                  <button
                    onClick={() => { setSearchTerm(''); setFilterType('All'); setFilterLocation('All'); setFilterCompany('All'); }}
                    className="mt-3 text-brand hover:underline text-sm"
                  >
                    Hapus Filter
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
                <p>Pilih lowongan untuk melihat detail</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
