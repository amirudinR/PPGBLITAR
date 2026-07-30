import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useChartColors } from '@/hooks/useChartColors';

interface GenerusChartProps {
  data: { name: string; 'Laki-laki': number; 'Perempuan': number }[];
}

export default function GenerusChart({ data }: GenerusChartProps) {
  const colors = useChartColors(2);

  return (
    <Card className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-xs mb-6">
      <CardHeader className="border-b border-border/50 px-6 py-4">
        <CardTitle className="text-base font-bold text-foreground">Distribusi Generus per Jenjang Usia</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }} />
            <Legend />
            <Bar dataKey="Laki-laki" fill={colors[0]} radius={[6, 6, 0, 0]} name="Laki-laki" />
            <Bar dataKey="Perempuan" fill={colors[1]} radius={[6, 6, 0, 0]} name="Perempuan" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}