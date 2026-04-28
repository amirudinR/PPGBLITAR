import { useState, useEffect } from 'react';

export type BaseTheme = 'classic' | 'soft' | 'neu' | 'editorial' | 'glass';

const BASE_THEME_OPTIONS: BaseTheme[] = ['classic', 'soft', 'neu', 'editorial', 'glass'];

const isBaseTheme = (value: string | null): value is BaseTheme => {
    return value !== null && BASE_THEME_OPTIONS.includes(value as BaseTheme);
};

export function useTheme() {
    const [baseTheme, setBaseThemeState] = useState<BaseTheme>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('baseTheme');
            if (isBaseTheme(stored)) return stored;
            // Legacy migration from old theme storage
            const oldStored = localStorage.getItem('theme');
            if (oldStored === 'soft') return 'soft';
            if (oldStored === 'neu') return 'neu';
            if (oldStored === 'editorial') return 'editorial';
            if (oldStored === 'glass') return 'glass';
        }
        return 'classic';
    });

    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('darkMode');
            if (stored !== null) return stored === 'true';
            // Legacy migration
            const oldStored = localStorage.getItem('theme');
            if (oldStored === 'dark') return true;
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) return true;
        }
        return false;
    });

    useEffect(() => {
        const root = window.document.documentElement;

        root.classList.remove('dark', 'soft', 'neu', 'editorial', 'glass');
        document.body.classList.remove('glass');

        if (baseTheme !== 'classic') {
            root.classList.add(baseTheme);
        }
        if (baseTheme === 'glass') {
            document.body.classList.add('glass');
        }

        if (isDarkMode) {
            root.classList.add('dark');
        }

        localStorage.setItem('baseTheme', baseTheme);
        localStorage.setItem('darkMode', String(isDarkMode));
    }, [baseTheme, isDarkMode]);

    const setBaseTheme = (theme: BaseTheme) => {
        setBaseThemeState(theme);
    };

    const toggleDarkMode = () => {
        setIsDarkMode(prev => !prev);
    };

    return { baseTheme, isDarkMode, setBaseTheme, toggleDarkMode };
}
