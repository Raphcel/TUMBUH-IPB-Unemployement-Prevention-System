import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { motion } from 'framer-motion';

import { useAuth } from '../context/AuthContext';

import { TopLayout } from '../components/layout/TopLayout';

export function DashboardLayout({ role }) {
  const { user } = useAuth();
  const activeRole = role || user?.role || 'student';
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
      <Sidebar
        role={activeRole}
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <motion.main
        initial={{ opacity: 0, x: 20 }}
        animate={{
          opacity: 1,
          x: 0,
          marginLeft: isSidebarCollapsed ? 80 : 256
        }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, type: 'tween', ease: 'easeOut' }}
        className="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out"
        style={{ marginLeft: isSidebarCollapsed ? 80 : 256 }}
      >
        <TopLayout />
        <div className="p-8">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
}
