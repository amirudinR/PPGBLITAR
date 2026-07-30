import React from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Generus, Kelompok, PENDIDIKAN_LIST, STATUS_MONDOK_LIST } from '@/types/admin';
import DatePicker from '@/components/ui/date-picker';

const JURUSAN_TRIGGERS = ['SMK', 'KULIAH'];

interface GenerusEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingGenerus: Generus | null;
  handleEditInputChange: (field: keyof Omit<Generus, 'id'>, value: string | number) => void;
  handleEditSelectChange: (field: keyof Omit<Generus, 'id'>, value: string) => void;
  handleUpdate: () => Promise<void>;
  kelompok: Kelompok[];
  allGenerus: Generus[];
}

export default function GenerusEditDialog({
  isOpen,
  onClose,
  editingGenerus,
  handleEditInputChange,
  handleEditSelectChange,
  handleUpdate,
  kelompok,
  allGenerus,
}: GenerusEditDialogProps) {
  const filteredKelompok = React.useMemo(() => {
    if (!editingGenerus?.desa) return [];
    return kelompok.filter(k => k.desaName === editingGenerus.desa);
  }, [editingGenerus?.desa, kelompok]);

  const existingJurusan = React.useMemo(() => {
    if (!allGenerus) return [];
    const set = new Set<string>();
    allGenerus.forEach(g => { if (g.jurusan) set.add(g.jurusan); });
    return Array.from(set).sort();
  }, [allGenerus]);

  const existingPekerjaan = React.useMemo(() => {
    if (!allGenerus) return [];
    const set = new Set<string>();
    allGenerus.forEach(g => { if (g.pekerjaan) set.add(g.pekerjaan); });
    return Array.from(set).sort();
  }, [allGenerus]);

  if (!editingGenerus) return null;
  const showJurusan = JURUSAN_TRIGGERS.includes(editingGenerus.pendidikan);

  const handleAktivitasChange = (value: string) => {
    handleEditSelectChange('aktivitas', value);
    if (value === 'mondok') {
      if (!editingGenerus.statusMondok || editingGenerus.statusMondok === STATUS_MONDOK_LIST[3]) {
        handleEditSelectChange('statusMondok', STATUS_MONDOK_LIST[3]);
      }
    } else {
      handleEditInputChange('statusMondok', '');
    }
    if (value === 'bekerja') {
      handleEditInputChange('tugas', '');
    }
    if (value === 'tugas') {
      handleEditInputChange('pekerjaan', '');
    }
    if (!value) {
      handleEditInputChange('pekerjaan', '');
      handleEditInputChange('tugas', '');
      handleEditInputChange('statusMondok', '');
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[600px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Data Generus</AlertDialogTitle>
        </AlertDialogHeader>
        {editingGenerus && (
          <div className="max-h-[60vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-medium">Nama Generus</Label>
                <Input id="edit-name" value={editingGenerus.name} onChange={(e) => handleEditInputChange('name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-jenisKelamin" className="text-sm font-medium">Jenis Kelamin</Label>
                <Select value={editingGenerus.jenisKelamin} onValueChange={(value) => handleEditSelectChange('jenisKelamin', value)}>
                  <SelectTrigger id="edit-jenisKelamin"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Tanggal Lahir</Label>
                <DatePicker
                  value={editingGenerus.tanggalLahir}
                  onChange={(v) => handleEditInputChange('tanggalLahir', v)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tahunLahir" className="text-sm font-medium">Tahun Lahir</Label>
                <Input id="edit-tahunLahir" type="number" value={editingGenerus.tahunLahir} onChange={(e) => handleEditInputChange('tahunLahir', parseInt(e.target.value, 10) || 0)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-pendidikan" className="text-sm font-medium">Pendidikan</Label>
                <Select value={editingGenerus.pendidikan} onValueChange={(value) => { handleEditSelectChange('pendidikan', value); if (!JURUSAN_TRIGGERS.includes(value)) handleEditInputChange('jurusan', ''); }}>
                  <SelectTrigger id="edit-pendidikan"><SelectValue /></SelectTrigger>
                  <SelectContent>{PENDIDIKAN_LIST.map((p: string) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {showJurusan && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Jurusan</Label>
                  <Input
                    list="jurusan-list-edit"
                    placeholder="Masukkan Jurusan"
                    value={editingGenerus.jurusan}
                    onChange={(e) => handleEditInputChange('jurusan', e.target.value)}
                  />
                  <datalist id="jurusan-list-edit">
                    {existingJurusan.map(j => <option key={j} value={j} />)}
                  </datalist>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-medium">Aktivitas</Label>
                <Select value={editingGenerus.aktivitas} onValueChange={handleAktivitasChange}>
                  <SelectTrigger><SelectValue placeholder="Pilih Aktivitas" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bekerja">Bekerja</SelectItem>
                    <SelectItem value="mondok">Mondok</SelectItem>
                    <SelectItem value="tugas">Tugas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editingGenerus.aktivitas === 'bekerja' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Pekerjaan</Label>
                  <Input
                    list="pekerjaan-list-edit"
                    placeholder="Masukkan Pekerjaan"
                    value={editingGenerus.pekerjaan}
                    onChange={(e) => handleEditInputChange('pekerjaan', e.target.value)}
                  />
                  <datalist id="pekerjaan-list-edit">
                    {existingPekerjaan.map(p => <option key={p} value={p} />)}
                  </datalist>
                </div>
              )}

              {editingGenerus.aktivitas === 'mondok' && (
                <div className="space-y-2">
                  <Label htmlFor="edit-statusMondok" className="text-sm font-medium">Status Mondok</Label>
                  <Select value={editingGenerus.statusMondok} onValueChange={(value) => handleEditSelectChange('statusMondok', value)}>
                    <SelectTrigger id="edit-statusMondok"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUS_MONDOK_LIST.map((p: string) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}

              {editingGenerus.aktivitas === 'tugas' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Deskripsi Tugas</Label>
                  <Input
                    placeholder="Masukkan deskripsi tugas"
                    value={editingGenerus.tugas}
                    onChange={(e) => handleEditInputChange('tugas', e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-medium">MT</Label>
                <Select value={editingGenerus.mt} onValueChange={(value) => handleEditSelectChange('mt', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Belum MT">Belum MT</SelectItem>
                    <SelectItem value="MT">MT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-desa" className="text-sm font-medium">Desa</Label>
                <Input id="edit-desa" value={editingGenerus.desa} onChange={(e) => handleEditInputChange('desa', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-kelompok" className="text-sm font-medium">Kelompok</Label>
                <Select value={editingGenerus.kelompok} onValueChange={(value) => handleEditSelectChange('kelompok', value)}>
                  <SelectTrigger id="edit-kelompok"><SelectValue placeholder="Pilih Kelompok" /></SelectTrigger>
                  <SelectContent>{filteredKelompok.map(k => <SelectItem key={k.id} value={k.name}>{k.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-namaAyah" className="text-sm font-medium">Nama Ayah</Label>
                <Input id="edit-namaAyah" value={editingGenerus.namaAyah} onChange={(e) => handleEditInputChange('namaAyah', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-statusAyah" className="text-sm font-medium">Status Ayah</Label>
                <Select value={editingGenerus.statusAyah} onValueChange={(value) => handleEditSelectChange('statusAyah', value)}>
                  <SelectTrigger id="edit-statusAyah"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="jm">JM</SelectItem><SelectItem value="hum">HUM</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-namaIbu" className="text-sm font-medium">Nama Ibu</Label>
                <Input id="edit-namaIbu" value={editingGenerus.namaIbu} onChange={(e) => handleEditInputChange('namaIbu', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-statusIbu" className="text-sm font-medium">Status Ibu</Label>
                <Select value={editingGenerus.statusIbu} onValueChange={(value) => handleEditSelectChange('statusIbu', value)}>
                  <SelectTrigger id="edit-statusIbu"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="jm">JM</SelectItem><SelectItem value="hum">HUM</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
        <AlertDialogFooter>
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          <Button onClick={() => handleUpdate()}>Simpan Perubahan</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
