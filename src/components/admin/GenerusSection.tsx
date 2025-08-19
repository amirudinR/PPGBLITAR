import React, { useState, useMemo } from 'react';
import { Generus, PENDIDIKAN_LIST, Pendidikan, STATUS_MONDOK_LIST, GENERUS_FILTER_FIELDS, getJenjangUsia } from '@/types/admin';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface GenerusSectionProps {
  allGenerus: Generus[];
  newGenerus: Omit<Generus, 'id'>;
  setNewGenerus: React.Dispatch<React.SetStateAction<Omit<Generus, 'id'>>>;
  onAddGenerus: () => Promise<boolean>;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterCategory: string;
  onFilterCategoryChange: (value: string) => void;
}

const dropdownCategories = ['tahunLahir', 'pendidikan', 'statusMondok', 'desa', 'kelompok'];

export default function GenerusSection({ 
  allGenerus,
  newGenerus, 
  setNewGenerus, 
  onAddGenerus, 
  searchTerm, 
  onSearchChange,
  filterCategory,
  onFilterCategoryChange
}: GenerusSectionProps) {
  const [open, setOpen] = useState(false);

  const searchOptions = useMemo(() => {
    if (!dropdownCategories.includes(filterCategory)) return [];
    const uniqueValues = [...new Set(allGenerus.map(item => item[filterCategory as keyof Generus]))];
    return uniqueValues.map(String).sort();
  }, [filterCategory, allGenerus]);

  const filteredGenerus = useMemo(() => {
    if (!searchTerm) return allGenerus;
    return allGenerus.filter(g => {
      const value = g[filterCategory as keyof Generus];
      if (dropdownCategories.includes(filterCategory)) {
        return String(value) === searchTerm;
      }
      return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [allGenerus, searchTerm, filterCategory]);

  const handleSave = async () => {
    const success = await onAddGenerus();
    if (success) {
      setOpen(false);
    }
  };

  const handleInputChange = (field: keyof typeof newGenerus, value: string | number) => {
    setNewGenerus(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (field: keyof typeof newGenerus, value: string) => {
    setNewGenerus(prev => ({ ...prev, [field]: value as any }));
  };

  const renderSearchInput = () => {
    if (dropdownCategories.includes(filterCategory)) {
      return (
        <Select 
          value={searchTerm} 
          onValueChange={(value) => onSearchChange(value === '--all--' ? '' : value || '')}
        >
          <SelectTrigger className="w-full flex-grow md:w-[200px]">
            <SelectValue placeholder={`Pilih ${GENERUS_FILTER_FIELDS.find(f => f.value === filterCategory)?.label}...`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="--all--">Semua</SelectItem>
            {searchOptions.map(option => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    return (
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input 
          placeholder="Cari..." 
          className="pl-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Data Generus</h2>
        <div className="flex items-center gap-2 w-full md:w-auto">
          {renderSearchInput()}
          <Select value={filterCategory} onValueChange={(value) => {
            onFilterCategoryChange(value);
            onSearchChange('');
          }}>
            <SelectTrigger className="w-[180px] flex-shrink-0">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              {GENERUS_FILTER_FIELDS.map(field => (
                <SelectItem key={field.value} value={field.value}>{field.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="flex-shrink-0">
                <Plus className="w-4 h-4 mr-2" />
                Tambah
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Tambah Data Generus</DialogTitle>
                <DialogDescription>
                  Isi formulir di bawah ini untuk menambahkan data generus baru.
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Generus</Label>
                    <Input id="name" value={newGenerus.name} onChange={(e) => handleInputChange('name', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jenisKelamin">Jenis Kelamin</Label>
                    <Select value={newGenerus.jenisKelamin} onValueChange={(value) => handleSelectChange('jenisKelamin', value)}>
                      <SelectTrigger id="jenisKelamin">
                        <SelectValue placeholder="Pilih Jenis Kelamin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                        <SelectItem value="Perempuan">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tahunLahir">Tahun Lahir</Label>
                    <Input id="tahunLahir" type="number" value={newGenerus.tahunLahir} onChange={(e) => handleInputChange('tahunLahir', parseInt(e.target.value, 10) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pendidikan">Pendidikan</Label>
                    <Select value={newGenerus.pendidikan} onValueChange={(value) => handleSelectChange('pendidikan', value)}>
                      <SelectTrigger id="pendidikan">
                        <SelectValue placeholder="Pilih Pendidikan" />
                      </SelectTrigger>
                      <SelectContent>
                        {PENDIDIKAN_LIST.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="statusMondok">Status Mondok</Label>
                    <Select value={newGenerus.statusMondok} onValueChange={(value) => handleSelectChange('statusMondok', value)}>
                      <SelectTrigger id="statusMondok">
                        <SelectValue placeholder="Pilih Status Mondok" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_MONDOK_LIST.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desa">Desa</Label>
                    <Input id="desa" value={newGenerus.desa} onChange={(e) => handleInputChange('desa', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kelompok">Kelompok</Label>
                    <Input id="kelompok" value={newGenerus.kelompok} onChange={(e) => handleInputChange('kelompok', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="namaAyah">Nama Ayah</Label>
                    <Input id="namaAyah" value={newGenerus.namaAyah} onChange={(e) => handleInputChange('namaAyah', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="statusAyah">Status Ayah</Label>
                    <Select value={newGenerus.statusAyah} onValueChange={(value) => handleSelectChange('statusAyah', value)}>
                        <SelectTrigger id="statusAyah"><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                        <SelectContent><SelectItem value="jm">JM</SelectItem><SelectItem value="hum">HUM</SelectItem></SelectContent>
                  </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="namaIbu">Nama Ibu</Label>
                    <Input id="namaIbu" value={newGenerus.namaIbu} onChange={(e) => handleInputChange('namaIbu', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="statusIbu">Status Ibu</Label>
                    <Select value={newGenerus.statusIbu} onValueChange={(value) => handleSelectChange('statusIbu', value)}>
                        <SelectTrigger id="statusIbu"><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                        <SelectContent><SelectItem value="jm">JM</SelectItem><SelectItem value="hum">HUM</SelectItem></SelectContent>
                  </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
                <Button type="button" onClick={handleSave}>Simpan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Generus</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tahun Lahir</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pendidikan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenjang Usia</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Mondok</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Desa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelompok</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Ayah</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Ayah</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Ibu</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Ibu</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredGenerus.length === 0 ? (
              <tr>
                <td colSpan={12} className="text-center py-10 text-gray-500">
                  Tidak ada hasil yang cocok dengan pencarian Anda.
                </td>
              </tr>
            ) : (
              filteredGenerus.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.tahunLahir}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.pendidikan}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getJenjangUsia(item.pendidikan)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.statusMondok}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.desa}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.kelompok}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.namaAyah}</td>
                  <td className="px-6 py-4 whitespace-nowrap uppercase">{item.statusAyah}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.namaIbu}</td>
                  <td className="px-6 py-4 whitespace-nowrap uppercase">{item.statusIbu}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded mr-2">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}