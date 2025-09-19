import React, { useState, useMemo } from 'react';
import { Generus, Desa, Kelompok, PENDIDIKAN_LIST, STATUS_MONDOK_LIST, GURU_STATUS_LIST } from '@/types/admin';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface GenerusActionsProps {
  currentUser: any;
  newGenerus: Omit<Generus, 'id'>;
  setNewGenerus: React.Dispatch<React.SetStateAction<Omit<Generus, 'id'>>>;
  desas: Desa[];
  kelompok: Kelompok[];
  onAddGenerus: () => Promise<boolean>;
  allGenerus: Generus[]; // Tambahkan properti ini
}

export default function GenerusActions({
  currentUser,
  newGenerus,
  setNewGenerus,
  desas,
  kelompok,
  onAddGenerus,
  allGenerus // Tambahkan parameter ini
}: GenerusActionsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

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

  // Fungsi untuk mengekspor data ke Excel
  const handleExport = () => {
    // Siapkan data untuk diekspor
    const exportData = allGenerus.map(generus => ({
      "Nama Generus": genus.name,
      "Jenis Kelamin": genus.jenisKelamin,
      "Tahun Lahir": genus.tahunLahir,
      "Pendidikan": genus.pendidikan,
      "Status Mondok": genus.statusMondok,
      "Nama Ayah": genus.namaAyah,
      "Status Ayah": genus.statusAyah,
      "Nama Ibu": genus.namaIbu,
      "Status Ibu": genus.statusIbu,
      "Desa": genus.desa,
      "Kelompok": genus.kelompok
    }));

    // Buat worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Atur lebar kolom
    ws['!cols'] = [
      { wch: 20 }, // Nama Generus
      { wch: 12 }, // Jenis Kelamin
      { wch: 12 }, // Tahun Lahir
      { wch: 15 }, // Pendidikan
      { wch: 25 }, // Status Mondok
      { wch: 15 }, // Nama Ayah
      { wch: 10 }, // Status Ayah
      { wch: 15 }, // Nama Ibu
      { wch: 10 }, // Status Ibu
      { wch: 15 }, // Desa
      { wch: 15 }  // Kelompok
    ];

    // Buat workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Generus");

    // Ekspor file
    XLSX.writeFile(wb, "data_generus.xlsx");
  };

  // Fungsi untuk mengunduh template Excel
  const handleDownloadTemplate = () => {
    // Data contoh untuk template
    const templateData = [
      {
        "Nama Generus": "Contoh Nama",
        "Jenis Kelamin": "Laki-laki",
        "Tahun Lahir": 2010,
        "Pendidikan": "SD 3",
        "Status Mondok": "Tidak Sedang Mondok",
        "Nama Ayah": "Nama Ayah",
        "Status Ayah": "jm",
        "Nama Ibu": "Nama Ibu",
        "Status Ibu": "hum",
        "Desa": "Contoh Desa",
        "Kelompok": "Contoh Kelompok"
      }
    ];

    // Buat worksheet dari data contoh
    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // Atur lebar kolom
    ws['!cols'] = [
      { wch: 20 }, // Nama Generus
      { wch: 12 }, // Jenis Kelamin
      { wch: 12 }, // Tahun Lahir
      { wch: 15 }, // Pendidikan
      { wch: 25 }, // Status Mondok
      { wch: 15 }, // Nama Ayah
      { wch: 10 }, // Status Ayah
      { wch: 15 }, // Nama Ibu
      { wch: 10 }, // Status Ibu
      { wch: 15 }, // Desa
      { wch: 15 }  // Kelompok
    ];

    // Buat workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Data Generus");

    // Ekspor file template
    XLSX.writeFile(wb, "template_import_data_generus.xlsx");
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div></div> {/* Spacer for alignment */}
      <div className="flex items-center gap-2">
        {(currentUser?.role === 'kelompok' || currentUser?.role === 'admin' || currentUser?.role === 'adminsuper') && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Template
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>
        )}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
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
                <div className="space-y-2"><Label>Nama Generus</Label><Input value={newGenerus.name} onChange={(e) => handleNewInputChange('name', e.target.value)} /></div>
                <div className="space-y-2"><Label>Jenis Kelamin</Label><Select value={newGenerus.jenisKelamin} onValueChange={(v) => handleNewSelectChange('jenisKelamin', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Laki-laki">Laki-laki</SelectItem><SelectItem value="Perempuan">Perempuan</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label>Tahun Lahir</Label><Input type="number" value={newGenerus.tahunLahir} onChange={(e) => handleNewInputChange('tahunLahir', parseInt(e.target.value, 10) || 0)} /></div>
                <div className="space-y-2"><Label>Pendidikan</Label><Select value={newGenerus.pendidikan} onValueChange={(v) => handleNewSelectChange('pendidikan', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PENDIDIKAN_LIST.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Status Mondok</Label><Select value={newGenerus.statusMondok} onValueChange={(v) => handleNewSelectChange('statusMondok', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUS_MONDOK_LIST.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Desa</Label><Select value={newGenerus.desa} onValueChange={handleNewDesaChange}><SelectTrigger><SelectValue placeholder="Pilih Desa" /></SelectTrigger><SelectContent>{desas.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Kelompok</Label><Select value={newGenerus.kelompok} onValueChange={(v) => handleNewSelectChange('kelompok', v)}><SelectTrigger><SelectValue placeholder="Pilih Kelompok" /></SelectTrigger><SelectContent>{filteredKelompokForNew.map(k => <SelectItem key={k.id} value={k.name}>{k.name}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Nama Ayah</Label><Input value={newGenerus.namaAyah} onChange={(e) => handleNewInputChange('namaAyah', e.target.value)} /></div>
                <div className="space-y-2"><Label>Status Ayah</Label><Select value={newGenerus.statusAyah} onValueChange={(v) => handleNewSelectChange('statusAyah', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="jm">JM</SelectItem><SelectItem value="hum">HUM</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label>Nama Ibu</Label><Input value={newGenerus.namaIbu} onChange={(e) => handleNewInputChange('namaIbu', e.target.value)} /></div>
                <div className="space-y-2"><Label>Status Ibu</Label><Select value={newGenerus.statusIbu} onValueChange={(v) => handleNewSelectChange('statusIbu', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="jm">JM</SelectItem><SelectItem value="hum">HUM</SelectItem></SelectContent></Select></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setIsAddDialogOpen(false)}>Batal</Button>
              <Button onClick={handleSave}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}