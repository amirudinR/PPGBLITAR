import React from 'react';
import { BaseTheme, useTheme } from '@/hooks/useTheme';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sun, Moon, Sparkles, Layers, Layout, Droplets } from 'lucide-react';

const THEME_OPTIONS: { value: BaseTheme; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: 'classic',
    label: 'Classic',
    icon: <Sun className="h-5 w-5" />,
    description: 'Tampilan klasik bersih dengan warna biru cerah.',
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
  const { baseTheme, isDarkMode, setBaseTheme, toggleDarkMode } = useTheme();

  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight mb-6">Pengaturan</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Dark Mode Toggle */}
        <Card>
          <CardHeader>
            <CardTitle>Mode Tampilan</CardTitle>
            <CardDescription>
              Aktifkan mode gelap untuk kenyamanan mata di malam hari.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button
              onClick={toggleDarkMode}
              className={`
                flex items-center gap-4 p-4 rounded-xl border-2 w-full text-left transition-all duration-200
                ${isDarkMode ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/40 hover:bg-muted/50'}
              `}
            >
              <div className={`flex items-center justify-center h-10 w-10 rounded-lg shrink-0 ${isDarkMode ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground">{isDarkMode ? 'Mode Gelap Aktif' : 'Mode Terang Aktif'}</div>
                <div className="text-sm text-muted-foreground">Klik untuk {isDarkMode ? 'beralih ke mode terang' : 'beralih ke mode gelap'}</div>
              </div>
              <div className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${isDarkMode ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${isDarkMode ? 'translate-x-7' : 'translate-x-1'}`} />
              </div>
            </button>
          </CardContent>
        </Card>

        {/* Theme Selection */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Tema Aplikasi</CardTitle>
            <CardDescription>
              Pilih tampilan yang sesuai dengan preferensi Anda. Setiap tema tersedia dalam mode terang dan gelap.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {THEME_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setBaseTheme(option.value)}
                  className={`
                    flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200
                    ${baseTheme === option.value
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/40 hover:bg-muted/50'
                    }
                  `}
                >
                  <div className={`
                    flex items-center justify-center h-10 w-10 rounded-lg shrink-0
                    ${baseTheme === option.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                  `}>
                    {option.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  </div>
                  <div className={`
                    h-5 w-5 rounded-full border-2 shrink-0 transition-all duration-200
                    ${baseTheme === option.value ? 'border-primary bg-primary' : 'border-muted-foreground/30'}
                  `}>
                    {baseTheme === option.value && (
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
