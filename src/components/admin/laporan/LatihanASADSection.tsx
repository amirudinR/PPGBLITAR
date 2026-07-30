import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User, LatihanASAD, JENIS_LATIHAN_LIST, Generus } from '@/types/admin';
import LatihanStatisticsCards from './LatihanStatisticsCards';
import LatihanFilters from './LatihanFilters';
import LatihanTable from './LatihanTable';
import LatihanFormDialog from './LatihanFormDialog';
import LatihanDeleteDialog from './LatihanDeleteDialog';

interface LatihanASADSectionProps {
    currentUser: User | null;
    generus: Generus[];
    latihanItems: LatihanASAD[];
    loading: boolean;
    onAdd: (data: Omit<LatihanASAD, 'id'>) => Promise<boolean>;
    onUpdate: (id: string, data: Omit<LatihanASAD, 'id'>) => Promise<boolean>;
    onDelete: (id: string) => Promise<void>;
}

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export default function LatihanASADSection({ currentUser, generus, latihanItems, loading, onAdd, onUpdate, onDelete }: LatihanASADSectionProps) {

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

    const stats = useMemo(() => {
        const total = latihanItems.length;
        const tercapai = latihanItems.filter(item => item.status === 'Tercapai').length;
        const tidakTercapai = latihanItems.filter(item => item.status === 'Tidak Tercapai').length;
        const dalamProses = latihanItems.filter(item => item.status === 'Dalam Proses').length;
        const persentaseTercapai = total > 0 ? Math.round((tercapai / total) * 100) : 0;
        return { total, tercapai, tidakTercapai, dalamProses, persentaseTercapai };
    }, [latihanItems]);

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
            await onUpdate(selectedItem.id, formData);
        } else {
            await onAdd(formData);
        }
        setIsDialogOpen(false);
    };

    const handleDelete = async () => {
        if (selectedItem) {
            await onDelete(selectedItem.id);
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
                    <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90">
                        <Plus className="w-4 h-4 mr-2" /> Tambah Latihan
                    </Button>
                )}
            </div>

            {/* Statistics Cards */}
            <LatihanStatisticsCards stats={stats} />

            {/* Filters */}
            <LatihanFilters
                searchTerm={searchTerm}
                filterMonth={filterMonth}
                filterStatus={filterStatus}
                onSearchChange={setSearchTerm}
                onMonthChange={setFilterMonth}
                onStatusChange={setFilterStatus}
                months={MONTHS}
            />

            {/* Data Table */}
            <LatihanTable
                items={filteredItems}
                canEdit={canEdit}
                onEdit={handleOpenDialog}
                onDelete={(item) => { setSelectedItem(item); setIsDeleteDialogOpen(true); }}
            />

            {/* Add/Edit Dialog */}
            <LatihanFormDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSubmit={handleSubmit}
                selectedItem={selectedItem}
                formData={formData}
                onFormDataChange={setFormData}
                onGenerusChange={handleGenerusChange}
                generus={generus}
                months={MONTHS}
            />

            {/* Delete Confirmation Dialog */}
            <LatihanDeleteDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDelete}
            />
        </div>
    );
}
