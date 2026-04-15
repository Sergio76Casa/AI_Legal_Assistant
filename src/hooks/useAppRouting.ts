import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type AppView = 
    | 'home' | 'dashboard' | 'admin' | 'login' | 'create-org' 
    | 'documents' | 'templates' | 'signatures' | 'privacy' 
    | 'cookies' | 'legal-procedures' | 'halal-culture' 
    | 'housing-guide' | 'organization' | 'settings' 
    | 'tenant-public' | 'affiliates' | 'afiliados-terminos' 
    | 'register-affiliate' | 'affiliate-kit' | 'sign' | 'join' | 'verify';

/**
 * Hook to manage routing and view state for Legal AI Global.
 */
export function useAppRouting(user: any, profile: any) {
    const [view, setView] = useState<AppView>(
        new URLSearchParams(window.location.search).get('token') ? 'join' : 'home'
    );
    const [previousView, setPreviousView] = useState<AppView>('home');
    const [currentSlug, setCurrentSlug] = useState<string | null>(null);
    const [signDocumentId, setSignDocumentId] = useState<string | null>(null);
    const [verifyDocumentId, setVerifyDocumentId] = useState<string | null>(null);

    // Track navigation history for legal pages
    useEffect(() => {
        if (view !== 'privacy' && view !== 'cookies' && view !== 'afiliados-terminos') {
            setPreviousView(view);
        }
    }, [view]);

    const navigate = (newView: AppView, path?: string) => {
        setView(newView);
        if (path) {
            window.history.pushState({}, '', path);
        } else {
            // Default path mapping if none provided
            const mappedPath = newView === 'home' ? '/' : 
                             newView === 'dashboard' ? '/dashboard' :
                             newView === 'documents' ? '/dashboard/documents' :
                             newView === 'templates' ? '/dashboard/templates' :
                             newView === 'signatures' ? '/dashboard/signatures' :
                             newView === 'affiliates' ? '/dashboard/affiliates' :
                             newView === 'admin' ? '/dashboard/admin' :
                             newView === 'organization' ? '/dashboard/organization' :
                             newView === 'settings' ? '/dashboard/settings' : `/${newView}`;
            window.history.pushState({}, '', mappedPath);
        }
    };

    useEffect(() => {
        const handleRouting = async () => {
            const params = new URLSearchParams(window.location.search);
            let ref = params.get('ref');
            const token = params.get('token');
            let path = window.location.pathname.replace(/^\/|\/$/g, '');

            const reservedPublic = ['login', 'create-org', 'privacy', 'cookies', 'home', 'afiliados-terminos', 'register-affiliate', 'affiliate-kit', 'join', 'pro', 'pro/pricing', 'personal', 'personal/pricing', ''];

            // 1. Force 'join' if token is present
            if (path === 'join' || (path === '' && token)) {
                setView('join');
                if (path === '') window.history.replaceState({}, '', `/join?${params.toString()}`);
                return;
            }

            // 2. Sign and Verify routes
            if (path.startsWith('sign/')) {
                const docToken = path.replace('sign/', '');
                if (docToken) {
                    setSignDocumentId(docToken);
                    setView('sign');
                    return;
                }
            }

            if (path.startsWith('verify/')) {
                const docToken = path.replace('verify/', '');
                if (docToken) {
                    setVerifyDocumentId(docToken);
                    setView('verify');
                    return;
                }
            }

            // Dashboard mapping
            const dashboardMap: Record<string, AppView> = {
                'dashboard': 'dashboard',
                'dashboard/documents': 'documents',
                'dashboard/templates': 'templates',
                'dashboard/signatures': 'signatures',
                'dashboard/affiliates': 'affiliates',
                'dashboard/organization': 'organization',
                'dashboard/settings': 'settings',
                'dashboard/admin': 'admin'
            };

            // 3. Vanity URL / Affiliate detection
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

            // 4. Set Referral Cookie (legalflow.digital domain for production)
            if (ref) {
                const date = new Date();
                date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
                document.cookie = `referral_code=${ref.toUpperCase()};expires=${date.toUTCString()};path=/;SameSite=Lax;Domain=.legalflow.digital`;
            }

            // 5. Final View Resolution
            const isAdmin = user?.email === 'lsergiom76@gmail.com' || profile?.role === 'admin' || profile?.role === 'superadmin';
            const adminOnlyViews = ['admin', 'organization', 'settings', 'templates', 'signatures'];

            if (path === '' || path === 'home') {
                setView(user ? 'dashboard' : 'home');
            } else if (dashboardMap[path]) {
                const targetView = dashboardMap[path];
                if (adminOnlyViews.includes(targetView) && !isAdmin && user) {
                    setView('documents');
                    window.history.replaceState({}, '', '/dashboard/documents');
                } else {
                    setView(user ? targetView : 'login');
                }
            } else if (reservedPublic.includes(path.toLowerCase())) {
                setView(path.toLowerCase() as AppView);
            } else if (['legal-procedures', 'halal-culture', 'housing-guide'].includes(path)) {
                setView(path as AppView);
            } else if (/^[a-z0-9-]+$/.test(path)) {
                setCurrentSlug(path);
                setView('tenant-public');
            }
        };

        handleRouting();
    }, [user, profile]);

    return {
        view,
        setView,
        navigate,
        previousView,
        currentSlug,
        setCurrentSlug,
        signDocumentId,
        verifyDocumentId
    };
}
