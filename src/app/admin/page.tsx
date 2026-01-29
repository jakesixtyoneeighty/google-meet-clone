'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { usePermissions } from '@/hooks/usePermissions';
import Header from '@/components/Header';
import { Shield, User, Crown, Loader2, Check, X } from 'lucide-react';

interface UserData {
    id: string;
    name: string;
    email: string;
    imageUrl: string;
    role: string;
    isHostDomain: boolean;
    createdAt: number;
}

const roleIcons: Record<string, React.ReactNode> = {
    admin: <Crown className="w-4 h-4 text-yellow-500" />,
    host: <Shield className="w-4 h-4 text-nj-red" />,
    'host (domain)': <Shield className="w-4 h-4 text-nj-red" />,
    user: <User className="w-4 h-4 text-nj-grey-400" />,
};

const AdminPage = () => {
    const { isLoaded, isSignedIn } = useUser();
    const { canCreateMeeting, email } = usePermissions();
    const router = useRouter();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isLoaded && (!isSignedIn || !canCreateMeeting)) {
            router.push('/');
        }
    }, [isLoaded, isSignedIn, canCreateMeeting, router]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/admin/users');
                if (!res.ok) {
                    if (res.status === 403) {
                        router.push('/');
                        return;
                    }
                    throw new Error('Failed to fetch users');
                }
                const data = await res.json();
                setUsers(data.users);
            } catch (e) {
                setError('Failed to load users');
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        if (isSignedIn && canCreateMeeting) {
            fetchUsers();
        }
    }, [isSignedIn, canCreateMeeting, router]);

    const updateRole = async (userId: string, newRole: string) => {
        setUpdating(userId);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: newRole }),
            });

            if (!res.ok) throw new Error('Failed to update role');

            setUsers((prev) =>
                prev.map((u) =>
                    u.id === userId ? { ...u, role: newRole } : u
                )
            );
        } catch (e) {
            setError('Failed to update user role');
            console.error(e);
        } finally {
            setUpdating(null);
        }
    };

    if (!isLoaded || loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-nj-red" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <Header />
            <main className="max-w-6xl mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                        <p className="text-nj-grey-400 mt-1">
                            Manage user roles and broadcasting permissions
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-nj-grey-400">
                        <div className="flex items-center gap-2">
                            <Crown className="w-4 h-4 text-yellow-500" />
                            <span>Admin</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-nj-red" />
                            <span>Host</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-nj-grey-400" />
                            <span>User</span>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                        {error}
                    </div>
                )}

                <div className="bg-nj-grey-900/50 border border-nj-grey-800 rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-nj-grey-800">
                                <th className="text-left px-6 py-4 text-sm font-semibold text-nj-grey-300">User</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-nj-grey-300">Email</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-nj-grey-300">Current Role</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-nj-grey-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b border-nj-grey-800/50 hover:bg-nj-grey-800/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={user.imageUrl}
                                                alt={user.name}
                                                className="w-10 h-10 rounded-full bg-nj-grey-800"
                                            />
                                            <span className="font-medium">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-nj-grey-400">
                                        {user.email}
                                        {user.isHostDomain && (
                                            <span className="ml-2 text-xs px-2 py-0.5 rounded bg-nj-red/20 text-nj-red">
                                                Host Domain
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {roleIcons[user.role] || roleIcons.user}
                                            <span className="capitalize">{user.role}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {updating === user.id ? (
                                            <Loader2 className="w-5 h-5 animate-spin text-nj-grey-400" />
                                        ) : user.isHostDomain ? (
                                            <span className="text-sm text-nj-grey-500">Domain-based (auto)</span>
                                        ) : (
                                            <select
                                                value={user.role}
                                                onChange={(e) => updateRole(user.id, e.target.value)}
                                                className="bg-nj-grey-800 border border-nj-grey-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-nj-red transition-colors"
                                            >
                                                <option value="user">User</option>
                                                <option value="host">Host</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {users.length === 0 && (
                        <div className="p-12 text-center text-nj-grey-400">
                            No users found
                        </div>
                    )}
                </div>

                <div className="mt-8 p-6 bg-nj-grey-900/30 border border-nj-grey-800 rounded-xl">
                    <h3 className="font-semibold mb-2">Permission Levels</h3>
                    <ul className="text-sm text-nj-grey-400 space-y-2">
                        <li><strong className="text-yellow-500">Admin:</strong> Full access - can create broadcasts and manage all users</li>
                        <li><strong className="text-nj-red">Host:</strong> Can create and manage broadcasts</li>
                        <li><strong className="text-nj-grey-300">User:</strong> Can only join broadcasts via code</li>
                        <li className="text-nj-grey-500 italic">Note: Users with @sixtyoneeighty.net emails automatically have host permissions</li>
                    </ul>
                </div>
            </main>
        </div>
    );
};

export default AdminPage;
