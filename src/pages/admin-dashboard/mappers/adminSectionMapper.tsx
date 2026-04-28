import React from 'react';
import { User, Generus } from '@/types/admin';
import { AdminDashboardDataModel } from '../hooks/useAdminDashboardData';
import { AdminSectionId } from '@/config/adminSections';
import AttendanceSection from '@/components/admin/kehadiran/AttendanceSection';
import AccountsSection from '@/components/admin/akun/AccountsSection';
import GenerusSection from '@/components/admin/generus/GenerusSection';
import DesaSection from '@/components/admin/desa/DesaSection';
import KelompokSection from '@/components/admin/kelompok/KelompokSection';
import DashboardSection from '@/components/admin/dashboard/DashboardSection';
import M5USection from '@/components/admin/m5u/M5USection';
import GuruSection from '@/components/admin/guru/GuruSection';
import KelasSection from '@/components/admin/kelas/KelasSection';
import ProfileSection from '@/components/admin/profil/ProfileSection';
import MonthlyAttendanceSection from '@/components/admin/kehadiran/MonthlyAttendanceSection';
import StudentAttendanceRecapSection from '@/components/admin/kehadiran/StudentAttendanceRecapSection';
import NilaiGenerusSection from '@/components/admin/nilai/NilaiGenerusSection';
import RekapNilaiSection from '@/components/admin/nilai/RekapNilaiSection';
import AnnouncementsSection from '@/components/admin/pengumuman/AnnouncementsSection';
import GuruDashboardStats from '@/components/admin/dashboard/GuruDashboardStats';
import M5USearchPage from '@/pages/M5USearchPage';
import TargetBulananSection from '@/components/admin/target-materi/TargetBulananSection';
import RekapPerKelasSection from '@/components/admin/target-materi/RekapPerKelasSection';
import DetailPencapaianKelas from '@/components/admin/target-materi/DetailPencapaianKelas';
import LatihanASADSection from '@/components/admin/laporan/LatihanASADSection';
import JariyahPPGSection from '@/components/admin/laporan/JariyahPPGSection';
import FeaturePermissionsSection from '@/components/admin/pengaturan/FeaturePermissionsSection';
import SettingsSection from '@/components/admin/pengaturan/SettingsSection';

