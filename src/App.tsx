import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
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

/**
 * Main Application Component with React Router.
 */
function App() {
    const { tenant, user, profile, isAdmin, loading: sessionLoading } = useTenant();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [showSplash, setShowSplash] = useState(false);
    const [legalModal, setLegalModal] = useState<'privacy' | 'cookies' | null>(null);

    // Initial session loading screen
    if (sessionLoading) {
        return (
            <div className="min-h-screen bg-[#0a0f1d] flex flex-col items-center justify-center text-white">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Cargando sesión...</p>
            </div>
        );
    }

    const currentPath = location.pathname;
    const isPublic = currentPath === '/public' || currentPath === '/';
    
    return (
        <Layout 
            onNavigate={(view, path) => navigate(path || `/${view}`)}
            onOpenLegal={(type) => {
                if (type === 'privacy' || type === 'cookies') setLegalModal(type);
                else navigate(`/${type}`);
            }}
            user={user} 
            profile={profile} 
            hideNavFooter={isPublic} 
            hideFooter={!!user || currentPath === '/join'} 
            currentView={currentPath.split('/')[1] || 'home'}
        >
            <Routes>
                {/* 1. Public Entry Points */}
                <Route path="/" element={
                    <LandingPage 
                        onLogin={() => navigate('/login')}
                        onCreateOrg={(plan) => navigate(`/create-org${plan ? `?plan=${plan}` : ''}`)}
                    />
                } />
                <Route path="/public" element={<Navigate to="/" replace />} />

                {/* 2. Authentication */}
                <Route path="/login" element={
                    user ? <Navigate to="/dashboard" replace /> : (
                        <AuthForm
                            onAuthSuccess={() => {
                                setShowSplash(true);
                                navigate('/dashboard');
                            }}
                            onBack={() => navigate(tenant?.slug ? `/${tenant.slug}` : '/')}
                        />
                    )
                } />
                <Route path="/create-org" element={
                    user ? <Navigate to="/dashboard" replace /> : (
                        <CreateOrgForm
                            selectedPlan="free"
                            onSuccess={() => navigate('/dashboard')}
                            onBack={() => navigate(tenant?.slug ? `/${tenant.slug}` : '/')}
                        />
                    )
                } />

                {/* 3. Dashboard Routes */}
                <Route path="/dashboard" element={
                    !user ? <Navigate to="/login" replace /> : 
                    isAdmin ? <AdminDashboard initialTab="earnings" /> : 
                    <TenantDashboard user={user} profile={profile} onBack={() => navigate(tenant?.slug ? `/${tenant.slug}` : '/')} onNavigate={(v) => navigate(`/dashboard/${v}`)} />
                } />

                {/* Dashboard Tab Aliases */}
                <Route path="/documents" element={
                    isAdmin ? <AdminDashboard initialTab="documents" /> : <TenantDashboardWrapper tab="documents" />
                } />
                <Route path="/dashboard/:tab" element={
                    isAdmin ? <AdminDashboardWrapper /> : <TenantDashboardWrapper />
                } />

                {/* 4. Special & Legal Pages */}
                <Route path="/privacy" element={<LegalPage type="privacy" onBack={() => navigate(-1)} />} />
                <Route path="/cookies" element={<LegalPage type="cookies" onBack={() => navigate(-1)} />} />
                <Route path="/afiliados-terminos" element={<AffiliateTerms onBack={() => navigate(-1)} />} />
                <Route path="/register-affiliate" element={<RegisterAffiliate onBack={() => navigate(-1)} />} />
                <Route path="/affiliate-kit" element={<AffiliateKit onBack={() => navigate(-1)} />} />
                <Route path="/legal-procedures" element={<LegalProcedures onBack={() => navigate(tenant?.slug ? `/${tenant.slug}` : '/dashboard')} user={user} />} />
                <Route path="/halal-culture" element={<HalalCulture onBack={() => navigate(tenant?.slug ? `/${tenant.slug}` : '/dashboard')} />} />
                <Route path="/housing-guide" element={<HousingGuide onBack={() => navigate(tenant?.slug ? `/${tenant.slug}` : '/dashboard')} />} />
                
                {/* 5. Utility Flow Pages */}
                <Route path="/join" element={<JoinPage onSuccess={(slug) => navigate(slug ? `/${slug}` : '/dashboard')} />} />
                <Route path="/sign/:id" element={<SignatureWrapper />} />
                <Route path="/verify/:id" element={<VerifyWrapper />} />

                {/* 6. Dynamic Tenant Slugs (Vanity URLs) */}
                <Route path="/:slug" element={<TenantPublicPageWrapper onLogin={() => navigate('/login')} />} />
            </Routes>
            
            {/* Global Widgets */}
            {user && <ChatDrawer />}
            
            {legalModal && (
                <LegalPage type={legalModal} onBack={() => setLegalModal(null)} />
            )}
            {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
        </Layout>
    );
}

// Wrapper Components to handle URL parameters
function TenantDashboardWrapper({ tab }: { tab?: string }) {
    const { user, profile, tenant } = useTenant();
    const { tab: urlTab } = useParams();
    const navigate = useNavigate();

    if (!user) return <Navigate to="/login" replace />;

    return (
        <TenantDashboard 
            user={user} 
            profile={profile} 
            initialTab={tab || urlTab || 'home'} 
            onBack={() => navigate(tenant?.slug ? `/${tenant.slug}` : '/')}
            onNavigate={(v) => navigate(`/dashboard/${v}`)}
        />
    );
}

function AdminDashboardWrapper() {
    const { user, isAdmin } = useTenant();
    const { tab } = useParams();

    if (!user || !isAdmin) return <Navigate to="/login" replace />;

    return (
        <AdminDashboard initialTab={tab} />
    );
}

function SignatureWrapper() {
    const { id } = useParams();
    return <SignaturePage documentId={id || ''} />;
}

function VerifyWrapper() {
    const { id } = useParams();
    return <VerifyDocument documentId={id || ''} />;
}

function TenantPublicPageWrapper({ onLogin }: { onLogin: () => void }) {
    const { slug } = useParams();
    
    // List of reserved words to avoid matching slugs mistakenly
    const reserved = ['public', 'dashboard', 'documents', 'login', 'create-org', 'privacy', 'cookies', 'sign', 'verify', 'join', 'enterprise'];
    if (reserved.includes(slug || '')) return <Navigate to="/" replace />;

    return <TenantPublicPage slug={slug || ''} onLogin={onLogin} />;
}

export default App;

