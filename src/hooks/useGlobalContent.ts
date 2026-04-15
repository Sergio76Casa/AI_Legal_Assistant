import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook to manage global legal content/documents for Legal AI Global.
 */
export function useGlobalContent() {
    const [globalDocuments, setGlobalDocuments] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const fetchGlobalDocuments = useCallback(async () => {
        setIsUploading(true);
        try {
            const { data: docs, error: docsError } = await supabase
                .from('documents')
                .select('*')
                .order('created_at', { ascending: false });

            if (docsError) throw docsError;

            const { data: kbData } = await supabase
                .from('knowledge_base')
                .select('title, metadata');

            const docsWithKb = docs?.map(doc => {
                const kbEntries = kbData?.filter(kb => kb.metadata?.source === doc.url) || [];
                return {
                    ...doc,
                    kbCount: kbEntries.length,
                    aiTitle: kbEntries[0]?.title || 'Pendiente de procesar'
                };
            });

            setGlobalDocuments(docsWithKb || []);
        } catch (error: any) {
            console.error('Error fetching docs:', error.message);
        } finally {
            setIsUploading(false);
        }
    }, []);

    const handleUpload = async (file: File, country: string) => {
        if (!file) return;
        setIsUploading(true);
        setStatus(null);
        setUploadProgress(0);
        
        try {
            const filePath = `${country}/${Date.now()}_${file.name}`;
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

            const { error: processError } = await supabase.functions.invoke('process-pdf', {
                body: {
                    bucket_id: 'legal-global',
                    file_path: filePath,
                    user_id: null,
                    document_id: docData?.id
                }
            });

            if (processError) throw processError;

            setStatus({ type: 'success', message: `¡Documento legal de ${country} cargado y procesado con éxito para Legal AI Global!` });
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
            await supabase.from('knowledge_base').delete().eq('metadata->>source', url);
            await supabase.storage.from('legal-global').remove([url]);
            const { error: dbError } = await supabase.from('documents').delete().eq('id', id);
            if (dbError) throw dbError;
            setStatus({ type: 'success', message: 'Documento y memoria de IA eliminados correctamente.' });
            fetchGlobalDocuments();
        } catch (error: any) {
            setStatus({ type: 'error', message: `Error al eliminar: ${error.message}` });
        }
    };

    return {
        globalDocuments,
        isUploading,
        uploadProgress,
        status,
        setStatus,
        fetchGlobalDocuments,
        handleUpload,
        handleDeleteDoc
    };
}
