import { useState } from 'react';
import { ArrowRight, Shield, Globe, Zap, Smartphone, Lock } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';
import { BookDemoModal } from './BookDemoModal';

export function LandingPage({ onLogin, onCreateOrg }: { onLogin: () => void; onCreateOrg: () => void }) {
    const { t } = useTranslation();
    const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-stone-50 font-sans text-slate-900">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-stone-100">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">L</div>
                        <span className="text-xl font-serif font-bold tracking-tight text-slate-900">Legal<span className="text-emerald-600">Flow</span></span>
                    </div>
                    <div className="flex items-center gap-4">
                        <LanguageSelector />
                        <div className="h-4 w-px bg-slate-200 mx-1" />
                        <button onClick={onLogin} className="text-sm font-medium hover:text-emerald-600 transition-colors">
                            {t('landing.nav.login')}
                        </button>
                        <button onClick={onCreateOrg} className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                            {t('landing.nav.create_org')}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-8 border border-emerald-100">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        {t('landing.hero.new_tag')}
                    </div>
                    <h1 className="text-5xl md:text-7xl font-serif font-medium tracking-tight text-slate-900 mb-8 max-w-4xl mx-auto leading-tight">
                        {t('landing.hero.title')} <br />
                        <span className="text-emerald-600 italic">{t('landing.hero.subtitle')}</span>
                    </h1>
                    <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                        {t('landing.hero.desc')}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button onClick={onCreateOrg} className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white rounded-full font-medium text-lg hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-200/50 flex items-center justify-center gap-2">
                            {t('landing.hero.start_free')} <ArrowRight className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setIsDemoModalOpen(true)}
                            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-medium text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                        >
                            {t('landing.hero.book_demo')}
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Grid (Bento Style) */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-serif mb-4">{t('landing.features.title')}</h2>
                        <p className="text-slate-500">{t('landing.features.subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                        {/* Card 1: Isolation */}
                        <div className="row-span-2 rounded-3xl bg-slate-50 p-8 border border-slate-100 flex flex-col justify-between group hover:shadow-lg transition-all">
                            <div>
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                    <Shield className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h3 className="text-2xl font-serif mb-2">{t('landing.features.security_title')}</h3>
                                <p className="text-slate-600">{t('landing.features.security_desc')}</p>
                            </div>
                            <div className="h-40 bg-white rounded-2xl border border-slate-100 p-4 relative overflow-hidden">
                                <div className="absolute top-4 left-4 right-4 h-2 bg-emerald-100 rounded-full w-2/3"></div>
                                <div className="absolute top-8 left-4 right-4 h-2 bg-slate-100 rounded-full w-1/2"></div>
                                <Lock className="absolute bottom-4 right-4 w-12 h-12 text-slate-100" />
                            </div>
                        </div>

                        {/* Card 2: AI */}
                        <div className="md:col-span-2 rounded-3xl bg-slate-900 p-8 text-white flex flex-col md:flex-row items-center gap-8 group hover:shadow-xl transition-all">
                            <div className="flex-1">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                                    <Zap className="w-6 h-6 text-yellow-400" />
                                </div>
                                <h3 className="text-2xl font-serif mb-2">{t('landing.features.ai_title')}</h3>
                                <p className="text-slate-300">
                                    <Trans i18nKey="landing.features.ai_desc" components={{ 1: <em /> }} />
                                </p>
                            </div>
                            <div className="w-full md:w-1/2 h-48 bg-white/5 rounded-2xl border border-white/10 p-4 backdrop-blur-sm">
                                <div className="flex gap-2 mb-4">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-2 bg-white/20 rounded w-3/4"></div>
                                    <div className="h-2 bg-white/10 rounded w-1/2"></div>
                                    <div className="h-2 bg-white/10 rounded w-5/6"></div>
                                </div>
                            </div>
                        </div>

                        {/* Card 3: Global */}
                        <div className="rounded-3xl bg-emerald-50 p-8 border border-emerald-100 flex flex-col hover:bg-emerald-100/50 transition-colors">
                            <Globe className="w-8 h-8 text-emerald-600 mb-4" />
                            <h3 className="text-xl font-serif mb-2">{t('landing.features.global_title')}</h3>
                            <p className="text-slate-600 text-sm">{t('landing.features.global_desc')}</p>
                        </div>

                        {/* Card 4: Mobile */}
                        <div className="rounded-3xl bg-white p-8 border border-slate-100 flex flex-col hover:border-emerald-200 transition-colors">
                            <Smartphone className="w-8 h-8 text-indigo-600 mb-4" />
                            <h3 className="text-xl font-serif mb-2">{t('landing.features.mobile_title')}</h3>
                            <p className="text-slate-600 text-sm">{t('landing.features.mobile_desc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto bg-slate-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10">
                        <h2 className="text-4xl font-serif mb-6">{t('landing.cta.title')}</h2>
                        <p className="text-slate-300 mb-8 max-w-xl mx-auto">{t('landing.cta.desc')}</p>
                        <button onClick={onCreateOrg} className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-lg hover:bg-emerald-50 transition-all shadow-lg">
                            {t('landing.cta.btn')}
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-stone-50 py-12 px-6 border-t border-stone-200 text-center text-slate-500 text-sm">
                <p>&copy; 2026 LegalFlow. {t('landing.footer')}</p>
            </footer>

            <BookDemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
        </div>
    );
}
