import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Desa, JENJANG_USIA_LIST } from '@/types/admin';

type SummaryData = {
  [key: string]: { attended: number; held: number };
};

interface AdminDesaViewProps {
  desas: Desa[];
  summaryData: Record<string, SummaryData>;
}

export default function AdminDesaView({ desas, summaryData }: AdminDesaViewProps) {
  return (
    <Accordion type="multiple" className="w-full space-y-4">
      {desas.map(desa => {
        const desaSummary = summaryData[desa.name] || {};
        return (
          <AccordionItem value={desa.id} key={desa.id} className="bg-card rounded-lg shadow">
            <AccordionTrigger className="px-6 text-lg font-semibold hover:no-underline">
              {desa.name}
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <Table>
                <TableHeader><TableRow><TableHead>Jenjang Usia</TableHead><TableHead className="text-center">Total Kehadiran</TableHead><TableHead className="w-48">Persentase</TableHead></TableRow></TableHeader>
                <TableBody>
                  {JENJANG_USIA_LIST.map(jenjang => {
                    const stats = desaSummary[jenjang] || { attended: 0, held: 0 };
                    const percentage = stats.held > 0 ? Math.round((stats.attended / stats.held) * 100) : 0;
                    return (
                      <TableRow key={jenjang}>
                        <TableCell>{jenjang}</TableCell>
                        <TableCell className="text-center">{stats.attended} / {stats.held}</TableCell>
                        <TableCell><div className="flex items-center gap-2"><Progress value={percentage} className="w-24" /><span>{percentage}%</span></div></TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  );
}
