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
    const [country, setCountry] = useState('ES');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        if (!tenantSlug) {
            fetch('https://ipapi.co/json/')
                .then(res => res.json())
                .then(data => {
                    if (data.country_code) {
                        setCountry(data.country_code);
                    }
                })
                .catch(() => { });
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
        <div className="flex min-h-screen items-center justify-center bg-[#0a0f1d] p-4 md:p-6">
            {/* Subtle background glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]"></div>
            </div>

            <div className="relative w-full max-w-md space-y-8 bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="absolute top-6 left-6 flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition-all group"
                        title={t('procedures.back')}
                    >
                        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                        <span>{t('procedures.back').split(' ')[0]}</span>
                    </button>
                )}
                <div className="text-center pt-4">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                        {tenantSlug ? (
                            <span className="text-xl font-bold text-primary">{tenantSlug.charAt(0).toUpperCase()}</span>
                        ) : (
                            <LogIn className="h-6 w-6 text-primary" />
                        )}
                    </div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-white font-serif">
                        {tenantSlug
                            ? (isSignUp ? t('auth.register_tenant', { tenant: tenantName || tenantSlug }) : t('auth.access_tenant', { tenant: tenantName || tenantSlug }))
                            : (isSignUp ? t('auth.create_account') : t('auth.sign_in'))
                        }
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
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
                        className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-white/10 transition-all disabled:opacity-50 backdrop-blur-sm"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        {t('auth.google')}
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-slate-900 px-2 text-slate-500">{t('auth.with_email')}</span>
                        </div>
                    </div>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleEmailAuth}>
                    <div className="-space-y-px rounded-md">
                        {isSignUp && (
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                                    <span className="text-xs font-bold border border-white/20 rounded px-1 text-slate-400">U</span>
                                </span>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    className="relative block w-full rounded-t-md border-0 py-3 pl-10 bg-white/5 text-white ring-1 ring-inset ring-white/10 placeholder:text-slate-500 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                    placeholder={t('auth.username_placeholder')}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        )}
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                                <Mail size={18} />
                            </span>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className={`relative block w-full border-0 py-3 pl-10 bg-white/5 text-white ring-1 ring-inset ring-white/10 placeholder:text-slate-500 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 ${isSignUp ? '' : 'rounded-t-md'}`}
                                placeholder={t('auth.email_placeholder')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                                <Lock size={18} />
                            </span>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="relative block w-full rounded-b-md border-0 py-3 pl-10 bg-white/5 text-white ring-1 ring-inset ring-white/10 placeholder:text-slate-500 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                placeholder={t('auth.password_placeholder')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20 animate-pulse">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-lg bg-primary px-3 py-3 text-sm font-semibold text-slate-900 hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70 transition-all shadow-lg shadow-primary/20"
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
                        className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
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
