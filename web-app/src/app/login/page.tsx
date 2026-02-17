'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Lock, Mail, Github, Chrome, ArrowRight, AlertCircle, Scale } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const { signInWithGoogle } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });
                if (error) throw error;
                alert('¡Registro exitoso! Revisa tu correo para confirmar.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-xl"
            >
                <div className="flex justify-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-400 to-purple-600 p-[1px]">
                        <div className="w-full h-full bg-black rounded-[11px] flex items-center justify-center">
                            <Scale className="w-6 h-6 text-cyan-400" />
                        </div>
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    {mode === 'signin' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
                </h1>
                <p className="text-gray-400 text-center mb-8 text-sm">
                    {mode === 'signin' ? 'Accede a tu asistente legal inteligente.' : 'Únete a la comunidad HalalLegal.'}
                </p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> {error}
                    </div>
                )}

                <form onSubmit={handleEmailAuth} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                                placeholder="tu@email.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 transition-opacity font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 mt-2"
                    >
                        {loading ? 'Procesando...' : (mode === 'signin' ? 'Iniciar Sesión' : 'Registrarse')} <ArrowRight className="w-4 h-4" />
                    </button>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#0a0a0a] px-2 text-gray-500">O continúa con</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={signInWithGoogle}
                        className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2.5 transition-colors text-sm font-medium"
                    >
                        <Chrome className="w-4 h-4" /> Google
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2.5 transition-colors text-sm font-medium opacity-50 cursor-not-allowed">
                        <Github className="w-4 h-4" /> GitHub
                    </button>
                </div>

                <div className="mt-8 text-center text-sm text-gray-500">
                    {mode === 'signin' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                    <button
                        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                        className="text-purple-400 hover:text-purple-300 font-bold transition-colors"
                    >
                        {mode === 'signin' ? 'Regístrate' : 'Inicia Sesión'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
