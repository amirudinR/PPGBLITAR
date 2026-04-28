import React, { useState } from 'react';
import { LayoutDashboard, GraduationCap, Calendar, FileText, MoreHorizontal, UserCircle, Edit, Target, Megaphone, Settings, LogOut } from 'lucide-react';
import { Role } from '@/types/admin';
import { User } from '@/types/admin';
import { ADMIN_MENU_ITEMS } from '@/config/adminSections';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useTheme } from '@/hooks/useTheme';

interface MobileBottomNavProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  currentUser: User | null;
  canAccessFeature?: (featureId: string) => boolean;
  onLogout: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'generus', label: 'Generus', icon: GraduationCap },
  { id: 'rekap-kelas', label: 'Kehadiran', icon: Calendar },
  { id: 'm5u', label: 'Laporan', icon: FileText },
];

export default function MobileBottomNav({
  activeSection,
  setActiveSection,
  currentUser,
  canAccessFeature,
  onLogout,
}: MobileBottomNavProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const { baseTheme } = useTheme();

  const userRole: Role = currentUser?.role ?? 'orangtua';

  const hasAccess = (itemRoles: Role[], featureId?: string): boolean => {
    if (!itemRoles.includes(userRole)) return false;
    if (featureId && canAccessFeature) {
      return canAccessFeature(featureId);
    }
    return true;
  };

  // Build "More" menu items dynamically
  const moreItems = ADMIN_MENU_ITEMS
    .flatMap(group => group.children || [])
    .filter(child => {
      // Exclude items already in main nav
      if (NAV_ITEMS.some(nav => nav.id === child.id)) return false;
      return hasAccess(child.roles, child.featureId);
    })
    .map(child => ({
      id: child.id,
      label: child.label,
      icon: child.icon,
    }));

  // Add logout as last item
  const handleMoreItemClick = (id: string) => {
    setActiveSection(id);
    setMoreOpen(false);
  };

  const isActive = (id: string) => activeSection === id;

  return (
    <>
      {/* Main Bottom Nav */}
      <nav
        className={`fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border lg:hidden
          ${baseTheme === 'glass' ? 'backdrop-blur-lg bg-background/70' : ''}
        `}
      >
        <div className="flex items-center justify-around h-16">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.id);
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className="flex flex-col items-center justify-center gap-0.5 w-16 h-full relative"
              >
                <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors duration-200
                  ${active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}
                `}>
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-medium leading-tight ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}

          {/* More button */}
          <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center justify-center gap-0.5 w-16 h-full">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl text-muted-foreground hover:text-foreground transition-colors">
                  <MoreHorizontal className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-medium leading-tight text-muted-foreground">Lainnya</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto max-h-[70vh] rounded-t-2xl pb-8">
              <SheetHeader className="pb-4">
                <SheetTitle className="text-lg text-center">Menu Lainnya</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-3 gap-3 pb-4">
                {moreItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMoreItemClick(item.id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all
                        ${activeSection === item.id
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/30 hover:bg-muted/50 text-foreground'}
                      `}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-xs font-medium text-center leading-tight">{item.label}</span>
                    </button>
                  );
                })}
              </div>
              {/* Logout - separate section at bottom */}
              <div className="border-t border-border pt-4">
                <button
                  onClick={() => {
                    setMoreOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-border hover:border-destructive/30 hover:bg-destructive/5 text-destructive transition-all"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </>
  );
}
