import React, { useState, useMemo, useEffect } from 'react';
import { Generus, Desa, Kelompok } from '@/types/admin';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import GenerusImportDialog from './GenerusImportDialog';
import GenerusActionButtons from './GenerusActionButtons';
import AddGenerusDialog from './AddGenerusDialog';
import { handleExport, handleDownloadTemplate } from '@/utils/generusExcelUtils';

interface GenerusActionsProps {
  currentUser: any;
  newGenerus: Omit<Generus, 'id'>;
  setNewGenerus: React.Dispatch<React.SetStateAction<Omit<Generus, 'id'>>>;
  desas: Desa[];
  kelompok: Kelompok[];
  onAddGenerus: () => Promise<boolean>;
  onImportGenerus: (data: any[]) => Promise<boolean>;
  allGenerus: Generus[];
}

export default function GenerusActions({
  currentUser,
  newGenerus,
  setNewGenerus,
  desas,
  kelompok,
  onAddGenerus,
  onImportGenerus,
  allGenerus
}: GenerusActionsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  // Set default desa and kelompok based on currentUser for PJP kelompok
  useEffect(() => {
    if (currentUser?.role === 'kelompok' && currentUser.desa && currentUser.kelompok) {
      setNewGenerus(prev => ({
        ...prev,
        desa: currentUser.desa,
        kelompok: currentUser.kelompok
      }));
    }
  }, [currentUser, setNewGenerus]);

  const handleNewInputChange = (field: keyof typeof newGenerus, value: string | number) => {
    setNewGenerus(prev => ({ ...prev, [field]: value }));
  };

  const handleNewSelectChange = (field: keyof typeof newGenerus, value: string) => {
    setNewGenerus(prev => ({ ...prev, [field]: value as any }));
  };

  const handleNewDesaChange = (desaName: string) => {
    setNewGenerus(prev => ({ ...prev, desa: desaName, kelompok: '' }));
  };

  const filteredKelompokForNew = useMemo(() => {
    if (!newGenerus.desa) return [];
    return kelompok.filter(k => k.desaName === newGenerus.desa);
  }, [newGenerus.desa, kelompok]);

  const handleSave = async () => {
    const success = await onAddGenerus();
    if (success) {
      setIsAddDialogOpen(false);
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div></div> {/* Spacer for alignment */}
      <div className="flex items-center gap-2">
        {(currentUser?.role === 'kelompok' || currentUser?.role === 'admin' || currentUser?.role === 'adminsuper') && (
          <GenerusActionButtons
            currentUser={currentUser}
            onDownloadTemplate={handleDownloadTemplate}
            onImportExcel={() => setIsImportDialogOpen(true)}
            onExportExcel={() => handleExport(allGenerus)}
          />
        )}
        <AddGenerusDialog
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          newGenerus={newGenerus}
          onInputChange={handleNewInputChange}
          onSelectChange={handleNewSelectChange}
          onDesaChange={handleNewDesaChange}
          onSave={handleSave}
          filteredKelompok={filteredKelompokForNew}
          currentUser={currentUser}
          desas={desas}
          allGenerus={allGenerus}
        />
        
        <GenerusImportDialog
          isOpen={isImportDialogOpen}
          onClose={() => setIsImportDialogOpen(false)}
          onImport={onImportGenerus}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}