import React, { useState, useEffect, useMemo } from 'react';
import { Material, KELAS_MATERI_LIST, JUDUL_MATERI_LIST, SEMESTER_GANJIL_MONTHS, SEMESTER_GENAP_MONTHS, User } from '@/types/admin';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import MaterialsFilter from './MaterialsFilter';
import MaterialsActionButtons from './MaterialsActionButtons';
import MaterialsTable from './MaterialsTable';
import AddMaterialDialog from './AddMaterialDialog';
import EditMaterialDialog from './EditMaterialDialog';
import UploadMaterialDialog from './UploadMaterialDialog';
import { handleDownloadTemplate, handleFileUpload } from '@/utils/materialsExcelUtils';

interface MaterialsSectionProps {
  materials: Material[];
  newMaterial: Omit<Material, 'id'>;
  setNewMaterial: React.Dispatch<React.SetStateAction<Omit<Material, 'id'>>>;
  onAddMaterial: () => Promise<boolean>;
  onUpdateMaterial: (id: string, updatedData: Omit<Material, 'id'>) => Promise<boolean>;
  onDeleteMaterial: (id: string) => void;
  onDeleteMultipleMaterials: (ids: string[]) => void;
  onAddMultipleMaterials: (materials: Omit<Material, 'id'>[]) => Promise<boolean>;
  currentUser: User | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  monthFilter: string[];
  setMonthFilter: (months: string[]) => void;
}

const findCorrectCase = (list: readonly string[], value: string): string | undefined => {
  const lowercasedValue = value.trim().toLowerCase();
  return list.find(item => item.toLowerCase() === lowercasedValue);
};

const filterOptions = [
  { value: 'judulMateri', label: 'Judul Materi' },
  { value: 'rincianMateri', label: 'Rincian Materi' },
  { value: 'kelas', label: 'Kelas' },
  { value: 'semester', label: 'Semester' },
];

const allMonths = [...SEMESTER_GANJIL_MONTHS, ...SEMESTER_GENAP_MONTHS];

export default function MaterialsSection({
  materials, newMaterial, setNewMaterial, onAddMaterial, onUpdateMaterial, onDeleteMaterial,
  onDeleteMultipleMaterials, onAddMultipleMaterials, currentUser, searchTerm, setSearchTerm,
  filterCategory, setFilterCategory, monthFilter, setMonthFilter,
}: MaterialsSectionProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);

  const canEdit = currentUser?.role === 'adminsuper' || currentUser?.role === 'admin';

  const dropdownCategories = ['judulMateri', 'kelas', 'semester'];

  const searchOptions = useMemo(() => {
    if (!dropdownCategories.includes(filterCategory)) return [];
    if (filterCategory === 'semester') return ['Ganjil', 'Genap'];
    
    const uniqueValues = [...new Set(materials.map(item => item[filterCategory as keyof Omit<Material, 'id' | 'targetBulan'>]))];
    return uniqueValues.map(String).sort();
  }, [filterCategory, materials]);

  const filteredMaterials = useMemo(() => {
    let results = materials;
    if (searchTerm) {
      results = results.filter(material => {
        const value = material[filterCategory as keyof Omit<Material, 'id' | 'targetBulan'>];
        if (dropdownCategories.includes(filterCategory)) {
            return String(value) === searchTerm;
        }
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    if (monthFilter.length > 0) {
      results = results.filter(material => {
        const targetBulan = Array.isArray(material.targetBulan) ? material.targetBulan : [String(material.targetBulan)];
        return monthFilter.some(selectedMonth => targetBulan.includes(selectedMonth));
      });
    }
    return results;
  }, [materials, searchTerm, filterCategory, monthFilter]);

  const handleInputChange = (field: keyof typeof newMaterial, value: string) => setNewMaterial(prev => ({ ...prev, [field]: value }));
  const handleSelectChange = (field: keyof typeof newMaterial, value: string | string[]) => setNewMaterial(prev => ({ ...prev, [field]: value as any }));
  useEffect(() => { setNewMaterial(prev => ({ ...prev, targetBulan: [] })); }, [newMaterial.semester, setNewMaterial]);
  const handleAdd = async () => { const success = await onAddMaterial(); if (success) setIsAddDialogOpen(false); };
  const openEditDialog = (material: Material) => {
    const materialToEdit = { ...material };
    const targetBulan = materialToEdit.targetBulan as any;
    if (typeof targetBulan === 'string') materialToEdit.targetBulan = targetBulan.split(',').map((s: string) => s.trim()).filter(Boolean);
    else if (!Array.isArray(targetBulan)) materialToEdit.targetBulan = [];
    setEditingMaterial(materialToEdit);
    setIsEditDialogOpen(true);
  };
  const handleEditChange = (field: keyof Omit<Material, 'id'>, value: string | string[]) => { if (editingMaterial) setEditingMaterial({ ...editingMaterial, [field]: value as any }); };
  const handleUpdate = async () => {
    if (!editingMaterial) return;
    const { id, ...updatedData } = editingMaterial;
    const success = await onUpdateMaterial(id, updatedData);
    if (success) { setIsEditDialogOpen(false); setEditingMaterial(null); }
  };
  const handleSelectAll = (checked: boolean | 'indeterminate') => setSelectedMaterials(checked ? filteredMaterials.map(m => m.id) : []);
  const handleSelectOne = (id: string, checked: boolean | 'indeterminate') => setSelectedMaterials(prev => checked ? [...prev, id] : prev.filter(materialId => materialId !== id));
  const handleDeleteSelected = () => { onDeleteMultipleMaterials(selectedMaterials); setSelectedMaterials([]); };
  const handleFileUploadWrapper = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(event, onAddMultipleMaterials, () => setIsUploadDialogOpen(false));
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold self-start">Kelola Materi</h2>
        <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
          <MaterialsFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            monthFilter={monthFilter}
            setMonthFilter={setMonthFilter}
            searchOptions={searchOptions}
            dropdownCategories={dropdownCategories}
            filterOptions={filterOptions}
          />
        </div>
      </div>
      {canEdit && (
        <MaterialsActionButtons
          selectedMaterialsCount={selectedMaterials.length}
          onDownloadTemplate={handleDownloadTemplate}
          onUploadDialogOpen={() => setIsUploadDialogOpen(true)}
          onAddDialogOpen={() => setIsAddDialogOpen(true)}
          onDeleteSelected={handleDeleteSelected}
          uploadDialogContent={<UploadMaterialDialog isOpen={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen} onFileUpload={handleFileUploadWrapper} />}
        />
      )}
      <MaterialsTable
        materials={filteredMaterials}
        canEdit={canEdit}
        selectedMaterials={selectedMaterials}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
        onEdit={openEditDialog}
        onDelete={onDeleteMaterial}
      />
      <AddMaterialDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        newMaterial={newMaterial}
        onInputChange={handleInputChange}
        onSelectChange={handleSelectChange}
        onSave={handleAdd}
      />
      <EditMaterialDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editingMaterial={editingMaterial}
        onEditChange={handleEditChange}
        onUpdate={handleUpdate}
      />
    </div>
  );
}