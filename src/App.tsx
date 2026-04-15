import { useState } from 'react';
import { Layout } from './components/Layout';
import { AuthForm } from './components/AuthForm';
import { AdminDashboard } from './components/AdminDashboard';
import { TenantDashboard } from './components/TenantDashboard';
import { CreateOrgForm } from './components/CreateOrgForm';
import { JoinPage } from './components/JoinPage';
import { TenantPublicPage } from './components/TenantPublicPage';
import { LegalPage } from './components/LegalPage';
import { AffiliateTerms } from './components/AffiliateTerms';
import { RegisterAffiliate } from './components/RegisterAffiliate';
import { AffiliateKit } from './components/AffiliateKit';
import { LegalProcedures } from './components/LegalProcedures';
import { HalalCulture } from './components/HalalCulture';
import { HousingGuide } from './components/HousingGuide';
import { SignaturePage } from './components/SignaturePage';
import { VerifyDocument } from './components/VerifyDocument';
import { LandingPage } from './components/LandingPage';
import { SplashScreen } from './components/SplashScreen';
import { ChatDrawer } from './components/ChatDrawer';
import { useTenant } from './lib/TenantContext';
import { useAppRouting } from './hooks/useAppRouting';

/**
 * Main Application Component.
 * Handlers routing, session state, and layout.
 */
function App() {
    const { user, profile, isAdmin, loading: sessionLoading } = useTenant();
    const { 
        view, 
        currentSlug, 
        navigate, 
        previousView, 
        setCurrentSlug,
        signDocumentId,
        verifyDocumentId
    } = useAppRouting(user, profile);

    const [showSplash, setShowSplash] = useState(false);
    const [legalModal, setLegalModal] = useState<'privacy' | 'cookies' | null>(null);

    const showAdmin = isAdmin && (view === 'admin' || window.location.search.includes('admin=true'));

    if (sessionLoading) {
        return (
            <div className="min-h-screen bg-[#0a0f1d] flex flex-col items-center justify-center text-white">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Cargando sesión...</p>
            </div>
        );
    }

    if (view === 'home' && !user) {
        return (
            <LandingPage 
                onLogin={() => navigate('login', '/login')}
                onCreateOrg={(plan) => navigate('create-org', `/create-org${plan ? `?plan=${plan}` : ''}`)}
            />
        );
    }

    return (
        <Layout 
            onNavigate={navigate}
            onOpenLegal={(type) => {
                if (type === 'privacy' || type === 'cookies') {
                    setLegalModal(type);
                }
            }}
            user={user} 
            profile={profile} 
            hideNavFooter={view === 'home'} 
            hideFooter={!!user || view === 'join'} 
            currentView={view}
        >
            {/* High Priority Views */}
            {view === 'sign' && signDocumentId ? (
                <SignaturePage documentId={signDocumentId} />
            ) : view === 'verify' && verifyDocumentId ? (
                <VerifyDocument documentId={verifyDocumentId} />
            ) : view === 'tenant-public' ? (
                <TenantPublicPage
                    slug={currentSlug || ''}
                    onLogin={() => navigate('login', '/login')}
                />
            ) : view === 'login' && !user ? (
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
                    selectedPlan="free"
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
            ) : (view === 'dashboard' || view === 'organization' || view === 'documents' || view === 'templates' || view === 'signatures' || view === 'affiliates' || view === 'settings' || view === 'home') && user ? (
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
                <JoinPage onSuccess={(slug) => {
                    if (slug) {
                        setCurrentSlug(slug);
                        navigate('tenant-public', `/${slug}`);
                    } else {
                        navigate('dashboard', '/dashboard');
                    }
                }} />
            ) : (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
                    <h1 className="text-4xl font-black mb-4 uppercase tracking-tight">VISTA: {view}</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-8">Esta funcionalidad está en desarrollo para tu perfil.</p>
                    <button 
                        onClick={() => navigate('home', '/')}
                        className="px-8 py-3 bg-primary text-slate-900 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                    >
                        Volver al Inicio
                    </button>
                </div>
            )}
            
            {/* Global Widgets */}
            {user && <ChatDrawer />}
            
            {legalModal && (
                <LegalPage type={legalModal} onBack={() => setLegalModal(null)} />
            )}
            {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
        </Layout>
    );
}

export default App;
