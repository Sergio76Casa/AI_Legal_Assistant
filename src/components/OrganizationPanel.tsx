import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, UserPlus, Mail, Shield, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

interface OrganizationPanelProps {
    tenantId: string;
}

export const OrganizationPanel: React.FC<OrganizationPanelProps> = ({ tenantId }) => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        if (tenantId) fetchUsers();
    }, [tenantId]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Fetch profiles for this tenant
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('tenant_id', tenantId);

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data, error } = await supabase.functions.invoke('invite-user', {
                body: {
                    email: inviteEmail,
                    tenant_id: tenantId,
                    role: 'user' // Default to member role
                }
            });

            if (error) throw error;

            if (data.error) throw new Error(data.error);

            setStatus({ type: 'success', message: `Invitación creada correctamente. Token: ${data.invite_token}` });
            setInviteEmail('');
            // TODO: Refresh list if we show pending invites
        } catch (error: any) {
            console.error('Invite error:', error);
            setStatus({ type: 'error', message: error.message || 'Error al enviar invitación' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <BuildingIcon size={24} className="text-emerald-600" />
                    Mi Organización
                </h2>
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    ID: {tenantId}
                </div>
            </div>

            {/* Invite Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <UserPlus size={18} />
                    Invitar Nuevo Miembro
                </h3>
                <form onSubmit={handleInvite} className="flex gap-4">
                    <input
                        type="email"
                        placeholder="correo@empresa.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                    />
                    <button
                        type="submit"
                        className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2"
                    >
                        <Mail size={18} />
                        Enviar Invitación
                    </button>
                </form>
                {status && (
                    <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        {status.message}
                    </div>
                )}
            </div>

            {/* Users List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-700">Miembros del Equipo ({users.length})</h3>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-400">Cargando usuarios...</div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-3 font-medium">Usuario</th>
                                <th className="px-6 py-3 font-medium">Rol</th>
                                <th className="px-6 py-3 font-medium">Fecha Unión</th>
                                <th className="px-6 py-3 font-medium">Estado</th>
                                <th className="px-6 py-3 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                                                {user.email?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{user.email}</div>
                                                <div className="text-xs text-gray-500">{user.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin'
                                            ? 'bg-purple-100 text-purple-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {user.role === 'admin' ? <Shield size={12} className="mr-1" /> : null}
                                            {user.role || 'member'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-medium">
                                            Activo
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-400 hover:text-red-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">
                                        No hay usuarios en esta organización (¡raro, deberías estar tú!)
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

const BuildingIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
        <path d="M9 22v-4h6v4" />
        <path d="M8 6h.01" />
        <path d="M16 6h.01" />
        <path d="M8 10h.01" />
        <path d="M16 10h.01" />
        <path d="M8 14h.01" />
        <path d="M16 14h.01" />
        <path d="M8 18h.01" />
        <path d="M16 18h.01" />
    </svg>
);
