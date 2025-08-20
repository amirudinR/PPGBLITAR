import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface GenerusChartProps {
  data: { name: string; 'Laki-laki': number; 'Perempuan': number }[];
}

export default function GenerusChart({ data }: GenerusChartProps) {
  const totalLakiLaki = useMemo(() => data.reduce((acc, cur) => acc + cur['Laki-laki'], 0), [data]);
  const totalPerempuan = useMemo(() => data.reduce((acc, cur) => acc + cur['Perempuan'], 0), [data]);
  const grandTotal = totalLakiLaki + totalPerempuan;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Statistik Generus per Jenjang Usia</CardTitle>
        <CardDescription>
          Total: {grandTotal} (Laki-laki: {totalLakiLaki}, Perempuan: {totalPerempuan})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Laki-laki" fill="#3b82f6" name="Laki-laki" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="Laki-laki" position="top" formatter={(value: number) => (value > 0 ? value : '')} fontSize={12} />
            </Bar>
            <Bar dataKey="Perempuan" fill="#ec4899" name="Perempuan" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="Perempuan" position="top" formatter={(value: number) => (value > 0 ? value : '')} fontSize={12} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}