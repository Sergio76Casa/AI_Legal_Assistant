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
import { SplashScreen } from './components/SplashScreen';
import { DynamicFooter } from './components/DynamicFooter';
import { LegalModal } from './components/Landing/LegalModal';
import { ServicesModal } from './components/Landing/ServicesModal';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);
(window as any).supabase = supabase;

function App() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [view, setView] = useState<'home' | 'dashboard' | 'admin' | 'login' | 'create-org' | 'documents' | 'templates' | 'privacy' | 'cookies' | 'legal-procedures' | 'halal-culture' | 'housing-guide' | 'organization' | 'settings' | 'tenant-public' | 'affiliates' | 'afiliados-terminos' | 'register-affiliate'>('home');
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
            let path = window.location.pathname.replace(/^\/|\/$/g, '');
            const reservedPublic = ['login', 'create-org', 'privacy', 'cookies', 'home', 'afiliados-terminos', 'register-affiliate', ''];

            // Dashboard views mapping
            const dashboardMap: Record<string, string> = {
                'dashboard': 'dashboard',
                'dashboard/documents': 'documents',
                'dashboard/templates': 'templates',
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
            const adminOnlyViews = ['admin', 'organization', 'settings', 'templates'];

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
                if (!user) setView('tenant-public');
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
        if (user && view === 'home' && (window.location.pathname === '/' || window.location.pathname === '/home')) {
            setView('dashboard');
            window.history.replaceState({}, '', '/dashboard');
        }
    }, [user, view]);

    // Handle initial state and deep linking
    useEffect(() => {
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
    }, [user]);

    const isAdmin = user?.email === 'lsergiom76@gmail.com' || profile?.role === 'admin' || profile?.role === 'superadmin';
    const showAdmin = isAdmin && (view === 'admin' || window.location.search.includes('admin=true'));

    return (
        <TenantProvider>
            <ChatProvider>
                {view === 'tenant-public' && !user ? (
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
                                    v === 'affiliates' ? '/dashboard/affiliates' :
                                        v === 'admin' ? '/dashboard/admin' :
                                            v === 'organization' ? '/dashboard/organization' :
                                                v === 'settings' ? '/dashboard/settings' : `/${v}`);
                        window.history.pushState({}, '', path);
                    }} user={user} profile={profile} hideNavFooter={view === 'home'} hideFooter={!!user} currentView={view}>
                        {view === 'home' ? (
                            <LandingPage
                                onLogin={() => { setView('login'); window.history.pushState({}, '', '/login'); }}
                                onCreateOrg={() => { setView('create-org'); window.history.pushState({}, '', '/create-org'); }}
                            />
                        ) : view === 'login' && !user ? (
                            <AuthForm
                                onAuthSuccess={() => {
                                    setShowSplash(true);
                                    setView('dashboard');
                                    window.history.pushState({}, '', '/dashboard');
                                }}
                                onBack={() => { setView('home'); window.history.pushState({}, '', '/'); }}
                            />
                        ) : view === 'create-org' && !user ? (
                            <CreateOrgForm
                                onSuccess={() => { setView('dashboard'); window.history.pushState({}, '', '/dashboard'); }}
                                onBack={() => { setView('home'); window.history.pushState({}, '', '/'); }}
                            />
                        ) : showAdmin ? (
                            <AdminDashboard />
                        ) : (view === 'organization' || view === 'documents' || view === 'templates' || view === 'affiliates' || view === 'settings') && user ? (
                            <TenantDashboard
                                user={user}
                                profile={profile}
                                initialTab={view}
                                onBack={() => { setView('dashboard'); window.history.pushState({}, '', '/dashboard'); }}
                                onNavigate={(v) => { setView(v as any); window.history.pushState({}, '', `/dashboard/${v}`); }}
                            />
                        ) : view === 'privacy' ? (
                            <LegalPage type="privacy" onBack={() => { setView('home'); window.history.pushState({}, '', '/'); }} />
                        ) : view === 'cookies' ? (
                            <LegalPage type="cookies" onBack={() => { setView('home'); window.history.pushState({}, '', '/'); }} />
                        ) : view === 'afiliados-terminos' ? (
                            <AffiliateTerms onBack={() => { setView('home'); window.history.pushState({}, '', '/'); }} />
                        ) : view === 'register-affiliate' ? (
                            <RegisterAffiliate onBack={() => { setView('home'); window.history.pushState({}, '', '/'); }} />
                        ) : view === 'legal-procedures' ? (
                            <LegalProcedures onBack={() => { setView('dashboard'); window.history.pushState({}, '', '/dashboard'); }} user={user} />
                        ) : view === 'halal-culture' ? (
                            <HalalCulture onBack={() => { setView('dashboard'); window.history.pushState({}, '', '/dashboard'); }} />
                        ) : view === 'housing-guide' ? (
                            <HousingGuide onBack={() => { setView('dashboard'); window.history.pushState({}, '', '/dashboard'); }} />
                        ) : user || view === 'dashboard' ? (
                            <>
                                <Hero />
                                <BentoGrid onNavigate={(v) => {
                                    setView(v);
                                    const path = v === 'documents' ? '/dashboard/documents' :
                                        v === 'affiliates' ? '/dashboard/affiliates' : `/${v}`;
                                    window.history.pushState({}, '', path);
                                }} />
                                <DynamicFooter
                                    onOpenLegal={(type) => setLegalModal(type)}
                                    onOpenService={(type) => setServiceModal(type)}
                                />
                            </>
                        ) : (
                            <LandingPage
                                onLogin={() => { setView('login'); window.history.pushState({}, '', '/login'); }}
                                onCreateOrg={() => { setView('create-org'); window.history.pushState({}, '', '/create-org'); }}
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
