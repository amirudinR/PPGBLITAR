import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'soft' | 'neu' | 'editorial' | 'glass';

const THEME_OPTIONS: Theme[] = ['light', 'dark', 'soft', 'neu', 'editorial', 'glass'];

const isTheme = (value: string | null): value is Theme => {
    return value !== null && THEME_OPTIONS.includes(value as Theme);
};

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('theme');
            if (isTheme(stored)) return stored;

            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        }
        return 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;

        root.classList.remove('dark', 'soft', 'neu', 'editorial', 'glass');
        if (theme === 'glass') {
            root.classList.add('glass');
            document.body.classList.add('glass');
        } else {
            document.body.classList.remove('glass');
            if (theme !== 'light') {
                root.classList.add(theme);
            }
        }

        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => {
            if (prev === 'light') return 'dark';
            if (prev === 'dark') return 'soft';
            if (prev === 'soft') return 'neu';
            if (prev === 'neu') return 'editorial';
            if (prev === 'editorial') return 'glass';
            return 'light';
        });
    };

    return { theme, setTheme, toggleTheme };
}
