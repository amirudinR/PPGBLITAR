import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useJariyahPPG } from '@/hooks/useJariyahPPG';
import { User, JariyahPPG, JENIS_JARIYAH_LIST, Generus } from '@/types/admin';
import JariyahStatisticsCards from './JariyahStatisticsCards';
import JariyahFilters from './JariyahFilters';
import JariyahTable from './JariyahTable';
import JariyahFormDialog from './JariyahFormDialog';
import JariyahDeleteDialog from './JariyahDeleteDialog';

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
                    <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90">
                        <Plus className="w-4 h-4 mr-2" /> Tambah Jariyah
                    </Button>
                )}
            </div>

            {/* Statistics Cards */}
            <JariyahStatisticsCards stats={stats} formatCurrency={formatCurrency} />

            {/* Filters */}
            <JariyahFilters
                searchTerm={searchTerm}
                filterMonth={filterMonth}
                filterJenis={filterJenis}
                onSearchChange={setSearchTerm}
                onMonthChange={setFilterMonth}
                onJenisChange={setFilterJenis}
                months={MONTHS}
                jenisList={[...JENIS_JARIYAH_LIST]}
            />

            {/* Data Table */}
            <JariyahTable
                items={filteredItems}
                canEdit={canEdit}
                formatCurrency={formatCurrency}
                onEdit={handleOpenDialog}
                onDelete={(item) => { setSelectedItem(item); setIsDeleteDialogOpen(true); }}
            />

            {/* Add/Edit Dialog */}
            <JariyahFormDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSubmit={handleSubmit}
                selectedItem={selectedItem}
                formData={formData}
                onFormDataChange={setFormData}
                onDonaturTypeChange={handleDonaturTypeChange}
                onGenerusChange={handleGenerusChange}
                generus={generus}
                months={MONTHS}
            />

            {/* Delete Confirmation Dialog */}
            <JariyahDeleteDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDelete}
            />
        </div>
    );
}
