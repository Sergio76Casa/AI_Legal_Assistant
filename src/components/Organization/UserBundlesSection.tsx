import React, { useEffect } from 'react';
import { Loader2, FolderDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUserBundles } from '../../hooks/organization/useUserBundles';

interface UserBundlesSectionProps {
    userId: string;
    tenantId: string | undefined;
    onBundleSuccess: (data: any) => void;
}

export const UserBundlesSection: React.FC<UserBundlesSectionProps> = ({ userId, tenantId, onBundleSuccess }) => {
    const { t } = useTranslation();
    const { 
        bundles, 
        generatingBundleId, 
        progressMsg, 
        fetchBundles, 
        handleGenerateBundle 
    } = useUserBundles(tenantId);

    useEffect(() => {
        if (tenantId) fetchBundles();
    }, [tenantId, fetchBundles]);

    if (bundles.length === 0) return null;

    return (
        <div className="mt-2 pt-2 border-t border-white/10">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{t('org_panel.quick_bundles')}</p>
            <div className="flex flex-wrap gap-2">
                {bundles.map(bundle => {
                    const isProcessing = generatingBundleId === bundle.id;
                    return (
                        <button
                            key={bundle.id}
                            onClick={async () => {
                                const result = await handleGenerateBundle(bundle, userId);
                                if (result.success) onBundleSuccess(result.result);
                            }}
                            disabled={!!generatingBundleId}
                            className="group flex items-center gap-2 px-3 py-1.5 bg-indigo-500/5 hover:bg-indigo-500/15 border border-indigo-500/10 hover:border-indigo-500/30 rounded-lg transition-all disabled:opacity-50"
                        >
                            {isProcessing ? (
                                <Loader2 size={12} className="animate-spin text-indigo-400" />
                            ) : (
                                <FolderDown size={12} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                            )}
                            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-tight">
                                {isProcessing ? (progressMsg || t('org_panel.generating')) : bundle.name}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
