import React from 'react';
import Sidebar from '@/components/admin/layout/Sidebar';
import Header from '@/components/admin/layout/Header';
import { User } from '@/types/admin';

interface AdminDashboardLayoutProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  onLogout: () => void;
  currentUser: User | null;
  canAccessFeature: (featureId: string) => boolean;
  title: string;
  theme: 'light' | 'dark' | 'soft' | 'neu' | 'editorial' | 'glass';
  toggleTheme: () => void;
  loading: boolean;
  children: React.ReactNode;
}

export default function AdminDashboardLayout({
  activeSection,
  onSectionChange,
  sidebarOpen,
  setSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
  onLogout,
  currentUser,
  canAccessFeature,
  title,
  theme,
  toggleTheme,
  loading,
  children,
}: AdminDashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={onSectionChange}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        onLogout={onLogout}
        currentUser={currentUser}
        canAccessFeature={canAccessFeature}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={title}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <main className="flex-1 overflow-auto p-6">
          {loading ? <div className="text-center p-8">Memuat data...</div> : children}
        </main>
      </div>
    </div>
  );
}
