import React from 'react';
import { LogOut, X } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Role, User } from '@/types/admin';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ADMIN_MENU_ITEMS } from '@/config/adminSections';
import { useTheme } from '@/hooks/useTheme';

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
  const { baseTheme } = useTheme();
  const userRole: Role = currentUser?.role ?? 'orangtua';

  const getPanelTitle = () => {
    if (!currentUser) return 'Admin Panel';
    switch (currentUser.role) {
      case 'adminsuper':
      case 'admin':
        return 'Admin Panel';
      case 'desa':
        return `PJP Desa ${currentUser.desa || ''}`;
      case 'kelompok':
        return `PJP Kelompok ${currentUser.kelompok || ''}`;
      case 'guru':
        return 'Panel Guru';
      case 'orangtua':
        return 'Panel Orang Tua';
      default:
        return 'Panel';
    }
  };

  const hasAccess = (itemRoles: Role[], featureId?: string): boolean => {
    if (!itemRoles.includes(userRole)) return false;
    if (featureId && canAccessFeature) {
      return canAccessFeature(featureId);
    }
    return true;
  };

  const visibleMenuItems = ADMIN_MENU_ITEMS
    .filter(group => group.roles.includes(userRole))
    .map(group => {
      const visibleChildren = (group.children || []).filter(child =>
        hasAccess(child.roles, child.featureId)
      );

      if (visibleChildren.length === 0) return null;
      return {
        ...group,
        children: visibleChildren,
      };
    })
    .filter(Boolean) as Array<(typeof ADMIN_MENU_ITEMS)[number]>;

  const parentOfActive = visibleMenuItems.find(item =>
    item.children?.some(child => child.id === activeSection)
  )?.id;

  const getSidebarClass = () => {
    switch (baseTheme) {
      case 'neu':
        return 'neu-sidebar';
      case 'soft':
        return 'soft-sidebar';
      default:
        return '';
    }
  };

  const getItemClass = (isActive: boolean) => {
    const base = 'w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors mb-2';
    switch (baseTheme) {
      case 'neu':
        return `${base} ${isActive ? 'neu-inset text-primary font-semibold' : 'neu-flat'}`;
      case 'soft':
        return `${base} ${isActive ? 'bg-accent text-primary font-semibold border-l-[3px] border-primary shadow-sm' : 'hover:bg-sidebar-accent'}`;
      default:
        return `${base} ${isActive ? 'bg-card text-primary font-semibold' : 'hover:bg-sidebar-accent'}`;
    }
  };

  const getChildClass = (isActive: boolean) => {
    const base = 'w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors mb-1 text-sm';
    switch (baseTheme) {
      case 'neu':
        return `${base} ${isActive ? 'neu-inset text-primary font-semibold' : 'neu-flat'}`;
      case 'soft':
        return `${base} ${isActive ? 'bg-accent text-primary font-semibold border-l-[3px] border-primary shadow-sm' : 'hover:bg-sidebar-accent'}`;
      default:
        return `${base} ${isActive ? 'bg-card text-primary font-semibold' : 'hover:bg-sidebar-accent'}`;
    }
  };

  const getLogoutClass = () => {
    const base = 'w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors';
    switch (baseTheme) {
      case 'neu':
        return `${base} neu-flat text-destructive`;
      case 'soft':
        return `${base} text-destructive hover:bg-destructive/10 hover:text-destructive-foreground`;
      default:
        return `${base} text-destructive hover:bg-destructive/10 hover:text-destructive-foreground`;
    }
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 bg-sidebar text-sidebar-foreground shadow-lg flex flex-col
        transform transition-all duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${sidebarCollapsed ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden' : 'w-64'}
        ${getSidebarClass()}
      `}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-sidebar-border h-14">
          <Tooltip>
            <TooltipTrigger asChild>
              <h1 className="text-xl font-bold text-sidebar-foreground truncate cursor-pointer">{getPanelTitle()}</h1>
            </TooltipTrigger>
            <TooltipContent>
              <p>{getPanelTitle()}</p>
            </TooltipContent>
          </Tooltip>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-sidebar-foreground"
            aria-label="Tutup sidebar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <Accordion type="multiple" defaultValue={parentOfActive ? [parentOfActive] : []}>
            {visibleMenuItems.map((item) => {
              const groupChildren = item.children || [];

              if (groupChildren.length === 1 && item.id !== 'dashboard') {
                const child = groupChildren[0];
                const Icon = child.icon;

                return (
                  <button
                    key={child.id}
                    onClick={() => {
                      setActiveSection(child.id);
                      setSidebarOpen(false);
                    }}
                    className={getItemClass(activeSection === child.id)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{child.label}</span>
                  </button>
                );
              }

              const GroupIcon = item.icon;
              return (
                <AccordionItem value={item.id} key={item.id} className="border-none">
                  <AccordionTrigger className="px-4 py-3 rounded-lg hover:no-underline hover:bg-sidebar-accent w-full">
                    <div className="flex items-center space-x-3">
                      <GroupIcon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-8 pt-2">
                    {groupChildren.map(child => {
                      const ChildIcon = child.icon;
                      return (
                        <button
                          key={child.id}
                          onClick={() => {
                            setActiveSection(child.id);
                            setSidebarOpen(false);
                          }}
                          className={getChildClass(activeSection === child.id)}
                        >
                          <ChildIcon className="w-4 h-4" />
                          <span>{child.label}</span>
                        </button>
                      );
                    })}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={onLogout}
            className={getLogoutClass()}
            aria-label="Keluar"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </>
  );
}
