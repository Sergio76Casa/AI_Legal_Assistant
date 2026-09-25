import { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import logger from './logger';
import { isSuperAdminEmail } from './constants/auth';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface TenantConfig {
  navigation_style?: 'sidebar' | 'tabs';
  primary_color?: string;
  logo_url?: string;
  [key: string]: unknown;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: string;
  config: TenantConfig | null;
}

interface TenantRelation {
  slug: string;
  id?: string;
  name?: string;
  plan?: string;
  config?: TenantConfig | null;
}

interface UserProfile {
  id: string;
  role: string;
  tenant_id?: string;
  subscription_tier?: string;
  tenants?: TenantRelation | null;
}

interface TenantContextType {
  tenant: Tenant | null;
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  refreshTenant: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  user: null,
  profile: null,
  isAdmin: false,
  loading: true,
  refreshTenant: async () => { },
});

export const useTenant = () => useContext(TenantContext);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshingRef = useRef(false);
  const lastSessionIdRef = useRef<string | null>(null);

  const syncFullState = useCallback(async (session: Session | null) => {
    if (refreshingRef.current) return;

    try {
      refreshingRef.current = true;
      logger.log('[TenantProvider] Syncing state...');

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      let tenantToLoad: Tenant | null = null;
      let currentProfileData: UserProfile | null = null;

      // Priority 1: From Profile (if logged in)
      if (currentUser) {
        const { data } = await supabase
          .from('profiles')
          .select('*, tenants(*)')
          .eq('id', currentUser.id)
          .maybeSingle();

        currentProfileData = data as UserProfile | null;

        if (currentProfileData?.tenants) {
          tenantToLoad = currentProfileData.tenants as unknown as Tenant;
        }
      }

      // Priority 2: From URL Slug
      if (!tenantToLoad) {
        const path = window.location.pathname;
        const pathParts = path.split('/').filter(Boolean);
        const potentialSlug = pathParts[0];

        const reservedPaths = ['dashboard', 'login', 'create-org', 'documents', 'admin', 'join'];

        if (potentialSlug && !reservedPaths.includes(potentialSlug)) {
          logger.log(`[TenantProvider] detected slug in URL: ${potentialSlug}`);
          const { data: tenantData } = await supabase
            .from('tenants')
            .select('*')
            .eq('slug', potentialSlug)
            .maybeSingle();

          if (tenantData) {
            tenantToLoad = tenantData as Tenant;
          }
        }
      }

      // Priority 3: Fallback invitation token
      if (!tenantToLoad) {
        const token = new URLSearchParams(window.location.search).get('token');
        if (token) {
          const { data: invite } = await supabase
            .from('tenant_invitations')
            .select('*, tenants(*)')
            .eq('token', token)
            .maybeSingle();

          if (invite?.tenants) {
            tenantToLoad = invite.tenants as unknown as Tenant;
          }
        }
      }

      // Sync subscription_tier
      if (currentProfileData && tenantToLoad) {
        let effectiveTier = tenantToLoad.plan;
        if (!effectiveTier || effectiveTier === 'free') {
          effectiveTier = currentProfileData.subscription_tier ?? 'free';
        }
        if (currentProfileData.role === 'superadmin' || currentProfileData.role === 'admin') {
          effectiveTier = 'business';
        }
        currentProfileData.subscription_tier = effectiveTier;
      } else if (
        currentProfileData?.role === 'superadmin' ||
        currentProfileData?.role === 'admin'
      ) {
        currentProfileData.subscription_tier = 'business';
      }

      setProfile(currentProfileData);
      setTenant(tenantToLoad);
    } catch (error) {
      logger.error('[TenantProvider] Fatal sync error:', error);
    } finally {
      setLoading(false);
      refreshingRef.current = false;
    }
  }, []);

  const refreshTenant = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    await syncFullState(session);
  }, [syncFullState]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        lastSessionIdRef.current = session?.user?.id ?? null;
        syncFullState(session);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const currentId = session?.user?.id ?? null;
      if (currentId !== lastSessionIdRef.current || event === 'SIGNED_OUT') {
        logger.log(`[TenantProvider] Session change (${event}): ${currentId}`);
        lastSessionIdRef.current = currentId;
        if (mounted) syncFullState(session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const isAdmin =
    isSuperAdminEmail(user?.email) ||
    profile?.role === 'admin' ||
    profile?.role === 'superadmin';

  return (
    <TenantContext.Provider value={{
      tenant,
      user,
      profile,
      isAdmin,
      loading,
      refreshTenant
    }}>
      {children}
    </TenantContext.Provider>
  );
};
