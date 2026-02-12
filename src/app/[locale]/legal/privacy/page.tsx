import { useTranslations } from 'next-intl';

export default function PrivacyPage() {
    const t = useTranslations('PrivacyPolicy');

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-6">{t('title')}</h1>

                <div className="space-y-6 text-gray-600">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">{t('section1_title')}</h2>
                        <p>{t('section1_content')}</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">{t('section2_title')}</h2>
                        <p>{t('section2_content')}</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">{t('section3_title')}</h2>
                        <p>{t('section3_content')}</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">{t('section4_title')}</h2>
                        <p>{t('section4_content')}</p>
                    </section>

                    <p className="text-sm text-gray-400 mt-8">
                        {t('last_updated')}: {new Date().toLocaleDateString()}
                    </p>
                </div>
            </div>
        </div>
    );
}
