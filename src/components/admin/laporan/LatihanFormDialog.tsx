import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LatihanASAD, JENIS_LATIHAN_LIST, Generus } from '@/types/admin';

interface LatihanFormData {
    generusId: string;
    generusName: string;
    jenisLatihan: typeof JENIS_LATIHAN_LIST[number];
    tanggal: string;
    bulan: string;
    tahun: number;
    keterangan: string;
    status: 'Tercapai' | 'Tidak Tercapai' | 'Dalam Proses';
    desa: string;
    kelompok: string;
    createdBy: string;
}

interface LatihanFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    selectedItem: LatihanASAD | null;
    formData: LatihanFormData;
    onFormDataChange: (data: LatihanFormData) => void;
    onGenerusChange: (generusId: string) => void;
    generus: Generus[];
    months: string[];
}

export default function LatihanFormDialog({
    isOpen,
    onClose,
    onSubmit,
    selectedItem,
    formData,
    onFormDataChange,
    onGenerusChange,
    generus,
    months
}: LatihanFormDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{selectedItem ? 'Edit Latihan' : 'Tambah Latihan Baru'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>Nama Generus</Label>
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
                    <div>
                        <Label>Jenis Latihan</Label>
                        <Select value={formData.jenisLatihan} onValueChange={(v) => onFormDataChange({ ...formData, jenisLatihan: v as typeof JENIS_LATIHAN_LIST[number] })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {JENIS_LATIHAN_LIST.map(jenis => (
                                    <SelectItem key={jenis} value={jenis}>{jenis}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Tanggal</Label>
                        <Input type="date" value={formData.tanggal} onChange={(e) => onFormDataChange({ ...formData, tanggal: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
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
                        <Select value={formData.status} onValueChange={(v) => onFormDataChange({ ...formData, status: v as 'Tercapai' | 'Tidak Tercapai' | 'Dalam Proses' })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Tercapai">Tercapai</SelectItem>
                                <SelectItem value="Dalam Proses">Dalam Proses</SelectItem>
                                <SelectItem value="Tidak Tercapai">Tidak Tercapai</SelectItem>
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
