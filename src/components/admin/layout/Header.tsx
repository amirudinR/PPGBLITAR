import React from 'react';
import { Menu, Sun, Moon, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import NotificationBell from '@/components/admin/notifikasi/NotificationBell';
import HelpButton from './HelpButton';
import { User } from '@/types/admin';

interface HeaderProps {
    title: string;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (collapsed: boolean) => void;
    baseTheme: 'classic' | 'soft' | 'neu' | 'editorial' | 'glass';
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    currentUser?: User | null;
    onNavigate?: (section: string) => void;
}

export default function Header({
    title,
    sidebarOpen,
    setSidebarOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
    baseTheme,
    isDarkMode,
    toggleDarkMode,
    currentUser,
    onNavigate,
}: HeaderProps) {
    return (
        <header className="bg-card/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-40 h-16 flex items-center shadow-xs">
            <div className="flex items-center justify-between px-4 sm:px-6 w-full">
                {/* Left side - Sidebar toggles & Title */}
                <div className="flex items-center gap-3">
                    {/* Mobile menu button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden rounded-2xl hover:bg-muted"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>

                    {/* Desktop sidebar collapse button */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="hidden lg:flex rounded-2xl hover:bg-muted text-muted-foreground hover:text-foreground"
                                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            >
                                {sidebarCollapsed ? (
                                    <PanelLeft className="h-5 w-5" />
                                ) : (
                                    <PanelLeftClose className="h-5 w-5" />
                                )}
                                <span className="sr-only">
                                    {sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                                </span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {sidebarCollapsed ? 'Tampilkan Sidebar' : 'Sembunyikan Sidebar'}
                        </TooltipContent>
                    </Tooltip>

                    {/* Page Title */}
                    <div className="flex items-center gap-2">
                        <h1 className="text-base sm:text-lg font-bold text-foreground tracking-tight">{title}</h1>
                    </div>
                </div>

                {/* Right side - User Actions & Theme Toggle */}
                <div className="flex items-center gap-2">
                    {currentUser && onNavigate && (
                        <NotificationBell currentUser={currentUser} onNavigate={onNavigate} />
                    )}
                    <HelpButton onNavigate={onNavigate} />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={toggleDarkMode}
                                className="rounded-full hover:bg-muted relative overflow-hidden transition-all duration-300"
                            >
                                <Sun className={`h-5 w-5 transition-all duration-300 absolute text-amber-500 ${isDarkMode ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} />
                                <Moon className={`h-5 w-5 transition-all duration-300 text-slate-700 ${isDarkMode ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
                                <span className="sr-only">Toggle dark mode</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
                        </TooltipContent>
                    </Tooltip>

                    {currentUser && (
                        <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-border/60">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-extrabold flex items-center justify-center text-xs border border-primary/20">
                                {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'US'}
                            </div>
                            <div className="text-left text-xs truncate max-w-[120px]">
                                <p className="font-bold text-foreground truncate">{currentUser.name || 'Pengurus'}</p>
                                <p className="text-[10px] text-muted-foreground capitalize truncate">{currentUser.role}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
