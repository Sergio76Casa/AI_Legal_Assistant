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
                    }
                }
            });

            if (authError) throw authError;

            // B. Mark Invitation as Accepted & Link User to Tenant
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
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-red-500/20">
                    <AlertOctagon size={48} className="mx-auto text-red-500 mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Invitación Inválida</h2>
                    <p className="text-slate-400">{error}</p>
                    <a href="/" className="mt-6 inline-block text-primary font-bold hover:underline">Volver al Inicio</a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[150px] -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[150px] -ml-48 -mb-48"></div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-white/10 relative z-10">
                <div className="bg-slate-900/80 p-8 text-center border-b border-white/5">
                    <ShieldCheck size={48} className="text-primary mx-auto mb-4 animate-pulse" />
                    <h1 className="text-2xl font-black text-white mb-2 tracking-tight">Únete al Equipo</h1>
                    <p className="text-slate-400 text-sm">
                        Has sido invitado a colaborar en <br />
                        <span className="text-primary font-black text-lg tracking-tight uppercase">{invitation.tenants?.name || 'Organización'}</span>
                    </p>
                </div>

                <div className="p-8">
                    <div className="mb-6 bg-primary/10 text-primary px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 border border-primary/20">
                        <CheckCircle size={16} className="shrink-0" />
                        <div>
                            <p className="opacity-70 uppercase tracking-widest text-[10px] mb-0.5">Invitación verificada</p>
                            <p className="text-sm font-black">{invitation.email}</p>
                        </div>
                    </div>

                    <form onSubmit={handleJoin} className="space-y-6">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Crea tu Contraseña</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all placeholder:text-slate-600 font-medium"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-primary text-slate-900 py-4 rounded-xl font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary/20 active:scale-[0.98]"
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

                    <p className="mt-8 text-center text-[10px] uppercase font-black tracking-widest text-slate-600">
                        Al unirte, aceptas los términos de <span className="text-white">LegalFlow</span> y de <span className="text-white">{invitation.tenants?.name}</span>.
                    </p>
                </div>
            </div>
        </div>
    );
};
