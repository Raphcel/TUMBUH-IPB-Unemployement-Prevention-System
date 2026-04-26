import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

import { Beranda } from './pages/Beranda';
import { Lowongan } from './pages/Lowongan';
import { DetailLowongan } from './pages/DetailLowongan';
import { Perusahaan } from './pages/Perusahaan';
import { DetailPerusahaan } from './pages/DetailPerusahaan';
import { Panduan } from './pages/Panduan';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

import { StudentDashboard } from './pages/student/Dashboard';
import { LamaranSaya } from './pages/student/LamaranSaya';
import { Bookmarks } from './pages/student/Bookmarks';
import { ProfilStudent } from './pages/student/Profil';

import { HRDashboard } from './pages/hr/Dashboard';
import { Calendar } from './pages/Calendar';
import { KelolaLowongan } from './pages/hr/KelolaLowongan';
import { Pelamar } from './pages/hr/Pelamar';
import { ProfilPerusahaanHR } from './pages/hr/ProfilPerusahaan';
import { FormLowongan } from './pages/hr/FormLowongan';
import { Notifications } from './pages/Notifications';

/**
 * ErrorBoundary — catches render errors and shows a fallback UI.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Terjadi Kesalahan</h1>
          <p className="text-gray-600 mb-8 text-center max-w-md">
            Maaf, terjadi kesalahan yang tidak terduga. Silakan muat ulang halaman.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#0f2854] text-white rounded-lg hover:bg-[#0f2854]/90 transition-colors"
          >
            Muat Ulang
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * NotFound — 404 page for unmatched routes.
 */
function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <h1 className="text-7xl font-bold text-[#0f2854] mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Halaman Tidak Ditemukan</h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Halaman yang Anda cari tidak ada atau telah dipindahkan.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-[#0f2854] text-white rounded-lg hover:bg-[#0f2854]/90 transition-colors"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}

/**
 * ProtectedRoute — redirects to /login if unauthenticated, or to a
 * role-specific dashboard when the user's role doesn't match.
 */
function ProtectedRoute({ allowedRole, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f2854]" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRole && user.role !== allowedRole) {
    const dest = user.role === 'hr' ? '/hr/dashboard' : '/student/dashboard';
    return <Navigate to={dest} replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Beranda />} />
        <Route path="/lowongan" element={<Lowongan />} />
        <Route path="/lowongan/:id" element={<DetailLowongan />} />
        <Route path="/perusahaan" element={<Perusahaan />} />
        <Route path="/perusahaan/:id" element={<DetailPerusahaan />} />
        <Route path="/panduan" element={<Panduan />} />
      </Route>

      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Shared Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>

      {/* Student Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRole="student">
            <DashboardLayout role="student" />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="applications" element={<LamaranSaya />} />
        <Route path="bookmarks" element={<Bookmarks />} />
        <Route path="profile" element={<ProfilStudent />} />
      </Route>

      {/* HR Routes */}
      <Route
        path="/hr"
        element={
          <ProtectedRoute allowedRole="hr">
            <DashboardLayout role="hr" />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<HRDashboard />} />
        <Route path="opportunities" element={<KelolaLowongan />} />
        <Route path="lowongan/baru" element={<FormLowongan />} />
        <Route path="opportunities/:id/edit" element={<FormLowongan />} />
        <Route path="applicants" element={<Navigate to="/hr/opportunities" replace />} />
        <Route path="company" element={<ProfilPerusahaanHR />} />
        <Route path="calendar" element={<Calendar />} />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
