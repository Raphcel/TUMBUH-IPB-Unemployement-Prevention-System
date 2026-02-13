import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
import { ProfilStudent } from './pages/student/Profil';

import { HRDashboard } from './pages/hr/Dashboard';
import { KelolaLowongan } from './pages/hr/KelolaLowongan';
import { Pelamar } from './pages/hr/Pelamar';
import { ProfilPerusahaanHR } from './pages/hr/ProfilPerusahaan';

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
        <Route path="applicants" element={<Pelamar />} />
        <Route path="company" element={<ProfilPerusahaanHR />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
