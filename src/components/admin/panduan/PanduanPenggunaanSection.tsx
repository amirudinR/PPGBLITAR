import React from 'react';
import { User } from '@/types/admin';
import SectionHeader from '../shared/SectionHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import {
  Shield, Users, LayoutDashboard, GraduationCap, Calendar, ClipboardCheck,
  Target, MessagesSquare, ListChecks, BarChart3, FileText, BookMarked,
  Bell, Settings, UserCircle, Megaphone, BookOpen, Edit, Home, Users2,
  Contact, School, Search, ClipboardList, Lock,
} from 'lucide-react';

interface GuideItem {
  icon: React.ElementType;
  title: string;
  description: string;
  tips?: string[];
}

interface GuideCategory {
  category: string;
  items: GuideItem[];
}

const GUIDE_ADMINSUPER: GuideCategory[] = [
  {
    category: 'Data Master',
    items: [
      { icon: Users, title: 'Akun', description: 'Kelola semua akun pengguna: tambah, edit, reset password, dan hapus akun guru, PJP, maupun orang tua.', tips: ['Gunakan tombol reset password jika pengguna lupa sandi.'] },
      { icon: Home, title: 'Desa', description: 'Tambah dan kelola data desa. Desa adalah unit wilayah tertinggi dalam struktur kelompok generus.', tips: ['Desa harus dibuat sebelum kelompok bisa ditambahkan.'] },
      { icon: Users2, title: 'Kelompok', description: 'Kelola data kelompok generus di dalam setiap desa.', tips: ['Setiap kelompok terikat ke satu desa.'] },
      { icon: Contact, title: 'Data Guru', description: 'Kelola profil guru: nama, desa, kelompok, dan kelas yang diajar.', tips: ['Guru harus terdaftar sebelum bisa di-assign ke kelas.'] },
      { icon: School, title: 'Data Kelas', description: 'Kelola kelas generus: nama kelas, guru pengajar, dan daftar siswa (generus).', tips: ['Pastikan generus sudah terdaftar sebelum ditambahkan ke kelas.'] },
    ],
  },
  {
    category: 'Pengaturan Akses',
    items: [
      { icon: Shield, title: 'Akses Fitur', description: 'Kelola fitur mana yang bisa diakses oleh setiap role. Aktifkan atau nonaktifkan fitur, dan atur role yang diizinkan.', tips: ['Akses Fitur hanya tersedia untuk Admin Super.', 'Fitur inti (Dashboard, Profil) tidak bisa dinonaktifkan.'] },
      { icon: Lock, title: 'Periode Evaluasi', description: 'Buat dan buka/tutup periode evaluasi semesteran. Hanya satu periode yang bisa terbuka sekaligus.', tips: ['Buka periode agar guru/PJP bisa mengisi evaluasi.', 'Tutup periode setelah evaluasi selesai.'] },
    ],
  },
];

const GUIDE_ADMIN: GuideCategory[] = [
  {
    category: 'Pengelolaan Data',
    items: [
      { icon: Users, title: 'Akun', description: 'Kelola akun pengguna di seluruh wilayah. Tambah, edit, reset password, dan hapus akun.', tips: ['Admin tidak dapat mengubah role adminsuper.'] },
      { icon: Users2, title: 'Kelompok', description: 'Kelola data kelompok generus lintas desa.', tips: [] },
      { icon: Contact, title: 'Data Guru & Kelas', description: 'Kelola guru dan kelas di seluruh wilayah.', tips: [] },
    ],
  },
  {
    category: 'Evaluasi Semesteran',
    items: [
      { icon: Calendar, title: 'Periode Evaluasi', description: 'Buat dan kelola periode evaluasi. Toggle Terbuka/Tertutup untuk mengontrol apakah guru dan PJP bisa mengisi evaluasi.', tips: ['Hanya satu periode yang bisa terbuka sekaligus.', 'Saat periode dibuka, guru dan PJP kelompok bisa mengisi evaluasi.'] },
      { icon: BarChart3, title: 'Evaluasi Semesteran', description: 'Lihat semua evaluasi yang sudah diisi oleh guru/PJP. Klik Publish untuk mempublikasikan evaluasi ke orang tua.', tips: ['Admin tidak mengisi evaluasi — itu tugas guru/PJP.', 'Evaluasi yang dipublish bisa dilihat oleh orang tua.'] },
    ],
  },
  {
    category: 'Pengumuman & Laporan',
    items: [
      { icon: Megaphone, title: 'Pengumuman', description: 'Buat dan kelola pengumuman yang tampil di dashboard semua pengguna.', tips: ['Gunakan fitur ini untuk pemberitahuan penting.'] },
    ],
  },
];

