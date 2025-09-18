import React, { useState, useMemo } from 'react';
import { M5U, User } from '@/types/admin';
import { Plus, Edit, Trash2, Search, CheckCircle, Clock, XCircle, Archive } from 'lucide-react';
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

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

const filterOptions = [
    { value: 'bulan', label: 'Bulan' },
    { value: 'tahun', label: 'Tahun' },
    { value: 'agenda', label: 'Agenda' },
    { value: 'hasil', label: 'Hasil' },
    { value: 'pj', label: 'PJ' },
    { value: 'statusHasil', label: 'Status Hasil' },
];

interface M5USectionProps {
  currentUser: User | null;
}

export default function M5USection({ currentUser }: M5USectionProps) {
  const [m5uItems, setM5uItems] = useState<M5U[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<Omit<M5U, 'id'>>({
    bulan: '', tahun: new Date().getFullYear(), agenda: '', hasil: '', pj: '', waktuPelaksanaan: '', statusHasil: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('bulan');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<M5U | null>(null);

  // Filter M5U items based on user role
  const filteredM5uItems = useMemo(() => {
    let items = m5uItems;
    
    // Filter by user's kelompok
    if (currentUser?.kelompok) {
      items = items.filter(item => 
        item.pj.includes(currentUser.kelompok) || 
        item.agenda.includes(currentUser.kelompok)
      );
    }
    
    // Apply search filter
    if (searchTerm) {
      items = items.filter(item => {
        const value = item[filterCategory as keyof M5U];
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    
    return items;
  }, [m5uItems, currentUser, searchTerm, filterCategory]);

  // Group items by month for the main view
  const groupedByMonth = useMemo(() => {
    const groups: Record<string, M5U[]> = {};
    filteredM5uItems.forEach(item => {
      const key = `${item.bulan} ${item.tahun}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });
    return groups;
  }, [filteredM5uItems]);

  const canEdit = currentUser?.role !== 'guru';

  const dropdownCategories = ['bulan', 'tahun', 'statusHasil'];

  const searchOptions = useMemo(() => {
    if (!dropdownCategories.includes(filterCategory)) return [];
    if (filterCategory === 'bulan') return months;
    if (filterCategory === 'tahun') return years.map(String);
    if (filterCategory === 'statusHasil') return ['Terlaksana', 'Dalam Proses', 'Belum Terlaksana', 'Mansuh'];
    return [];
  }, [filterCategory]);

  const chartData = useMemo(() => {
    const statusCounts = {
      'Terlaksana': 0,
      'Dalam Proses': 0,
      'Belum Terlaksana': 0,
      'Mansuh': 0,
    };

    filteredM5uItems.forEach(item => {
      if (item.statusHasil && statusCounts.hasOwnProperty(item.statusHasil)) {
        statusCounts[item.statusHasil as keyof typeof statusCounts]++;
      }
    });

    return Object.entries(statusCounts)
      .map(([name, value]) => ({ name, value }));
  }, [filteredM5uItems]);

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
    setSelectedItem(item);
    setIsDetailDialogOpen(true);
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

  // Get status icon and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Terlaksana':
        return { icon: CheckCircle, color: 'text-green-500' };
      case 'Dalam Proses':
        return { icon: Clock, color: 'text-blue-500' };
      case 'Belum Terlaksana':
        return { icon: XCircle, color: 'text-red-500' };
      case 'Mansuh':
        return { icon: Archive, color: 'text-gray-500' };
      default:
        return { icon: Clock, color: 'text-gray-500' };
    }
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
        <h2 className="text-2xl font-bold">Detail Agenda M5U</h2>
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
      
      {/* Main view grouped by month */}
      <div className="space-y-6">
        {Object.entries(groupedByMonth).map(([monthYear, items]) => {
          const [bulan, tahun] = monthYear.split(' ');
          return (
            <div key={monthYear} className="bg-white rounded-lg shadow overflow-hidden">
              <div 
                className="px-6 py-4 bg-gray-50 cursor-pointer hover:bg-gray-100 flex justify-between items-center"
                onClick={() => setSelectedMonth(selectedMonth === monthYear ? null : monthYear)}
              >
                <h3 className="text-lg font-semibold">{bulan} {tahun}</h3>
                <span className="text-sm text-gray-500">
                  {items.length} agenda
                </span>
              </div>
              
              {selectedMonth === monthYear && (
                <div className="p-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Agenda</TableHead>
                        <TableHead>PJ</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => {
                        const statusInfo = getStatusInfo(item.statusHasil);
                        const StatusIcon = statusInfo.icon;
                        
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.agenda}</TableCell>
                            <TableCell>{item.pj}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <StatusIcon className={`w-4 h-4 mr-2 ${statusInfo.color}`} />
                                <span>{item.statusHasil}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => openDetailDialog(item)}
                                className="mr-2"
                              >
                                Detail
                              </Button>
                              {canEdit && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => openDialog(item)}
                                    className="mr-1"
                                  >
                                    <Edit className="w-4 h-4 text-blue-600" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                        <AlertDialogDescription>Tindakan ini akan menghapus agenda M5U secara permanen.</AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(item.id)}>Hapus</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          );
        })}
      </div>

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

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detail Agenda M5U</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Bulan</Label>
                  <p className="mt-1 text-sm">{selectedItem.bulan}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tahun</Label>
                  <p className="mt-1 text-sm">{selectedItem.tahun}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Agenda</Label>
                <p className="mt-1 text-sm">{selectedItem.agenda}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Hasil</Label>
                <p className="mt-1 text-sm whitespace-pre-wrap">{selectedItem.hasil || '-'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Penanggung Jawab</Label>
                <p className="mt-1 text-sm">{selectedItem.pj}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Waktu Pelaksanaan</Label>
                <p className="mt-1 text-sm">
                  {selectedItem.waktuPelaksanaan 
                    ? new Date(selectedItem.waktuPelaksanaan).toLocaleDateString('id-ID') 
                    : '-'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="mt-1 flex items-center">
                  {(() => {
                    const statusInfo = getStatusInfo(selectedItem.statusHasil);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <>
                        <StatusIcon className={`w-4 h-4 mr-2 ${statusInfo.color}`} />
                        <span>{selectedItem.statusHasil || '-'}</span>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDetailDialogOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}