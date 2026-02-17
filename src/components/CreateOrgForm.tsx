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
    const [step, setStep] = useState(1); // 1: Info, 2: Creating
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
            // New Flow: Call Edge Function 'create-organization' directly
            // This function handles both Tenant creation and User creation + assignment
            const { data, error: functionError } = await supabase.functions.invoke('create-organization', {
                body: {
                    email,
                    password,
                    orgName,
                    username
                }
            });

            if (functionError) throw functionError;

            // Check for logical errors returned by the function (even with 200 OK)
            if (data && !data.success) {
                throw new Error(data.error || 'Error desconocido al crear la organización');
            }

            // If successful, the user is created. We can try to sign them in automatically.
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (signInError) {
                // If auto-signin fails (e.g. strict security), just show success message
                console.warn('Auto-signin after creation failed:', signInError);
            }

            // Success!
            setStep(2);
            setTimeout(() => {
                onSuccess();
            }, 2000);

        } catch (err: any) {
            console.error(err);
            // Translate common auth errors
            let msg = err.message || "Ocurrió un error inesperado.";
            if (msg.includes('already registered')) msg = "Este email ya está registrado.";

            setError(msg);
            setLoading(false);
        }
    };

    if (step === 2) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-emerald-600">
                    <CheckCircle2 size={48} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">¡Todo listo!</h2>
                <p className="text-slate-600 text-lg">
                    Se ha creado la organización <span className="font-bold text-slate-900">{orgName}</span>.
                </p>
                <p className="text-sm text-slate-400 mt-8">Redirigiendo a tu panel...</p>
            </div>
        );
    }

    return (
        <div className="p-8 bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md mx-auto mt-10 relative">
            <button
                onClick={onBack}
                className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
                ← Volver
            </button>

            <div className="text-center mb-8 mt-4">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Building size={24} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Nueva Organización</h2>
                <p className="text-slate-500 text-sm">Crea tu espacio de trabajo seguro</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Organization Name */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nombre de la Empresa</label>
                    <div className="relative">
                        <Building className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input
                            type="text"
                            required
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            placeholder="Ej. Legal Corp SL"
                        />
                    </div>
                </div>

                <div className="border-t border-slate-100 my-4"></div>

                {/* Admin User Info */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Administrador</label>
                    <div className="space-y-3">
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                placeholder="Tu nombre completo"
                            />
                        </div>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                placeholder="tu@empresa.com"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                placeholder="Contraseña segura"
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg font-medium border border-red-100 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 mt-2"
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

            <p className="text-center text-xs text-slate-400 mt-6">
                Al crear una cuenta, aceptas nuestros Términos de Servicio B2B.
            </p>
        </div>
    );
};