const GUIDE_DESA: GuideCategory[] = [
  {
    category: 'Data Wilayah',
    items: [
      { icon: Users, title: 'Akun', description: 'Kelola akun pengguna di wilayah desa Anda: guru, PJP kelompok, dan orang tua.', tips: [] },
      { icon: Users2, title: 'Kelompok', description: 'Lihat dan kelola kelompok generus yang ada di desa Anda.', tips: [] },
      { icon: Contact, title: 'Data Guru', description: 'Kelola guru yang bertugas di desa Anda.', tips: [] },
      { icon: School, title: 'Data Kelas', description: 'Kelola kelas yang ada di desa Anda.', tips: [] },
    ],
  },
  {
    category: 'Kehadiran & Laporan',
    items: [
      { icon: Calendar, title: 'Rekap Per Kelas', description: 'Lihat rekap kehadiran generus per kelas di seluruh desa Anda.', tips: ['Filter berdasarkan rentang tanggal untuk laporan bulanan.'] },
      { icon: Users, title: 'Rekap Per Siswa', description: 'Lihat rekap kehadiran per generus/siswa di desa Anda.', tips: [] },
      { icon: BookMarked, title: 'Laporan (ASAD & Jariyah)', description: 'Pantau laporan Latihan ASAD dan Jariyah PPG dari seluruh kelompok di desa.', tips: [] },
    ],
  },
  {
    category: 'Musyawaroh & Checklist',
    items: [
      { icon: MessagesSquare, title: 'Agenda M5U', description: 'Buat dan pantau agenda musyawaroh di desa Anda.', tips: [] },
      { icon: ClipboardCheck, title: 'Detail & Absensi', description: 'Isi absensi, notulensi, dan action items untuk agenda musyawaroh yang sudah dibuat.', tips: [] },
      { icon: ClipboardList, title: 'Template Checklist', description: 'Buat template checklist untuk guru/PJP di desa Anda.', tips: ['Template checklist dipakai sebagai panduan tugas rutin.'] },
      { icon: ListChecks, title: 'Checklist Saya', description: 'Isi checklist yang di-assign kepada Anda.', tips: [] },
      { icon: BarChart3, title: 'Rekap Checklist', description: 'Lihat rekap completion rate checklist seluruh desa.', tips: [] },
    ],
  },
];

