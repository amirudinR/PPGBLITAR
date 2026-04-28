import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useChartColors } from '@/hooks/useChartColors';

interface GenderChartProps {
  data: { name: string; value: number }[];
}

export default function GenderChart({ data }: GenderChartProps) {
  const COLORS = useChartColors(2);

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={100}
              innerRadius={60}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [value, 'Jumlah']}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                borderRadius: '0.5rem',
                border: '1px solid hsl(var(--border))'
              }}
            />
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              wrapperStyle={{ paddingTop: '20px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}