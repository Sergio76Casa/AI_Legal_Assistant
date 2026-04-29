import React from 'react';
import { User, MapPin, Users, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ProfileTab } from '../../hooks/useEditProfileLogic';

interface ProfileTabsProps {
    activeTab: ProfileTab;
    onTabChange: (tab: ProfileTab) => void;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, onTabChange }) => {
    const { t } = useTranslation();

    const tabs: { id: ProfileTab; label: string; icon: React.ElementType }[] = [
        { id: 'basic',          label: t('profile.tabs.personal'),       icon: User     },
        { id: 'address',        label: t('profile.tabs.address'),         icon: MapPin   },
        { id: 'filiation',      label: t('profile.tabs.filiation'),       icon: Users    },
        { id: 'representation', label: t('profile.tabs.representation'),  icon: FileText },
    ];

    return (
        <div className="flex border-b border-white/10">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    type="button"
                    onClick={() => onTabChange(tab.id)}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                        activeTab === tab.id
                            ? 'border-primary text-primary bg-primary/10'
                            : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <tab.icon size={16} />
                    <span className="hidden sm:inline">{tab.label}</span>
                </button>
            ))}
        </div>
    );
};
