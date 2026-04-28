import React, { useState } from 'react';
import { Settings, Shield, Check, X, Lock, Unlock, Users, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useFeaturePermissions } from '@/hooks/useFeaturePermissions';
import { User, ROLES, FEATURE_CATEGORIES } from '@/types/admin';

interface FeaturePermissionsSectionProps {
    currentUser: User | null;
}

const ROLE_LABELS: Record<string, string> = {
    adminsuper: 'Super Admin',
    admin: 'Admin',
    desa: 'PJP Desa',
    kelompok: 'PJP Kelompok',
    guru: 'Guru',
    orangtua: 'Orang Tua'
};

const ROLE_COLORS: Record<string, string> = {
    adminsuper: 'bg-destructive/20 text-destructive border-destructive/30',
    admin: 'bg-[hsl(var(--stat-6)/0.2)] text-[hsl(var(--stat-6))] border-[hsl(var(--stat-6)/0.3)]',
    desa: 'bg-[hsl(var(--info)/0.2)] text-[hsl(var(--info))] border-[hsl(var(--info)/0.3)]',
    kelompok: 'bg-[hsl(var(--success)/0.2)] text-[hsl(var(--success))] border-[hsl(var(--success)/0.3)]',
    guru: 'bg-[hsl(var(--warning)/0.2)] text-[hsl(var(--warning))] border-[hsl(var(--warning)/0.3)]',
    orangtua: 'bg-[hsl(var(--stat-2)/0.2)] text-[hsl(var(--stat-2))] border-[hsl(var(--stat-2)/0.3)]'
};

export default function FeaturePermissionsSection({ currentUser }: FeaturePermissionsSectionProps) {
    const {
        permissions,
        loading,
        toggleRoleAccess,
        toggleFeatureEnabled,
        getPermissionsByCategory
    } = useFeaturePermissions(currentUser);

    const [searchTerm, setSearchTerm] = useState('');
    const [openCategories, setOpenCategories] = useState<string[]>(FEATURE_CATEGORIES.map(c => c.id));

    const toggleCategory = (categoryId: string) => {
        setOpenCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(c => c !== categoryId)
                : [...prev, categoryId]
        );
    };

    const filteredPermissions = permissions.filter(p =>
        p.featureName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (currentUser?.role !== 'adminsuper') {
        return (
            <div className="text-center py-12">
                <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h2 className="text-xl font-semibold mb-2">Akses Terbatas</h2>
                <p className="text-muted-foreground">Hanya Super Admin yang dapat mengakses pengaturan ini</p>
            </div>
        );
    }

    if (loading) {
        return <div className="text-center py-12">Memuat pengaturan akses...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Shield className="w-6 h-6 text-primary" />
                        Pengaturan Akses Fitur
                    </h2>
                    <p className="text-muted-foreground">Kelola fitur mana yang dapat diakses oleh setiap role</p>
                </div>
            </div>

            {/* Legend */}
            <Card className="bg-card">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Keterangan Role</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {ROLES.filter(r => r !== 'adminsuper').map(role => (
                            <Badge key={role} variant="outline" className={`${ROLE_COLORS[role]} border`}>
                                {ROLE_LABELS[role]}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Cari fitur..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Feature Categories */}
            <div className="space-y-4">
                {FEATURE_CATEGORIES.map(category => {
                    const categoryPermissions = searchTerm
                        ? filteredPermissions.filter(p => p.category === category.id)
                        : getPermissionsByCategory(category.id);

                    if (categoryPermissions.length === 0) return null;

                    return (
                        <Collapsible
                            key={category.id}
                            open={openCategories.includes(category.id)}
                            onOpenChange={() => toggleCategory(category.id)}
                        >
                            <Card className="bg-card">
                                <CollapsibleTrigger asChild>
                                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                {openCategories.includes(category.id) ? (
                                                    <ChevronDown className="w-5 h-5" />
                                                ) : (
                                                    <ChevronRight className="w-5 h-5" />
                                                )}
                                                {category.name}
                                                <Badge variant="secondary" className="ml-2">
                                                    {categoryPermissions.length} fitur
                                                </Badge>
                                            </CardTitle>
                                        </div>
                                    </CardHeader>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <CardContent className="pt-0">
                                        <div className="space-y-4">
                                            {categoryPermissions.map(permission => (
                                                <div
                                                    key={permission.id}
                                                    className={`p-4 rounded-lg border ${permission.isEnabled
                                                            ? 'bg-card border-border'
                                                            : 'bg-muted/50 border-muted'
                                                        }`}
                                                >
                                                    {/* Feature Header */}
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-semibold text-foreground">
                                                                    {permission.featureName}
                                                                </h4>
                                                                {permission.isCore && (
                                                                    <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                                                                        <Lock className="w-3 h-3 mr-1" />
                                                                        Fitur Inti
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">
                                                                {permission.description}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-muted-foreground">
                                                                {permission.isEnabled ? 'Aktif' : 'Nonaktif'}
                                                            </span>
                                                            <Switch
                                                                checked={permission.isEnabled}
                                                                onCheckedChange={() => toggleFeatureEnabled(permission.id)}
                                                                disabled={permission.isCore}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Role Toggles */}
                                                    <div className="flex flex-wrap gap-2">
                                                        {ROLES.filter(r => r !== 'adminsuper').map(role => {
                                                            const hasAccess = permission.allowedRoles.includes(role);
                                                            return (
                                                                <Button
                                                                    key={role}
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className={`${hasAccess
                                                                            ? ROLE_COLORS[role] + ' border'
                                                                            : 'bg-muted text-muted-foreground border-muted'
                                                                        } transition-all`}
                                                                    onClick={() => toggleRoleAccess(permission.id, role)}
                                                                    disabled={!permission.isEnabled}
                                                                >
                                                                    {hasAccess ? (
                                                                        <Check className="w-3 h-3 mr-1" />
                                                                    ) : (
                                                                        <X className="w-3 h-3 mr-1" />
                                                                    )}
                                                                    {ROLE_LABELS[role]}
                                                                </Button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </CollapsibleContent>
                            </Card>
                        </Collapsible>
                    );
                })}
            </div>

            {/* Info Card */}
            <Card className="bg-[hsl(var(--info)/0.1)] border-[hsl(var(--info)/0.2)]">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <Settings className="w-5 h-5 text-[hsl(var(--info))] mt-0.5" />
                        <div>
                            <h4 className="font-medium text-foreground">Catatan Penting</h4>
                            <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                                <li>• <strong>Super Admin</strong> selalu memiliki akses ke semua fitur</li>
                                <li>• <strong>Fitur Inti</strong> (Dashboard & Profil) tidak dapat dinonaktifkan</li>
                                <li>• Perubahan akses akan langsung berlaku untuk semua pengguna</li>
                                <li>• Klik tombol role untuk menambah/menghapus akses</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
