/**
 * IDs técnicos oficiales de los planes en la base de datos (columna tenants.plan)
 */
export const PLAN_IDS = {
    STARTER: 'free',
    BUSINESS: 'pro',
    ENTERPRISE: 'business'
} as const;

export type PlanId = typeof PLAN_IDS[keyof typeof PLAN_IDS];

/**
 * Metadatos comerciales alineados con Configuración_planes_y_precios.md
 */
export const PLANS_METADATA = {
    [PLAN_IDS.STARTER]: {
        name: 'Starter',
        commercialName: 'Starter',
        maxDocuments: 10,
        maxQueries: 50,
        color: 'slate',
        badgeClass: 'bg-white/10 text-slate-400',
        summary: 'Ideal para profesionales con hasta 10 expedientes mensuales.'
    },
    [PLAN_IDS.BUSINESS]: {
        name: 'Business',
        commercialName: 'Business',
        maxDocuments: 50,
        maxQueries: 500,
        color: 'purple',
        badgeClass: 'bg-purple-500/15 text-purple-400',
        summary: 'Perfecto para despachos en crecimiento (hasta 50 expedientes).'
    },
    [PLAN_IDS.ENTERPRISE]: {
        name: 'Enterprise',
        commercialName: 'Enterprise',
        maxDocuments: -1, // Ilimitado
        maxQueries: -1,  // Ilimitado
        color: 'primary',
        badgeClass: 'bg-primary/15 text-primary',
        summary: 'Capacidad ilimitada y consultoría estratégica personalizada.'
    }
} as const;

/**
 * Función de utilidad para obtener metadatos de un plan de forma segura
 */
export const getPlanMetadata = (
    planId: string | null | undefined,
    customNames?: { free?: string; pro?: string; business?: string }
) => {
    const id = (planId || PLAN_IDS.STARTER) as PlanId;
    const metadata = { ...(PLANS_METADATA[id] || PLANS_METADATA[PLAN_IDS.STARTER]) } as any;

    // Override names if custom names are provided
    if (customNames) {
        if (id === PLAN_IDS.STARTER && customNames.free) {
            metadata.commercialName = customNames.free;
            metadata.name = customNames.free;
        } else if (id === PLAN_IDS.BUSINESS && customNames.pro) {
            metadata.commercialName = customNames.pro;
            metadata.name = customNames.pro;
        } else if (id === PLAN_IDS.ENTERPRISE && customNames.business) {
            metadata.commercialName = customNames.business;
            metadata.name = customNames.business;
        }
    }

    return metadata;
};