const GUIDE_KELOMPOK: GuideCategory[] = [
  {
    category: 'Data & Kehadiran',
    items: [
      { icon: School, title: 'Data Kelas', description: 'Lihat dan kelola kelas yang ada di kelompok Anda.', tips: [] },
      { icon: GraduationCap, title: 'Data Generus', description: 'Lihat daftar generus yang terdaftar di kelompok Anda.', tips: [] },
      { icon: Calendar, title: 'Rekap Per Kelas', description: 'Lihat rekap kehadiran seluruh kelas di kelompok Anda.', tips: [] },
      { icon: Users, title: 'Rekap Per Siswa', description: 'Lihat rekap kehadiran tiap generus di kelompok Anda.', tips: [] },
    ],
  },
  {
    category: 'Target & Evaluasi',
    items: [
      { icon: Target, title: 'Target Bulanan', description: 'Set target pencapaian materi bulanan untuk kelas di kelompok Anda.', tips: ['Target dipakai sebagai acuan rekap pencapaian.'] },
      { icon: BookOpen, title: 'Rekap Per Kelas (Materi)', description: 'Pantau pencapaian materi tiap kelas dibanding target yang ditetapkan.', tips: [] },
      { icon: BarChart3, title: 'Evaluasi Semesteran', description: 'Isi evaluasi semesteran untuk generus di kelompok Anda saat periode evaluasi dibuka.', tips: ['Klik "Agregasi Otomatis" untuk mengambil data kehadiran dan nilai otomatis.', 'Setelah diisi, klik "Kirim untuk Review" agar bisa dipublish admin.'] },
    ],
  },
  {
    category: 'Musyawaroh & Checklist',
    items: [
      { icon: MessagesSquare, title: 'Agenda M5U', description: 'Buat dan lihat agenda musyawaroh kelompok.', tips: [] },
      { icon: ClipboardCheck, title: 'Detail & Absensi', description: 'Isi absensi dan notulensi musyawaroh, tambah action items.', tips: [] },
      { icon: ListChecks, title: 'Checklist Saya', description: 'Isi checklist yang di-assign kepada Anda.', tips: [] },
      { icon: BarChart3, title: 'Rekap Checklist', description: 'Lihat rekap completion rate checklist di kelompok Anda.', tips: [] },
    ],
  },
];

const GUIDE_GURU: GuideCategory[] = [
  {
    category: 'Kehadiran & Nilai',
    items: [
      { icon: Calendar, title: 'Input Kehadiran', description: 'Input kehadiran harian generus untuk kelas yang Anda ajar. Tandai setiap generus: Hadir, Izin, Sakit, atau Alpha.', tips: ['Input kehadiran setiap kali pertemuan agar rekap akurat.', 'Kehadiran yang sudah di-input bisa diedit jika ada kesalahan.'] },
      { icon: Edit, title: 'Input Nilai', description: 'Input nilai generus per materi untuk kelas Anda.', tips: ['Nilai direkap otomatis dalam Rekap Nilai dan Evaluasi.'] },
      { icon: BookOpen, title: 'Rekap Nilai', description: 'Lihat rekap nilai semua generus di kelas Anda berdasarkan periode.', tips: [] },
    ],
  },
  {
    category: 'Evaluasi Semesteran',
    items: [
      { icon: BarChart3, title: 'Evaluasi Semesteran', description: 'Isi evaluasi semesteran untuk setiap generus di kelas Anda. Tersedia tab "Isi Evaluasi" saat periode evaluasi dibuka oleh admin.', tips: ['Klik "Isi" pada generus yang belum ada evaluasinya.', 'Gunakan "Agregasi Otomatis" untuk mengisi data kehadiran & nilai secara otomatis.', 'Isi Aspek Kepribadian dengan slider (1-5).', 'Klik "Kirim untuk Review" setelah selesai agar admin bisa publish.'] },
    ],
  },
  {
    category: 'Musyawaroh & Checklist',
    items: [
      { icon: MessagesSquare, title: 'Agenda M5U', description: 'Lihat agenda musyawaroh yang relevan dengan Anda.', tips: [] },
      { icon: ListChecks, title: 'Checklist Saya', description: 'Isi checklist tugas yang di-assign kepada Anda oleh PJP atau admin.', tips: ['Selesaikan checklist sesuai deadline yang ditetapkan.'] },
    ],
  },
  {
    category: 'Laporan',
    items: [
      { icon: Calendar, title: 'Rekap Per Kelas', description: 'Lihat rekap kehadiran kelas yang Anda ajar.', tips: [] },
      { icon: BookMarked, title: 'Laporan ASAD & Jariyah', description: 'Input dan lihat laporan Latihan ASAD dan Jariyah PPG.', tips: [] },
    ],
  },
];

