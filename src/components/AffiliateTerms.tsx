import { motion } from 'framer-motion';
import { useTranslation, Trans } from 'react-i18next';
import { useEffect } from 'react'; // Ensure useEffect is imported

interface AffiliateTermsProps {
    onBack: () => void;
}

export function AffiliateTerms({ onBack }: AffiliateTermsProps) {
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

    const sections = [
        {
            id: 'eligibility',
            title: t('affiliate_terms.sections.eligibility.title'),
            content: t('affiliate_terms.sections.eligibility.content'),
            sub: t('affiliate_terms.sections.eligibility.sub')
        },
        {
            id: 'commissions',
            title: t('affiliate_terms.sections.commissions.title'),
            content: (
                <Trans i18nKey="affiliate_terms.sections.commissions.content">
                    Se otorgará una comisión del <span className="text-primary font-bold">20% recurrente</span> (mensual o anual) por cada nuevo suscriptor que contrate un plan de pago a través del enlace personalizado del afiliado.
                </Trans>
            ),
            example: (
                <Trans i18nKey="affiliate_terms.sections.commissions.example">
                    <span className="text-white font-bold">Ejemplo:</span> Si refieres un suscriptor al Plan Business (149€/mes), recibirás <span className="text-primary font-bold">29,80€/mes</span> de forma recurrente mientras el suscriptor mantenga su plan activo.
                </Trans>
            )
        },
        {
            id: 'cookies',
            title: t('affiliate_terms.sections.cookies.title'),
            content: (
                <Trans i18nKey="affiliate_terms.sections.cookies.content">
                    Utilizamos una ventana de atribución de <span className="text-primary font-bold">30 días</span>. Si un cliente potencial hace clic en tu enlace de afiliado y completa la suscripción dentro de ese periodo, la comisión te será asignada automáticamente.
                </Trans>
            ),
            sub: t('affiliate_terms.sections.cookies.sub')
        },
        {
            id: 'payments',
            title: t('affiliate_terms.sections.payments.title'),
            content: (
                <Trans i18nKey="affiliate_terms.sections.payments.content">
                    Las comisiones se liquidarán <span className="text-primary font-bold">mensualmente</span> a través de Stripe o transferencia bancaria, una vez alcanzado un umbral mínimo de <span className="text-primary font-bold">50€</span>.
                </Trans>
            ),
            list: t('affiliate_terms.sections.payments.details', { returnObjects: true }) as string[]
        },
        {
            id: 'ethics',
            title: t('affiliate_terms.sections.ethics.title'),
            content: (
                <Trans i18nKey="affiliate_terms.sections.ethics.content">
                    Queda <span className="text-primary font-bold">estrictamente prohibido</span> el uso de técnicas de spam, publicidad engañosa, suplantación de identidad o cualquier práctica que pueda dañar la reputación de LegalFlow.
                </Trans>
            ),
            warning: (
                <Trans i18nKey="affiliate_terms.sections.ethics.warning">
                    <span className="text-primary font-bold">⚠️ Importante:</span> El incumplimiento de esta norma supondrá la <span className="text-primary font-bold">baja inmediata</span> del programa y la pérdida de todas las comisiones acumuladas y pendientes de pago.
                </Trans>
            )
        },
        {
            id: 'modifications',
            title: t('affiliate_terms.sections.modifications.title'),
            content: t('affiliate_terms.sections.modifications.content'),
            sub: t('affiliate_terms.sections.modifications.sub')
        }
    ];

    return (
        <div className="min-h-screen bg-[#0a0f1d] py-16 md:py-20 px-4 md:px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                {/* Back */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-10 text-sm font-medium"
                >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    {t('affiliate_terms.back')}
                </button>

                {/* Header */}
                <div className="mb-16 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                        {t('affiliate_terms.title')}
                    </h1>
                    <p className="text-slate-400 italic">
                        {t('affiliate_terms.last_update')}
                    </p>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {sections.map((section) => (
                        <div key={section.id} className="glass-card rounded-[2.5rem] p-8 md:p-10 space-y-6">
                            <h2 className="text-2xl font-bold text-white border-b border-white/5 pb-4">
                                {section.title}
                            </h2>
                            <div className="text-slate-400 leading-relaxed text-lg space-y-4">
                                <div>{section.content}</div>
                                {section.sub && <p className="text-sm opacity-80">{section.sub}</p>}
                                {section.example && (
                                    <div className="bg-white/5 rounded-2xl p-6 text-sm border border-white/5">
                                        {section.example}
                                    </div>
                                )}
                                {section.warning && (
                                    <div className="bg-primary/5 rounded-2xl p-6 text-sm border border-primary/10">
                                        {section.warning}
                                    </div>
                                )}
                                {section.list && (
                                    <ul className="space-y-3 pt-2">
                                        {section.list.map((item, i) => (
                                            <li key={i} className="flex gap-3 text-sm">
                                                <span className="text-primary font-bold">•</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-20 pt-10 border-t border-white/5 text-center text-slate-600 text-sm">
                    <p>
                        <Trans i18nKey="affiliate_terms.footer">
                            © 2026 LegalFlow Pro. Todos los derechos reservados.<br />
                            Estos términos están sujetos a la legislación española y a la jurisdicción de los tribunales de Madrid.
                        </Trans>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
