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
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Distribusi Generus per Jenjang Usia</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Laki-laki" fill={colors[0]} name="Laki-laki" />
            <Bar dataKey="Perempuan" fill={colors[1]} name="Perempuan" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}