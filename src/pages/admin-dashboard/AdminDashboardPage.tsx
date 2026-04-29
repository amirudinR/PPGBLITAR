import React, { useCallback } from 'react';
import { User, Generus } from '@/types/admin';
import { useTheme } from '@/hooks/useTheme';
import { useFeaturePermissions } from '@/hooks/useFeaturePermissions';
import { SECTION_LABELS } from '@/config/adminSections';
import { useAdminDashboardState } from './hooks/useAdminDashboardState';
import { useAdminDashboardData, AdminDashboardDataModel } from './hooks/useAdminDashboardData';
import AdminDashboardLayout from './components/AdminDashboardLayout';
import AdminSectionContainer from './components/AdminSectionContainer';

interface AdminDashboardPageProps {
  currentUser: User | null;
  handleLogout: () => void;
}

export default function AdminDashboardPage({ currentUser, handleLogout }: AdminDashboardPageProps) {
  const { baseTheme, isDarkMode, toggleDarkMode } = useTheme();
  const { canAccessFeature } = useFeaturePermissions(currentUser);

  const checkFeatureAccess = useCallback(
    (featureId: string): boolean => {
      if (!currentUser) return false;
      return canAccessFeature(featureId, currentUser.role);
    },
    [currentUser, canAccessFeature],
  );

  const {
    activeSection,
    sidebarOpen,
    setSidebarOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
    detailKelasId,
    setDetailKelasId,
    periode,
    searchTerm,
    setSearchTerm,
    filterCategory,
    setFilterCategory,
    startMonth,
    setStartMonth,
    startYear,
    setStartYear,
    endMonth,
    setEndMonth,
    endYear,
    setEndYear,
    setSectionAndPersist,
  } = useAdminDashboardState({ currentUser, checkFeatureAccess });

  const data: AdminDashboardDataModel = useAdminDashboardData({ currentUser, activeSection });

  const handleImportGenerus = useCallback(
    async (records: Omit<Generus, 'id'>[]) => data.importGenerus(records),
    [data],
  );

  const handleViewDetail = useCallback(
    (kelasId: string) => {
      setDetailKelasId(kelasId);
      setSectionAndPersist('detail-pencapaian-kelas');
    },
    [setDetailKelasId, setSectionAndPersist],
  );

  const handleBackFromDetail = useCallback(() => {
    setDetailKelasId(null);
    setSectionAndPersist('rekap-per-kelas');
  }, [setDetailKelasId, setSectionAndPersist]);

  const title = SECTION_LABELS[activeSection] ?? 'Dashboard';

  return (
    <AdminDashboardLayout
      activeSection={activeSection}
      onSectionChange={setSectionAndPersist}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      sidebarCollapsed={sidebarCollapsed}
      setSidebarCollapsed={setSidebarCollapsed}
      onLogout={handleLogout}
      currentUser={currentUser}
      canAccessFeature={checkFeatureAccess}
      title={title}
      baseTheme={baseTheme}
      isDarkMode={isDarkMode}
      toggleDarkMode={toggleDarkMode}
      loading={data.loading}
      onNavigate={setSectionAndPersist}
    >
      <AdminSectionContainer
        activeSection={activeSection}
        currentUser={currentUser}
        detailKelasId={detailKelasId}
        periode={periode}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        startMonth={startMonth}
        setStartMonth={setStartMonth}
        startYear={startYear}
        setStartYear={setStartYear}
        endMonth={endMonth}
        setEndMonth={setEndMonth}
        endYear={endYear}
        setEndYear={setEndYear}
        onImportGenerus={handleImportGenerus}
        onViewDetail={handleViewDetail}
        onBackFromDetail={handleBackFromDetail}
        onNavigate={setSectionAndPersist}
        data={data}
      />
    </AdminDashboardLayout>
  );
}
