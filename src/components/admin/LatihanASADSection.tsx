import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Calendar, Target, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useLatihanASAD } from '@/hooks/useLatihanASAD';
import { User, LatihanASAD, JENIS_LATIHAN_LIST, Generus } from '@/types/admin';

interface LatihanASADSectionProps {
    currentUser: User | null;
    generus: Generus[];
}

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export default function LatihanASADSection({ currentUser, generus }: LatihanASADSectionProps) {
    const { latihanItems, loading, addLatihan, updateLatihan, deleteLatihan, getStatistics } = useLatihanASAD(currentUser);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<LatihanASAD | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMonth, setFilterMonth] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const [formData, setFormData] = useState({
        generusId: '',
        generusName: '',
        jenisLatihan: JENIS_LATIHAN_LIST[0] as typeof JENIS_LATIHAN_LIST[number],
        tanggal: new Date().toISOString().split('T')[0],
        bulan: MONTHS[new Date().getMonth()],
        tahun: new Date().getFullYear(),
        keterangan: '',
        status: 'Dalam Proses' as 'Tercapai' | 'Tidak Tercapai' | 'Dalam Proses',
        desa: currentUser?.desa || '',
        kelompok: currentUser?.kelompok || '',
        createdBy: currentUser?.id || ''
    });

    const stats = getStatistics();

    const filteredItems = useMemo(() => {
        return latihanItems.filter(item => {
            const matchesSearch = item.generusName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.jenisLatihan.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesMonth = filterMonth === 'all' || item.bulan === filterMonth;
            const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
            return matchesSearch && matchesMonth && matchesStatus;
        });
    }, [latihanItems, searchTerm, filterMonth, filterStatus]);

    const handleOpenDialog = (item?: LatihanASAD) => {
        if (item) {
            setSelectedItem(item);
            setFormData({
                generusId: item.generusId,
                generusName: item.generusName,
                jenisLatihan: item.jenisLatihan,
                tanggal: item.tanggal,
                bulan: item.bulan,
                tahun: item.tahun,
                keterangan: item.keterangan,
                status: item.status,
                desa: item.desa,
                kelompok: item.kelompok,
                createdBy: item.createdBy
            });
        } else {
            setSelectedItem(null);
            setFormData({
                generusId: '',
                generusName: '',
                jenisLatihan: JENIS_LATIHAN_LIST[0],
                tanggal: new Date().toISOString().split('T')[0],
                bulan: MONTHS[new Date().getMonth()],
                tahun: new Date().getFullYear(),
                keterangan: '',
                status: 'Dalam Proses',
                desa: currentUser?.desa || '',
                kelompok: currentUser?.kelompok || '',
                createdBy: currentUser?.id || ''
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.generusId || !formData.jenisLatihan) {
            return;
        }

        if (selectedItem) {
            await updateLatihan(selectedItem.id, formData);
        } else {
            await addLatihan(formData);
        }
        setIsDialogOpen(false);
    };

    const handleDelete = async () => {
        if (selectedItem) {
            await deleteLatihan(selectedItem.id);
            setIsDeleteDialogOpen(false);
            setSelectedItem(null);
        }
    };

    const handleGenerusChange = (generusId: string) => {
        const selectedGenerus = generus.find(g => g.id === generusId);
        setFormData({
            ...formData,
            generusId,
            generusName: selectedGenerus?.name || ''
        });
    };

    if (loading) {
        return <div className="p-6 text-center">Memuat data...</div>;
    }

    const canEdit = currentUser?.role === 'adminsuper' || currentUser?.role === 'admin' ||
        currentUser?.role === 'desa' || currentUser?.role === 'kelompok';

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Laporan Latihan ASAD</h2>
                    <p className="text-muted-foreground">Pencatatan aktivitas latihan harian Generus</p>
                </div>
                {canEdit && (
                    <Button onClick={() => handleOpenDialog()} className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="w-4 h-4 mr-2" /> Tambah Latihan
                    </Button>
                )}
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-80">Total Latihan</p>
                                <p className="text-3xl font-bold">{stats.total}</p>
                            </div>
                            <Target className="w-10 h-10 opacity-80" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-80">Tercapai</p>
                                <p className="text-3xl font-bold">{stats.tercapai}</p>
                            </div>
                            <CheckCircle className="w-10 h-10 opacity-80" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-80">Dalam Proses</p>
                                <p className="text-3xl font-bold">{stats.dalamProses}</p>
                            </div>
                            <Clock className="w-10 h-10 opacity-80" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-80">Persentase</p>
                                <p className="text-3xl font-bold">{stats.persentaseTercapai}%</p>
                            </div>
                            <Calendar className="w-10 h-10 opacity-80" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5" /> Filter Data
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari nama atau jenis latihan..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={filterMonth} onValueChange={setFilterMonth}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter Bulan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Bulan</SelectItem>
                                {MONTHS.map(month => (
                                    <SelectItem key={month} value={month}>{month}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="Tercapai">Tercapai</SelectItem>
                                <SelectItem value="Dalam Proses">Dalam Proses</SelectItem>
                                <SelectItem value="Tidak Tercapai">Tidak Tercapai</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Data Table */}
            <Card>
                <CardContent className="p-0">
                    {filteredItems.length > 0 ? (
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
                                {filteredItems.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.generusName}</TableCell>
                                        <TableCell>{item.jenisLatihan}</TableCell>
                                        <TableCell>{item.tanggal}</TableCell>
                                        <TableCell>{item.bulan} {item.tahun}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Tercapai' ? 'bg-green-500/20 text-green-800' :
                                                    item.status === 'Dalam Proses' ? 'bg-yellow-500/20 text-yellow-800' :
                                                        'bg-red-500/20 text-red-800'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate">{item.keterangan || '-'}</TableCell>
                                        {canEdit && (
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="icon" onClick={() => handleOpenDialog(item)}>
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="outline" size="icon" className="text-red-600" onClick={() => { setSelectedItem(item); setIsDeleteDialogOpen(true); }}>
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

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{selectedItem ? 'Edit Latihan' : 'Tambah Latihan Baru'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Nama Generus</Label>
                            <Select value={formData.generusId} onValueChange={handleGenerusChange}>
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
                            <Select value={formData.jenisLatihan} onValueChange={(v) => setFormData({ ...formData, jenisLatihan: v as typeof JENIS_LATIHAN_LIST[number] })}>
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
                            <Input type="date" value={formData.tanggal} onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Bulan</Label>
                                <Select value={formData.bulan} onValueChange={(v) => setFormData({ ...formData, bulan: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MONTHS.map(month => (
                                            <SelectItem key={month} value={month}>{month}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Tahun</Label>
                                <Input type="number" value={formData.tahun} onChange={(e) => setFormData({ ...formData, tahun: parseInt(e.target.value) })} />
                            </div>
                        </div>
                        <div>
                            <Label>Status</Label>
                            <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as 'Tercapai' | 'Tidak Tercapai' | 'Dalam Proses' })}>
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
                            <Textarea value={formData.keterangan} onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })} placeholder="Catatan tambahan..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                        <Button onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700">
                            {selectedItem ? 'Simpan' : 'Tambah'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Data Latihan?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus data latihan ini? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
