import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Mail, Lock, Loader2, LogIn, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface AuthFormProps {
    onAuthSuccess: () => void;
    onBack?: () => void;
    tenantSlug?: string;
    tenantName?: string;
    targetPlan?: string;
    initialIsSignUp?: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess, onBack, tenantSlug, tenantName, targetPlan, initialIsSignUp = false }) => {
    const { t } = useTranslation();
    const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [country, setCountry] = useState('ES'); // Default: España
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Detectar país automáticamente al montar el componente (si no se especifica tenant)
    React.useEffect(() => {
        if (!tenantSlug) {
            fetch('https://ipapi.co/json/')
                .then(res => res.json())
                .then(data => {
                    if (data.country_code) {
                        setCountry(data.country_code);
                    }
                })
                .catch(() => {
                    // Si falla, mantener España por defecto
                });
        }
    }, [tenantSlug]);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const authOptions = {
            email,
            password,
            options: {
                data: {
                    username: username,
                    country: country,
                    tenant_slug: tenantSlug || undefined,
                    plan: targetPlan || 'free'
                }
            }
        };

        const { error } = isSignUp
            ? await supabase.auth.signUp(authOptions)
            : await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError(error.message);
        } else {
            onAuthSuccess();
        }
        setLoading(false);
    };

    const handleGoogleAuth = async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'select_account',
                    },
                }
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
                <div className="text-center">
                    {onBack && (
                        <button onClick={onBack} className="absolute top-8 left-8 p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                        {tenantSlug ? (
                            <span className="text-xl font-bold text-emerald-600">{tenantSlug.charAt(0).toUpperCase()}</span>
                        ) : (
                            <LogIn className="h-6 w-6 text-emerald-600" />
                        )}
                    </div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 font-serif">
                        {tenantSlug
                            ? (isSignUp ? t('auth.register_tenant', { tenant: tenantName || tenantSlug }) : t('auth.access_tenant', { tenant: tenantName || tenantSlug }))
                            : (isSignUp ? t('auth.create_account') : t('auth.sign_in'))
                        }
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        {isSignUp
                            ? (tenantSlug ? t('auth.create_account_context', { plan: targetPlan === 'pro' ? t('auth.plan_premium') : t('auth.plan_free') }) : t('auth.subtitle_up'))
                            : t('auth.subtitle_in')
                        }
                    </p>
                </div>

                <div className="mt-8 space-y-4">
                    <button
                        onClick={handleGoogleAuth}
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all disabled:opacity-50"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        {t('auth.google')}
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-slate-500">{t('auth.with_email')}</span>
                        </div>
                    </div>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleEmailAuth}>
                    <div className="-space-y-px rounded-md shadow-sm">
                        {isSignUp && (
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                    <span className="text-xs font-bold border border-slate-300 rounded px-1">U</span>
                                </span>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    className="relative block w-full rounded-t-md border-0 py-3 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
                                    placeholder={t('auth.username_placeholder')}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        )}
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <Mail size={18} />
                            </span>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className={`relative block w-full border-0 py-3 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6 ${isSignUp ? '' : 'rounded-t-md'}`}
                                placeholder={t('auth.email_placeholder')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <Lock size={18} />
                            </span>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="relative block w-full rounded-b-md border-0 py-3 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
                                placeholder={t('auth.password_placeholder')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-100 animate-pulse">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-lg bg-emerald-600 px-3 py-3 text-sm font-semibold text-white hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-70 transition-all shadow-lg shadow-emerald-200"
                        >
                            {loading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {isSignUp ? t('auth.create_account_btn') : t('auth.login_btn')}
                        </button>
                    </div>
                </form>

                <div className="text-center">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-sm font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
                    >
                        {isSignUp
                            ? t('auth.go_to_login')
                            : t('auth.go_to_signup')}
                    </button>
                </div>
            </div>
        </div>
    );
};
