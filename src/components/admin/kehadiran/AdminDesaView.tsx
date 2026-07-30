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
          <AccordionItem value={desa.id} key={desa.id} className="bg-card rounded-3xl border border-border/60 overflow-hidden shadow-xs px-2">
            <AccordionTrigger className="px-6 py-4 text-base font-bold text-foreground hover:no-underline">
              Desa {desa.name}
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2">
              <div className="overflow-x-auto rounded-2xl border border-border/50">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow className="border-b border-border/60">
                      <TableHead className="font-bold text-xs uppercase text-muted-foreground py-3 pl-4">Jenjang Usia</TableHead>
                      <TableHead className="font-bold text-xs uppercase text-muted-foreground py-3 text-center">Total Kehadiran</TableHead>
                      <TableHead className="font-bold text-xs uppercase text-muted-foreground py-3 text-center pr-4">Persentase</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {JENJANG_USIA_LIST.map(jenjang => {
                      const stats = desaSummary[jenjang] || { attended: 0, held: 0 };
                      const percentage = stats.held > 0 ? Math.round((stats.attended / stats.held) * 100) : 0;
                      return (
                        <TableRow key={jenjang} className="hover:bg-muted/30 border-b border-border/40 transition-colors">
                          <TableCell className="font-semibold text-foreground text-xs py-3 pl-4">{jenjang}</TableCell>
                          <TableCell className="text-center font-semibold text-xs py-3">{stats.attended} / {stats.held}</TableCell>
                          <TableCell className="py-3 pr-4">
                            <div className="flex items-center justify-center gap-3 max-w-xs mx-auto">
                              <Progress value={percentage} className="h-2 flex-1 rounded-full" />
                              <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                                percentage >= 85
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : percentage >= 65
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              }`}>
                                {percentage}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
