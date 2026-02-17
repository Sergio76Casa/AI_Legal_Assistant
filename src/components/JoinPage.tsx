import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldCheck, ArrowRight, Loader2, CheckCircle, AlertOctagon } from 'lucide-react';

interface JoinPageProps {
    onSuccess: () => void;
}

export const JoinPage: React.FC<JoinPageProps> = ({ onSuccess }) => {
    // 1. Get Token from URL (simple query param extraction)
    const token = new URLSearchParams(window.location.search).get('token');

    const [loading, setLoading] = useState(true);
    const [invitation, setInvitation] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [processing, setProcessing] = useState(false);

    // 2. Validate Token on Mount
    useEffect(() => {
        if (!token) {
            setError('Enlace de invitación inválido o incompleto.');
            setLoading(false);
            return;
        }
        validateToken();
    }, [token]);

    const validateToken = async () => {
        try {
            // Check if invitation exists and is valid
            const { data, error } = await supabase
                .from('tenant_invitations')
                .select('*, tenants(name)')
                .eq('token', token)
                .eq('status', 'pending')
                .single();

            if (error || !data) throw new Error('Esta invitación no existe o ya ha caducado.');

            setInvitation(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!invitation || !password) return;
        setProcessing(true);

        try {
            // A. Register User
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: invitation.email,
                password: password,
                options: {
                    data: {
                        username: invitation.email.split('@')[0],
                        // CRITICAL: We don't verify email again because they clicked the invite link
                        // But standard flow might require verify. For B2B invites, we usually pre-verify.
                    }
                }
            });

            if (authError) throw authError;

            // B. Mark Invitation as Accepted & Link User to Tenant
            // We call a secure RPC or Edge Function for this usually.
            // For MVP, we can try client-side if Policies allow, but BETTER use an Edge Function 'accept-invite'.

            const { error: acceptError } = await supabase.functions.invoke('accept-invite', {
                body: { token, user_id: authData.user?.id }
            });

            if (acceptError) throw acceptError;

            // C. Success!
            onSuccess(); // Redirect to Dashboard

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error al procesar el registro.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-emerald-600" size={48} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-l-4 border-red-500">
                    <AlertOctagon size={48} className="mx-auto text-red-500 mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Invitación Inválida</h2>
                    <p className="text-gray-600">{error}</p>
                    <a href="/" className="mt-6 inline-block text-emerald-600 font-medium hover:underline">Volver al Inicio</a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
                <div className="bg-slate-900 p-8 text-center">
                    <ShieldCheck size={48} className="text-emerald-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Únete al Equipo</h1>
                    <p className="text-slate-400">
                        Has sido invitado a colaborar en <br />
                        <span className="text-white font-semibold text-lg">{invitation.tenants?.name || 'Organización'}</span>
                    </p>
                </div>

                <div className="p-8">
                    <div className="mb-6 bg-blue-50 text-blue-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                        <CheckCircle size={16} />
                        Invitación verificada para: <strong>{invitation.email}</strong>
                    </div>

                    <form onSubmit={handleJoin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Crea tu Contraseña</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Creando cuenta...
                                </>
                            ) : (
                                <>
                                    Aceptar Invitación <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-xs text-gray-400">
                        Al unirte, aceptas los términos de Legal & Halal y de {invitation.tenants?.name}.
                    </p>
                </div>
            </div>
        </div>
    );
};
