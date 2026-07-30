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
    if (!currentUser) return 'PPG Blitar';
    switch (currentUser.role) {
      case 'adminsuper':
      case 'admin':
        return 'Admin Panel';
      case 'desa':
        return `Desa ${currentUser.desa || ''}`;
      case 'kelompok':
        return `Kelompok ${currentUser.kelompok || ''}`;
      case 'guru':
        return 'Panel Guru';
      case 'orangtua':
        return 'Panel Orang Tua';
      default:
        return 'PPG Blitar';
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

  const getItemClass = (isActive: boolean) => {
    return `w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs transition-all duration-200 ${
      isActive
        ? 'bg-primary/10 text-primary font-bold shadow-xs border border-primary/15'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-foreground font-medium'
    }`;
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 bg-card border-r border-border/60 text-card-foreground shadow-sm flex flex-col
        transform transition-all duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${sidebarCollapsed ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden' : 'w-64'}
      `}>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 h-16">
          <div className="flex items-center space-x-3 truncate">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[hsl(218,78%,28%)] to-[hsl(200,85%,42%)] text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-primary/20 shrink-0">
              pb.
            </div>
            <div className="truncate">
              <h1 className="text-sm font-extrabold text-foreground tracking-tight truncate">{getPanelTitle()}</h1>
              <p className="text-[10px] text-muted-foreground font-semibold tracking-wider uppercase truncate">PPG BLITAR</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-xl text-muted-foreground hover:bg-muted"
            aria-label="Tutup sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu List */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {visibleMenuItems.map((group) => {
            const groupChildren = group.children || [];

            return (
              <div key={group.id} className="space-y-1">
                {/* Category Header Label */}
                <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  {group.label}
                </div>

                <div className="space-y-1">
                  {groupChildren.map((child) => {
                    const ChildIcon = child.icon;
                    const isActive = activeSection === child.id;
                    return (
                      <button
                        key={child.id}
                        onClick={() => {
                          setActiveSection(child.id);
                          setSidebarOpen(false);
                        }}
                        className={getItemClass(isActive)}
                      >
                        <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-primary text-primary-foreground shadow-xs' : 'text-slate-500 dark:text-slate-400'}`}>
                          <ChildIcon className="w-4 h-4" />
                        </div>
                        <span className="truncate">{child.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="p-3 border-t border-border/50 pb-20 lg:pb-3">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            aria-label="Keluar"
          >
            <div className="p-1 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
              <LogOut className="w-4 h-4" />
            </div>
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </>
  );
}
