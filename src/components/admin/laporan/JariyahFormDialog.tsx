import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JariyahPPG, JENIS_JARIYAH_LIST, Generus } from '@/types/admin';

interface JariyahFormData {
    donaturName: string;
    donaturType: 'Generus' | 'Orang Tua' | 'Umum';
    generusId: string;
    jenisJariyah: typeof JENIS_JARIYAH_LIST[number];
    nominal: number;
    tanggal: string;
    bulan: string;
    tahun: number;
    keterangan: string;
    status: 'Diterima' | 'Pending' | 'Ditolak';
    desa: string;
    kelompok: string;
    createdBy: string;
}

interface JariyahFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    selectedItem: JariyahPPG | null;
    formData: JariyahFormData;
    onFormDataChange: (data: JariyahFormData) => void;
    onDonaturTypeChange: (type: 'Generus' | 'Orang Tua' | 'Umum') => void;
    onGenerusChange: (generusId: string) => void;
    generus: Generus[];
    months: string[];
}

export default function JariyahFormDialog({
    isOpen,
    onClose,
    onSubmit,
    selectedItem,
    formData,
    onFormDataChange,
    onDonaturTypeChange,
    onGenerusChange,
    generus,
    months
}: JariyahFormDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{selectedItem ? 'Edit Jariyah' : 'Tambah Jariyah Baru'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    <div>
                        <Label>Tipe Donatur</Label>
                        <Select value={formData.donaturType} onValueChange={(v) => onDonaturTypeChange(v as 'Generus' | 'Orang Tua' | 'Umum')}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Generus">Generus</SelectItem>
                                <SelectItem value="Orang Tua">Orang Tua</SelectItem>
                                <SelectItem value="Umum">Umum</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {formData.donaturType === 'Generus' ? (
                        <div>
                            <Label>Pilih Generus</Label>
                            <Select value={formData.generusId} onValueChange={onGenerusChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Generus" />
                                </SelectTrigger>
                                <SelectContent>
                                    {generus.map(g => (
                                        <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : (
                        <div>
                            <Label>Nama Donatur</Label>
                            <Input value={formData.donaturName} onChange={(e) => onFormDataChange({ ...formData, donaturName: e.target.value })} placeholder="Masukkan nama donatur" />
                        </div>
                    )}
                    <div>
                        <Label>Jenis Jariyah</Label>
                        <Select value={formData.jenisJariyah} onValueChange={(v) => onFormDataChange({ ...formData, jenisJariyah: v as typeof JENIS_JARIYAH_LIST[number] })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {JENIS_JARIYAH_LIST.map(jenis => (
                                    <SelectItem key={jenis} value={jenis}>{jenis}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Nominal (Rp)</Label>
                        <Input type="number" value={formData.nominal} onChange={(e) => onFormDataChange({ ...formData, nominal: parseInt(e.target.value) || 0 })} placeholder="0" />
                    </div>
                    <div>
                        <Label>Tanggal</Label>
                        <Input type="date" value={formData.tanggal} onChange={(e) => onFormDataChange({ ...formData, tanggal: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label>Bulan</Label>
                            <Select value={formData.bulan} onValueChange={(v) => onFormDataChange({ ...formData, bulan: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map(month => (
                                        <SelectItem key={month} value={month}>{month}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Tahun</Label>
                            <Input type="number" value={formData.tahun} onChange={(e) => onFormDataChange({ ...formData, tahun: parseInt(e.target.value) })} />
                        </div>
                    </div>
                    <div>
                        <Label>Status</Label>
                        <Select value={formData.status} onValueChange={(v) => onFormDataChange({ ...formData, status: v as 'Diterima' | 'Pending' | 'Ditolak' })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Diterima">Diterima</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Ditolak">Ditolak</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Keterangan</Label>
                        <Textarea value={formData.keterangan} onChange={(e) => onFormDataChange({ ...formData, keterangan: e.target.value })} placeholder="Catatan tambahan..." />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Batal</Button>
                    <Button onClick={onSubmit} className="bg-primary hover:bg-primary/90">
                        {selectedItem ? 'Simpan' : 'Tambah'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
