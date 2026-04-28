import React from 'react';
import { Menu, Sun, Moon, Sparkles, Layers, Layout, Droplets, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface HeaderProps {
    title: string;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (collapsed: boolean) => void;
    theme: 'light' | 'dark' | 'soft' | 'neu' | 'editorial' | 'glass';
    toggleTheme: () => void;
}

export default function Header({
    title,
    sidebarOpen,
    setSidebarOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
    theme,
    toggleTheme,
}: HeaderProps) {
    const getHeaderClass = () => {
        switch (theme) {
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
        switch (theme) {
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

                {/* Right side - Theme toggle */}
                <div className="flex items-center gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="icon"
                                onClick={toggleTheme}
                                className={`${getBtnClass()} relative overflow-hidden transition-all duration-300`}
                            >
                                <Sun className={`h-5 w-5 transition-all duration-300 ${theme === 'light' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} />
                                <Moon className={`absolute h-5 w-5 transition-all duration-300 ${theme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'}`} />
                                <Sparkles className={`absolute h-5 w-5 transition-all duration-300 ${theme === 'soft' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} />
                                <Layers className={`absolute h-5 w-5 transition-all duration-300 ${theme === 'neu' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} />
                                <Layout className={`absolute h-5 w-5 transition-all duration-300 ${theme === 'editorial' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} />
                                <Droplets className={`absolute h-5 w-5 transition-all duration-300 ${theme === 'glass' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} />
                                <span className="sr-only">Toggle theme</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {theme === 'light' ? 'Mode Gelap' : theme === 'dark' ? 'Mode Soft Minimal' : theme === 'soft' ? 'Mode Neumorphism' : theme === 'neu' ? 'Mode Editorial' : theme === 'editorial' ? 'Mode Glassmorphism' : 'Mode Terang'}
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </header>
    );
}
