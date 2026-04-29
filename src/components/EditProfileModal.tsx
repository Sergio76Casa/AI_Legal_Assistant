import React from 'react';
import { X, Save, User, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEditProfileLogic } from '../hooks/useEditProfileLogic';
import { ProfileTabs } from './EditProfileModal/ProfileTabs';
import { ProfileFormFields } from './EditProfileModal/ProfileFormFields';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    onProfileUpdated?: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, userId, onProfileUpdated }) => {
    const { t } = useTranslation();
    const logic = useEditProfileLogic({ isOpen, userId, onClose, onProfileUpdated });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900/95 backdrop-blur-xl text-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-white/10">

                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <User className="text-primary" size={20} />
                        {t('profile.edit_title')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {logic.loading ? (
                    <div className="flex-1 flex items-center justify-center p-12">
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                ) : (
                    <form onSubmit={logic.handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                        <ProfileTabs activeTab={logic.activeTab} onTabChange={logic.setActiveTab} />

                        <div className="flex-1 overflow-y-auto p-6">
                            <ProfileFormFields
                                activeTab={logic.activeTab}
                                formData={logic.formData}
                                onChange={logic.handleChange}
                                userId={userId}
                            />
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-medium"
                            >
                                {t('profile.cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={logic.saving}
                                className="px-6 py-2 bg-primary text-slate-900 rounded-lg hover:bg-primary/90 transition-colors font-bold flex items-center gap-2 disabled:opacity-50"
                            >
                                {logic.saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {t('profile.save_btn')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
