import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface AttendanceChartProps {
  data: { name: string; percentage: number }[];
}

export default function AttendanceChart({ data }: AttendanceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Persentase Kehadiran per Kelas</CardTitle>
        <CardDescription>Berdasarkan data kehadiran bulanan yang diisi oleh guru.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 100]} unit="%" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Bar dataKey="percentage" fill="#4f46e5" name="Kehadiran" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="percentage" position="top" formatter={(value: number) => `${value}%`} fontSize={12} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}