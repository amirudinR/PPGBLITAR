import React, { useState, useCallback } from 'react';
import { User, Generus, Kelas } from '@/types/admin';
import { EvaluasiSemester, EvaluasiPeriode, AspekKepribadian, EvaluasiMetrics } from '@/types/evaluasi';
import SectionHeader from '../shared/SectionHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Eye } from 'lucide-react';
import { aggregateEvaluasiMetrics } from '@/utils/evaluasiAggregator';
import EvaluasiDetailDialog from './EvaluasiDetailDialog';
import EvaluasiFillTable from './EvaluasiFillTable';
import EvaluasiViewTable from './EvaluasiViewTable';
import EvaluasiWarningBanner from './EvaluasiWarningBanner';


interface Props {
  currentUser: User | null;
  generus?: Generus[];
  kelas?: Kelas[];
  evaluasiList: EvaluasiSemester[];
  activePeriode: EvaluasiPeriode | null;
  loadingEvaluasi: boolean;
  loadingPeriode: boolean;
  onSave: (id: string | null, data: Partial<EvaluasiSemester>) => Promise<boolean>;
  onPublish: (id: string) => Promise<boolean>;
  onNavigate?: (section: string) => void;
}

const EMPTY_ASPEK: AspekKepribadian = {
  akhlak: 3,
  kedisiplinan: 3,
  kemandirian: 3,
  kerjasama: 3,
  catatanAspek: '',
};

