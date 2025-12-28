import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Edit, Trash2, DollarSign, TrendingUp, Users, PieChart, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useJariyahPPG } from '@/hooks/useJariyahPPG';
import { User, JariyahPPG, JENIS_JARIYAH_LIST, Generus } from '@/types/admin';

interface JariyahPPGSectionProps {
    currentUser: User | null;
    generus: Generus[];
}

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

export default function JariyahPPGSection({ currentUser, generus }: JariyahPPGSectionProps) {
    const { jariyahItems, loading, addJariyah, updateJariyah, deleteJariyah, getStatistics } = useJariyahPPG(currentUser);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<JariyahPPG | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMonth, setFilterMonth] = useState<string>('all');
    const [filterJenis, setFilterJenis] = useState<string>('all');

    const [formData, setFormData] = useState({
        donaturName: '',
        donaturType: 'Generus' as 'Generus' | 'Orang Tua' | 'Umum',
        generusId: '',
        jenisJariyah: JENIS_JARIYAH_LIST[0] as typeof JENIS_JARIYAH_LIST[number],
        nominal: 0,
        tanggal: new Date().toISOString().split('T')[0],
        bulan: MONTHS[new Date().getMonth()],
        tahun: new Date().getFullYear(),
        keterangan: '',
        status: 'Pending' as 'Diterima' | 'Pending' | 'Ditolak',
        desa: currentUser?.desa || '',
        kelompok: currentUser?.kelompok || '',
        createdBy: currentUser?.id || ''
    });

    const stats = getStatistics();

    const filteredItems = useMemo(() => {
        return jariyahItems.filter(item => {
            const matchesSearch = item.donaturName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.jenisJariyah.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesMonth = filterMonth === 'all' || item.bulan === filterMonth;
            const matchesJenis = filterJenis === 'all' || item.jenisJariyah === filterJenis;
            return matchesSearch && matchesMonth && matchesJenis;
        });
    }, [jariyahItems, searchTerm, filterMonth, filterJenis]);

    const handleOpenDialog = (item?: JariyahPPG) => {
        if (item) {
            setSelectedItem(item);
            setFormData({
                donaturName: item.donaturName,
                donaturType: item.donaturType,
                generusId: item.generusId || '',
                jenisJariyah: item.jenisJariyah,
                nominal: item.nominal,
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
                donaturName: '',
                donaturType: 'Generus',
                generusId: '',
                jenisJariyah: JENIS_JARIYAH_LIST[0],
                nominal: 0,
                tanggal: new Date().toISOString().split('T')[0],
                bulan: MONTHS[new Date().getMonth()],
                tahun: new Date().getFullYear(),
                keterangan: '',
                status: 'Pending',
                desa: currentUser?.desa || '',
                kelompok: currentUser?.kelompok || '',
                createdBy: currentUser?.id || ''
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.donaturName || !formData.jenisJariyah || formData.nominal <= 0) {
            return;
        }

        if (selectedItem) {
            await updateJariyah(selectedItem.id, formData);
        } else {
            await addJariyah(formData);
        }
        setIsDialogOpen(false);
    };

    const handleDelete = async () => {
        if (selectedItem) {
            await deleteJariyah(selectedItem.id);
            setIsDeleteDialogOpen(false);
            setSelectedItem(null);
        }
    };

    const handleDonaturTypeChange = (type: 'Generus' | 'Orang Tua' | 'Umum') => {
        setFormData({
            ...formData,
            donaturType: type,
            generusId: '',
            donaturName: ''
        });
    };

    const handleGenerusChange = (generusId: string) => {
        const selectedGenerus = generus.find(g => g.id === generusId);
        setFormData({
            ...formData,
            generusId,
            donaturName: selectedGenerus?.name || ''
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
                    <h2 className="text-2xl font-bold">Laporan Jariyah PPG</h2>
                    <p className="text-muted-foreground">Pencatatan kontribusi dan donasi PPG</p>
                </div>
                {canEdit && (
                    <Button onClick={() => handleOpenDialog()} className="bg-green-600 hover:bg-green-700">
                        <Plus className="w-4 h-4 mr-2" /> Tambah Jariyah
                    </Button>
                )}
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-80">Total Jariyah</p>
                                <p className="text-3xl font-bold">{stats.total}</p>
                            </div>
                            <Users className="w-10 h-10 opacity-80" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-80">Total Nominal</p>
                                <p className="text-2xl font-bold">{formatCurrency(stats.totalNominal)}</p>
                            </div>
                            <DollarSign className="w-10 h-10 opacity-80" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-80">Diterima</p>
                                <p className="text-2xl font-bold">{formatCurrency(stats.nominalDiterima)}</p>
                            </div>
                            <TrendingUp className="w-10 h-10 opacity-80" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-80">Pending</p>
                                <p className="text-3xl font-bold">{stats.pending}</p>
                            </div>
                            <PieChart className="w-10 h-10 opacity-80" />
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
                                placeholder="Cari nama donatur atau jenis..."
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
                        <Select value={filterJenis} onValueChange={setFilterJenis}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter Jenis" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Jenis</SelectItem>
                                {JENIS_JARIYAH_LIST.map(jenis => (
                                    <SelectItem key={jenis} value={jenis}>{jenis}</SelectItem>
                                ))}
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
                                {filteredItems.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.donaturName}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.donaturType === 'Generus' ? 'bg-blue-500/20 text-blue-800' :
                                                    item.donaturType === 'Orang Tua' ? 'bg-purple-500/20 text-purple-800' :
                                                        'bg-muted text-foreground'
                                                }`}>
                                                {item.donaturType}
                                            </span>
                                        </TableCell>
                                        <TableCell>{item.jenisJariyah}</TableCell>
                                        <TableCell className="font-semibold text-green-600">{formatCurrency(item.nominal)}</TableCell>
                                        <TableCell>{item.tanggal}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Diterima' ? 'bg-green-500/20 text-green-800' :
                                                    item.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-800' :
                                                        'bg-red-500/20 text-red-800'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </TableCell>
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
                            <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">Belum Ada Data Jariyah PPG</p>
                            <p className="text-sm">Klik tombol "Tambah Jariyah" untuk menambahkan data baru</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{selectedItem ? 'Edit Jariyah' : 'Tambah Jariyah Baru'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                        <div>
                            <Label>Tipe Donatur</Label>
                            <Select value={formData.donaturType} onValueChange={(v) => handleDonaturTypeChange(v as 'Generus' | 'Orang Tua' | 'Umum')}>
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
                        ) : (
                            <div>
                                <Label>Nama Donatur</Label>
                                <Input value={formData.donaturName} onChange={(e) => setFormData({ ...formData, donaturName: e.target.value })} placeholder="Masukkan nama donatur" />
                            </div>
                        )}
                        <div>
                            <Label>Jenis Jariyah</Label>
                            <Select value={formData.jenisJariyah} onValueChange={(v) => setFormData({ ...formData, jenisJariyah: v as typeof JENIS_JARIYAH_LIST[number] })}>
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
                            <Input type="number" value={formData.nominal} onChange={(e) => setFormData({ ...formData, nominal: parseInt(e.target.value) || 0 })} placeholder="0" />
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
                            <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as 'Diterima' | 'Pending' | 'Ditolak' })}>
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
                            <Textarea value={formData.keterangan} onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })} placeholder="Catatan tambahan..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                        <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                            {selectedItem ? 'Simpan' : 'Tambah'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Data Jariyah?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus data jariyah ini? Tindakan ini tidak dapat dibatalkan.
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
