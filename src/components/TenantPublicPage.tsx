import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Building2, ArrowRight, CheckCircle2, Star, Shield, Lock } from 'lucide-react';
import { AuthForm } from './AuthForm';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';
import { LegalModal } from './Landing/LegalModal';
import { DynamicFooter } from './DynamicFooter';
import { ServicesModal } from './Landing/ServicesModal';

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
    const [legalModal, setLegalModal] = useState<'privacy' | 'cookies' | 'legal' | null>(null);
    const [serviceModal, setServiceModal] = useState<'documents' | 'templates' | 'organization' | 'affiliates' | null>(null);

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
            <div className="flex h-screen items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-12 w-12 bg-white/10 rounded-full"></div>
                    <div className="h-4 w-32 bg-white/10 rounded"></div>
                </div>
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className="flex h-screen flex-col items-center justify-center p-8 text-center text-slate-500">
                <Building2 size={64} className="mb-6 text-slate-600" />
                <h1 className="text-2xl font-bold text-white">{t('tenant_page.org_not_found')}</h1>
                <p className="mt-2 text-slate-400">{t('tenant_page.org_not_found_desc', { slug })}</p>
                <a href="/" className="mt-8 text-primary font-medium hover:underline">{t('tenant_page.go_main')}</a>
            </div>
        );
    }

    if (showAuth) {
        return (
            <div className="min-h-screen">
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
        <div className="min-h-screen bg-[#0a0f1d]">
            {/* Header */}
            <header className="fixed w-full bg-[#0a0f1d]/80 backdrop-blur-md border-b border-white/10 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {tenant.config?.show_logo && tenant.config?.logo_url ? (
                            <img
                                src={tenant.config.logo_url}
                                alt={tenant.name}
                                className="h-10 w-auto object-contain"
                            />
                        ) : (
                            <div className="bg-primary/15 p-2 rounded-lg border border-primary/20">
                                <Building2 size={24} className="text-primary" />
                            </div>
                        )}
                        {!tenant.config?.show_logo && (
                            <span className="font-bold text-xl text-white">{tenant.name}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <LanguageSelector />
                        <div className="h-4 w-px bg-white/20 mx-1" />
                        <button
                            onClick={() => {
                                setSelectedPlan('free');
                                setAuthMode('login');
                                setShowAuth(true);
                            }}
                            className="px-6 py-2 bg-primary text-slate-900 text-sm font-bold rounded-full hover:bg-primary/90 transition-colors"
                        >
                            {t('tenant_page.client_access')}
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        {t('tenant_page.official_portal')}
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-8">
                        {t('tenant_page.welcome_to')} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-400">
                            {tenant.name}
                        </span>
                    </h1>

                    <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                        {t('tenant_page.hero_desc')}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => {
                                setSelectedPlan('free');
                                setAuthMode('login');
                                setShowAuth(true);
                            }}
                            className="w-full sm:w-auto px-8 py-4 bg-primary text-slate-900 text-lg font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
                        >
                            {t('tenant_page.sign_in')}
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <a href="#plans" className="w-full sm:w-auto px-8 py-4 text-slate-300 text-lg font-bold rounded-xl border border-white/15 hover:bg-white/5 transition-colors inline-flex items-center justify-center">
                            {t('tenant_page.view_plans')}
                        </a>
                    </div>
                </div>

                {/* Features / Trust signals */}
                <div className="mt-24 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-32">
                    {[
                        { title: t('tenant_page.doc_management'), desc: t('tenant_page.doc_management_desc'), icon: <Lock className="text-primary" /> },
                        { title: t('tenant_page.ai_advice'), desc: t('tenant_page.ai_advice_desc'), icon: <Star className="text-primary" /> },
                        { title: t('tenant_page.total_privacy'), desc: t('tenant_page.total_privacy_desc'), icon: <Shield className="text-primary" /> }
                    ].map((feature, i) => (
                        <div key={i} className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 text-center hover:bg-white/10 transition-all flex flex-col items-center gap-4">
                            <div className="p-3 bg-white/10 rounded-full">
                                {feature.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                                <p className="text-slate-400 text-sm">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Plans Section */}
                <div id="plans" className="max-w-5xl mx-auto scroll-mt-32">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">{t('tenant_page.choose_access')}</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            {t('tenant_page.choose_access_desc')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Free Plan */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 hover:border-primary/30 hover:bg-white/10 transition-all relative overflow-hidden group">
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-white mb-2">{t('tenant_page.basic_access')}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-primary">0€</span>
                                    <span className="text-slate-500">/mes</span>
                                </div>
                                <p className="text-slate-400 text-sm mt-4">{t('tenant_page.basic_desc')}</p>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-sm text-slate-300">
                                    <CheckCircle2 size={18} className="text-primary flex-shrink-0" />
                                    <span>{t('tenant_page.basic_feat1')}</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-300">
                                    <CheckCircle2 size={18} className="text-primary flex-shrink-0" />
                                    <span>{t('tenant_page.basic_feat2')}</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-300">
                                    <CheckCircle2 size={18} className="text-primary flex-shrink-0" />
                                    <span>{t('tenant_page.basic_feat3')}</span>
                                </li>
                            </ul>
                            <button
                                onClick={() => {
                                    setSelectedPlan('free');
                                    setAuthMode('signup');
                                    setShowAuth(true);
                                }}
                                className="w-full py-4 rounded-xl border-2 border-white/15 text-slate-300 font-bold hover:border-primary hover:text-primary transition-colors bg-transparent"
                            >
                                {t('tenant_page.register_free')}
                            </button>
                        </div>

                        {/* Premium Plan */}
                        <div className="bg-slate-800/80 backdrop-blur-sm rounded-3xl border border-primary/20 p-8 shadow-2xl shadow-primary/5 relative overflow-hidden transform md:-translate-y-4">
                            <div className="absolute top-0 right-0 bg-primary text-slate-900 text-xs font-bold px-3 py-1 rounded-bl-xl">
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
                                    <CheckCircle2 size={18} className="text-primary flex-shrink-0" />
                                    <span className="text-white">{t('tenant_page.premium_feat1')}</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-300">
                                    <CheckCircle2 size={18} className="text-primary flex-shrink-0" />
                                    <span className="text-white">{t('tenant_page.premium_feat2')}</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-300">
                                    <CheckCircle2 size={18} className="text-primary flex-shrink-0" />
                                    <span className="text-white">{t('tenant_page.premium_feat3')}</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-300">
                                    <CheckCircle2 size={18} className="text-primary flex-shrink-0" />
                                    <span className="text-white">{t('tenant_page.premium_feat4')}</span>
                                </li>
                            </ul>
                            <button
                                onClick={() => {
                                    setSelectedPlan('pro');
                                    setAuthMode('signup');
                                    setShowAuth(true);
                                }}
                                className="w-full py-4 rounded-xl bg-primary text-slate-900 font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                            >
                                {t('tenant_page.start_premium')}
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <DynamicFooter
                tenant={tenant}
                onOpenLegal={(type) => setLegalModal(type)}
                onOpenService={(type) => setServiceModal(type)}
            />

            {/* Legal Modals */}
            <LegalModal
                type={legalModal}
                onClose={() => setLegalModal(null)}
            />

            <ServicesModal
                type={serviceModal}
                onClose={() => setServiceModal(null)}
            />
        </div>
    );
};
