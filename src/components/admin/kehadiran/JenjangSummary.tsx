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
    <Card className="mb-8">
      <CardHeader><CardTitle>Rata-rata Kehadiran per Jenjang Usia</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Jenjang Usia</TableHead>
              <TableHead className="text-center">Total Kehadiran</TableHead>
              <TableHead className="w-48">Persentase</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jenjangUsiaSummary.map(summary => (
              <TableRow key={summary.name}>
                <TableCell>{summary.name}</TableCell>
                <TableCell className="text-center">{summary.attended} / {summary.held}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={summary.percentage} className="w-24" />
                    <span>{summary.percentage}%</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
