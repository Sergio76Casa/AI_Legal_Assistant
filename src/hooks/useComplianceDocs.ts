import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useSessionObserver } from './useSessionObserver';

export interface ComplianceDocument {
    id: string;
    tenant_id: string;
    type: string;
    name: string;
    file_url?: string;
    expiry_date: string | null;
    metadata: any;
    status: string;
    signature_url?: string;
    signer_name?: string;
    signed_at?: string;
}

export function useComplianceDocs() {
    const { profile } = useSessionObserver();
    const [documents, setDocuments] = useState<ComplianceDocument[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchDocuments = useCallback(async () => {
        if (!profile?.tenant_id) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('compliance_documents')
                .select('*')
                .eq('tenant_id', profile.tenant_id)
                .order('expiry_date', { ascending: true });

            if (error) throw error;
            setDocuments(data || []);
        } catch (err: any) {
            console.error('Error fetching compliance docs:', err.message);
        } finally {
            setLoading(false);
        }
    }, [profile?.tenant_id]);

    const addDocument = async (doc: Partial<ComplianceDocument>) => {
        if (!profile?.tenant_id) return { success: false };
        try {
            const { data, error } = await supabase
                .from('compliance_documents')
                .insert([{ ...doc, tenant_id: profile.tenant_id }])
                .select()
                .single();

            if (error) throw error;
            setDocuments(prev => [...prev, data]);
            return { success: true, data };
        } catch (err: any) {
            return { success: false, message: err.message };
        }
    };

    const completeSignature = async (docId: string, signatureDataUrl: string, signerName: string) => {
        if (!profile?.tenant_id) return { success: false };
        try {
            // 1. Convert Data URL to Blob
            const response = await fetch(signatureDataUrl);
            const blob = await response.blob();

            // 2. Upload to Storage
            const filePath = `${profile.tenant_id}/signatures/${docId}_${Date.now()}.png`;
            const { error: uploadError } = await supabase.storage
                .from('compliance')
                .upload(filePath, blob, { contentType: 'image/png' });

            if (uploadError) throw uploadError;

            // 3. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('compliance')
                .getPublicUrl(filePath);

            // 4. Update Database Record
            const { error: dbError } = await supabase
                .from('compliance_documents')
                .update({
                    signature_url: publicUrl,
                    signer_name: signerName,
                    signed_at: new Date().toISOString(),
                    status: 'signed',
                    ip_address: 'Stark-Verified' // Could be dynamic if needed
                })
                .eq('id', docId)
                .eq('tenant_id', profile.tenant_id);

            if (dbError) throw dbError;

            await fetchDocuments();
            return { success: true };
        } catch (err: any) {
            console.error('Signature Capture Error:', err.message);
            return { success: false, message: err.message };
        }
    };

    useEffect(() => {
        if (profile?.tenant_id) fetchDocuments();
    }, [fetchDocuments, profile?.tenant_id]);

    return {
        documents,
        loading,
        fetchDocuments,
        addDocument,
        completeSignature
    };
}
