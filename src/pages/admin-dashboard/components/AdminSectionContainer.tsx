import React from 'react';
import { User, Generus } from '@/types/admin';
import { AdminSectionId } from '@/config/adminSections';
import { renderAdminSection } from '../mappers/adminSectionMapper';
import { AdminDashboardDataModel } from '../hooks/useAdminDashboardData';

interface AdminSectionContainerProps {
  activeSection: AdminSectionId;
  currentUser: User | null;
  detailKelasId: string | null;
  periode: {
    startMonth: string;
    startYear: string;
    endMonth: string;
    endYear: string;
  };
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
  onImportGenerus: (data: Omit<Generus, 'id'>[]) => Promise<boolean>;
  onViewDetail: (kelasId: string) => void;
  onBackFromDetail: () => void;
  data: AdminDashboardDataModel;
}

export default function AdminSectionContainer(props: AdminSectionContainerProps) {
  return <>{renderAdminSection(props)}</>;
}
