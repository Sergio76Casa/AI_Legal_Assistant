import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useConfigTranslations = () => {
    const [translating, setTranslating] = useState(false);
    const [translationSuccess, setTranslationSuccess] = useState(false);
    const [translationProgress, setTranslationProgress] = useState<{ current: number, total: number } | null>(null);

    const handleTranslate = useCallback(async (links: any[]) => {
        // 1. Identify blocks that really need translation
        const workList = links.map((link, index) => {
            const hasTitle = typeof link.title === 'string' && link.title.trim().length > 0;
            if (!hasTitle) return { needsWork: false, index, link };

            const currentFingerprint = JSON.stringify({ title: link.title, content: link.content || '' });
            const alreadyHasTranslations = link.translations && Object.keys(link.translations).length > 0;
            const isUnchanged = link._fingerprint === currentFingerprint && alreadyHasTranslations;

            return {
                needsWork: !isUnchanged,
                index,
                link,
                currentFingerprint
            };
        });

        const blocksToTranslate = workList.filter(w => w.needsWork);

        if (blocksToTranslate.length === 0) {
            console.log('All blocks up to date. Skipping translation.');
            return links;
        }

        setTranslating(true);
        setTranslationProgress({ current: 0, total: blocksToTranslate.length });

        const newLinks = [...links];

        try {
            for (let i = 0; i < blocksToTranslate.length; i++) {
                const workItem = blocksToTranslate[i];
                const linkIndex = workItem.index;
                const link = { ...newLinks[linkIndex] }; 

                setTranslationProgress({ current: i + 1, total: blocksToTranslate.length });

                const { data, error } = await supabase.functions.invoke('translate-footer', {
                    body: {
                        title: link.title,
                        content: link.content || '',
                        sourceLang: 'auto'
                    }
                });

                if (error) {
                    console.error(`Error in block ${linkIndex + 1}:`, error.message);
                    continue;
                }

                if (data && data.translations && Object.keys(data.translations).length > 0) {
                    link.translations = {
                        ...(link.translations || {}),
                        ...data.translations
                    };
                    link._fingerprint = workItem.currentFingerprint;

                    if (data.icon) {
                        link.icon = data.icon;
                    }

                    newLinks[linkIndex] = link;
                }
            }

            setTranslationSuccess(true);
            setTimeout(() => setTranslationSuccess(false), 5000);
            return newLinks;
        } catch (err) {
            console.error('Error in handleTranslate:', err);
            return links;
        } finally {
            console.log('[useConfigTranslations] Finished translation process.');
            setTranslating(false);
            setTranslationProgress(null);
        }
    }, []);

    return {
        translating,
        translationSuccess,
        translationProgress,
        handleTranslate
    };
};
