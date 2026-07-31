import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, DollarSign } from 'lucide-react';
import { JariyahPPG } from '@/types/admin';

interface JariyahTableProps {
    items: JariyahPPG[];
    canEdit: boolean;
    formatCurrency: (amount: number) => string;
    onEdit: (item: JariyahPPG) => void;
    onDelete: (item: JariyahPPG) => void;
}

export default function JariyahTable({ items, canEdit, formatCurrency, onEdit, onDelete }: JariyahTableProps) {
    return (
        <Card className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-xs">
            <CardContent className="p-0">
                {items.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Donatur</TableHead>
                                <TableHead>Tipe</TableHead>
                                <TableHead>Jenis Jariyah</TableHead>
                                <TableHead>Nominal</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Status</TableHead>
                                {canEdit && <TableHead className="text-right">Aksi</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.donaturName}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.donaturType === 'Generus' ? 'bg-[hsl(var(--info)/0.2)] text-[hsl(var(--info))]' :
                                                item.donaturType === 'Orang Tua' ? 'bg-[hsl(var(--stat-6)/0.2)] text-[hsl(var(--stat-6))]' :
                                                    'bg-muted text-foreground'
                                            }`}>
                                            {item.donaturType}
                                        </span>
                                    </TableCell>
                                    <TableCell>{item.jenisJariyah}</TableCell>
                                    <TableCell className="font-semibold text-[hsl(var(--success))]">{formatCurrency(item.nominal)}</TableCell>
                                    <TableCell>{item.tanggal}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Diterima' ? 'bg-[hsl(var(--success)/0.2)] text-[hsl(var(--success))]' :
                                                item.status === 'Pending' ? 'bg-[hsl(var(--warning)/0.2)] text-[hsl(var(--warning))]' :
                                                    'bg-destructive/20 text-destructive'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </TableCell>
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
                        <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">Belum Ada Data Jariyah PPG</p>
                        <p className="text-sm">Klik tombol "Tambah Jariyah" untuk menambahkan data baru</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
