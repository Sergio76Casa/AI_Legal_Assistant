import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Cookie, ArrowLeft } from 'lucide-react';

interface LegalPageProps {
    type: 'privacy' | 'cookies';
    onBack: () => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ type, onBack }) => {
    const { t } = useTranslation();
    const isPrivacy = type === 'privacy';

    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-8 group"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span>{t('docs.go_home')}</span>
            </button>

            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
                <div className="flex items-center gap-4 mb-8">
                    <div className={isPrivacy ? "p-3 bg-blue-50 text-blue-600 rounded-2xl" : "p-3 bg-amber-50 text-amber-600 rounded-2xl"}>
                        {isPrivacy ? <Shield size={32} /> : <Cookie size={32} />}
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        {t(isPrivacy ? 'legal.privacy_title' : 'legal.cookies_title')}
                    </h1>
                </div>

                <div className="prose prose-slate max-w-none">
                    <p className="text-lg text-slate-600 leading-relaxed whitespace-pre-line">
                        {t(isPrivacy ? 'legal.privacy_content' : 'legal.cookies_content')}
                    </p>

                    <div className="mt-12 pt-8 border-t border-slate-100">
                        <p className="text-sm text-slate-400">
                            Última actualización: {new Date().toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
