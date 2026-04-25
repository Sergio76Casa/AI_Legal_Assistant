import { useState } from 'react';
import { supabase } from '../lib/supabase';

export const useAssetUpload = (tenantId: string) => {
    const [uploadingField, setUploadingField] = useState<string | null>(null);

    const handleFileUpload = async (field: string, file: File, onSuccess: (url: string) => void) => {
        if (!tenantId) return;
        setUploadingField(field);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${tenantId}/${field}_${Date.now()}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('tenant-assets')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('tenant-assets')
                .getPublicUrl(fileName);

            onSuccess(publicUrl);
        } catch (err) {
            console.error('Error uploading asset:', err);
            alert('Error al subir imagen. Revisa los permisos de storage.');
        } finally {
            setUploadingField(null);
        }
    };

    return {
        uploadingField,
        handleFileUpload
    };
};
