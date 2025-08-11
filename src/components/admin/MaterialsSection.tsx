import React from 'react';
import { Material } from '@/types/admin';
import { Plus, Edit, Trash2, Upload } from 'lucide-react';

interface MaterialsSectionProps {
  materials: Material[];
  newMaterial: { title: string; description: string };
  setNewMaterial: React.Dispatch<React.SetStateAction<{ title: string; description: string }>>;
  onAddMaterial: () => void;
  onDeleteMaterial: (id: string) => void;
}

export default function MaterialsSection({
  materials,
  newMaterial,
  setNewMaterial,
  onAddMaterial,
  onDeleteMaterial,
}: MaterialsSectionProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Kelola Materi</h2>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Tambah Materi Baru</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul Materi</label>
            <input
              type="text"
              value={newMaterial.title}
              onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan judul materi"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea
              value={newMaterial.description}
              onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Masukkan deskripsi materi"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Pilih File</span>
              </button>
              <span className="text-sm text-gray-500">Belum ada file dipilih</span>
            </div>
          </div>
          <button
            onClick={onAddMaterial}
            className="w-full md:w-auto px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center space-x-2"
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
        <div className="divide-y divide-gray-200">
          {materials.map((material) => (
            <div key={material.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{material.title}</h4>
                  <p className="text-sm text-gray-500">{material.description}</p>
                  <p className="text-xs text-gray-400 mt-1">Ditambahkan: {material.date}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteMaterial(material.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}