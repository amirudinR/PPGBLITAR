import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FeaturePermission, FEATURE_LIST, Role, User } from '@/types/admin';
import { showSuccess, showError } from '@/utils/toast';

export function useFeaturePermissions(currentUser: User | null) {
    const [permissions, setPermissions] = useState<FeaturePermission[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPermissions = useCallback(async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, 'featurePermissions'));

            if (querySnapshot.empty) {
                // Initialize default permissions if none exist
                console.log('Initializing default feature permissions...');
                const batch = writeBatch(db);
                const defaultPermissions: FeaturePermission[] = FEATURE_LIST.map((feature, index) => ({
                    ...feature,
                    id: feature.featureId
                }));

                for (const perm of defaultPermissions) {
                    const docRef = doc(db, 'featurePermissions', perm.id);
                    batch.set(docRef, perm);
                }

                await batch.commit();
                setPermissions(defaultPermissions);
            } else {
                const perms = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as FeaturePermission[];
                setPermissions(perms);
            }
        } catch (error) {
            console.error('Error fetching permissions:', error);
            // Fallback to default permissions from FEATURE_LIST
            const defaultPermissions: FeaturePermission[] = FEATURE_LIST.map((feature) => ({
                ...feature,
                id: feature.featureId
            }));
            setPermissions(defaultPermissions);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (currentUser) {
            fetchPermissions();
        }
    }, [currentUser, fetchPermissions]);

    const updatePermission = async (featureId: string, updates: Partial<FeaturePermission>) => {
        if (currentUser?.role !== 'adminsuper') {
            showError('Hanya Super Admin yang dapat mengubah pengaturan akses');
            return false;
        }

        try {
            const docRef = doc(db, 'featurePermissions', featureId);
            await updateDoc(docRef, updates);

            setPermissions(prev =>
                prev.map(p => p.id === featureId ? { ...p, ...updates } : p)
            );

            showSuccess('Pengaturan akses berhasil diperbarui');
            return true;
        } catch (error) {
            console.error('Error updating permission:', error);
            showError('Gagal memperbarui pengaturan akses');
            return false;
        }
    };

    const toggleRoleAccess = async (featureId: string, role: Role) => {
        const permission = permissions.find(p => p.id === featureId);
        if (!permission) return false;

        // AdminSuper always has access, cannot be removed
        if (role === 'adminsuper') {
            showError('Akses Super Admin tidak dapat diubah');
            return false;
        }

        const newAllowedRoles = permission.allowedRoles.includes(role)
            ? permission.allowedRoles.filter(r => r !== role)
            : [...permission.allowedRoles, role];

        return updatePermission(featureId, { allowedRoles: newAllowedRoles });
    };

    const toggleFeatureEnabled = async (featureId: string) => {
        const permission = permissions.find(p => p.id === featureId);
        if (!permission) return false;

        if (permission.isCore) {
            showError('Fitur inti tidak dapat dinonaktifkan');
            return false;
        }

        return updatePermission(featureId, { isEnabled: !permission.isEnabled });
    };

    const canAccessFeature = useCallback((featureId: string, userRole: Role): boolean => {
        // AdminSuper always has access to everything
        if (userRole === 'adminsuper') return true;

        const permission = permissions.find(p => p.featureId === featureId);
        if (!permission) {
            // If no permission found, fallback to FEATURE_LIST defaults
            const defaultFeature = FEATURE_LIST.find(f => f.featureId === featureId);
            return defaultFeature ? defaultFeature.allowedRoles.includes(userRole) && defaultFeature.isEnabled : false;
        }

        return permission.isEnabled && permission.allowedRoles.includes(userRole);
    }, [permissions]);

    const getPermissionsByCategory = useCallback((category: string) => {
        return permissions.filter(p => p.category === category);
    }, [permissions]);

    return {
        permissions,
        loading,
        fetchPermissions,
        updatePermission,
        toggleRoleAccess,
        toggleFeatureEnabled,
        canAccessFeature,
        getPermissionsByCategory
    };
}