export default function EvaluasiSemesterSection({ currentUser, generus = [], kelas = [], evaluasiList, activePeriode, loadingEvaluasi, loadingPeriode, onSave, onPublish, onNavigate }: Props) {

  const [dialog, setDialog] = useState<{ open: boolean; existing?: EvaluasiSemester; generusItem?: Generus }>({ open: false });
  const [aspek, setAspek] = useState<AspekKepribadian>(EMPTY_ASPEK);
  const [catatanGuru, setCatatanGuru] = useState('');
  const [rekomendasi, setRekomendasi] = useState('');
  const [aggregating, setAggregating] = useState(false);
  const [dialogMetrics, setDialogMetrics] = useState<EvaluasiMetrics | null>(null);

  const isManager = ['adminsuper', 'admin'].includes(currentUser?.role ?? '');
  const isOrangtua = currentUser?.role === 'orangtua';
  const canEdit = !isManager && !isOrangtua;
  const canPublish = ['adminsuper', 'admin', 'desa', 'kelompok'].includes(currentUser?.role ?? '');

  const getKelasForGenerus = useCallback(
    (g: Generus) => kelas.find((k) => k.studentIds?.includes(g.id)),
    [kelas],
  );

  const openDialog = (ev: EvaluasiSemester, g?: Generus) => {
    setAspek(ev.aspekKepribadian ?? EMPTY_ASPEK);
    setCatatanGuru(ev.catatanGuru ?? '');
    setRekomendasi(ev.rekomendasi ?? '');
    setDialogMetrics(ev.metrics ?? null);
    setDialog({ open: true, existing: ev, generusItem: g });
  };

  const handleAutoAggregate = useCallback(async () => {
    if (!dialog.existing || !dialog.generusItem) return;
    const kelasItem = getKelasForGenerus(dialog.generusItem);
    if (!kelasItem || !activePeriode?.startDate || !activePeriode?.endDate) return;
    setAggregating(true);
    try {
      const metrics = await aggregateEvaluasiMetrics(
        dialog.generusItem.id,
        kelasItem.id,
        activePeriode.startDate.toDate(),
        activePeriode.endDate.toDate(),
      );
      setDialogMetrics(metrics);
      await onSave(dialog.existing.id || null, { metrics });
    } finally {
      setAggregating(false);
    }
  }, [dialog, activePeriode, onSave]);

  const handleSave = async (submit: boolean) => {
    if (!dialog.existing) return;
    await onSave(dialog.existing.id || null, {
      ...(dialogMetrics ? { metrics: dialogMetrics } : {}),
      aspekKepribadian: aspek,
      catatanGuru,
      rekomendasi,
      status: submit ? 'reviewed' : 'draft',
      filledBy: currentUser?.id,
      ...(dialog.existing.id ? {} : {
        generusId: dialog.existing.generusId,
        generusName: dialog.existing.generusName,
        kelasId: dialog.existing.kelasId,
        desa: dialog.existing.desa,
        kelompok: dialog.existing.kelompok,
        semester: dialog.existing.semester,
        tahunAjaran: dialog.existing.tahunAjaran,
        periode: dialog.existing.periode,
      }),
    });
    setDialog({ open: false });
  };

  const myKelas = kelas.filter((k) => {
    if (currentUser?.role === 'guru') return k.guruId === currentUser.id;
    if (currentUser?.role === 'kelompok') return k.kelompok === currentUser.kelompok && k.desa === currentUser.desa;
    return true;
  });

  const myGenerus = generus.filter((g) => {
    if (!activePeriode) return false;
    return myKelas.some((k) => k.studentIds?.includes(g.id));
  });

  if (loadingPeriode || loadingEvaluasi) {
    return <div className="text-center p-8 text-muted-foreground">Memuat evaluasi...</div>;
  }

  return (
    <div>
      <SectionHeader
        title="Evaluasi Semesteran"
        subtitle={
          activePeriode
            ? `Periode aktif: Semester ${activePeriode.semester} ${activePeriode.tahunAjaran}`
            : 'Tidak ada periode evaluasi yang sedang aktif.'
        }
      />

      {!activePeriode && !isOrangtua && (
        <EvaluasiWarningBanner isManager={isManager} onNavigate={onNavigate} />
      )}

      <Tabs defaultValue={canEdit ? 'isi' : 'lihat'}>
        <TabsList className="mb-4">
          {canEdit && !isOrangtua && (
            <TabsTrigger value="isi"><FileText className="w-4 h-4 mr-2" />Isi Evaluasi</TabsTrigger>
          )}
          <TabsTrigger value="lihat"><Eye className="w-4 h-4 mr-2" />Lihat Evaluasi ({evaluasiList.length})</TabsTrigger>
        </TabsList>

        {/* ─── ISI EVALUASI TAB (guru/PJP) ─── */}
        {canEdit && !isOrangtua && (
          <TabsContent value="isi">
            <EvaluasiFillTable
              generus={myGenerus}
              kelas={kelas}
              evaluasiList={evaluasiList}
              activePeriode={activePeriode}
              onOpenDialog={openDialog}
              getKelasForGenerus={getKelasForGenerus}
              currentUser={currentUser}
            />
          </TabsContent>
        )}

        {/* ─── LIHAT EVALUASI TAB ─── */}
        <TabsContent value="lihat">
          <EvaluasiViewTable
            evaluasiList={evaluasiList}
            canPublish={canPublish}
            onPublish={onPublish}
          />
        </TabsContent>
      </Tabs>

      {/* ─── FILL/VIEW DIALOG ─── */}
      <EvaluasiDetailDialog
        open={dialog.open}
        onOpenChange={(o) => setDialog({ open: o })}
        evaluasi={dialog.existing}
        generusItem={dialog.generusItem}
        aspek={aspek}
        onAspekChange={setAspek}
        catatanGuru={catatanGuru}
        onCatatanGuruChange={setCatatanGuru}
        rekomendasi={rekomendasi}
        onRekomendasiChange={setRekomendasi}
        dialogMetrics={dialogMetrics}
        aggregating={aggregating}
        canEdit={canEdit}
        isOrangtua={isOrangtua}
        onAutoAggregate={handleAutoAggregate}
        onSaveDraft={() => handleSave(false)}
        onSubmit={() => handleSave(true)}
      />
    </div>
  );
}
