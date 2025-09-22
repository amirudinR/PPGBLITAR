import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { M5U, User } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, ArrowLeft, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import { useM5U } from '@/hooks/useM5U';

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

// Fungsi untuk memformat tanggal ke format dd-mm-yyyy
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateString;
};

// Fungsi untuk memformat tanggal ke format Indonesia
const formatIndonesianDate = (date: Date) => {
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

export default function M5UDetailPage() {
  const navigate = useNavigate();
  const { bulan, tahun } = useParams<{ bulan: string; tahun: string }>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<Omit<M5U, 'id'>>({
    bulan: bulan || '', tahun: Number(tahun) || new Date().getFullYear(), agenda: '', hasil: '', pj: '', waktuPelaksanaan: '', statusHasil: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Mock current user - in a real app this would come from context or props
  const currentUser: User | null = {
    id: 'user-id',
    name: 'Current User',
    email: 'user@example.com',
    role: 'admin',
    status: 'active',
    desa: 'Desa Example',
    kelompok: 'Kelompok Example'
  };
  
  const { m5uItems, loading, addM5U, updateM5U, deleteM5U } = useM5U(currentUser);
  
  // Filter items for current month/year
  const filteredM5UItems = useMemo(() => {
    return m5uItems.filter(item => 
      item.bulan === bulan && 
      item.tahun === Number(tahun)
    );
  }, [m5uItems, bulan, tahun]);

  const openDialog = (item?: M5U) => {
    if (item) {
      setIsEditMode(true);
      setCurrentItem(item);
      setEditingId(item.id);
    } else {
      setIsEditMode(false);
      setCurrentItem({
        bulan: bulan || '', tahun: Number(tahun) || new Date().getFullYear(), agenda: '', hasil: '', pj: currentUser?.name || '', waktuPelaksanaan: '', statusHasil: ''
      });
      setEditingId(null);
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    let success = false;
    if (isEditMode && editingId) {
      success = await updateM5U(editingId, currentItem);
    } else {
      // Add desa and kelompok info for role-based access control
      const itemWithMetadata = {
        ...currentItem,
        desa: currentUser?.desa || '',
        kelompok: currentUser?.kelompok || '',
        guruId: currentUser?.id || ''
      };
      success = await addM5U(itemWithMetadata);
    }
    
    if (success) {
      setIsDialogOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteM5U(id);
  };

  const handleChange = (field: keyof Omit<M5U, 'id'>, value: string | number) => {
    setCurrentItem(prev => ({ ...prev, [field]: value }));
  };

  // Fungsi untuk mengubah status hasil langsung di tabel
  const handleStatusChange = async (id: string, newStatus: M5U['statusHasil']) => {
    const itemToUpdate = filteredM5UItems.find(item => item.id === id);
    if (itemToUpdate) {
      await updateM5U(id, { ...itemToUpdate, statusHasil: newStatus });
    }
  };

  // Fungsi untuk mencetak PDF
  const handlePrintPDF = () => {
    const doc = new jsPDF();
    
    // Set font size and styles
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Musyawaroh 5 Unsur (M5U)', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Kelompok: ${currentUser?.kelompok || 'Kelompok Contoh'}`, 105, 30, { align: 'center' });
    doc.text(`Bulan: ${bulan} ${tahun}`, 105, 37, { align: 'center' });
    
    // Add content
    let yPos = 50;
    filteredM5UItems.forEach((item, index) => {
      if (yPos > 250) { // Create new page if needed
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFont(undefined, 'bold');
      doc.text(`${index + 1}. ${item.agenda}`, 20, yPos);
      yPos += 7;
      
      doc.setFont(undefined, 'normal');
      doc.text(`Hasil: ${item.hasil || '-'}`, 25, yPos);
      yPos += 7;
      
      doc.text(`Tanggal Pelaksanaan: ${formatDate(item.waktuPelaksanaan)}`, 25, yPos);
      yPos += 7;
      
      doc.text(`Penanggung Jawab: ${item.pj}`, 25, yPos);
      yPos += 12;
    });
    
    // Add signature section
    yPos += 10;
    const signatureY = yPos > 250 ? 250 : yPos;
    
    doc.text(`Samarinda, ${formatIndonesianDate(new Date())}`, 140, signatureY);
    doc.text('PJP Kelompok', 140, signatureY + 30);
    doc.line(130, signatureY + 25, 180, signatureY + 25); // Signature line
    
    doc.text('Pembina Kelompok', 40, signatureY + 30);
    doc.line(30, signatureY + 25, 80, signatureY + 25); // Signature line
    
    // Save the PDF
    doc.save(`M5U_${currentUser?.kelompok || 'Kelompok'}_${bulan}_${tahun}.pdf`);
  };

  if (loading) {
    return <div className="p-6 text-center">Memuat data...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Detail Agenda M5U</h1>
        <Button variant="outline" size="icon" onClick={handlePrintPDF} className="ml-auto">
          <Printer className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <Label className="font-semibold">Bulan</Label>
            <p className="text-lg">{bulan}</p>
          </div>
          <div>
            <Label className="font-semibold">Tahun</Label>
            <p className="text-lg">{tahun}</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Daftar Agenda</h2>
          <Button onClick={() => openDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Agenda
          </Button>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agenda</TableHead>
                <TableHead>Hasil</TableHead>
                <TableHead>PJ</TableHead>
                <TableHead>Tanggal Pelaksanaan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredM5UItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.agenda}</TableCell>
                  <TableCell>{item.hasil || '-'}</TableCell>
                  <TableCell>{item.pj}</TableCell>
                  <TableCell>{formatDate(item.waktuPelaksanaan)}</TableCell>
                  <TableCell>
                    <Select 
                      value={item.statusHasil || ''} 
                      onValueChange={(value) => handleStatusChange(item.id, value as M5U['statusHasil'])}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Pilih Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Terlaksana">Terlaksana</SelectItem>
                        <SelectItem value="Dalam Proses">Dalam Proses</SelectItem>
                        <SelectItem value="Belum Terlaksana">Belum Terlaksana</SelectItem>
                        <SelectItem value="Mansuh">Mansuh</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => openDialog(item)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini akan menghapus agenda ini secara permanen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(item.id)}>
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Agenda M5U' : 'Tambah Agenda M5U Baru'}</DialogTitle>
          </DialogHeader>
          <div className="py-4 grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="agenda">Agenda</Label>
              <Textarea 
                id="agenda" 
                value={currentItem.agenda} 
                onChange={(e) => handleChange('agenda', e.target.value)} 
                className="mt-1" 
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="hasil">Hasil</Label>
              <Textarea 
                id="hasil" 
                value={currentItem.hasil} 
                onChange={(e) => handleChange('hasil', e.target.value)} 
                className="mt-1" 
              />
            </div>
            <div>
              <Label htmlFor="pj">Penanggung Jawab (PJ)</Label>
              <Input 
                id="pj" 
                value={currentItem.pj} 
                onChange={(e) => handleChange('pj', e.target.value)} 
                className="mt-1" 
              />
            </div>
            <div>
              <Label htmlFor="waktuPelaksanaan">Waktu Pelaksanaan</Label>
              <Input 
                id="waktuPelaksanaan" 
                type="date" 
                value={currentItem.waktuPelaksanaan} 
                onChange={(e) => handleChange('waktuPelaksanaan', e.target.value)} 
                className="mt-1" 
              />
            </div>
            {isEditMode && (
              <div className="col-span-2">
                <Label htmlFor="statusHasil">Status Hasil</Label>
                <Select 
                  value={currentItem.statusHasil} 
                  onValueChange={(value) => handleChange('statusHasil', value as M5U['statusHasil'])}
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