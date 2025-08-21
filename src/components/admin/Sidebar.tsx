import React from 'react';
import { Users, BookOpen, Calendar, LogOut, X, GraduationCap, Database, Home, Users2, LayoutDashboard, ClipboardCheck, Contact } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { User } from '@/types/admin';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru', 'orangtua'] },
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
    ]
  },
  { id: 'generus', label: 'Data Generus', icon: GraduationCap, roles: ['adminsuper', 'admin', 'desa', 'kelompok'] },
  { id: 'kehadiran', label: 'Kehadiran', icon: Calendar, roles: ['adminsuper', 'admin', 'desa', 'kelompok'] },
  { id: 'materi', label: 'Materi', icon: BookOpen, roles: ['adminsuper', 'admin', 'kelompok'] },
  { id: 'm5u', label: 'M5U', icon: ClipboardCheck, roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru', 'orangtua'] },
];

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onLogout: () => void;
  currentUser: User | null;
}

export default function Sidebar({
  activeSection,
  setActiveSection,
  sidebarOpen,
  setSidebarOpen,
  onLogout,
  currentUser,
}: SidebarProps) {
  const userRole = currentUser?.role || 'orangtua';

  const visibleMenuItems = menuItems.filter(item => item.roles.includes(userRole)).map(item => {
    if (item.children) {
      const visibleChildren = item.children.filter(child => child.roles.includes(userRole));
      if (visibleChildren.length > 0) {
        return { ...item, children: visibleChildren };
      }
    }
    return item;
  }).filter(item => item.children ? item.children.length > 0 : true);

  const parentOfActive = visibleMenuItems.find(item => item.children?.some(child => child.id === activeSection))?.id;

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between p-6 border-b">
        <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
          <X className="w-6 h-6" />
        </button>
      </div>
      <nav className="p-4">
        <Accordion type="multiple" defaultValue={parentOfActive ? [parentOfActive] : []}>
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            if (item.children) {
              return (
                <AccordionItem value={item.id} key={item.id} className="border-none">
                  <AccordionTrigger className="px-4 py-3 rounded-lg hover:no-underline hover:bg-gray-100">
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
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors mb-1 text-sm ${
                            activeSection === child.id
                              ? 'bg-blue-500 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
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
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors mb-2 ${
                  activeSection === item.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </Accordion>
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-8"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </nav>
    </div>
  );
}