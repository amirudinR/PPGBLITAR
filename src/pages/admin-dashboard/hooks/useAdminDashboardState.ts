import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User } from '@/types/admin';
import { AdminSectionId, getAccessibleSections, isValidAdminSection } from '@/config/adminSections';

interface UseAdminDashboardStateParams {
  currentUser: User | null;
  checkFeatureAccess: (featureId: string) => boolean;
}

export function useAdminDashboardState({ currentUser, checkFeatureAccess }: UseAdminDashboardStateParams) {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedSection = searchParams.get('section');

  const [activeSection, setActiveSection] = useState<AdminSectionId>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [detailKelasId, setDetailKelasId] = useState<string | null>(null);
  const [periode] = useState({
    startMonth: (new Date().getMonth() + 1).toString().padStart(2, '0'),
    startYear: new Date().getFullYear().toString(),
    endMonth: (new Date().getMonth() + 1).toString().padStart(2, '0'),
    endYear: new Date().getFullYear().toString(),
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('name');

  const [startMonth, setStartMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [startYear, setStartYear] = useState(new Date().getFullYear().toString());
  const [endMonth, setEndMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [endYear, setEndYear] = useState(new Date().getFullYear().toString());

  const accessibleSections = useMemo<AdminSectionId[]>(() => {
    if (!currentUser) return ['dashboard'];
    const sections = getAccessibleSections(currentUser.role, checkFeatureAccess);
    return sections.length > 0 ? sections : ['dashboard'];
  }, [currentUser, checkFeatureAccess]);

  useEffect(() => {
    if (!requestedSection || !isValidAdminSection(requestedSection)) {
      const fallback = accessibleSections[0] || 'dashboard';
      setActiveSection(fallback);
      setSearchParams({ section: fallback }, { replace: true });
      return;
    }

    const isAllowedDetailSection =
      requestedSection === 'detail-pencapaian-kelas' &&
      accessibleSections.includes('rekap-per-kelas');

    if (!accessibleSections.includes(requestedSection) && !isAllowedDetailSection) {
      const fallback = accessibleSections[0] || 'dashboard';
      setActiveSection(fallback);
      setSearchParams({ section: fallback }, { replace: true });
      return;
    }

    setActiveSection(requestedSection);
  }, [requestedSection, accessibleSections, setSearchParams]);

  const setSectionAndPersist = useCallback(
    (section: string) => {
      const safeSection: AdminSectionId = isValidAdminSection(section) ? section : 'dashboard';
      setActiveSection(safeSection);
      setSearchParams({ section: safeSection }, { replace: true });
    },
    [setSearchParams],
  );

  return {
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
    accessibleSections,
  };
}

export type AdminDashboardStateModel = ReturnType<typeof useAdminDashboardState>;
