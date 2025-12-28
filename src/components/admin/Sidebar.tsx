import React from 'react';
import { Users, BookOpen, Calendar, LogOut, X, GraduationCap, Database, Home, Users2, LayoutDashboard, ClipboardCheck, Contact, School, UserCircle, Edit, Megaphone, FileText, Target, BookMarked, Search, Shield, Settings } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { User } from '@/types/admin';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru', 'orangtua'] },
  { id: 'profile', label: 'Profil Saya', icon: UserCircle, roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru', 'orangtua'] },
  {
    id: 'master',
    label: 'Data Master',
    icon: Database,
    roles: ['adminsuper', 'admin', 'desa', 'kelompok'],
    children: [
      { id: 'akun', label: 'Akun', icon: Users, roles: ['adminsuper', 'admin', 'desa', 'kelompok'] },
      { id: 'desa', label: 'Desa', icon: Home, roles: ['adminsuper', 'admin'] },
      { id: 'kelompok', label: 'Kelompok', icon: Users2, roles: ['adminsuper', 'admin', 'desa'] },
      { id: 'dataguru', label: 'Data Guru', icon: Contact, roles: ['adminsuper', 'admin', 'desa', 'kelompok'] },
      { id: 'datakelas', label: 'Data Kelas', icon: School, roles: ['adminsuper', 'admin', 'desa', 'kelompok'] },
    ]
  },
  { id: 'generus', label: 'Data Generus', icon: GraduationCap, roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru'] },
  {
    id: 'kehadiran',
    label: 'Kehadiran',
    icon: Calendar,
    roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru'],
    children: [
      { id: 'kehadiran-guru', label: 'Input Kehadiran', icon: Calendar, roles: ['guru'] },
      { id: 'rekap-kelas', label: 'Rekap Per Kelas', icon: School, roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru'] },
      { id: 'rekap-siswa', label: 'Rekap Per Siswa', icon: Users, roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru'] },
    ]
  },
  {
    id: 'nilai',
    label: 'Nilai Generus',
    icon: ClipboardCheck,
    roles: ['guru'],
    children: [
      { id: 'input-nilai', label: 'Input Nilai', icon: Edit, roles: ['guru'] },
      { id: 'rekap-nilai', label: 'Rekap Nilai', icon: BookOpen, roles: ['guru'] },
    ]
  },
  {
    id: 'target-materi',
    label: 'Target Materi',
    icon: Target,
    roles: ['adminsuper', 'admin', 'kelompok'],
    children: [
      { id: 'target-bulanan', label: 'Target Bulanan', icon: Target, roles: ['adminsuper', 'admin', 'kelompok'] },
      { id: 'rekap-per-kelas', label: 'Rekap Per Kelas', icon: BookOpen, roles: ['adminsuper', 'admin', 'kelompok'] },
    ]
  },
  {
    id: 'laporan',
    label: 'Laporan',
    icon: FileText,
    roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru'],
    children: [
      { id: 'm5u', label: 'M5U', icon: Megaphone, roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru', 'orangtua'] },
      { id: 'cari-hasil-m5u', label: 'Cari Hasil M5U', icon: Search, roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru'] },
      { id: 'latihan-asad', label: 'Latihan ASAD', icon: BookMarked, roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru'] },
      { id: 'jariyah-ppg', label: 'Jariyah PPG', icon: BookMarked, roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru'] },
    ]
  },
  { id: 'pengumuman', label: 'Pengumuman', icon: Megaphone, roles: ['adminsuper', 'admin'] },
  // Super Admin Only - Settings
  {
    id: 'pengaturan',
    label: 'Pengaturan',
    icon: Settings,
    roles: ['adminsuper'],
    children: [
      { id: 'akses-fitur', label: 'Akses Fitur', icon: Shield, roles: ['adminsuper'] },
    ]
  },
];

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  onLogout: () => void;
  currentUser: User | null;
  canAccessFeature?: (featureId: string) => boolean;
}

export default function Sidebar({
  activeSection,
  setActiveSection,
  sidebarOpen,
  setSidebarOpen,
  sidebarCollapsed,
  onLogout,
  currentUser,
  canAccessFeature,
}: SidebarProps) {
  const userRole = currentUser?.role || 'orangtua';

  const getPanelTitle = () => {
    if (!currentUser) return "Admin Panel";
    switch (currentUser.role) {
      case 'adminsuper':
      case 'admin':
        return "Admin Panel";
      case 'desa':
        return `PJP Desa ${currentUser.desa || ''}`;
      case 'kelompok':
        return `PJP Kelompok ${currentUser.kelompok || ''}`;
      case 'guru':
        return "Panel Guru";
      case 'orangtua':
        return "Panel Orang Tua";
      default:
        return "Panel";
    }
  };

  const panelTitle = getPanelTitle();

  // Parent menu IDs that are just containers (not in FEATURE_LIST)
  const containerMenuIds = ['master', 'kehadiran', 'nilai', 'target-materi', 'laporan', 'pengaturan'];

  // Check if user can access a menu item
  const hasAccess = (itemId: string, itemRoles: string[]): boolean => {
    // Container menus (parent items) always fallback to static role check
    // because they are not in FEATURE_LIST
    if (containerMenuIds.includes(itemId)) {
      return itemRoles.includes(userRole);
    }

    // If canAccessFeature is provided, use it (checks Firestore permissions)
    if (canAccessFeature) {
      return canAccessFeature(itemId);
    }
    // Fallback to static role check
    return itemRoles.includes(userRole);
  };

  const visibleMenuItems = menuItems.map(item => {
    // For container menus, check if any children are accessible
    if (item.children) {
      const visibleChildren = item.children.filter(child => hasAccess(child.id, child.roles));
      if (visibleChildren.length > 0) {
        return { ...item, children: visibleChildren };
      }
      // No visible children, don't show the container
      return null;
    }
    // For non-container items, check direct access
    if (!hasAccess(item.id, item.roles)) return null;
    return item;
  }).filter(Boolean) as (typeof menuItems[number])[];

  const parentOfActive = visibleMenuItems.find(item => item.children?.some(child => child.id === activeSection))?.id;

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-sidebar text-sidebar-foreground shadow-lg flex flex-col 
        transform transition-all duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${sidebarCollapsed ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden' : 'w-64'}
      `}>
        <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
          <Tooltip>
            <TooltipTrigger asChild>
              <h1 className="text-xl font-bold text-white truncate cursor-pointer">{panelTitle}</h1>
            </TooltipTrigger>
            <TooltipContent>
              <p>{panelTitle}</p>
            </TooltipContent>
          </Tooltip>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-sidebar-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <Accordion type="multiple" defaultValue={parentOfActive ? [parentOfActive] : []}>
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              if (item.children) {
                return (
                  <AccordionItem value={item.id} key={item.id} className="border-none">
                    <AccordionTrigger className="px-4 py-3 rounded-lg hover:no-underline hover:bg-sidebar-accent">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-8 pt-2">
                      {item.children.map(child => {
                        const ChildIcon = child.icon;
                        return (
                          <button
                            key={child.id}
                            onClick={() => {
                              setActiveSection(child.id);
                              setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors mb-1 text-sm ${activeSection === child.id
                              ? 'bg-card text-indigo-600 font-semibold'
                              : 'hover:bg-sidebar-accent'
                              }`}
                          >
                            <ChildIcon className="w-4 h-4" />
                            <span>{child.label}</span>
                          </button>
                        )
                      })}
                    </AccordionContent>
                  </AccordionItem>
                )
              }
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors mb-2 ${activeSection === item.id
                    ? 'bg-card text-indigo-600 font-semibold'
                    : 'hover:bg-sidebar-accent'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </Accordion>
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-300 hover:bg-red-500/10 dark:bg-red-500/200 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </>
  );
}