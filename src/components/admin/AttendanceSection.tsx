import React from 'react';
import { Attendance } from '@/types/admin';
import StatCard from '@/components/admin/StatCard';

interface AttendanceSectionProps {
  attendance: Attendance[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Hadir': return 'bg-green-100 text-green-800';
    case 'Tidak Hadir': return 'bg-red-100 text-red-800';
    case 'Izin': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function AttendanceSection({ attendance }: AttendanceSectionProps) {
  const totalHadir = attendance.filter(a => a.status === 'Hadir').length;
  const totalTidakHadir = attendance.filter(a => a.status === 'Tidak Hadir').length;
  const totalIzin = attendance.filter(a => a.status === 'Izin').length;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Data Kehadiran</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Hadir" value={totalHadir} colorClass="text-green-600" />
        <StatCard title="Total Tidak Hadir" value={totalTidakHadir} colorClass="text-red-600" />
        <StatCard title="Total Izin" value={totalIzin} colorClass="text-yellow-600" />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Siswa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendance.map((record) => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{record.studentName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{record.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}