import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Building, User, Mail, Lock, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface CreateOrgFormProps {
    onSuccess: () => void;
    onBack: () => void;
}

export const CreateOrgForm: React.FC<CreateOrgFormProps> = ({ onSuccess, onBack }) => {
    const { t } = useTranslation();
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
            let msg = err.message || t('landing.create_org.error_generic');
            if (msg.includes('already registered')) msg = t('landing.create_org.error_registered');

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
                <h2 className="text-3xl font-bold text-white mb-2">{t('landing.create_org.success_title')}</h2>
                <p className="text-slate-300 text-lg">
                    {t('landing.create_org.success_desc_1')} <span className="font-bold text-white">{orgName}</span>.
                </p>
                <p className="text-sm text-slate-500 mt-8">{t('landing.create_org.redirecting')}</p>
            </div>
        );
    }

    return (
        <div className="p-8 bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 max-w-md mx-auto mt-10 relative">
            <button
                onClick={onBack}
                className="absolute top-4 left-4 text-slate-400 hover:text-white transition-colors"
            >
                ← {t('landing.create_org.back')}
            </button>

            <div className="text-center mb-8 mt-4">
                <div className="w-12 h-12 bg-primary/15 text-primary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-primary/20">
                    <Building size={24} />
                </div>
                <h2 className="text-2xl font-bold text-white">{t('landing.create_org.title')}</h2>
                <p className="text-primary text-sm">{t('landing.create_org.subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Organization Name */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t('landing.create_org.company_name')}</label>
                    <div className="relative">
                        <Building className="absolute left-3 top-3 text-slate-500" size={18} />
                        <input
                            type="text"
                            required
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-white placeholder:text-slate-500"
                            placeholder={t('landing.create_org.company_placeholder')}
                        />
                    </div>
                </div>

                <div className="border-t border-white/10 my-4"></div>

                {/* Admin User Info */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t('landing.create_org.admin_label')}</label>
                    <div className="space-y-3">
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-slate-500" size={18} />
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-white placeholder:text-slate-500"
                                placeholder={t('landing.create_org.name_placeholder')}
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
                                placeholder={t('landing.create_org.email_placeholder')}
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
                                placeholder={t('landing.create_org.password_placeholder')}
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
                            {t('landing.create_org.btn_loading')}
                        </>
                    ) : (
                        <>
                            {t('landing.create_org.btn_submit')} <ArrowRight size={20} />
                        </>
                    )}
                </button>
            </form>

            <p className="text-center text-xs text-slate-500 mt-6">
                {t('landing.create_org.terms_notice')}
            </p>
        </div>
    );
};
