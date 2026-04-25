import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';

interface AppSettings {
    plan_names: {
        free: string;
        pro: string;
        business: string;
    };
    affiliate_commission_rate: number;
    navigation_style?: 'topnav' | 'sidebar';
}

interface AppSettingsContextType {
    settings: AppSettings | null;
    isLoading: boolean;
    refreshSettings: () => Promise<void>;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('app_settings')
                .select('settings')
                .eq('id', 'global')
                .maybeSingle();

            if (error) throw error;
            if (data?.settings) {
                setSettings(data.settings as AppSettings);
            }
        } catch (error) {
            console.error('Error fetching app settings:', error);
            // Fallback default values
            setSettings({
                plan_names: {
                    free: 'Starter',
                    pro: 'Business',
                    business: 'Enterprise'
                },
                affiliate_commission_rate: 20,
                navigation_style: 'topnav'
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <AppSettingsContext.Provider value={{ settings, isLoading, refreshSettings: fetchSettings }}>
            {children}
        </AppSettingsContext.Provider>
    );
};

export const useAppSettings = () => {
    const context = useContext(AppSettingsContext);
    if (context === undefined) {
        throw new Error('useAppSettings must be used within an AppSettingsProvider');
    }
    return context;
};
