import React, { useState } from 'react';
import { Generus, Desa, Kelompok, User } from '@/types/admin';
import GenerusChart from './GenerusChart';
import GenerusTable from './GenerusTable';
import GenerusFilters from './GenerusFilters';
import GenerusActions from './GenerusActions';

interface GenerusSectionProps {
  allGenerus: Generus[];
  desas: Desa[];
  kelompok: Kelompok[];
  newGenerus: Omit<Generus, 'id'>;
  setNewGenerus: React.Dispatch<React.SetStateAction<Omit<Generus, 'id'>>>;
  onAddGenerus: () => Promise<boolean>;
  onImportGenerus: (data: any[]) => Promise<boolean>;
  onUpdateGenerus: (id: string, data: Omit<Generus, 'id'>) => Promise<boolean>;
  onDeleteGenerus: (id: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterCategory: string;
  onFilterCategoryChange: (value: string) => void;
  currentUser: User | null;
}

export default function GenerusSection({ 
  allGenerus,
  desas,
  kelompok,
  newGenerus, 
  setNewGenerus, 
  onAddGenerus,
  onImportGenerus,
  onUpdateGenerus,
  onDeleteGenerus,
  searchTerm, 
  onSearchChange,
  filterCategory,
  onFilterCategoryChange,
  currentUser
}: GenerusSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory]);

  const chartData = React.useMemo(() => {
    const summary: { [key: string]: { name: string; 'Laki-laki': number; 'Perempuan': number } } = {};
    const jenjangOptions = ['Caberawit', 'Pra Remaja', 'Remaja', 'Pra Nikah'];
    
    jenjangOptions.forEach(j => {
      summary[j] = { name: j, 'Laki-laki': 0, 'Perempuan': 0 };
    });

    allGenerus.forEach(g => {
      const jenjang = g.pendidikan === 'Belum sekolah' || g.pendidikan === 'Paud/TK' || 
                      g.pendidikan.startsWith('SD') ? 'Caberawit' :
                      g.pendidikan.startsWith('SMP') ? 'Pra Remaja' :
                      g.pendidikan.startsWith('SMA') ? 'Remaja' : 'Pra Nikah';
                      
      if (summary[jenjang]) {
        summary[jenjang][g.jenisKelamin]++;
      }
    });
    return Object.values(summary);
  }, [allGenerus]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Data Generus</h2>
      <GenerusChart data={chartData} />
      <GenerusFilters
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        filterCategory={filterCategory}
        onFilterCategoryChange={onFilterCategoryChange}
        currentUser={currentUser}
      />
      <GenerusActions
        currentUser={currentUser}
        newGenerus={newGenerus}
        setNewGenerus={setNewGenerus}
        desas={desas}
        kelompok={kelompok}
        onAddGenerus={onAddGenerus}
        onImportGenerus={onImportGenerus}
        allGenerus={allGenerus}
      />
      <GenerusTable
        allGenerus={allGenerus}
        searchTerm={searchTerm}
        filterCategory={filterCategory}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
        onUpdateGenerus={onUpdateGenerus}
        onDeleteGenerus={onDeleteGenerus}
        desas={desas}
        kelompok={kelompok}
      />
    </div>
  );
}