import React from 'react';
import { User } from '@/types/admin';
import SectionHeader from '../shared/SectionHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2 } from 'lucide-react';
import HierarchyNode from './HierarchyNode';
import SetupStepsSection from './SetupStepsSection';
import FlowDiagram from './FlowDiagram';
import { ROLE_TREE, OPERATIONAL_FLOWS } from './constants';

/* ── Main component ─────────────────────────────────────────────── */

interface Props {
  currentUser: User | null;
}

export default function AlurKerjaSection({ currentUser }: Props) {
  return (
    <div className="space-y-10">
      <SectionHeader
        title="Alur Kerja Aplikasi"
        subtitle="Pelajari struktur organisasi, langkah setup awal, dan alur operasional harian aplikasi ini."
      />

      {/* ── Section 1: Hierarchy ────────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold mb-1">1. Struktur Hierarki &amp; Peran</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Setiap peran memiliki tanggung jawab dan akses fitur yang berbeda. Peran yang lebih tinggi dapat memantau peran di bawahnya.
        </p>
        <div className="overflow-x-auto pb-4">
          <div className="flex justify-center min-w-[320px]">
            <HierarchyNode node={ROLE_TREE} />
          </div>
        </div>
      </section>

      {/* ── Section 2: Setup steps ──────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold mb-1">2. Alur Setup Awal</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Ikuti langkah-langkah ini secara berurutan saat pertama kali menggunakan sistem.
        </p>
        <SetupStepsSection />
        <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
          <span>Setelah 8 langkah di atas selesai, sistem siap digunakan untuk operasional harian!</span>
        </div>
      </section>

      {/* ── Section 3: Operational flows ────────────────────── */}
      <section>
        <h2 className="text-lg font-bold mb-1">3. Alur Operasional</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Berikut adalah alur kerja sehari-hari untuk setiap kategori fitur. Klik tab untuk melihat alur masing-masing.
        </p>
        <Tabs defaultValue="kehadiran">
          <TabsList className="flex-wrap h-auto gap-1 mb-4">
            {OPERATIONAL_FLOWS.map((flow) => {
              const Icon = flow.icon;
              return (
                <TabsTrigger key={flow.id} value={flow.id} className="text-xs sm:text-sm gap-1.5">
                  <Icon className="w-3.5 h-3.5" />
                  {flow.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
          {OPERATIONAL_FLOWS.map((flow) => (
            <TabsContent key={flow.id} value={flow.id}>
              <div className="max-w-lg mx-auto">
                <FlowDiagram flow={flow} />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </div>
  );
}
