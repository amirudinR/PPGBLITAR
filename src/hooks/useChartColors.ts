import { useMemo } from 'react';

function getCssVar(varName: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value ? `hsl(${value})` : '#888888';
}

export function useChartColors(count: number = 6): string[] {
  return useMemo(() => {
    return Array.from({ length: count }, (_, i) => getCssVar(`--chart-${i + 1}`));
  }, [count]);
}

export function useSemanticColors() {
  return useMemo(() => ({
    success: getCssVar('--success'),
    warning: getCssVar('--warning'),
    info: getCssVar('--info'),
    destructive: getCssVar('--destructive'),
    muted: getCssVar('--muted-foreground'),
  }), []);
}
