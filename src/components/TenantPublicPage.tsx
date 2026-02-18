import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Building2, ArrowRight, CheckCircle2, Star, Shield, Lock } from 'lucide-react';
import { AuthForm } from './AuthForm';
import { useTranslation } from 'react-i18next';

interface TenantPublicPageProps {
    slug: string;
    onLogin: () => void;
}

export const TenantPublicPage: React.FC<TenantPublicPageProps> = ({ slug, onLogin }) => {
    const { t } = useTranslation();
    const [tenant, setTenant] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showAuth, setShowAuth] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro'>('free');
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

    useEffect(() => {
        const fetchTenant = async () => {
            const { data } = await supabase
                .from('tenants')
                .select('*')
                .eq('slug', slug)
                .single();

            if (data) {
                setTenant(data);
            }
            setLoading(false);
        };
        fetchTenant();
    }, [slug]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-12 w-12 bg-slate-200 rounded-full"></div>
                    <div className="h-4 w-32 bg-slate-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className="flex h-screen flex-col items-center justify-center p-8 text-center text-slate-500 bg-slate-50">
                <Building2 size={64} className="mb-6 text-slate-300" />
                <h1 className="text-2xl font-bold text-slate-900">{t('tenant_page.org_not_found')}</h1>
                <p className="mt-2 text-slate-600">{t('tenant_page.org_not_found_desc', { slug })}</p>
                <a href="/" className="mt-8 text-emerald-600 font-medium hover:underline">{t('tenant_page.go_main')}</a>
            </div>
        );
    }

    if (showAuth) {
        return (
            <div className="min-h-screen bg-slate-50">
                <AuthForm
                    onAuthSuccess={onLogin}
                    onBack={() => setShowAuth(false)}
                    tenantSlug={slug}
                    tenantName={tenant.name}
                    targetPlan={selectedPlan}
                    initialIsSignUp={authMode === 'signup'}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="fixed w-full bg-white/80 backdrop-blur-sm border-b border-slate-100 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                            <Building2 size={24} className="text-emerald-600" />
                        </div>
                        <span className="font-bold text-xl text-slate-900">{tenant.name}</span>
                    </div>
                    <button
                        onClick={() => {
                            setSelectedPlan('free');
                            setAuthMode('login');
                            setShowAuth(true);
                        }}
                        className="px-6 py-2.5 bg-slate-900 text-white font-medium rounded-full hover:bg-slate-800 transition-colors"
                    >
                        {t('tenant_page.client_access')}
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <main className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-8 border border-emerald-100">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        {t('tenant_page.official_portal')}
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-8">
                        {t('tenant_page.welcome_to')} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                            {tenant.name}
                        </span>
                    </h1>

                    <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed">
                        {t('tenant_page.hero_desc')}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => {
                                setSelectedPlan('free');
                                setAuthMode('login');
                                setShowAuth(true);
                            }}
                            className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white text-lg font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 group"
                        >
                            {t('tenant_page.sign_in')}
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <a href="#plans" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 text-lg font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors inline-flex items-center justify-center">
                            {t('tenant_page.view_plans')}
                        </a>
                    </div>
                </div>

                {/* Features / Trust signals */}
                <div className="mt-24 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-32">
                    {[
                        { title: t('tenant_page.doc_management'), desc: t('tenant_page.doc_management_desc'), icon: <Lock className="text-emerald-600" /> },
                        { title: t('tenant_page.ai_advice'), desc: t('tenant_page.ai_advice_desc'), icon: <Star className="text-emerald-600" /> },
                        { title: t('tenant_page.total_privacy'), desc: t('tenant_page.total_privacy_desc'), icon: <Shield className="text-emerald-600" /> }
                    ].map((feature, i) => (
                        <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center hover:shadow-md transition-shadow flex flex-col items-center gap-4">
                            <div className="p-3 bg-white rounded-full shadow-sm">
                                {feature.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
                                <p className="text-slate-500 text-sm">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Plans Section */}
                <div id="plans" className="max-w-5xl mx-auto scroll-mt-32">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('tenant_page.choose_access')}</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">
                            {t('tenant_page.choose_access_desc')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Free Plan */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-8 hover:border-emerald-200 hover:shadow-xl transition-all relative overflow-hidden group">
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{t('tenant_page.basic_access')}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-emerald-600">0€</span>
                                    <span className="text-slate-400">/mes</span>
                                </div>
                                <p className="text-slate-500 text-sm mt-4">{t('tenant_page.basic_desc')}</p>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-sm text-slate-700">
                                    <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                                    <span>{t('tenant_page.basic_feat1')}</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-700">
                                    <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                                    <span>{t('tenant_page.basic_feat2')}</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-700">
                                    <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                                    <span>{t('tenant_page.basic_feat3')}</span>
                                </li>
                            </ul>
                            <button
                                onClick={() => {
                                    setSelectedPlan('free');
                                    setAuthMode('signup');
                                    setShowAuth(true);
                                }}
                                className="w-full py-4 rounded-xl border-2 border-slate-200 text-slate-700 font-bold hover:border-emerald-600 hover:text-emerald-600 transition-colors bg-transparent"
                            >
                                {t('tenant_page.register_free')}
                            </button>
                        </div>

                        {/* Premium Plan */}
                        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-2xl relative overflow-hidden transform md:-translate-y-4">
                            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                                {t('tenant_page.recommended')}
                            </div>
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-white mb-2">{t('tenant_page.premium_access')}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-white">9,99€</span>
                                    <span className="text-slate-400">/mes</span>
                                </div>
                                <p className="text-slate-400 text-sm mt-4">{t('tenant_page.premium_desc')}</p>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-sm text-slate-300">
                                    <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
                                    <span className="text-white">{t('tenant_page.premium_feat1')}</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-300">
                                    <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
                                    <span className="text-white">{t('tenant_page.premium_feat2')}</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-300">
                                    <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
                                    <span className="text-white">{t('tenant_page.premium_feat3')}</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-300">
                                    <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
                                    <span className="text-white">{t('tenant_page.premium_feat4')}</span>
                                </li>
                            </ul>
                            <button
                                onClick={() => {
                                    setSelectedPlan('pro');
                                    setAuthMode('signup');
                                    setShowAuth(true);
                                }}
                                className="w-full py-4 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
                            >
                                {t('tenant_page.start_premium')}
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-100 py-12 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6 text-center text-slate-400 text-sm">
                    <p>&copy; {new Date().getFullYear()} {tenant.name}. {t('tenant_page.powered_by')}</p>
                </div>
            </footer>
        </div>
    );
};
