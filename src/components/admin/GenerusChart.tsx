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
    <Card className="border-0 shadow-none">
      <CardContent className="p-0">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: '#6b7280' }}
            />
            <YAxis 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: '#6b7280' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
            />
            <Legend />
            <Bar 
              dataKey="Laki-laki" 
              fill="#3b82f6" 
              name="Laki-laki" 
              radius={[4, 4, 0, 0]}
              barSize={30}
            >
              <LabelList 
                dataKey="Laki-laki" 
                position="top" 
                formatter={(value: number) => (value > 0 ? value : '')} 
                fontSize={12} 
                fill="#1e40af"
              />
            </Bar>
            <Bar 
              dataKey="Perempuan" 
              fill="#ec4899" 
              name="Perempuan" 
              radius={[4, 4, 0, 0]}
              barSize={30}
            >
              <LabelList 
                dataKey="Perempuan" 
                position="top" 
                formatter={(value: number) => (value > 0 ? value : '')} 
                fontSize={12} 
                fill="#9d174d"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="text-center text-sm text-gray-500 mt-4">
          Total: {grandTotal} (Laki-laki: {totalLakiLaki}, Perempuan: {totalPerempuan})
        </div>
      </CardContent>
    </Card>
  );
}