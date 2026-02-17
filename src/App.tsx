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

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);
(window as any).supabase = supabase;

function App() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [view, setView] = useState<'home' | 'admin' | 'login' | 'create-org' | 'documents' | 'privacy' | 'cookies' | 'legal-procedures' | 'halal-culture' | 'housing-guide' | 'tenant-settings' | 'tenant-public'>('home');
    const [currentSlug, setCurrentSlug] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async (userId: string) => {
            const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
            setProfile(data);
        };

        // Listen for auth changes
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
            }
        });

        // 🔍 SLUG DETECTION: Check if URL path is a specific tenant request
        const path = window.location.pathname;
        if (path !== '/' && !path.startsWith('/admin') && !path.includes('.')) {
            const potentialSlug = path.substring(1); // Quitar el slash inicial
            // Simple regex for likely slugs (alphanumeric, dashes)
            if (/^[a-z0-9-]+$/.test(potentialSlug)) {
                setCurrentSlug(potentialSlug);
                setView('tenant-public');
            }
        }

        return () => subscription.unsubscribe();
    }, []);

    const isAdmin = user?.email === 'lsergiom76@gmail.com' || profile?.role === 'superadmin';
    const showAdmin = isAdmin && (view === 'admin' || window.location.search.includes('admin=true'));

    return (
        <TenantProvider>
            <ChatProvider>
                {/* Ocultamos el Layout normal si estamos en la Landing Pública del Tenant (para diseño full custom) */}
                {view === 'tenant-public' ? (
                    <TenantPublicPage
                        slug={currentSlug || ''}
                        onLogin={() => {
                            // Limpiamos el slug de la URL visualmente (opcional) o mantenemos el contexto
                            // Por ahora, redirigimos al login normal
                            setView('login');
                            window.history.pushState({}, '', '/'); // Reset URL to root to avoid confusion, or keep it? 
                            // Better: Keep it clean for now.
                        }}
                    />
                ) : (
                    <Layout onNavigate={setView} user={user} profile={profile}>
                        {!user && view === 'home' ? (
                            <LandingPage onLogin={() => setView('login')} onCreateOrg={() => setView('create-org')} />
                        ) : view === 'login' && !user ? (
                            <AuthForm onAuthSuccess={() => setView('home')} onBack={() => setView('home')} />
                        ) : view === 'create-org' && !user ? (
                            <CreateOrgForm onSuccess={() => setView('home')} onBack={() => setView('home')} />
                        ) : showAdmin ? (
                            <AdminDashboard />
                        ) : view === 'tenant-settings' && user ? (
                            <TenantDashboard onBack={() => setView('home')} onNavigate={setView} />
                        ) : view === 'documents' && user ? (
                            <UserDocuments userId={user.id} onNavigate={setView} />
                        ) : view === 'privacy' ? (
                            <LegalPage type="privacy" onBack={() => setView('home')} />
                        ) : view === 'cookies' ? (
                            <LegalPage type="cookies" onBack={() => setView('home')} />
                        ) : view === 'legal-procedures' ? (
                            <LegalProcedures onBack={() => setView('home')} user={user} />
                        ) : view === 'halal-culture' ? (
                            <HalalCulture onBack={() => setView('home')} />
                        ) : view === 'housing-guide' ? (
                            <HousingGuide onBack={() => setView('home')} />
                        ) : (
                            <>
                                <Hero />
                                <BentoGrid onNavigate={setView} />
                            </>
                        )}
                        <ChatDrawer />
                    </Layout>
                )}
            </ChatProvider>
        </TenantProvider>
    );
}

export default App;
