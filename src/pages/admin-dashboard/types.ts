import { AdminSectionId } from '@/config/adminSections';
import { User } from '@/types/admin';

export interface AdminDashboardProps {
  currentUser: User | null;
  handleLogout: () => void;
}

export interface AdminDateRangeState {
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
}

export interface AdminPeriode {
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
}

export interface AdminDashboardState {
  activeSection: AdminSectionId;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  detailKelasId: string | null;
  setDetailKelasId: (id: string | null) => void;
  periode: AdminPeriode;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterCategory: string;
  setFilterCategory: (value: string) => void;
  startMonth: string;
  setStartMonth: (value: string) => void;
  startYear: string;
  setStartYear: (value: string) => void;
  endMonth: string;
  setEndMonth: (value: string) => void;
  endYear: string;
  setEndYear: (value: string) => void;
  setSectionAndPersist: (section: string) => void;
  accessibleSections: AdminSectionId[];
}
