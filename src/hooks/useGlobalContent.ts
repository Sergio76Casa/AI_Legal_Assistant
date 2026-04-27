import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useGlobalContent() {
    const [globalDocuments, setGlobalDocuments] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [activeTenantId, setActiveTenantId] = useState<string | null>(null);

    const fetchGlobalDocuments = useCallback(async () => {
        try {
            const { data: docs, error: docsError } = await supabase
                .from('documents')
                .select('*')
                .order('created_at', { ascending: false });

            if (docsError) throw docsError;

            const { data: kbData } = await supabase
                .from('knowledge_base')
                .select('title, metadata')
                .eq('tenant_id', '00000000-0000-0000-0000-000000000000');

            const { data: { user } } = await supabase.auth.getUser();
            let currentTenantId = null;
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single();
                if (profile) currentTenantId = profile.role === 'superadmin' ? '00000000-0000-0000-0000-000000000000' : profile.tenant_id;
                setActiveTenantId(currentTenantId);
            }

            const NULL_TENANT = '00000000-0000-0000-0000-000000000000';
            let lawSettings: any[] = [];
            if (currentTenantId && currentTenantId !== NULL_TENANT) {
                const { data: settingsData } = await supabase
                    .from('tenant_law_settings')
                    .select('document_id, is_enabled')
                    .eq('tenant_id', currentTenantId);
                if (settingsData) lawSettings = settingsData;
            }

            const docsWithKb = docs?.map(doc => {
                const kbEntries = kbData?.filter(kb => kb.metadata?.source === doc.url) || [];
                const setting = lawSettings.find(s => s.document_id === doc.url);
                const isEnabled = setting ? setting.is_enabled : true;

                return {
                    ...doc,
                    kbCount: kbEntries.length,
                    aiTitle: kbEntries[0]?.title || (doc.status === 'processing' ? 'Procesando...' : 'Pendiente de procesar'),
                    isEnabled: isEnabled
                };
            });

            setGlobalDocuments(docsWithKb || []);
        } catch (error: any) {
            console.error('Error fetching docs:', error.message);
        }
    }, []);

    // Polling automático mientras haya documentos en estado 'processing'
    useEffect(() => {
        const hasProcessing = globalDocuments.some(d => d.status === 'processing');
        if (!hasProcessing) return;

        const timer = setTimeout(() => {
            fetchGlobalDocuments();
        }, 5000);

        return () => clearTimeout(timer);
    }, [globalDocuments]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleUpload = async (file: File, country: string) => {
        if (!file) return;
        setIsUploading(true);
        setStatus(null);
        setUploadProgress(0);

        try {
            const sanitizedName = file.name
                .normalize('NFD').replace(/[̀-ͯ]/g, '')
                .replace(/[^a-zA-Z0-9._-]/g, '_')
                .replace(/__+/g, '_');
            const filePath = `${country}/${Date.now()}_${sanitizedName}`;

            const { error: uploadError } = await supabase.storage
                .from('legal-global')
                .upload(filePath, file, {
                    onUploadProgress: (progress: any) => {
                        const percent = (progress.loaded / progress.total) * 100;
                        setUploadProgress(percent);
                    }
                } as any);

            if (uploadError) throw uploadError;

            const { data: docData, error: dbError } = await supabase
                .from('documents')
                .insert({
                    name: file.name,
                    url: filePath,
                    user_id: null,
                    type: 'pdf',
                    status: 'processing',
                    country: country
                })
                .select('id')
                .single();

            if (dbError) throw dbError;

            const { data: processData, error: processError } = await supabase.functions.invoke('process-pdf', {
                body: {
                    bucket_id: 'legal-global',
                    file_path: filePath,
                    user_id: null,
                    document_id: docData?.id,
                    tenant_id: '00000000-0000-0000-0000-000000000000'
                }
            });

            if (processError) {
                let detail = processError.message;
                try {
                    const errBody = await (processError as any).context?.json?.();
                    detail = errBody?.error || errBody?.message || detail;
                } catch {
                    try {
                        detail = await (processError as any).context?.text?.() || detail;
                    } catch { /* ignorar */ }
                }
                console.error('process-pdf error:', detail);
                throw new Error(`Error al procesar PDF: ${detail}`);
            }

            // Si la función devuelve 202 (accepted), el procesamiento es asíncrono
            if (processData?.accepted) {
                setStatus({
                    type: 'success',
                    message: `Archivo subido. Procesando en segundo plano — los fragmentos aparecerán en unos minutos (documentos grandes pueden tardar más).`
                });
            } else {
                setStatus({
                    type: 'success',
                    message: `¡Documento de ${country} cargado y procesado: ${processData?.chunks_created ?? '?'} fragmentos en IA.`
                });
            }

            fetchGlobalDocuments();
            return true;
        } catch (error: any) {
            setStatus({ type: 'error', message: `Error: ${error.message}` });
            return false;
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteDoc = async (id: string, url: string) => {
        if (!confirm('¿Estás seguro de eliminar este documento legal? Esto lo borrará de la lista, del almacenamiento y de la memoria de la IA.')) return;
        try {
            const { error } = await supabase.functions.invoke('delete-document', {
                body: {
                    document_id: id,
                    file_path: url,
                    bucket_id: 'legal-global'
                }
            });

            if (error) {
                let detail = error.message;
                try {
                    const errBody = await (error as any).context?.json?.();
                    detail = errBody?.error || errBody?.message || detail;
                } catch {
                    try {
                        detail = await (error as any).context?.text?.() || detail;
                    } catch { /* ignorar */ }
                }
                throw new Error(detail);
            }

            setStatus({ type: 'success', message: 'Documento y memoria de IA eliminados correctamente.' });
            fetchGlobalDocuments();
        } catch (error: any) {
            setStatus({ type: 'error', message: `Error al eliminar: ${error.message}` });
        }
    };

    const handleReprocess = async (docId: string, url: string) => {
        try {
            await supabase.from('documents').update({ status: 'processing' }).eq('id', docId);
            setStatus({ type: 'success', message: 'Re-procesando documento en segundo plano...' });
            fetchGlobalDocuments();

            const { error: processError } = await supabase.functions.invoke('process-pdf', {
                body: {
                    bucket_id: 'legal-global',
                    file_path: url,
                    user_id: null,
                    document_id: docId,
                    tenant_id: '00000000-0000-0000-0000-000000000000'
                }
            });

            if (processError) {
                let detail = processError.message;
                try { const b = await (processError as any).context?.json?.(); detail = b?.error || detail; } catch { /* ignore */ }
                throw new Error(detail);
            }
        } catch (error: any) {
            setStatus({ type: 'error', message: `Error al re-procesar: ${error.message}` });
        }
    };

    const toggleLaw = async (documentUrl: string, currentState: boolean) => {
        if (!activeTenantId) return;
        try {
            const { error } = await supabase
                .from('tenant_law_settings')
                .upsert({
                    tenant_id: activeTenantId,
                    document_id: documentUrl,
                    is_enabled: !currentState,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'tenant_id, document_id' });

            if (error) throw error;
            fetchGlobalDocuments();
        } catch (error: any) {
            setStatus({ type: 'error', message: `Error al cambiar estado: ${error.message}` });
        }
    };

    return {
        globalDocuments,
        isUploading,
        uploadProgress,
        status,
        setStatus,
        handleReprocess,
        fetchGlobalDocuments,
        handleUpload,
        handleDeleteDoc,
        toggleLaw
    };
}
