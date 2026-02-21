export interface AdminProfile {
    id: string;
    role: 'admin' | 'superadmin' | 'user';
    tenant_id?: string;
    full_name?: string;
    username?: string;
}

export interface Law {
    id: string;
    title: string;
    description: string;
    region: string;
    content?: string;
    is_global: boolean;
    created_at: string;
}

export interface Tenant {
    id: string;
    name: string;
    slug: string;
    plan: string;
    plan_type: string;
    is_active: boolean;
    created_at: string;
    config?: any;
}

export interface GlobalDocument {
    id: string;
    name: string;
    region: string;
    file_path: string;
    size?: number;
    created_at: string;
}

export interface AdminStats {
    mrr: number;
    netProfit: number;
    affiliateCost: number;
    activeAffiliates: number;
}
