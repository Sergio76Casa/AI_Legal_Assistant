import { useTranslation } from 'react-i18next';

export function TrustBar() {
    const { t } = useTranslation();
    const partners = [
        t('landing.trust_bar.gdpr'),
        t('landing.trust_bar.ministry'),
        t('landing.trust_bar.secured'),
        t('landing.trust_bar.privacy')
    ];

    return (
        <div className="w-full py-12 border-y border-white/5 bg-white/2 backdrop-blur-sm overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-center md:justify-between items-center gap-8 md:gap-12 opacity-40 grayscale group hover:grayscale-0 transition-all duration-700">
                {partners.map((partner) => (
                    <span key={partner} className="text-lg md:text-xl font-bold italic text-white tracking-tight">
                        {partner}
                    </span>
                ))}
            </div>
        </div>
    );
}
