import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import { AuthForm } from './AuthForm';
import { useTranslation } from 'react-i18next';
import { LegalModal } from './Landing/LegalModal';
import { DynamicFooter } from './DynamicFooter';
import { ServicesModal } from './Landing/ServicesModal';
import { Hero } from './Hero';
import { BentoGrid } from './BentoGrid';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../lib/TenantContext';

interface TenantPublicPageProps {
    slug: string;
    onLogin: () => void;
}

export const TenantPublicPage: React.FC<TenantPublicPageProps> = ({ slug, onLogin }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { tenant, loading: contextLoading } = useTenant();
    const [showAuth, setShowAuth] = useState(false);
    const [legalModal, setLegalModal] = useState<'privacy' | 'cookies' | 'legal' | null>(null);
    const [serviceModal, setServiceModal] = useState<'documents' | 'templates' | 'organization' | 'affiliates' | null>(null);

    if (contextLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0a0f1d]">
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
                    tenantName={tenant?.name || ''}
                    targetPlan="free"
                    initialIsSignUp={false}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0f1d]">
            {/* Redundant header removed - using global Navbar */}

            {/* Main Content - Shared HomeView Logic */}
            <main className="pt-20">
                <Hero />
                <div className="mt-[-4rem] relative z-20">
                    <BentoGrid onNavigate={(view) => {
                        // For public pages, we might want to force login or show a preview
                        if (view === 'admin') navigate('/login');
                        else navigate(`/${view}`);
                    }} />
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
