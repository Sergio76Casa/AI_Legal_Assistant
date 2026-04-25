import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export interface Bundle {
    id: string;
    name: string;
    description?: string;
    [key: string]: any;
}

export const useUserBundles = (tenantId: string | undefined) => {
    const [bundles, setBundles] = useState<Bundle[]>([]);
    const [generatingBundleId, setGeneratingBundleId] = useState<string | null>(null);
    const [progressMsg, setProgressMsg] = useState('');

    const fetchBundles = useCallback(async () => {
        if (!tenantId) return;
        const { data } = await supabase
            .from('pdf_bundles')
            .select('*')
            .eq('tenant_id', tenantId);
        setBundles(data || []);
    }, [tenantId]);

    const handleGenerateBundle = async (bundle: Bundle, userId: string) => {
        setGeneratingBundleId(bundle.id);
        setProgressMsg('Generando...');

        try {
            const { generateBundleZIP } = await import('../../lib/bundle-generator');
            const result = await generateBundleZIP(bundle.id, userId, (msg) => setProgressMsg(msg));

            // Browser download logic
            const url = window.URL.createObjectURL(result.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = result.fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            return { success: true, result };
        } catch (error) {
            console.error('Error generating pack:', error);
            return { success: false, error };
        } finally {
            setGeneratingBundleId(null);
            setProgressMsg('');
        }
    };

    return {
        bundles,
        generatingBundleId,
        progressMsg,
        fetchBundles,
        handleGenerateBundle
    };
};
