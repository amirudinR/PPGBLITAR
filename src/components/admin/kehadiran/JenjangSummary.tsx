import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

interface JenjangSummaryItem {
  name: string;
  attended: number;
  held: number;
  percentage: number;
}

interface JenjangSummaryProps {
  jenjangUsiaSummary: JenjangSummaryItem[];
}

export default function JenjangSummary({ jenjangUsiaSummary }: JenjangSummaryProps) {
  return (
    <Card className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-xs mb-6">
      <CardHeader className="border-b border-border/50 px-6 py-4">
        <CardTitle className="text-base font-bold text-foreground">Rata-rata Kehadiran per Jenjang Usia</CardTitle>
      </CardHeader>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="border-b border-border/60">
              <TableHead className="font-bold text-xs uppercase text-muted-foreground py-3.5 pl-6">Jenjang Usia</TableHead>
              <TableHead className="font-bold text-xs uppercase text-muted-foreground py-3.5 text-center">Total Kehadiran</TableHead>
              <TableHead className="font-bold text-xs uppercase text-muted-foreground py-3.5 text-center pr-6">Persentase Kehadiran</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jenjangUsiaSummary.map(summary => (
              <TableRow key={summary.name} className="hover:bg-muted/30 border-b border-border/40 transition-colors">
                <TableCell className="font-semibold text-foreground py-3.5 pl-6">{summary.name}</TableCell>
                <TableCell className="text-center font-semibold text-xs py-3.5">{summary.attended} / {summary.held}</TableCell>
                <TableCell className="py-3.5 pr-6">
                  <div className="flex items-center justify-center gap-3 max-w-xs mx-auto">
                    <Progress value={summary.percentage} className="h-2 flex-1 rounded-full" />
                    <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                      summary.percentage >= 85
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : summary.percentage >= 65
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}>
                      {summary.percentage}%
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
