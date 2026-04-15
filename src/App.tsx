import { useState } from 'react';
import { Layout } from './components/Layout';
import { Hero } from './components/Hero';
import { BentoGrid } from './components/BentoGrid';
import { ChatDrawer } from './components/ChatDrawer';
import { ChatProvider } from './lib/ChatContext';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthForm } from './components/AuthForm';
import { LegalPage } from './components/LegalPage';
import { LegalProcedures } from './components/LegalProcedures';
import { HalalCulture } from './components/HalalCulture';
import { HousingGuide } from './components/HousingGuide';
import { TenantProvider } from './lib/TenantContext';
import { AppSettingsProvider } from './lib/AppSettingsContext';
import { LandingPage } from './components/LandingPage';
import { CreateOrgForm } from './components/CreateOrgForm';
import { TenantDashboard } from './components/TenantDashboard';
import { TenantPublicPage } from './components/TenantPublicPage';
import { AffiliateTerms } from './components/AffiliateTerms';
import { RegisterAffiliate } from './components/RegisterAffiliate';
import { AffiliateKit } from './components/AffiliateKit';
import { SplashScreen } from './components/SplashScreen';
import { DynamicFooter } from './components/DynamicFooter';
import { LegalModal } from './components/Landing/LegalModal';
import { ServicesModal } from './components/Landing/ServicesModal';
import { SignaturePage } from './components/SignaturePage';
import { JoinPage } from './components/JoinPage';
import { VerifyDocument } from './components/VerifyDocument';

// Hooks
import { useSessionObserver } from './hooks/useSessionObserver';
import { useAppRouting } from './hooks/useAppRouting';

function App() {
    const { user, profile, isAdmin } = useSessionObserver();
    const { 
        view, navigate, previousView, 
        currentSlug, setCurrentSlug, 
        signDocumentId, verifyDocumentId 
    } = useAppRouting(user, profile);

    const [showSplash, setShowSplash] = useState(false);
    const [legalModal, setLegalModal] = useState<'privacy' | 'cookies' | 'legal' | null>(null);
    const [serviceModal, setServiceModal] = useState<'documents' | 'templates' | 'organization' | 'affiliates' | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<string>('free');

    const showAdmin = isAdmin && (view === 'admin' || window.location.search.includes('admin=true'));

    if (view === 'sign' && signDocumentId) {
        return <SignaturePage documentId={signDocumentId} />;
    }

    if (view === 'verify' && verifyDocumentId) {
        return <VerifyDocument documentId={verifyDocumentId} />;
    }

    return (
        <AppSettingsProvider>
            <TenantProvider>
                <ChatProvider>
                    {view === 'tenant-public' ? (
                        <TenantPublicPage
                            slug={currentSlug || ''}
                            onLogin={() => navigate('login', '/login')}
                        />
                    ) : (
                        <Layout 
                            onNavigate={navigate}
                            onOpenLegal={(type) => setLegalModal(type)}
                            user={user} 
                            profile={profile} 
                            hideNavFooter={view === 'home'} 
                            hideFooter={!!user || view === 'join'} 
                            currentView={view}
                        >
                            {view === 'login' && !user ? (
                                <AuthForm
                                    onAuthSuccess={() => {
                                        setShowSplash(true);
                                        navigate('dashboard', '/dashboard');
                                    }}
                                    onBack={() => {
                                        if (currentSlug) {
                                            navigate('tenant-public', `/${currentSlug}`);
                                        } else {
                                            navigate('home', '/');
                                        }
                                    }}
                                />
                            ) : view === 'create-org' && !user ? (
                                <CreateOrgForm
                                    selectedPlan={selectedPlan}
                                    onSuccess={() => navigate('dashboard', '/dashboard')}
                                    onBack={() => {
                                        if (currentSlug) {
                                            navigate('tenant-public', `/${currentSlug}`);
                                        } else {
                                            navigate('home', '/');
                                        }
                                    }}
                                />
                            ) : showAdmin ? (
                                <AdminDashboard />
                            ) : (view === 'organization' || view === 'documents' || view === 'templates' || view === 'signatures' || view === 'affiliates' || view === 'settings') && user ? (
                                <TenantDashboard
                                    user={user}
                                    profile={profile}
                                    initialTab={view}
                                    onBack={() => navigate('dashboard', '/dashboard')}
                                    onNavigate={(v) => navigate(v as any, `/dashboard/${v}`)}
                                />
                            ) : view === 'privacy' ? (
                                <LegalPage type="privacy" onBack={() => navigate(previousView, previousView === 'home' ? '/' : `/${previousView}`)} />
                            ) : view === 'cookies' ? (
                                <LegalPage type="cookies" onBack={() => navigate(previousView, previousView === 'home' ? '/' : `/${previousView}`)} />
                            ) : view === 'afiliados-terminos' ? (
                                <AffiliateTerms onBack={() => navigate(previousView, previousView === 'home' ? '/' : `/${previousView}`)} />
                            ) : view === 'register-affiliate' ? (
                                <RegisterAffiliate onBack={() => navigate(previousView, previousView === 'home' ? '/' : `/${previousView}`)} />
                            ) : view === 'affiliate-kit' ? (
                                <AffiliateKit onBack={() => navigate(previousView, previousView === 'home' ? '/' : `/${previousView}`)} />
                            ) : view === 'legal-procedures' ? (
                                <LegalProcedures onBack={() => navigate('dashboard', '/dashboard')} user={user} />
                            ) : view === 'halal-culture' ? (
                                <HalalCulture onBack={() => navigate('dashboard', '/dashboard')} />
                            ) : view === 'housing-guide' ? (
                                <HousingGuide onBack={() => navigate('dashboard', '/dashboard')} />
                            ) : view === 'join' ? (
                                <>
                                    <JoinPage onSuccess={(slug) => {
                                        if (slug) {
                                            setCurrentSlug(slug);
                                            navigate('tenant-public', `/${slug}`);
                                        } else {
                                            navigate('dashboard', '/dashboard');
                                        }
                                    }} />
                                    <DynamicFooter
                                        onOpenLegal={(type) => setLegalModal(type)}
                                        onOpenService={(type) => setServiceModal(type)}
                                    />
                                </>
                            ) : user || view === 'dashboard' ? (
                                <>
                                    <Hero />
                                    <BentoGrid onNavigate={navigate} isAdmin={isAdmin} />
                                    <DynamicFooter
                                        onOpenLegal={(type) => setLegalModal(type)}
                                        onOpenService={(type) => setServiceModal(type)}
                                    />
                                </>
                            ) : (
                                <LandingPage
                                    onLogin={() => navigate('login', '/login')}
                                    onCreateOrg={(planId) => {
                                        if (planId) setSelectedPlan(planId);
                                        navigate('create-org', '/create-org');
                                    }}
                                />
                            )}
                            <ChatDrawer />
                            <LegalModal
                                type={legalModal}
                                onClose={() => setLegalModal(null)}
                            />
                            <ServicesModal
                                type={serviceModal}
                                onClose={() => setServiceModal(null)}
                            />
                            {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
                        </Layout>
                    )}
                </ChatProvider>
            </TenantProvider>
        </AppSettingsProvider>
    );
}

export default App;
