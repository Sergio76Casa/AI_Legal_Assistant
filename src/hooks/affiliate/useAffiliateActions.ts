import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export const useAffiliateActions = (userId: string | undefined, profile: any) => {
    const [joining, setJoining] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateDefaultCode = (name: string) => {
        const initials = name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 3);
        const random = Math.floor(1000 + Math.random() * 9000);
        return `${initials}${random}`;
    };

    const handleJoin = async () => {
        if (!userId || !profile) return null;
        setJoining(true);
        setError(null);
        try {
            const defaultCode = generateDefaultCode(profile.username || 'PARTNER');
            const { data, error: joinErr } = await supabase
                .from('affiliates')
                .insert({
                    user_id: userId,
                    affiliate_code: defaultCode,
                    status: 'active'
                })
                .select()
                .single();
            
            if (joinErr) throw joinErr;
            return data;
        } catch (err: any) {
            console.error('Error joining affiliate program:', err);
            setError(err.message);
            return null;
        } finally {
            setJoining(false);
        }
    };

    const handleUpdateCode = async (affiliateId: string, newCode: string) => {
        if (!affiliateId || !newCode.trim()) return false;
        setUpdating(true);
        setError(null);
        try {
            const cleanCode = newCode.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
            if (cleanCode.length < 3) throw new Error('El código debe tener al menos 3 caracteres.');

            const { error: updateErr } = await supabase
                .from('affiliates')
                .update({ affiliate_code: cleanCode })
                .eq('id', affiliateId);

            if (updateErr) {
                if (updateErr.code === '23505') throw new Error('Este código ya está en uso. Prueba con otro.');
                throw updateErr;
            }
            return true;
        } catch (err: any) {
            setError(err.message);
            return false;
        } finally {
            setUpdating(false);
        }
    };

    const handleCopyLink = (code: string) => {
        const url = `https://legalflow.digital?ref=${code}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return {
        joining,
        updating,
        copied,
        error,
        setError,
        handleJoin,
        handleUpdateCode,
        handleCopyLink
    };
};
