import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Target } from 'lucide-react';
import { LatihanASAD } from '@/types/admin';

interface LatihanTableProps {
    items: LatihanASAD[];
    canEdit: boolean;
    onEdit: (item: LatihanASAD) => void;
    onDelete: (item: LatihanASAD) => void;
}

export default function LatihanTable({ items, canEdit, onEdit, onDelete }: LatihanTableProps) {
    return (
        <Card>
            <CardContent className="p-0">
                {items.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama Generus</TableHead>
                                <TableHead>Jenis Latihan</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Bulan/Tahun</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Keterangan</TableHead>
                                {canEdit && <TableHead className="text-right">Aksi</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.generusName}</TableCell>
                                    <TableCell>{item.jenisLatihan}</TableCell>
                                    <TableCell>{item.tanggal}</TableCell>
                                    <TableCell>{item.bulan} {item.tahun}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Tercapai' ? 'bg-[hsl(var(--success)/0.2)] text-[hsl(var(--success))]' :
                                                item.status === 'Dalam Proses' ? 'bg-[hsl(var(--warning)/0.2)] text-[hsl(var(--warning))]' :
                                                    'bg-destructive/20 text-destructive'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate">{item.keterangan || '-'}</TableCell>
                                    {canEdit && (
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="icon" onClick={() => onEdit(item)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button variant="outline" size="icon" className="text-destructive" onClick={() => onDelete(item)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">Belum Ada Data Latihan ASAD</p>
                        <p className="text-sm">Klik tombol "Tambah Latihan" untuk menambahkan data baru</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
