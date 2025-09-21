import React, { useState, useMemo, useEffect } from 'react';
import { Generus, Desa, Kelompok, PENDIDIKAN_LIST, STATUS_MONDOK_LIST } from '@/types/admin';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Download, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import GenerusImportDialog from './GenerusImportDialog';

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

  // Fungsi untuk mengekspor data ke Excel
  const handleExport = () => {
    // Siapkan data untuk diekspor
    const exportData = allGenerus.map(item => ({
      "Nama Generus": item.name,
      "Jenis Kelamin": item.jenisKelamin,
      "Tahun Lahir": item.tahunLahir,
      "Pendidikan": item.pendidikan,
      "Status Mondok": item.statusMondok,
      "Nama Ayah": item.namaAyah,
      "Status Ayah": item.statusAyah,
      "Nama Ibu": item.namaIbu,
      "Status Ibu": item.statusIbu
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
      { wch: 10 }  // Status Ibu
    ];

    // Buat workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Generus");

    // Ekspor file
    XLSX.writeFile(wb, "data_generus.xlsx");
  };

  // Fungsi untuk mengunduh template Excel dengan dropdown
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
        "Status Ibu": "hum"
      }
    ];

    // Buat workbook
    const wb = XLSX.utils.book_new();
    
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
      { wch: 10 }  // Status Ibu
    ];

    // Tambahkan dropdown untuk kolom Jenis Kelamin
    const jenisKelaminRange = XLSX.utils.decode_range(ws['!ref'] || "A1");
    for (let rowNum = jenisKelaminRange.s.r + 1; rowNum <= jenisKelaminRange.e.r; rowNum++) {
      const cellRef = XLSX.utils.encode_cell({ r: rowNum, c: 1 }); // Kolom B (Jenis Kelamin)
      if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };
      ws[cellRef].v = 'Laki-laki'; // Default value
    }

    // Tambahkan dropdown untuk kolom Pendidikan
    const pendidikanRange = XLSX.utils.decode_range(ws['!ref'] || "A1");
    for (let rowNum = pendidikanRange.s.r + 1; rowNum <= pendidikanRange.e.r; rowNum++) {
      const cellRef = XLSX.utils.encode_cell({ r: rowNum, c: 3 }); // Kolom D (Pendidikan)
      if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };
      ws[cellRef].v = 'SD 3'; // Default value
    }

    // Tambahkan dropdown untuk kolom Status Mondok
    const statusMondokRange = XLSX.utils.decode_range(ws['!ref'] || "A1");
    for (let rowNum = statusMondokRange.s.r + 1; rowNum <= statusMondokRange.e.r; rowNum++) {
      const cellRef = XLSX.utils.encode_cell({ r: rowNum, c: 4 }); // Kolom E (Status Mondok)
      if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };
      ws[cellRef].v = 'Tidak Sedang Mondok'; // Default value
    }

    // Tambahkan dropdown untuk kolom Status Ayah
    const statusAyahRange = XLSX.utils.decode_range(ws['!ref'] || "A1");
    for (let rowNum = statusAyahRange.s.r + 1; rowNum <= statusAyahRange.e.r; rowNum++) {
      const cellRef = XLSX.utils.encode_cell({ r: rowNum, c: 6 }); // Kolom G (Status Ayah)
      if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };
      ws[cellRef].v = 'jm'; // Default value
    }

    // Tambahkan dropdown untuk kolom Status Ibu
    const statusIbuRange = XLSX.utils.decode_range(ws['!ref'] || "A1");
    for (let rowNum = statusIbuRange.s.r + 1; rowNum <= statusIbuRange.e.r; rowNum++) {
      const cellRef = XLSX.utils.encode_cell({ r: rowNum, c: 8 }); // Kolom I (Status Ibu)
      if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };
      ws[cellRef].v = 'hum'; // Default value
    }

    // Tambahkan worksheet ke workbook
    XLSX.utils.book_append_sheet(wb, ws, "Data Generus");

    // Buat worksheet tersembunyi untuk daftar dropdown
    const hiddenSheetData = [
      ["Laki-laki", "Perempuan"], // Jenis Kelamin
      ...PENDIDIKAN_LIST.map(item => [item]), // Pendidikan
      ...STATUS_MONDOK_LIST.map(item => [item]), // Status Mondok
      ["jm", "hum"] // Status Orang Tua
    ];
    
    const hiddenWs = XLSX.utils.aoa_to_sheet(hiddenSheetData);
    XLSX.utils.book_append_sheet(wb, hiddenWs, "DropdownLists");
    
    // Sembunyikan worksheet
    wb.Workbook = wb.Workbook || {};
    wb.Workbook.Sheets = wb.Workbook.Sheets || [];
    wb.Workbook.Sheets[wb.SheetNames.indexOf("DropdownLists")] = { Hidden: 1 };

    // Tambahkan validasi data untuk dropdown
    ws['!dataValidation'] = {
      // Jenis Kelamin (kolom B)
      'B2:B1000': {
        type: 'list',
        allowBlank: true,
        formulae: ['DropdownLists!$A$1:$B$1'],
        showErrorMessage: true,
        errorTitle: 'Invalid Value',
        error: 'Please select from the dropdown list'
      },
      // Pendidikan (kolom D)
      'D2:D1000': {
        type: 'list',
        allowBlank: true,
        formulae: [`DropdownLists!$A$2:$A$${PENDIDIKAN_LIST.length + 1}`],
        showErrorMessage: true,
        errorTitle: 'Invalid Value',
        error: 'Please select from the dropdown list'
      },
      // Status Mondok (kolom E)
      'E2:E1000': {
        type: 'list',
        allowBlank: true,
        formulae: [`DropdownLists!$A$${PENDIDIKAN_LIST.length + 2}:$A$${PENDIDIKAN_LIST.length + STATUS_MONDOK_LIST.length + 1}`],
        showErrorMessage: true,
        errorTitle: 'Invalid Value',
        error: 'Please select from the dropdown list'
      },
      // Status Ayah (kolom G)
      'G2:G1000': {
        type: 'list',
        allowBlank: true,
        formulae: [`DropdownLists!$A$${PENDIDIKAN_LIST.length + STATUS_MONDOK_LIST.length + 2}:$B$${PENDIDIKAN_LIST.length + STATUS_MONDOK_LIST.length + 2}`],
        showErrorMessage: true,
        errorTitle: 'Invalid Value',
        error: 'Please select from the dropdown list'
      },
      // Status Ibu (kolom I)
      'I2:I1000': {
        type: 'list',
        allowBlank: true,
        formulae: [`DropdownLists!$A$${PENDIDIKAN_LIST.length + STATUS_MONDOK_LIST.length + 2}:$B$${PENDIDIKAN_LIST.length + STATUS_MONDOK_LIST.length + 2}`],
        showErrorMessage: true,
        errorTitle: 'Invalid Value',
        error: 'Please select from the dropdown list'
      }
    };

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
            <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Import Excel
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
                
                {/* Only show desa/kelompok fields for admin roles */}
                {(currentUser?.role === 'admin' || currentUser?.role === 'adminsuper') && (
                  <>
                    <div className="space-y-2"><Label>Desa</Label><Select value={newGenerus.desa} onValueChange={handleNewDesaChange}><SelectTrigger><SelectValue placeholder="Pilih Desa" /></SelectTrigger><SelectContent>{desas.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-2"><Label>Kelompok</Label><Select value={newGenerus.kelompok} onValueChange={(v) => handleNewSelectChange('kelompok', v)}><SelectTrigger><SelectValue placeholder="Pilih Kelompok" /></SelectTrigger><SelectContent>{filteredKelompokForNew.map(k => <SelectItem key={k.id} value={k.name}>{k.name}</SelectItem>)}</SelectContent></Select></div>
                  </>
                )}
                
                {/* For PJP kelompok, show read-only desa/kelompok info */}
                {currentUser?.role === 'kelompok' && (
                  <>
                    <div className="space-y-2">
                      <Label>Desa</Label>
                      <Input value={currentUser.desa} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label>Kelompok</Label>
                      <Input value={currentUser.kelompok} readOnly />
                    </div>
                  </>
                )}
                
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