interface SectionMapperParams {
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

export function renderAdminSection({
  activeSection,
  currentUser,
  detailKelasId,
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
  onImportGenerus,
  onViewDetail,
  onBackFromDetail,
  data,
}: SectionMapperParams): React.ReactNode {
  switch (activeSection) {
    case 'dashboard':
      if (currentUser?.role === 'guru') {
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-3xl font-bold tracking-tight">Assalamualaikum, {currentUser.name}</h2>
              <p className="text-muted-foreground">Selamat datang di dasbor Anda sebagai Guru.</p>
            </div>
            <GuruDashboardStats
              kelas={data.kelas}
              generusData={data.generus}
              attendance={data.attendance}
              materials={data.materials}
              grades={data.grades}
            />
          </div>
        );
      }

      return (
        <DashboardSection
          stats={{
            generus: data.generus.length,
            desa: data.desas.length,
            kelompok: data.kelompok.length,
            users: data.users.length,
            gurus: data.gurus.length,
            kelas: data.kelas.length,
          }}
          generusData={data.generus}
          currentUser={currentUser}
          attendance={data.attendance}
          kelas={data.kelas}
          materials={data.materials}
          grades={data.grades}
          announcements={data.announcements}
        />
      );
    case 'generus':
      return (
        <GenerusSection
          allGenerus={data.generus}
          desas={data.desas}
          kelompok={data.kelompok}
          newGenerus={data.newGenerus}
          setNewGenerus={data.setNewGenerus}
          onAddGenerus={data.addGenerus}
          onImportGenerus={onImportGenerus}
          onUpdateGenerus={data.updateGenerus}
          onDeleteGenerus={data.deleteGenerus}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterCategory={filterCategory}
          onFilterCategoryChange={setFilterCategory}
          currentUser={currentUser}
        />
      );
    case 'desa':
      return <DesaSection desas={data.desas} onAddDesa={data.addDesa} onUpdateDesa={data.updateDesa} onDeleteDesa={data.deleteDesa} />;
    case 'kelompok':
      return <KelompokSection kelompok={data.kelompok} desas={data.desas} onAddKelompok={data.addKelompok} onUpdateKelompok={data.updateKelompok} onDeleteKelompok={data.deleteKelompok} />;
    case 'akun':
      return <AccountsSection users={data.users} desas={data.desas} kelompok={data.kelompok} onAddUser={data.addUser} onUpdateUser={data.updateUser} onDeleteUser={data.deleteUser} currentUser={currentUser} />;
    case 'dataguru':
      return <GuruSection gurus={data.gurus} onAddGuru={data.addGuru} onUpdateGuru={data.updateGuru} onDeleteGuru={data.deleteGuru} currentUser={currentUser} desas={data.desas} kelompok={data.kelompok} />;
    case 'datakelas':
      return <KelasSection kelas={data.kelas} gurus={data.gurus} generus={data.generus} onAddKelas={data.addKelas} onUpdateKelas={data.updateKelas} onDeleteKelas={data.deleteKelas} currentUser={currentUser} desas={data.desas} kelompok={data.kelompok} />;
    case 'rekap-kelas':
      return <AttendanceSection attendance={data.attendance} desas={data.desas} generusData={data.generus} kelas={data.kelas} startMonth={startMonth} setStartMonth={setStartMonth} startYear={startYear} setStartYear={setStartYear} endMonth={endMonth} setEndMonth={setEndMonth} endYear={endYear} setEndYear={setEndYear} currentUser={currentUser} />;
    case 'rekap-siswa':
      return <StudentAttendanceRecapSection attendance={data.attendance} desas={data.desas} kelompok={data.kelompok} kelas={data.kelas} currentUser={currentUser} startMonth={startMonth} setStartMonth={setStartMonth} startYear={startYear} setStartYear={setStartYear} endMonth={endMonth} setEndMonth={setEndMonth} endYear={endYear} setEndYear={setEndYear} />;
    case 'kehadiran-guru':
      return <MonthlyAttendanceSection currentUser={currentUser} gurus={data.gurus} kelas={data.kelas} generus={data.generus} />;
    case 'input-nilai':
      return <NilaiGenerusSection currentUser={currentUser} kelas={data.kelas} generus={data.generus} materials={data.materials} />;
    case 'rekap-nilai':
      return <RekapNilaiSection currentUser={currentUser} kelas={data.kelas} generus={data.generus} materials={data.materials} startMonth={startMonth} setStartMonth={setStartMonth} startYear={startYear} setStartYear={setStartYear} endMonth={endMonth} setEndMonth={setEndMonth} endYear={endYear} setEndYear={setEndYear} />;
    case 'pengumuman':
      return <AnnouncementsSection announcements={data.announcements} onAdd={data.addAnnouncement} onUpdate={data.updateAnnouncement} onDelete={data.deleteAnnouncement} />;
    case 'm5u':
      return <M5USection currentUser={currentUser} />;
    case 'cari-hasil-m5u':
      return <M5USearchPage currentUser={currentUser} />;
    case 'latihan-asad':
      return <LatihanASADSection currentUser={currentUser} generus={data.generus} />;
    case 'jariyah-ppg':
      return <JariyahPPGSection currentUser={currentUser} generus={data.generus} />;
    case 'profile':
      return <ProfileSection currentUser={currentUser} onUpdatePassword={data.updateCurrentUserPassword} />;
    case 'target-bulanan':
      return <TargetBulananSection kelas={data.kelas} materials={data.materials} currentUser={currentUser} />;
    case 'rekap-per-kelas':
      return <RekapPerKelasSection kelas={data.kelas} materials={data.materials} grades={data.grades} currentUser={currentUser} onViewDetail={onViewDetail} />;
    case 'detail-pencapaian-kelas': {
      const selectedKelas = data.kelas.find((k) => k.id === detailKelasId);
      return <DetailPencapaianKelas kelas={selectedKelas} generus={data.generus} materials={data.materials} grades={data.grades} onBack={onBackFromDetail} startDate={{ month: periode.startMonth, year: periode.startYear }} endDate={{ month: periode.endMonth, year: periode.endYear }} />;
    }
    case 'akses-fitur':
      return <FeaturePermissionsSection currentUser={currentUser} />;
    case 'pengaturan':
      return <SettingsSection />;
    default:
      return <div className="text-center p-8">Pilih menu untuk memulai.</div>;
  }
}
