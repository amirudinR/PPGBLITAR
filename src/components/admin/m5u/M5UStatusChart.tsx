import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSemanticColors } from '@/hooks/useChartColors';

interface M5UStatusChartProps {
  data: { name: string; value: number }[];
}

export default function M5UStatusChart({ data }: M5UStatusChartProps) {
  const semantic = useSemanticColors();
  const COLORS = [semantic.success, semantic.warning, semantic.destructive, semantic.muted];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ringkasan Status Hasil M5U</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}