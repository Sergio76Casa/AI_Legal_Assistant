import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

interface DeleteConfirmationModalProps {
    confirmDelete: { userId: string; permanent: boolean } | null;
    onCancel: () => void;
    onConfirm: () => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    confirmDelete,
    onCancel,
    onConfirm
}) => {
    const { t } = useTranslation();

    if (!confirmDelete) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(
                    "max-w-md w-full p-8 rounded-[32px] border shadow-2xl space-y-6",
                    confirmDelete.permanent
                        ? "bg-red-950/40 border-red-500/30"
                        : "bg-[#0A0F1D] border-white/10"
                )}
            >
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "p-4 rounded-2xl",
                        confirmDelete.permanent ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                    )}>
                        <AlertCircle size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">
                            {confirmDelete.permanent
                                ? t('org_panel.delete_modal.title_perm')
                                : t('org_panel.delete_modal.title_soft')}
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">
                            {confirmDelete.permanent
                                ? t('org_panel.delete_modal.desc_perm')
                                : t('org_panel.delete_modal.desc_soft')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                        {t('org_panel.delete_modal.cancel')}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            confirmDelete.permanent
                                ? "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20"
                                : "bg-white text-black hover:bg-slate-200"
                        )}
                    >
                        {confirmDelete.permanent
                            ? t('org_panel.delete_modal.confirm_perm')
                            : t('org_panel.delete_modal.confirm_soft')}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
