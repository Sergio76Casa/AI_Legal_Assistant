import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Building, User, Mail, Lock, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface CreateOrgFormProps {
    onSuccess: () => void;
    onBack: () => void;
}

export const CreateOrgForm: React.FC<CreateOrgFormProps> = ({ onSuccess, onBack }) => {
    const [step, setStep] = useState(1);
    const [orgName, setOrgName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const referralCode = document.cookie
                .split('; ')
                .find(row => row.startsWith('referral_code='))
                ?.split('=')[1];

            const { data, error: functionError } = await supabase.functions.invoke('create-organization', {
                body: {
                    email,
                    password,
                    orgName,
                    username,
                    referral_code: referralCode
                }
            });

            if (functionError) throw functionError;

            if (data && !data.success) {
                throw new Error(data.error || 'Error desconocido al crear la organización');
            }

            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (signInError) {
                console.warn('Auto-signin after creation failed:', signInError);
            }

            setStep(2);
            setTimeout(() => {
                onSuccess();
            }, 2000);

        } catch (err: any) {
            console.error(err);
            let msg = err.message || "Ocurrió un error inesperado.";
            if (msg.includes('already registered')) msg = "Este email ya está registrado.";

            setError(msg);
            setLoading(false);
        }
    };

    if (step === 2) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-primary/15 rounded-full flex items-center justify-center mb-6 text-primary border border-primary/20">
                    <CheckCircle2 size={48} />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">¡Todo listo!</h2>
                <p className="text-slate-300 text-lg">
                    Se ha creado la organización <span className="font-bold text-white">{orgName}</span>.
                </p>
                <p className="text-sm text-slate-500 mt-8">Redirigiendo a tu panel...</p>
            </div>
        );
    }

    return (
        <div className="p-8 bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 max-w-md mx-auto mt-10 relative">
            <button
                onClick={onBack}
                className="absolute top-4 left-4 text-slate-400 hover:text-white transition-colors"
            >
                ← Volver
            </button>

            <div className="text-center mb-8 mt-4">
                <div className="w-12 h-12 bg-primary/15 text-primary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-primary/20">
                    <Building size={24} />
                </div>
                <h2 className="text-2xl font-bold text-white">Nueva Organización</h2>
                <p className="text-primary text-sm">Crea tu espacio de trabajo seguro</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Organization Name */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nombre de la Empresa</label>
                    <div className="relative">
                        <Building className="absolute left-3 top-3 text-slate-500" size={18} />
                        <input
                            type="text"
                            required
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-white placeholder:text-slate-500"
                            placeholder="Ej. Legal Corp SL"
                        />
                    </div>
                </div>

                <div className="border-t border-white/10 my-4"></div>

                {/* Admin User Info */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Administrador</label>
                    <div className="space-y-3">
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-slate-500" size={18} />
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-white placeholder:text-slate-500"
                                placeholder="Tu nombre completo"
                            />
                        </div>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-white placeholder:text-slate-500"
                                placeholder="tu@empresa.com"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-white placeholder:text-slate-500"
                                placeholder="Contraseña segura"
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-500/10 text-red-400 text-xs rounded-lg font-medium border border-red-500/20 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-slate-900 py-3.5 rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-0.5 mt-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Configurando entorno...
                        </>
                    ) : (
                        <>
                            Crear Cuenta <ArrowRight size={20} />
                        </>
                    )}
                </button>
            </form>

            <p className="text-center text-xs text-slate-500 mt-6">
                Al crear una cuenta, aceptas nuestros Términos de Servicio B2B.
            </p>
        </div>
    );
};
