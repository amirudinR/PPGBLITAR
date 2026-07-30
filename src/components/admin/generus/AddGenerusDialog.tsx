import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { Generus, Desa, Kelompok, PENDIDIKAN_LIST, STATUS_MONDOK_LIST, AKTIVITAS_LIST } from '@/types/admin';
import DatePicker from '@/components/ui/date-picker';

const JURUSAN_TRIGGERS = ['SMK', 'KULIAH'];

interface AddGenerusDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newGenerus: Omit<Generus, 'id'>;
  onInputChange: (field: keyof Omit<Generus, 'id'>, value: string | number) => void;
  onSelectChange: (field: keyof Omit<Generus, 'id'>, value: string) => void;
  onDesaChange: (desaName: string) => void;
  onSave: () => Promise<void>;
  filteredKelompok: Kelompok[];
  currentUser: any;
  desas: Desa[];
  allGenerus: Generus[];
}

export default function AddGenerusDialog({
  isOpen,
  onOpenChange,
  newGenerus,
  onInputChange,
  onSelectChange,
  onDesaChange,
  onSave,
  filteredKelompok,
  currentUser,
  desas,
  allGenerus,
}: AddGenerusDialogProps) {
  const existingJurusan = useMemo(() => {
    const set = new Set<string>();
    allGenerus.forEach(g => { if (g.jurusan) set.add(g.jurusan); });
    return Array.from(set).sort();
  }, [allGenerus]);

  const existingPekerjaan = useMemo(() => {
    const set = new Set<string>();
    allGenerus.forEach(g => { if (g.pekerjaan) set.add(g.pekerjaan); });
    return Array.from(set).sort();
  }, [allGenerus]);

  const showJurusan = JURUSAN_TRIGGERS.includes(newGenerus.pendidikan);

  const handleAktivitasChange = (value: string) => {
    onSelectChange('aktivitas', value);
    if (value === 'mondok') {
      if (!newGenerus.statusMondok || newGenerus.statusMondok === STATUS_MONDOK_LIST[3]) {
        onSelectChange('statusMondok', STATUS_MONDOK_LIST[3]);
      }
    } else {
      onInputChange('statusMondok', '');
    }
    if (value === 'bekerja') {
      onInputChange('tugas', '');
    }
    if (value === 'tugas') {
      onInputChange('pekerjaan', '');
    }
    if (!value) {
      onInputChange('pekerjaan', '');
      onInputChange('tugas', '');
      onInputChange('statusMondok', '');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
            <div className="space-y-2">
              <Label>Nama Generus</Label>
              <Input value={newGenerus.name} onChange={(e) => onInputChange('name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Jenis Kelamin</Label>
              <Select value={newGenerus.jenisKelamin} onValueChange={(v) => onSelectChange('jenisKelamin', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                  <SelectItem value="Perempuan">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tanggal Lahir</Label>
              <DatePicker
                value={newGenerus.tanggalLahir}
                onChange={(v) => onInputChange('tanggalLahir', v)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tahun Lahir</Label>
              <Input type="number" value={newGenerus.tahunLahir} onChange={(e) => onInputChange('tahunLahir', parseInt(e.target.value, 10) || 0)} />
            </div>

            <div className="space-y-2">
              <Label>Pendidikan</Label>
              <Select value={newGenerus.pendidikan} onValueChange={(v) => { onSelectChange('pendidikan', v); if (!JURUSAN_TRIGGERS.includes(v)) onInputChange('jurusan', ''); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PENDIDIKAN_LIST.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {showJurusan && (
              <div className="space-y-2">
                <Label>Jurusan</Label>
                <div className="flex gap-2">
                  <Input
                    list="jurusan-list-add"
                    placeholder="Masukkan Jurusan"
                    value={newGenerus.jurusan}
                    onChange={(e) => onInputChange('jurusan', e.target.value)}
                    className="flex-1"
                  />
                  <datalist id="jurusan-list-add">
                    {existingJurusan.map(j => <option key={j} value={j} />)}
                  </datalist>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Aktivitas</Label>
              <Select value={newGenerus.aktivitas} onValueChange={handleAktivitasChange}>
                <SelectTrigger><SelectValue placeholder="Pilih Aktivitas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bekerja">Bekerja</SelectItem>
                  <SelectItem value="mondok">Mondok</SelectItem>
                  <SelectItem value="tugas">Tugas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newGenerus.aktivitas === 'bekerja' && (
              <div className="space-y-2">
                <Label>Pekerjaan</Label>
                <div className="flex gap-2">
                  <Input
                    list="pekerjaan-list-add"
                    placeholder="Masukkan Pekerjaan"
                    value={newGenerus.pekerjaan}
                    onChange={(e) => onInputChange('pekerjaan', e.target.value)}
                    className="flex-1"
                  />
                  <datalist id="pekerjaan-list-add">
                    {existingPekerjaan.map(p => <option key={p} value={p} />)}
                  </datalist>
                </div>
              </div>
            )}

            {newGenerus.aktivitas === 'mondok' && (
              <div className="space-y-2">
                <Label>Status Mondok</Label>
                <Select value={newGenerus.statusMondok} onValueChange={(v) => onSelectChange('statusMondok', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUS_MONDOK_LIST.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}

            {newGenerus.aktivitas === 'tugas' && (
              <div className="space-y-2">
                <Label>Deskripsi Tugas</Label>
                <Input
                  placeholder="Masukkan deskripsi tugas"
                  value={newGenerus.tugas}
                  onChange={(e) => onInputChange('tugas', e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>MT</Label>
              <Select value={newGenerus.mt} onValueChange={(v) => onSelectChange('mt', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Belum MT">Belum MT</SelectItem>
                  <SelectItem value="MT">MT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(currentUser?.role === 'admin' || currentUser?.role === 'adminsuper') && (
              <>
                <div className="space-y-2"><Label>Desa</Label><Select value={newGenerus.desa} onValueChange={onDesaChange}><SelectTrigger><SelectValue placeholder="Pilih Desa" /></SelectTrigger><SelectContent>{desas.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Kelompok</Label><Select value={newGenerus.kelompok} onValueChange={(v) => onSelectChange('kelompok', v)}><SelectTrigger><SelectValue placeholder="Pilih Kelompok" /></SelectTrigger><SelectContent>{filteredKelompok.map(k => <SelectItem key={k.id} value={k.name}>{k.name}</SelectItem>)}</SelectContent></Select></div>
              </>
            )}

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

            <div className="space-y-2"><Label>Nama Ayah</Label><Input value={newGenerus.namaAyah} onChange={(e) => onInputChange('namaAyah', e.target.value)} /></div>
            <div className="space-y-2"><Label>Status Ayah</Label><Select value={newGenerus.statusAyah} onValueChange={(v) => onSelectChange('statusAyah', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="jm">JM</SelectItem><SelectItem value="hum">HUM</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Nama Ibu</Label><Input value={newGenerus.namaIbu} onChange={(e) => onInputChange('namaIbu', e.target.value)} /></div>
            <div className="space-y-2"><Label>Status Ibu</Label><Select value={newGenerus.statusIbu} onValueChange={(v) => onSelectChange('statusIbu', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="jm">JM</SelectItem><SelectItem value="hum">HUM</SelectItem></SelectContent></Select></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={onSave}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
