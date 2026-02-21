import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation, Trans } from 'react-i18next';

interface RegisterAffiliateProps {
    onBack: () => void;
}

export function RegisterAffiliate({ onBack }: RegisterAffiliateProps) {
    const { t } = useTranslation();

    useEffect(() => {
        const meta = document.createElement('meta');
        meta.name = "robots";
        meta.content = "noindex";
        document.head.appendChild(meta);
        return () => {
            document.head.removeChild(meta);
        };
    }, []);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [company, setCompany] = useState('');
    const [role, setRole] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!acceptedTerms) return;
        // TODO: Connect to backend
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#0a0f1d] flex items-center justify-center px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card rounded-3xl p-12 text-center max-w-md space-y-6"
                >
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                        <span className="material-symbols-outlined text-4xl">check_circle</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">{t('register_affiliate.success_title')}</h2>
                    <p className="text-slate-400 leading-relaxed">
                        <Trans i18nKey="register_affiliate.success_desc">
                            Revisaremos tu solicitud en las próximas <span className="text-primary font-bold">24-48 horas</span>. Recibirás un email con tu enlace de afiliado y acceso al panel de seguimiento.
                        </Trans>
                    </p>
                    <button
                        onClick={onBack}
                        className="bg-primary text-background-dark px-8 py-3 rounded-full font-bold hover:brightness-110 transition-all"
                    >
                        {t('register_affiliate.success_btn')}
                    </button>
                </motion.div>
            </div>
        );
    }

    const roles = [
        { value: 'abogado', label: t('register_affiliate.form.roles.abogado') },
        { value: 'gestor', label: t('register_affiliate.form.roles.gestor') },
        { value: 'consultor', label: t('register_affiliate.form.roles.consultor') },
        { value: 'relocation', label: t('register_affiliate.form.roles.relocation') },
        { value: 'rrhh', label: t('register_affiliate.form.roles.rrhh') },
        { value: 'creador', label: t('register_affiliate.form.roles.creador') },
        { value: 'otro', label: t('register_affiliate.form.roles.otro') }
    ];

    return (
        <div className="min-h-screen bg-[#0a0f1d] py-16 md:py-20 px-4 md:px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto"
            >
                {/* Back */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-10 text-sm font-medium"
                >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    {t('register_affiliate.back')}
                </button>

                {/* Header */}
                <div className="text-center mb-12 space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto border border-primary/20">
                        <span className="material-symbols-outlined text-3xl">group_add</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white">{t('register_affiliate.title')}</h1>
                    <p className="text-slate-400 max-w-md mx-auto">
                        <Trans i18nKey="register_affiliate.desc">
                            Gana un <span className="text-primary font-bold">20% de comisión recurrente</span> por cada despacho o agencia que se suscriba con tu enlace.
                        </Trans>
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-8 md:p-10 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-300">{t('register_affiliate.form.name')}</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t('register_affiliate.form.name_placeholder')}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:border-primary/50 focus:outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-300">{t('register_affiliate.form.email')}</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t('register_affiliate.form.email_placeholder')}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:border-primary/50 focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-300">{t('register_affiliate.form.company')}</label>
                            <input
                                type="text"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                placeholder={t('register_affiliate.form.company_placeholder')}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:border-primary/50 focus:outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-300">{t('register_affiliate.form.role')}</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none transition-colors appearance-none"
                            >
                                <option value="" className="bg-background-dark">{t('register_affiliate.form.role_select')}</option>
                                {roles.map((r) => (
                                    <option key={r.value} value={r.value} className="bg-background-dark">{r.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Terms Checkbox */}
                    <div className="border-t border-white/5 pt-6">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                required
                                className="mt-1 w-5 h-5 rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50 cursor-pointer accent-[#13ecc8]"
                            />
                            <span className="text-sm text-slate-400 leading-relaxed">
                                <Trans i18nKey="register_affiliate.form.terms">
                                    He leído y acepto los <a
                                        href="/afiliados-terminos"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline font-bold"
                                        onClick={(e) => e.stopPropagation()}
                                    >Términos y Condiciones del Programa de Afiliados</a>, incluyendo la política de comisiones (20% recurrente), la ventana de atribución de 30 días y las normas de conducta. *
                                </Trans>
                            </span>
                        </label>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={!acceptedTerms}
                        className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2
                            ${acceptedTerms
                                ? 'bg-primary text-background-dark hover:brightness-110 shadow-lg shadow-primary/20 hover:shadow-primary/40 cursor-pointer'
                                : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'}`}
                    >
                        <span className="material-symbols-outlined text-lg">rocket_launch</span>
                        {t('register_affiliate.form.submit')}
                    </button>

                    <p className="text-center text-slate-600 text-xs">
                        {t('register_affiliate.form.footer')}
                    </p>
                </form>
            </motion.div>
        </div>
    );
}
