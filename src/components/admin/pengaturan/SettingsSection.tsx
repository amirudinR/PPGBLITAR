import React from 'react';
import { Theme, useTheme } from '@/hooks/useTheme';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sun, Moon, Sparkles, Layers, Layout, Droplets } from 'lucide-react';

const THEME_OPTIONS: { value: Theme; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: 'light',
    label: 'Terang',
    icon: <Sun className="h-5 w-5" />,
    description: 'Tampilan cerah dan bersih untuk penggunaan di siang hari.',
  },
  {
    value: 'dark',
    label: 'Gelap',
    icon: <Moon className="h-5 w-5" />,
    description: 'Tampilan gelap yang nyaman untuk mata di malam hari.',
  },
  {
    value: 'soft',
    label: 'Soft Minimal Enterprise',
    icon: <Sparkles className="h-5 w-5" />,
    description: 'Tampilan modern, bersih, dan minimalis ala Linear dan Notion.',
  },
  {
    value: 'neu',
    label: 'Neumorphism',
    icon: <Layers className="h-5 w-5" />,
    description: 'Tampilan tactile dengan efek emboss/deboss, organik dan sangat halus.',
  },
  {
    value: 'editorial',
    label: 'Swiss / Editorial',
    icon: <Layout className="h-5 w-5" />,
    description: 'Grid ketat, tipografi sebagai visual utama, presisi ruang ala desain grafis Swiss.',
  },
  {
    value: 'glass',
    label: 'Glassmorphism',
    icon: <Droplets className="h-5 w-5" />,
    description: 'Efek frosted glass dengan transparansi berlapis, elegan dan futuristik.',
  },
];

export default function SettingsSection() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight mb-6">Pengaturan</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Tema Aplikasi</CardTitle>
            <CardDescription>
              Pilih tampilan yang sesuai dengan preferensi Anda. Pilihan ini akan disimpan secara otomatis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3">
              {THEME_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={`
                    flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200
                    ${theme === option.value
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/40 hover:bg-muted/50'
                    }
                  `}
                >
                  <div className={`
                    flex items-center justify-center h-10 w-10 rounded-lg shrink-0
                    ${theme === option.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                  `}>
                    {option.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  </div>
                  <div className={`
                    h-5 w-5 rounded-full border-2 shrink-0 transition-all duration-200
                    ${theme === option.value ? 'border-primary bg-primary' : 'border-muted-foreground/30'}
                  `}>
                    {theme === option.value && (
                      <div className="h-full w-full rounded-full bg-primary-foreground scale-[0.4]" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
