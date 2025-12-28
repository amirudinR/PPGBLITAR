import React from 'react';
import { Menu, Sun, Moon, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface HeaderProps {
    title: string;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (collapsed: boolean) => void;
    theme: 'light' | 'dark';
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
    return (
        <header className="bg-card border-b border-border sticky top-0 z-40 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3">
                {/* Left side - Sidebar toggles */}
                <div className="flex items-center gap-2">
                    {/* Mobile menu button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
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
                                className="hidden lg:flex"
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
                    <h1 className="text-lg font-semibold text-foreground hidden md:block">{title}</h1>
                </div>

                {/* Right side - Theme toggle */}
                <div className="flex items-center gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={toggleTheme}
                                className="relative overflow-hidden transition-all duration-300 hover:bg-accent"
                            >
                                <Sun className={`h-5 w-5 transition-all duration-300 ${theme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100'
                                    }`} />
                                <Moon className={`absolute h-5 w-5 transition-all duration-300 ${theme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'
                                    }`} />
                                <span className="sr-only">Toggle theme</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>

            {/* Mobile page title */}
            <div className="px-4 pb-2 md:hidden">
                <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            </div>
        </header>
    );
}
