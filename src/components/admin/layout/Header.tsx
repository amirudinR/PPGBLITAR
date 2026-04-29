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
    const getHeaderClass = () => {
        switch (baseTheme) {
            case 'neu':
                return 'neu-header bg-card border-b border-border sticky top-0 z-40 h-14 flex items-center';
            case 'soft':
                return 'soft-header bg-card border-b border-border sticky top-0 z-40 h-14 flex items-center';
            case 'glass':
                return 'bg-card/60 backdrop-blur-md border-b border-border sticky top-0 z-40 h-14 flex items-center';
            default:
                return 'bg-card border-b border-border sticky top-0 z-40 h-14 flex items-center';
        }
    };

    const getBtnClass = () => {
        switch (baseTheme) {
            case 'neu':
                return 'neu-btn';
            case 'soft':
                return 'soft-btn';
            default:
                return '';
        }
    };

    return (
        <header className={getHeaderClass()}>
            <div className="flex items-center justify-between px-4 w-full">
                {/* Left side - Sidebar toggles */}
                <div className="flex items-center gap-2">
                    {/* Mobile menu button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`lg:hidden ${getBtnClass()}`}
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
                                className={`hidden lg:flex ${getBtnClass()}`}
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

                    {/* Page title */}
                    <h1 className="text-lg font-semibold text-foreground">{title}</h1>
                </div>

                {/* Right side - Notification bell + Help + Dark mode toggle */}
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
                                className={`${getBtnClass()} relative overflow-hidden transition-all duration-300`}
                            >
                                <Sun className={`h-5 w-5 transition-all duration-300 absolute ${isDarkMode ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} />
                                <Moon className={`h-5 w-5 transition-all duration-300 ${isDarkMode ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
                                <span className="sr-only">Toggle dark mode</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </header>
    );
}
