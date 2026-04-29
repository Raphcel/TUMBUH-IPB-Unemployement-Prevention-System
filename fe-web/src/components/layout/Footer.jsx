import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../context/LanguageContext';

export function Footer() {
  const { lang } = useTranslation();
  const copy = lang === 'id'
    ? {
        description: 'Platform karir mahasiswa untuk mempersiapkan masa depan yang lebih cerah.',
        student: 'Mahasiswa',
        findJobs: 'Cari Lowongan',
        careerGuide: 'Panduan Karir',
        companyProfile: 'Profil Perusahaan',
        company: 'Perusahaan',
        partner: 'Daftar Partner',
        recruitment: 'Solusi Rekrutmen',
        contact: 'Hubungi Kami',
        rights: 'Hak cipta dilindungi.',
      }
    : {
        description: 'A student career platform built to help prepare for a stronger professional future.',
        student: 'Students',
        findJobs: 'Find Opportunities',
        careerGuide: 'Career Guide',
        companyProfile: 'Company Profiles',
        company: 'Companies',
        partner: 'Become a Partner',
        recruitment: 'Recruitment Solutions',
        contact: 'Contact Us',
        rights: 'All rights reserved.',
      };

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
              {copy.description}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold leading-6 text-primary">
              {copy.student}
            </h3>
            <ul role="list" className="mt-6 space-y-4">
              <li>
                <Link
                  to="/lowongan"
                  className="text-sm leading-6 text-gray-600 hover:text-primary"
                >
                  {copy.findJobs}
                </Link>
              </li>
              <li>
                <Link
                  to="/panduan"
                  className="text-sm leading-6 text-gray-600 hover:text-primary"
                >
                  {copy.careerGuide}
                </Link>
              </li>
              <li>
                <Link
                  to="/perusahaan"
                  className="text-sm leading-6 text-gray-600 hover:text-primary"
                >
                  {copy.companyProfile}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold leading-6 text-primary">
              {copy.company}
            </h3>
            <ul role="list" className="mt-6 space-y-4">
              <li>
                <Link
                  to="/register"
                  className="text-sm leading-6 text-gray-600 hover:text-primary"
                >
                  {copy.partner}
                </Link>
              </li>
              <li>
                <Link
                  to="/panduan"
                  className="text-sm leading-6 text-gray-600 hover:text-primary"
                >
                  {copy.recruitment}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold leading-6 text-primary">
              {copy.contact}
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
            &copy; 2026 Tumbuh IPB. {copy.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
