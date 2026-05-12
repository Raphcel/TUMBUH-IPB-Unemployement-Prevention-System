import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../api/admin';
import { Trash2, Building2, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 20;

export function CompanyManagement() {
  const [companies, setCompanies] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = useCallback(() => {
    setLoading(true);
    adminApi
      .listCompanies(page * PAGE_SIZE, PAGE_SIZE)
      .then((data) => {
        setCompanies(data.items || []);
        setTotal(data.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const deleteCompany = async (companyId) => {
    if (!confirm('Yakin hapus perusahaan ini? Semua lowongan terkait juga akan dihapus.')) return;
    try {
      await adminApi.deleteCompany(companyId);
      fetchCompanies();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Perusahaan</h1>
        <p className="text-gray-500 mt-1">Lihat dan kelola semua perusahaan yang terdaftar</p>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Perusahaan</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Industri</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Lokasi</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Karyawan</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Rating</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand mx-auto" />
                  </td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                    Tidak ada perusahaan ditemukan.
                  </td>
                </tr>
              ) : (
                companies.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center p-1 bg-white shrink-0">
                          {c.logo ? (
                            <img src={c.logo} alt={c.name} className="w-full h-full object-contain" />
                          ) : (
                            <Building2 size={16} className="text-gray-400" />
                          )}
                        </div>
                        <span className="font-medium text-gray-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{c.industry}</td>
                    <td className="px-5 py-3.5 text-gray-500">{c.location}</td>
                    <td className="px-5 py-3.5 text-gray-500">{c.employee_count?.toLocaleString() || '—'}</td>
                    <td className="px-5 py-3.5">
                      {c.rating ? (
                        <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                          ★ {c.rating.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => deleteCompany(c.id)}
                          title="Hapus"
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Menampilkan {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} dari {total}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
