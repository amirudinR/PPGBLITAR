import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GenerusChartProps {
  data: { name: string; 'Laki-laki': number; 'Perempuan': number }[];
}

export default function GenerusChart({ data }: GenerusChartProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Statistik Generus per Jenjang Usia</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Laki-laki" fill="#3b82f6" name="Laki-laki" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Perempuan" fill="#ec4899" name="Perempuan" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}