import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { differenceInDays, parseISO, isBefore } from 'date-fns';
import { useSessionObserver } from './useSessionObserver';

export interface ElectricalAsset {
    id: string;
    tenant_id: string;
    name: string;
    cups: string;
    oca_expiry: string | null;
    cie_expiry: string | null;
    status: 'ok' | 'warning' | 'critical';
    preferred_language: string;
    created_at: string;
}

/**
 * Hook to manage Electrical Compliance and Efficiency for Legal AI Global.
 */
export function useCompliance(providedTenantId?: string) {
    const { profile } = useSessionObserver();
    const tenantId = providedTenantId || profile?.tenant_id;
    
    const [assets, setAssets] = useState<ElectricalAsset[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const calculateHealthStatus = (asset: Partial<ElectricalAsset>): 'ok' | 'warning' | 'critical' => {
        const now = new Date();
        const dates = [asset.oca_expiry, asset.cie_expiry].filter(Boolean) as string[];
        if (dates.length === 0) return 'ok';

        let worstStatus: 'ok' | 'warning' | 'critical' = 'ok';
        for (const dateStr of dates) {
            const expiryDate = parseISO(dateStr);
            const daysUntil = differenceInDays(expiryDate, now);
            if (isBefore(expiryDate, now) || daysUntil <= 30) {
                return 'critical'; 
            } else if (daysUntil <= 90) {
                worstStatus = 'warning'; 
            }
        }
        return worstStatus;
    };

    const fetchAssets = useCallback(async () => {
        if (!tenantId) return;
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from('electrical_assets')
                .select('*')
                .eq('tenant_id', tenantId)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            
            const processedAssets = (data || []).map(asset => ({
                ...asset,
                status: calculateHealthStatus(asset)
            }));
            setAssets(processedAssets);
        } catch (err: any) {
            console.error('Compliance error:', err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    const analyzeWithAI = async (asset: ElectricalAsset) => {
        if (!asset) return { success: false, message: 'Activo no válido' };
        console.log(`Legal AI Global: Inquesting AI for ${asset.name} in ${asset.preferred_language}...`);
        
        try {
            // This is where we'd call Gemini with the preferred_language
            const header = '### Informe de Optimización - Legal AI Global\n\n';
            const { data, error: aiError } = await supabase.functions.invoke('analyze-compliance', {
                body: { asset_id: asset.id, language: asset.preferred_language }
            });

            if (aiError) throw aiError;
            
            return {
                success: true,
                recommendation: `${header}${data.recommendation}`
            };
        } catch (err: any) {
            return {
                success: false,
                message: `Error IA: ${err.message}`
            };
        }
    };

    useEffect(() => {
        if (tenantId) fetchAssets();
    }, [tenantId, fetchAssets]);

    return {
        assets,
        loading,
        error,
        fetchAssets,
        analyzeWithAI,
        calculateHealthStatus
    };
}
