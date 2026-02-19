import { Layout } from './components/Layout';
import { Hero } from './components/Hero';
import { BentoGrid } from './components/BentoGrid';
import { ChatDrawer } from './components/ChatDrawer';
import { ChatProvider } from './lib/ChatContext';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthForm } from './components/AuthForm';
import { UserDocuments } from './components/UserDocuments';
import { LegalPage } from './components/LegalPage';
import { createClient } from '@supabase/supabase-js';
import { LegalProcedures } from './components/LegalProcedures';
import { HalalCulture } from './components/HalalCulture';
import { HousingGuide } from './components/HousingGuide';
import { useEffect, useState } from 'react';
import { TenantProvider } from './lib/TenantContext';
import { LandingPage } from './components/LandingPage';
import { CreateOrgForm } from './components/CreateOrgForm';
import { TenantDashboard } from './components/TenantDashboard';
import { TenantPublicPage } from './components/TenantPublicPage';
import { TemplateManager } from './components/TemplateManager';
import { AffiliatePanel } from './components/AffiliatePanel';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);
(window as any).supabase = supabase;

function App() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [view, setView] = useState<'home' | 'dashboard' | 'admin' | 'login' | 'create-org' | 'documents' | 'templates' | 'privacy' | 'cookies' | 'legal-procedures' | 'halal-culture' | 'housing-guide' | 'tenant-settings' | 'tenant-public' | 'affiliates'>('home');
    const [currentSlug, setCurrentSlug] = useState<string | null>(null);

    const fetchProfile = async (userId: string) => {
        const { data } = await supabase
            .from('profiles')
            .select('*, tenants(slug)')
            .eq('id', userId)
            .maybeSingle();
        setProfile(data);
    };

    // 🔍 ROUTING & REFERRAL SYSTEM
    useEffect(() => {
        const handleRouting = async () => {
            const params = new URLSearchParams(window.location.search);
            let ref = params.get('ref');
            let path = window.location.pathname.replace(/^\/|\/$/g, '');
            const reservedPublic = ['login', 'create-org', 'privacy', 'cookies', 'home', ''];

            // Dashboard views mapping
            const dashboardMap: Record<string, string> = {
                'dashboard': 'dashboard',
                'dashboard/documents': 'documents',
                'dashboard/templates': 'templates',
                'dashboard/affiliates': 'affiliates',
                'dashboard/settings': 'tenant-settings',
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
            if (path === '' || path === 'home') {
                setView('home');
            } else if (dashboardMap[path]) {
                setView(user ? dashboardMap[path] as any : 'login');
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
    }, [user]);

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
                setProfile(null);
                setView('home');
                window.history.pushState({}, '', '/');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // 🚀 REDIRECTION LOGIC: Auto-navigate to dashboard on login
    useEffect(() => {
        if (user && view === 'home' && window.location.pathname === '/') {
            setView('dashboard');
            window.history.pushState({}, '', '/dashboard');
        }
    }, [user, view]);

    const isAdmin = user?.email === 'lsergiom76@gmail.com' || profile?.role === 'superadmin';
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
                                            v === 'tenant-settings' ? '/dashboard/settings' : `/${v}`);
                        window.history.pushState({}, '', path);
                    }} user={user} profile={profile}>
                        {view === 'home' ? (
                            <LandingPage
                                onLogin={() => { setView('login'); window.history.pushState({}, '', '/login'); }}
                                onCreateOrg={() => { setView('create-org'); window.history.pushState({}, '', '/create-org'); }}
                            />
                        ) : view === 'login' && !user ? (
                            <AuthForm
                                onAuthSuccess={() => { setView('dashboard'); window.history.pushState({}, '', '/dashboard'); }}
                                onBack={() => { setView('home'); window.history.pushState({}, '', '/'); }}
                            />
                        ) : view === 'create-org' && !user ? (
                            <CreateOrgForm
                                onSuccess={() => { setView('dashboard'); window.history.pushState({}, '', '/dashboard'); }}
                                onBack={() => { setView('home'); window.history.pushState({}, '', '/'); }}
                            />
                        ) : showAdmin ? (
                            <AdminDashboard />
                        ) : view === 'tenant-settings' && user ? (
                            <TenantDashboard onBack={() => { setView('dashboard'); window.history.pushState({}, '', '/dashboard'); }} onNavigate={(v) => { setView(v); window.history.pushState({}, '', `/dashboard/settings`); }} />
                        ) : view === 'templates' && user ? (
                            <TemplateManager />
                        ) : view === 'affiliates' && user ? (
                            <AffiliatePanel />
                        ) : view === 'documents' && user ? (
                            <UserDocuments userId={user.id} onNavigate={(v) => { setView(v); window.history.pushState({}, '', `/dashboard/documents`); }} />
                        ) : view === 'privacy' ? (
                            <LegalPage type="privacy" onBack={() => { setView('home'); window.history.pushState({}, '', '/'); }} />
                        ) : view === 'cookies' ? (
                            <LegalPage type="cookies" onBack={() => { setView('home'); window.history.pushState({}, '', '/'); }} />
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
                                        v === 'templates' ? '/dashboard/templates' :
                                            v === 'affiliates' ? '/dashboard/affiliates' : `/${v}`;
                                    window.history.pushState({}, '', path);
                                }} />
                            </>
                        ) : (
                            <LandingPage
                                onLogin={() => { setView('login'); window.history.pushState({}, '', '/login'); }}
                                onCreateOrg={() => { setView('create-org'); window.history.pushState({}, '', '/create-org'); }}
                            />
                        )}
                        <ChatDrawer />
                    </Layout>
                )}
            </ChatProvider>
        </TenantProvider>
    );
}

export default App;
