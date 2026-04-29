import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { EvaluasiMetrics } from '@/types/evaluasi';
import { MonthlyAttendance, Grade } from '@/types/admin';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function monthsInRange(startDate: Date, endDate: Date): { month: string; year: number }[] {
  const result: { month: string; year: number }[] = [];
  const cur = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  while (cur <= end) {
    result.push({ month: MONTH_NAMES[cur.getMonth()], year: cur.getFullYear() });
    cur.setMonth(cur.getMonth() + 1);
  }
  return result;
}

export async function aggregateEvaluasiMetrics(
  generusId: string,
  kelasId: string,
  startDate: Date,
  endDate: Date,
): Promise<EvaluasiMetrics> {
  const months = monthsInRange(startDate, endDate);

  const [attendanceSnap, gradesSnap] = await Promise.all([
    getDocs(query(collection(db, 'monthlyAttendance'), where('studentId', '==', generusId))),
    getDocs(query(collection(db, 'grades'), where('studentId', '==', generusId), where('classId', '==', kelasId))),
  ]);

  const attendance = attendanceSnap.docs.map((d) => d.data() as MonthlyAttendance);
  const grades = gradesSnap.docs.map((d) => d.data() as Grade);

  const periodAttendance = attendance.filter((a) =>
    months.some((m) => m.month === a.month && m.year === a.year),
  );

  const totalMeetings = periodAttendance.reduce((s, a) => s + (a.meetingsHeld ?? 0), 0);
  const totalAttended = periodAttendance.reduce((s, a) => s + (a.meetingsAttended ?? 0), 0);

  const periodGrades = grades.filter((g) =>
    months.some((m) => m.month === g.month && m.year === g.year),
  );

  const numericGrades = periodGrades
    .map((g) => parseFloat(g.grade))
    .filter((n) => !isNaN(n));

  const rataRata = numericGrades.length > 0
    ? numericGrades.reduce((s, n) => s + n, 0) / numericGrades.length
    : 0;

  const perMateri: Record<string, number> = {};
  periodGrades.forEach((g) => {
    const val = parseFloat(g.grade);
    if (!isNaN(val)) {
      if (!perMateri[g.judulMateri]) {
        perMateri[g.judulMateri] = val;
      } else {
        perMateri[g.judulMateri] = (perMateri[g.judulMateri] + val) / 2;
      }
    }
  });

  return {
    kehadiran: {
      hadir: totalAttended,
      total: totalMeetings,
      persen: totalMeetings > 0 ? Math.round((totalAttended / totalMeetings) * 100) : 0,
    },
    nilai: {
      rataRata: Math.round(rataRata * 10) / 10,
      perMateri,
    },
    pencapaianMateri: {
      tercapai: numericGrades.filter((n) => n >= 70).length,
      total: numericGrades.length,
      persen: numericGrades.length > 0
        ? Math.round((numericGrades.filter((n) => n >= 70).length / numericGrades.length) * 100)
        : 0,
    },
  };
}

export function generateEvaluasiPDF(ev: {
  generusName: string;
  semester: string;
  tahunAjaran: string;
  metrics: EvaluasiMetrics;
  aspekKepribadian?: Record<string, number>;
  catatanGuru?: string;
  rekomendasi?: string;
}) {
  import('jspdf').then(({ jsPDF }) => {
    const doc = new jsPDF();
    const margin = 14;
    let y = 20;

    doc.setFontSize(16);
    doc.text('Evaluasi Semesteran', margin, y);
    y += 10;

    doc.setFontSize(11);
    doc.text(`Nama: ${ev.generusName}`, margin, y); y += 7;
    doc.text(`Semester: ${ev.semester}  |  Tahun Ajaran: ${ev.tahunAjaran}`, margin, y); y += 12;

    doc.setFontSize(12);
    doc.text('Rekap Akademik', margin, y); y += 8;
    doc.setFontSize(10);
    doc.text(`Kehadiran: ${ev.metrics.kehadiran.hadir}/${ev.metrics.kehadiran.total} (${ev.metrics.kehadiran.persen}%)`, margin, y); y += 6;
    doc.text(`Rata-rata Nilai: ${ev.metrics.nilai.rataRata}`, margin, y); y += 6;
    doc.text(`Pencapaian Materi: ${ev.metrics.pencapaianMateri.tercapai}/${ev.metrics.pencapaianMateri.total} (${ev.metrics.pencapaianMateri.persen}%)`, margin, y); y += 10;

    if (ev.aspekKepribadian) {
      doc.setFontSize(12);
      doc.text('Aspek Kepribadian', margin, y); y += 8;
      doc.setFontSize(10);
      Object.entries(ev.aspekKepribadian).forEach(([k, v]) => {
        if (k !== 'catatanAspek') {
          doc.text(`${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}/5`, margin, y); y += 6;
        }
      });
      y += 4;
    }

    if (ev.catatanGuru) {
      doc.setFontSize(12);
      doc.text('Catatan Guru', margin, y); y += 8;
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(ev.catatanGuru, 180);
      doc.text(lines, margin, y); y += lines.length * 6 + 4;
    }

    if (ev.rekomendasi) {
      doc.setFontSize(12);
      doc.text('Rekomendasi', margin, y); y += 8;
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(ev.rekomendasi, 180);
      doc.text(lines, margin, y);
    }

    doc.save(`Evaluasi_${ev.generusName}_${ev.semester}_${ev.tahunAjaran}.pdf`);
  });
}
