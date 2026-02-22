import { Layout } from './components/Layout';
import { Hero } from './components/Hero';
import { BentoGrid } from './components/BentoGrid';
import { ChatDrawer } from './components/ChatDrawer';
import { ChatProvider } from './lib/ChatContext';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthForm } from './components/AuthForm';
import { LegalPage } from './components/LegalPage';
import { createClient } from '@supabase/supabase-js';
import { LegalProcedures } from './components/LegalProcedures';
import { HalalCulture } from './components/HalalCulture';
import { HousingGuide } from './components/HousingGuide';
import { useEffect, useState, useRef } from 'react';
import { TenantProvider } from './lib/TenantContext';
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

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);
(window as any).supabase = supabase;

function App() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [view, setView] = useState<'home' | 'dashboard' | 'admin' | 'login' | 'create-org' | 'documents' | 'templates' | 'signatures' | 'privacy' | 'cookies' | 'legal-procedures' | 'halal-culture' | 'housing-guide' | 'organization' | 'settings' | 'tenant-public' | 'affiliates' | 'afiliados-terminos' | 'register-affiliate' | 'affiliate-kit' | 'sign' | 'join'>(
        new URLSearchParams(window.location.search).get('token') ? 'join' : 'home'
    );
    const [previousView, setPreviousView] = useState<typeof view | 'home'>('home');
    const [signDocumentId, setSignDocumentId] = useState<string | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<string>('free');

    // Track last non-legal view for "back" navigation
    useEffect(() => {
        if (view !== 'privacy' && view !== 'cookies' && view !== 'afiliados-terminos') {
            setPreviousView(view);
        }
    }, [view]);
    const [currentSlug, setCurrentSlug] = useState<string | null>(null);
    const [showSplash, setShowSplash] = useState(false);
    const [legalModal, setLegalModal] = useState<'privacy' | 'cookies' | 'legal' | null>(null);
    const [serviceModal, setServiceModal] = useState<'documents' | 'templates' | 'organization' | 'affiliates' | null>(null);
    const lastSlugRef = useRef<string | null>(null);

    const fetchProfile = async (userId: string) => {
        const { data } = await supabase
            .from('profiles')
            .select('*, tenants(slug)')
            .eq('id', userId)
            .maybeSingle();
        setProfile(data);
        if (data?.tenants?.slug) {
            setCurrentSlug(data.tenants.slug);
            lastSlugRef.current = data.tenants.slug;
        }
    };

    // 🔍 ROUTING & REFERRAL SYSTEM
    useEffect(() => {
        const handleRouting = async () => {
            const params = new URLSearchParams(window.location.search);
            let ref = params.get('ref');
            const token = params.get('token');
            let path = window.location.pathname.replace(/^\/|\/$/g, '');
            console.log('Routing Debug:', { path, token, ref, view });
            const reservedPublic = ['login', 'create-org', 'privacy', 'cookies', 'home', 'afiliados-terminos', 'register-affiliate', 'affiliate-kit', 'join', 'pro', 'pro/pricing', 'personal', 'personal/pricing', ''];

            // 1. Force 'join' if token is present and path is join
            if (path === 'join' || (path === '' && token)) {
                setView('join');
                if (path === '') window.history.replaceState({}, '', `/join?${params.toString()}`);
                return;
            }

            // 🖊️ SIGNATURE ROUTE: /sign/[token]
            if (path.startsWith('sign/')) {
                const token = path.replace('sign/', '');
                if (token) {
                    setSignDocumentId(token);
                    setView('sign');
                    return;
                }
            }

            // Dashboard views mapping
            const dashboardMap: Record<string, string> = {
                'dashboard': 'dashboard',
                'dashboard/documents': 'documents',
                'dashboard/templates': 'templates',
                'dashboard/signatures': 'signatures',
                'dashboard/affiliates': 'affiliates',
                'dashboard/organization': 'organization',
                'dashboard/settings': 'settings',
                'dashboard/admin': 'admin'
            };

            // A. Vanity URL Detection
            if (!ref && path && !reservedPublic.includes(path.toLowerCase()) && !path.startsWith('dashboard') && !path.includes('.')) {
                const { data: aff } = await supabase
                    .from('affiliates')
                    .select('affiliate_code')
                    .eq('affiliate_code', path.toUpperCase())
                    .maybeSingle();

                if (aff) {
                    ref = aff.affiliate_code;
                    window.history.replaceState({}, '', '/');
                    path = '';
                }
            }

            // B. Set Referral Cookie
            if (ref) {
                const date = new Date();
                date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
                document.cookie = `referral_code=${ref.toUpperCase()};expires=${date.toUTCString()};path=/;SameSite=Lax;Domain=.legalflow.digital`;
            }

            // C. Resolve View
            const userIsAdmin = user?.email === 'lsergiom76@gmail.com' || profile?.role === 'admin' || profile?.role === 'superadmin';
            const adminOnlyViews = ['admin', 'organization', 'settings', 'templates', 'signatures'];

            if (path === '' || path === 'home') {
                setView('home');
            } else if (dashboardMap[path]) {
                const targetView = dashboardMap[path];
                if (adminOnlyViews.includes(targetView) && !userIsAdmin && user) {
                    setView('documents');
                    window.history.replaceState({}, '', '/dashboard/documents');
                } else {
                    setView(user ? targetView as any : 'login');
                }
            } else if (reservedPublic.includes(path.toLowerCase())) {
                setView(path.toLowerCase() as any);
            } else if (['legal-procedures', 'halal-culture', 'housing-guide'].includes(path)) {
                setView(path as any);
            } else if (/^[a-z0-9-]+$/.test(path)) {
                setCurrentSlug(path);
                setView('tenant-public');
            }
        };

        handleRouting();
    }, [user, profile]);

    // 🚀 AUTH LISTENER
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                // GUARD: Never redirect away from the signature or join page
                const currentPath = window.location.pathname;
                if (currentPath.startsWith('/sign/') || currentPath.startsWith('/join')) return;

                const slugToRedirect = lastSlugRef.current;
                setProfile(null);
                if (slugToRedirect) {
                    setCurrentSlug(slugToRedirect);
                    setView('tenant-public');
                    window.history.pushState({}, '', `/${slugToRedirect}`);
                } else {
                    setView('home');
                    window.history.pushState({}, '', '/');
                }
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // 🚀 REDIRECTION LOGIC: Auto-navigate to dashboard on login
    useEffect(() => {
        // If we have a user and they are on the root/home, send them to dashboard
        // GUARD: Never redirect away from sign or join pages
        if (view === 'sign' || view === 'join') return;
        if (user && view === 'home' && (window.location.pathname === '/' || window.location.pathname === '/home')) {
            setView('dashboard');
            window.history.replaceState({}, '', '/dashboard');
        }
    }, [user, view]);

    useEffect(() => {
        // GUARD: Never redirect away from sign or join pages
        if (view === 'sign' || view === 'join') return;
        const path = window.location.pathname.substring(1);
        if (!path || path === '') {
            // Root
            if (user) {
                setView('dashboard');
                window.history.replaceState({}, '', '/dashboard');
            } else {
                setView('home');
            }
        }
    }, [user, view]);

    const isAdmin = user?.email === 'lsergiom76@gmail.com' || profile?.role === 'admin' || profile?.role === 'superadmin';
    const showAdmin = isAdmin && (view === 'admin' || window.location.search.includes('admin=true'));

    return (
        <TenantProvider>
            <ChatProvider>
                {/* 🖊️ SIGNATURE PAGE: Rendered outside layout for mobile-first fullscreen experience */}
                {view === 'sign' && signDocumentId ? (
                    <SignaturePage documentId={signDocumentId} />
                ) : view === 'tenant-public' ? (
                    <TenantPublicPage
                        slug={currentSlug || ''}
                        onLogin={() => {
                            setView('login');
                            window.history.pushState({}, '', '/login');
                        }}
                    />
                ) : (
                    <Layout onNavigate={(v) => {
                        setView(v);
                        const path = v === 'home' ? '/' : (v === 'dashboard' ? '/dashboard' :
                            v === 'documents' ? '/dashboard/documents' :
                                v === 'templates' ? '/dashboard/templates' :
                                    v === 'signatures' ? '/dashboard/signatures' :
                                        v === 'affiliates' ? '/dashboard/affiliates' :
                                            v === 'admin' ? '/dashboard/admin' :
                                                v === 'organization' ? '/dashboard/organization' :
                                                    v === 'settings' ? '/dashboard/settings' : `/${v}`);
                        window.history.pushState({}, '', path);
                    }}
                        onOpenLegal={(type) => setLegalModal(type)}
                        user={user} profile={profile} hideNavFooter={view === 'home'} hideFooter={!!user || view === 'join'} currentView={view}>
                        {view === 'login' && !user ? (
                            <AuthForm
                                onAuthSuccess={() => {
                                    setShowSplash(true);
                                    setView('dashboard');
                                    window.history.pushState({}, '', '/dashboard');
                                }}
                                onBack={() => {
                                    if (currentSlug) {
                                        setView('tenant-public');
                                        window.history.pushState({}, '', `/${currentSlug}`);
                                    } else {
                                        setView('home');
                                        window.history.pushState({}, '', '/');
                                    }
                                }}
                            />
                        ) : view === 'create-org' && !user ? (
                            <CreateOrgForm
                                selectedPlan={selectedPlan}
                                onSuccess={() => { setView('dashboard'); window.history.pushState({}, '', '/dashboard'); }}
                                onBack={() => {
                                    if (currentSlug) {
                                        setView('tenant-public');
                                        window.history.pushState({}, '', `/${currentSlug}`);
                                    } else {
                                        setView('home');
                                        window.history.pushState({}, '', '/');
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
                                onBack={() => { setView('dashboard'); window.history.pushState({}, '', '/dashboard'); }}
                                onNavigate={(v) => { setView(v as any); window.history.pushState({}, '', `/dashboard/${v}`); }}
                            />
                        ) : view === 'privacy' ? (
                            <LegalPage type="privacy" onBack={() => { setView(previousView as any); window.history.pushState({}, '', previousView === 'home' ? '/' : `/${previousView}`); }} />
                        ) : view === 'cookies' ? (
                            <LegalPage type="cookies" onBack={() => { setView(previousView as any); window.history.pushState({}, '', previousView === 'home' ? '/' : `/${previousView}`); }} />
                        ) : view === 'afiliados-terminos' ? (
                            <AffiliateTerms onBack={() => { setView(previousView as any); window.history.pushState({}, '', previousView === 'home' ? '/' : `/${previousView}`); }} />
                        ) : view === 'register-affiliate' ? (
                            <RegisterAffiliate onBack={() => { setView(previousView as any); window.history.pushState({}, '', previousView === 'home' ? '/' : `/${previousView}`); }} />
                        ) : view === 'affiliate-kit' ? (
                            <AffiliateKit onBack={() => { setView(previousView as any); window.history.pushState({}, '', previousView === 'home' ? '/' : `/${previousView}`); }} />
                        ) : view === 'legal-procedures' ? (
                            <LegalProcedures onBack={() => { setView('dashboard'); window.history.pushState({}, '', '/dashboard'); }} user={user} />
                        ) : view === 'halal-culture' ? (
                            <HalalCulture onBack={() => { setView('dashboard'); window.history.pushState({}, '', '/dashboard'); }} />
                        ) : view === 'housing-guide' ? (
                            <HousingGuide onBack={() => { setView('dashboard'); window.history.pushState({}, '', '/dashboard'); }} />
                        ) : view === 'join' ? (
                            <>
                                <JoinPage onSuccess={(slug) => {
                                    if (slug) {
                                        setCurrentSlug(slug);
                                        setView('tenant-public');
                                        window.history.pushState({}, '', `/${slug}`);
                                    } else {
                                        setView('dashboard');
                                        window.history.pushState({}, '', '/dashboard');
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
                                <BentoGrid onNavigate={(v) => {
                                    setView(v);
                                    const path = v === 'documents' ? '/dashboard/documents' :
                                        v === 'affiliates' ? '/dashboard/affiliates' :
                                            v === 'admin' ? '/dashboard/admin' : `/${v}`;
                                    window.history.pushState({}, '', path);
                                }} isAdmin={isAdmin} />
                                <DynamicFooter
                                    onOpenLegal={(type) => setLegalModal(type)}
                                    onOpenService={(type) => setServiceModal(type)}
                                />
                            </>
                        ) : (
                            <LandingPage
                                onLogin={() => { setView('login'); window.history.pushState({}, '', '/login'); }}
                                onCreateOrg={(planId) => {
                                    if (planId) setSelectedPlan(planId);
                                    setView('create-org');
                                    window.history.pushState({}, '', '/create-org');
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
    );
}

export default App;
