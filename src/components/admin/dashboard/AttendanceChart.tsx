import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MonthlyAttendance, Kelas } from '@/types/admin';
import { useChartColors } from '@/hooks/useChartColors';

interface AttendanceChartProps {
  attendance: MonthlyAttendance[];
  kelas: Kelas[];
}

export default function AttendanceChart({ attendance, kelas }: AttendanceChartProps) {
  const colors = useChartColors(1);

  const chartData = useMemo(() => {
    const classSummary: { [classId: string]: { attended: number; held: number } } = {};

    attendance.forEach(record => {
      if (!classSummary[record.classId]) {
        classSummary[record.classId] = { attended: 0, held: 0 };
      }
      classSummary[record.classId].attended += record.meetingsAttended;
      classSummary[record.classId].held += record.meetingsHeld;
    });

    const kelasMap = new Map(kelas.map(k => [k.id, k.namaKelas]));

    return Object.entries(classSummary).map(([classId, data]) => ({
      name: kelasMap.get(classId) || 'Kelas Tidak Dikenal',
      percentage: data.held > 0 ? Math.round((data.attended / data.held) * 100) : 0,
    }));
  }, [attendance, kelas]);

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Persentase Kehadiran per Kelas</CardTitle>
        <CardDescription>
          Rekapitulasi kehadiran bulanan untuk setiap kelas di kelompok Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 100]} unit="%" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Bar dataKey="percentage" fill={colors[0]} name="Kehadiran" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="percentage" position="top" formatter={(value: number) => `${value}%`} fontSize={12} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}