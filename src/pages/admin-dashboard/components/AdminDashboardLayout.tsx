import React from 'react';
import Sidebar from '@/components/admin/layout/Sidebar';
import Header from '@/components/admin/layout/Header';
import MobileBottomNav from '@/components/admin/layout/MobileBottomNav';
import { User } from '@/types/admin';
import { useFCM } from '@/hooks/useFCM';

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
  baseTheme: 'classic' | 'soft' | 'neu' | 'editorial' | 'glass';
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  loading: boolean;
  children: React.ReactNode;
  onNavigate?: (section: string) => void;
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
  baseTheme,
  isDarkMode,
  toggleDarkMode,
  loading,
  children,
  onNavigate,
}: AdminDashboardLayoutProps) {
  useFCM(currentUser);

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
          baseTheme={baseTheme}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          currentUser={currentUser}
          onNavigate={onNavigate}
        />
        <main className="flex-1 overflow-auto p-6 pb-20 lg:pb-6">
          {loading ? <div className="text-center p-8">Memuat data...</div> : children}
        </main>
        <MobileBottomNav
          activeSection={activeSection}
          setActiveSection={onSectionChange}
          currentUser={currentUser}
          canAccessFeature={canAccessFeature}
          onLogout={onLogout}
        />
      </div>
    </div>
  );
}
