import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, UserX, TrendingDown, AlertTriangle } from 'lucide-react';

interface StudentInfo {
  name: string;
  stat: number;
}

interface PrioritasGenerusCardProps {
  lowAttendanceStudents: StudentInfo[];
  behindTargetStudents: StudentInfo[];
}

export default function PrioritasGenerusCard({ lowAttendanceStudents, behindTargetStudents }: PrioritasGenerusCardProps) {
  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Generus Prioritas</CardTitle>
        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div>
          <h3 className="font-semibold flex items-center mb-2">
            <TrendingDown className="h-4 w-4 mr-2 text-orange-500" />
            Kehadiran Rendah
          </h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {lowAttendanceStudents.map(student => (
              <li key={student.name} className="flex justify-between">
                <span>{student.name}</span>
                <span className="font-medium">{student.stat}%</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold flex items-center mb-2">
            <UserX className="h-4 w-4 mr-2 text-red-500" />
            Target Tertinggal
          </h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {behindTargetStudents.map(student => (
              <li key={student.name} className="flex justify-between">
                <span>{student.name}</span>
                <span className="font-medium">{student.stat}%</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}