const GUIDE_ORANGTUA: GuideCategory[] = [
  {
    category: 'Informasi Generus',
    items: [
      { icon: LayoutDashboard, title: 'Dashboard', description: 'Lihat ringkasan informasi terkini tentang generus Anda: kehadiran, nilai, dan pengumuman terbaru.', tips: [] },
      { icon: MessagesSquare, title: 'Agenda M5U', description: 'Lihat jadwal dan hasil musyawaroh yang relevan dengan kelompok Anda.', tips: [] },
    ],
  },
  {
    category: 'Laporan & Evaluasi',
    items: [
      { icon: BarChart3, title: 'Evaluasi Semesteran', description: 'Lihat laporan evaluasi semesteran generus Anda yang sudah dipublish oleh admin. Berisi rekap kehadiran, nilai, aspek kepribadian, catatan guru, dan rekomendasi.', tips: ['Evaluasi hanya tampil setelah admin mempublishnya.', 'Anda bisa mengunduh laporan dalam format PDF.'] },
    ],
  },
];

const ROLE_TABS = [
  { value: 'adminsuper', label: 'Admin Super', minRoles: ['adminsuper'] as string[] },
  { value: 'admin', label: 'Admin', minRoles: ['adminsuper', 'admin'] as string[] },
  { value: 'desa', label: 'PJP Desa', minRoles: ['adminsuper', 'admin', 'desa'] as string[] },
  { value: 'kelompok', label: 'PJP Kelompok', minRoles: ['adminsuper', 'admin', 'desa', 'kelompok'] as string[] },
  { value: 'guru', label: 'Guru', minRoles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru'] as string[] },
  { value: 'orangtua', label: 'Orang Tua', minRoles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru', 'orangtua'] as string[] },
];

const GUIDE_DATA: Record<string, GuideCategory[]> = {
  adminsuper: GUIDE_ADMINSUPER,
  admin: GUIDE_ADMIN,
  desa: GUIDE_DESA,
  kelompok: GUIDE_KELOMPOK,
  guru: GUIDE_GURU,
  orangtua: GUIDE_ORANGTUA,
};

interface Props {
  currentUser: User | null;
}

function GuideSection({ categories }: { categories: GuideCategory[] }) {
  return (
    <Accordion type="multiple" className="space-y-2">
      {categories.map((cat) => (
        <AccordionItem key={cat.category} value={cat.category} className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            {cat.category}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pb-2">
              {cat.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-3">
                    <div className="mt-0.5 shrink-0">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-0.5">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      {item.tips && item.tips.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {item.tips.map((tip, i) => (
                            <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                              <span className="text-primary mt-0.5">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export default function PanduanPenggunaanSection({ currentUser }: Props) {
  const role = currentUser?.role ?? 'orangtua';

  const visibleTabs = ROLE_TABS.filter((tab) => tab.minRoles.includes(role));

  const defaultTab = role === 'adminsuper' ? 'adminsuper' : role;

  return (
    <div>
      <SectionHeader
        title="Panduan Penggunaan"
        subtitle="Pelajari cara menggunakan setiap fitur sesuai peran Anda."
      />

      <div className="mb-4 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground flex items-center gap-2">
        <UserCircle className="w-4 h-4 shrink-0" />
        <span>
          Anda login sebagai <strong className="text-foreground capitalize">{role === 'adminsuper' ? 'Admin Super' : role === 'orangtua' ? 'Orang Tua' : role.charAt(0).toUpperCase() + role.slice(1)}</strong>.{' '}
          {visibleTabs.length > 1 && 'Anda bisa melihat panduan untuk role di bawah Anda.'}
        </span>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          {visibleTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
              {tab.label}
              {tab.value === role && (
                <Badge variant="secondary" className="ml-2 text-[10px] px-1 py-0">Anda</Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {visibleTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <GuideSection categories={GUIDE_DATA[tab.value]} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
