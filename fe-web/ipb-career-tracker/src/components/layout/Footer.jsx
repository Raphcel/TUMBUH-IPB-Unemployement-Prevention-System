import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="mb-8 md:mb-0">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-white font-bold text-xl">
                T
              </div>
              <span className="text-xl font-bold text-primary tracking-tight">
                Tumbuh
              </span>
            </Link>
            <p className="text-gray-600 text-sm leading-6 max-w-xs">
              Platform karir mahasiswa untuk mempersiapkan masa depan yang lebih
              cerah.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold leading-6 text-primary">
              Mahasiswa
            </h3>
            <ul role="list" className="mt-6 space-y-4">
              <li>
                <Link
                  to="/lowongan"
                  className="text-sm leading-6 text-gray-600 hover:text-primary"
                >
                  Cari Lowongan
                </Link>
              </li>
              <li>
                <Link
                  to="/panduan"
                  className="text-sm leading-6 text-gray-600 hover:text-primary"
                >
                  Panduan Karir
                </Link>
              </li>
              <li>
                <Link
                  to="/perusahaan"
                  className="text-sm leading-6 text-gray-600 hover:text-primary"
                >
                  Profil Perusahaan
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold leading-6 text-primary">
              Perusahaan
            </h3>
            <ul role="list" className="mt-6 space-y-4">
              <li>
                <Link
                  to="/register-company"
                  className="text-sm leading-6 text-gray-600 hover:text-primary"
                >
                  Daftar Partner
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-sm leading-6 text-gray-600 hover:text-primary"
                >
                  Solusi Rekrutmen
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold leading-6 text-primary">
              Hubungi Kami
            </h3>
            <ul role="list" className="mt-6 space-y-4">
              <li className="text-sm leading-6 text-gray-600">
                support@tumbuh.me
              </li>
              <li className="text-sm leading-6 text-gray-600">
                IPB University, Bogor
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-center text-xs leading-5 text-gray-400">
            &copy; 2026 Tumbuh IPB. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
