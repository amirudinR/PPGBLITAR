import React from 'react';
import { Material } from '@/types/admin';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface MaterialsSectionProps {
  materials: Material[];
  newMaterial: Omit<Material, 'id' | 'date'>;
  setNewMaterial: React.Dispatch<React.SetStateAction<Omit<Material, 'id' | 'date'>>>;
  onAddMaterial: () => void;
  onDeleteMaterial: (id: string) => void;
}

const materialFields: (keyof Omit<Material, 'id' | 'date' | 'title'>)[] = [
  'bacaan', 'menulis', 'hafalan', 'praktekIbadah', 'keilmuan', 'tatakrama', 'kemandirian'
];

const fieldLabels: Record<string, string> = {
  bacaan: 'Materi Bacaan',
  menulis: 'Makna / Menulis',
  hafalan: 'Hafalan',
  praktekIbadah: 'Praktek Ibadah',
  keilmuan: 'Keilmuan dan Kefahaman',
  tatakrama: 'Tatakrama',
  kemandirian: 'Kemandirian'
};

export default function MaterialsSection({
  materials,
  newMaterial,
  setNewMaterial,
  onAddMaterial,
  onDeleteMaterial,
}: MaterialsSectionProps) {
  const handleInputChange = (field: keyof typeof newMaterial, value: string) => {
    setNewMaterial(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Kelola Materi</h2>
      
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-lg font-semibold mb-4">Tambah Materi Baru</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-base">Judul Materi</Label>
            <Input
              id="title"
              value={newMaterial.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="mt-1"
              placeholder="Contoh: Materi Pekan 1"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {materialFields.map(field => (
              <div key={field}>
                <Label htmlFor={field}>{fieldLabels[field]}</Label>
                <Textarea
                  id={field}
                  value={newMaterial[field]}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  className="mt-1"
                  placeholder={`Isi materi untuk ${fieldLabels[field]}`}
                />
              </div>
            ))}
          </div>
          <button
            onClick={onAddMaterial}
            className="w-full md:w-auto px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center space-x-2 mt-4"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Materi</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Daftar Materi</h3>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {materials.map((material) => (
            <AccordionItem value={material.id} key={material.id}>
              <AccordionTrigger className="px-4 text-base hover:no-underline">
                <div className="flex justify-between w-full pr-4">
                  <span>{material.title}</span>
                  <span className="text-sm text-gray-500 font-normal">{material.date}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  {materialFields.map(field => (
                    <div key={field}>
                      <h4 className="font-semibold text-gray-800">{fieldLabels[field]}</h4>
                      <p className="text-gray-600 whitespace-pre-wrap">{material[field] || '-'}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded flex items-center space-x-2 text-sm">
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => onDeleteMaterial(material.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded flex items-center space-x-2 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus</span>
                  </button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}