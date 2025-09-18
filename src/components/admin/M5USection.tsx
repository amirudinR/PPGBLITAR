import React, { useState, useMemo } from 'react';
import { M5U, User } from '@/types/admin';
import { Plus, Edit, Trash2, Search, CheckCircle, Clock, XCircle, Archive, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import M5UStatusChart from './M5UStatusChart';
import DashboardStatCard from './DashboardStatCard';

const initialData: M5U[] = [
  { id: '1', bulan: 'Januari', tahun: 2024, agenda: 'Evaluasi Kegiatan Akhir Tahun', hasil: 'Semua kegiatan berjalan lancar', pj: 'Admin Super', waktuPelaksanaan: '2024-01-15', statusHasil: 'Terlaksana' },
  { id: '2', bulan: 'Februari', tahun: 2024, agenda: 'Perencanaan Program Semester Genap', hasil: 'Program telah disusun', pj: 'Admin', waktuPelaksanaan: '2024-02-10', statusHasil: 'Terlaksana' },
  { id: '3', bulan: 'Maret', tahun: 2024, agenda: 'Persiapan Lomba Antar Kelompok', hasil: '-', pj: 'PJP Desa', waktuPelaksanaan: '2024-03-20', statusHasil: 'Dalam Proses' },
  { id: '4', bulan: 'Januari', tahun: 2024, agenda: 'Rapat Koordinasi Awal Tahun', hasil: 'Disepakati rencana kerja', pj: 'Admin Super', waktuPelaksanaan: '2024-01-20', statusHasil: 'Terlaksana' },
  { id: '5', bulan: 'Februari', tahun: 2024, agenda: 'Pelatihan Guru', hasil: 'Pelatihan selesai', pj: 'Admin', waktuPelaksanaan: '2024-02-15', statusHasil: 'Terlaksana' },
];

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

const filterOptions = [
    { value: 'bulan', label: 'Bulan' },
    { value: 'tahun', label: 'Tahun' },
    { value: 'pj', label: 'PJ' },
    { value: 'statusHasil', label: 'Status Hasil' },
];

interface M5USectionProps {
  currentUser: User | null;
}

export default function M5USection({ currentUser }: M5USectionProps) {
  const [m5uItems, setM5uItems] = useState<M5U[]>(initialData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<Omit<M5U, 'id'>>({
    bulan: '', tahun: new Date().getFullYear(), agenda: '', hasil: '', pj: '', waktuPelaksanaan: '', statusHasil: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailItem, setDetailItem] = useState<M5U | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('bulan');

  const canEdit = currentUser?.role !== 'guru';

  const dropdownCategories = ['bulan', 'tahun', 'statusHasil'];

  const searchOptions = useMemo(() => {
    if (!dropdownCategories.includes(filterCategory)) return [];
    if (filterCategory === 'bulan') return months;
    if (filterCategory === 'tahun') return years.map(String);
    if (filterCategory === 'statusHasil') return ['Terlaksana', 'Dalam Proses', 'Belum Terlaksana', 'Mansuh'];
    return [];
  }, [filterCategory]);

  // Aggregate data by month and year
  const aggregatedData = useMemo(() => {
    const aggregation: Record<string, { bulan: string; tahun: number; jumlahAgenda: number; items: M5U[] }> = {};
    
    m5uItems.forEach(item => {
      const key = `${item.bulan}-${item.tahun}`;
      if (!aggregation[key]) {
        aggregation[key] = {
          bulan: item.bulan,
          tahun: item.tahun,
          jumlahAgenda: 0,
          items: []
        };
      }
      aggregation[key].jumlahAgenda += 1;
      aggregation[key].items.push(item);
    });
    
    return Object.values(aggregation);
  }, [m5uItems]);

  const filteredAggregatedData = useMemo(() => {
    if (!searchTerm) {
      return aggregatedData;
    }
    return aggregatedData.filter(item => {
      const value = item[filterCategory as keyof typeof item];
      if (dropdownCategories.includes(filterCategory)) {
        return String(value) === searchTerm;
      }
      return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [aggregatedData, searchTerm, filterCategory]);

  const chartData = useMemo(() => {
    const statusCounts = {
      'Terlaksana': 0,
      'Dalam Proses': 0,
      'Belum Terlaksana': 0,
      'Mansuh': 0,
    };

    m5uItems.forEach(item => {
      if (item.statusHasil && statusCounts.hasOwnProperty(item.statusHasil)) {
        statusCounts[item.statusHasil as keyof typeof statusCounts]++;
      }
    });

    return Object.entries(statusCounts)
      .map(([name, value]) => ({ name, value }));
  }, [m5uItems]);

  const totalTerlaksana = useMemo(() => chartData.find(d => d.name === 'Terlaksana')?.value || 0, [chartData]);
  const totalDalamProses = useMemo(() => chartData.find(d => d.name === 'Dalam Proses')?.value || 0, [chartData]);
  const totalBelumTerlaksana = useMemo(() => chartData.find(d => d.name === 'Belum Terlaksana')?.value || 0, [chartData]);
  const totalMansuh = useMemo(() => chartData.find(d => d.name === 'Mansuh')?.value || 0, [chartData]);

  const openDialog = (item?: M5U) => {
    if (item) {
      setIsEditMode(true);
      setCurrentItem(item);
      setEditingId(item.id);
    } else {
      setIsEditMode(false);
      setCurrentItem({
        bulan: months[new Date().getMonth()], tahun: new Date().getFullYear(), agenda: '', hasil: '', pj: '', waktuPelaksanaan: '', statusHasil: ''
      });
      setEditingId(null);
    }
    setIsDialogOpen(true);
  };

  const openDetailDialog = (item: M5U) => {
    setDetailItem(item);
    setIsDetailDialogOpen(true);
  };

  const closeDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setDetailItem(null);
  };

  const handleSave = () => {
    if (isEditMode && editingId) {
      setM5uItems(m5uItems.map(item => item.id === editingId ? { ...currentItem, id: editingId } : item));
    } else {
      setM5uItems([...m5uItems, { ...currentItem, id: new Date().toISOString() }]);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setM5uItems(m5uItems.filter(item => item.id !== id));
  };

  const renderSearchInput = () => {
    if (dropdownCategories.includes(filterCategory)) {
      return (
        <Select 
          value={searchTerm} 
          onValueChange={(value) => setSearchTerm(value === '--all--' ? '' : value || '')}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={`Pilih ${filterOptions.find(f => f.value === filterCategory)?.label}...`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="--all--">Semua</SelectItem>
            {searchOptions.map(option => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    return (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input 
          placeholder="Cari..." 
          className="pl-10" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
      </div>
    );
  };

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <DashboardStatCard title="Terlaksana" value={totalTerlaksana} icon={CheckCircle} />
        <DashboardStatCard title="Dalam Proses" value={totalDalamProses} icon={Clock} />
        <DashboardStatCard title="Belum Terlaksana" value={totalBelumTerlaksana} icon={XCircle} />
        <DashboardStatCard title="Mansuh" value={totalMansuh} icon={Archive} />
      </div>
      <div className="mb-6">
        <M5UStatusChart data={chartData.filter(d => d.value > 0)} />
      </div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Agenda M5U</h2>
        <div className="flex items-center gap-2">
            {renderSearchInput()}
            <Select value={filterCategory} onValueChange={(value) => {
                setFilterCategory(value);
                setSearchTerm('');
            }}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {filterOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {canEdit && (
              <Button onClick={() => openDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Agenda
              </Button>
            )}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bulan</TableHead>
              <TableHead>Tahun</TableHead>
              <TableHead>Jumlah Agenda</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAggregatedData.map((item) => (
              <TableRow key={`${item.bulan}-${item.tahun}`}>
                <TableCell>{item.bulan}</TableCell>
                <TableCell>{item.tahun}</TableCell>
                <TableCell>{item.jumlahAgenda}</TableCell>
                <TableCell className="text-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openDetailDialog(item.items[0])}>
                    <Eye className="w-4 h-4 mr-2" />
                    Detail
                  </Button>
                  {canEdit && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => openDialog()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openDialog(item.items[0])}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detail Agenda M5U</DialogTitle>
          </DialogHeader>
          {detailItem && (
            <div className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Bulan</Label>
                  <p>{detailItem.bulan}</p>
                </div>
                <div>
                  <Label className="font-semibold">Tahun</Label>
                  <p>{detailItem.tahun}</p>
                </div>
                <div className="md:col-span-2">
                  <Label className="font-semibold">Agenda</Label>
                  <p>{detailItem.agenda}</p>
                </div>
                <div className="md:col-span-2">
                  <Label className="font-semibold">Hasil</Label>
                  <p>{detailItem.hasil || '-'}</p>
                </div>
                <div>
                  <Label className="font-semibold">Penanggung Jawab</Label>
                  <p>{detailItem.pj}</p>
                </div>
                <div>
                  <Label className="font-semibold">Waktu Pelaksanaan</Label>
                  <p>{detailItem.waktuPelaksanaan || '-'}</p>
                </div>
                <div className="md:col-span-2">
                  <Label className="font-semibold">Status Hasil</Label>
                  <p>{detailItem.statusHasil || '-'}</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Semua Agenda di {detailItem.bulan} {detailItem.tahun}</h3>
                <div className="max-h-60 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Agenda</TableHead>
                        <TableHead>PJ</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {aggregatedData
                        .find(d => d.bulan === detailItem.bulan && d.tahun === detailItem.tahun)
                        ?.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.agenda}</TableCell>
                            <TableCell>{item.pj}</TableCell>
                            <TableCell>{item.statusHasil}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={closeDetailDialog}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Agenda M5U' : 'Tambah Agenda M5U Baru'}</DialogTitle>
          </DialogHeader>
          <div className="py-4 grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bulan">Bulan</Label>
              <Select 
                value={currentItem.bulan} 
                onValueChange={(value) => setCurrentItem(prev => ({ ...prev, bulan: value }))}
              >
                <SelectTrigger id="bulan" className="mt-1">
                  <SelectValue placeholder="Pilih Bulan" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tahun">Tahun</Label>
              <Select 
                value={String(currentItem.tahun)} 
                onValueChange={(value) => setCurrentItem(prev => ({ ...prev, tahun: Number(value) }))}
              >
                <SelectTrigger id="tahun" className="mt-1">
                  <SelectValue placeholder="Pilih Tahun" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="agenda">Agenda</Label>
              <Textarea 
                id="agenda" 
                value={currentItem.agenda} 
                onChange={(e) => setCurrentItem(prev => ({ ...prev, agenda: e.target.value }))} 
                className="mt-1" 
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="hasil">Hasil</Label>
              <Textarea 
                id="hasil" 
                value={currentItem.hasil} 
                onChange={(e) => setCurrentItem(prev => ({ ...prev, hasil: e.target.value }))} 
                className="mt-1" 
              />
            </div>
            <div>
              <Label htmlFor="pj">Penanggung Jawab (PJ)</Label>
              <Input 
                id="pj" 
                value={currentItem.pj} 
                onChange={(e) => setCurrentItem(prev => ({ ...prev, pj: e.target.value }))} 
                className="mt-1" 
              />
            </div>
            <div>
              <Label htmlFor="waktuPelaksanaan">Waktu Pelaksanaan</Label>
              <Input 
                id="waktuPelaksanaan" 
                type="date" 
                value={currentItem.waktuPelaksanaan} 
                onChange={(e) => setCurrentItem(prev => ({ ...prev, waktuPelaksanaan: e.target.value }))} 
                className="mt-1" 
              />
            </div>
            {isEditMode && (
              <div className="col-span-2">
                <Label htmlFor="statusHasil">Status Hasil</Label>
                <Select 
                  value={currentItem.statusHasil} 
                  onValueChange={(value) => setCurrentItem(prev => ({ ...prev, statusHasil: value as M5U['statusHasil'] }))}
                >
                  <SelectTrigger id="statusHasil" className="mt-1">
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Terlaksana">Terlaksana</SelectItem>
                    <SelectItem value="Dalam Proses">Dalam Proses</SelectItem>
                    <SelectItem value="Belum Terlaksana">Belum Terlaksana</SelectItem>
                    <SelectItem value="Mansuh">Mansuh</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}