import React from 'react';
import { Hero } from './Hero';
import { BentoGrid } from './BentoGrid';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../lib/TenantContext';

/**
 * HomeView Component
 * The central "Assistant" view combining the Hero and BentoGrid.
 * Used in Landing, Public Tenant pages, and Dashboard Home.
 */
export const HomeView: React.FC = () => {
    const navigate = useNavigate();
    const { isAdmin } = useTenant();

    const handleNavigate = (view: string) => {
        // Map common views to their physical routes
        const routes: Record<string, string> = {
            'legal-procedures': '/legal-procedures',
            'halal-culture': '/halal-culture',
            'housing-guide': '/housing-guide',
            'admin': '/dashboard' // Admins go to dashboard for command center
        };

        const target = routes[view] || `/dashboard/${view}`;
        navigate(target);
    };

    return (
        <div className="page-enter">
            <Hero />
            <div className="mt-[-4rem] relative z-20">
                <BentoGrid onNavigate={handleNavigate} isAdmin={isAdmin} />
            </div>
        </div>
    );
};
