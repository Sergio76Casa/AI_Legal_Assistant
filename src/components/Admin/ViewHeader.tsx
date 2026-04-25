import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ViewHeaderProps {
    icon: LucideIcon;
    title: string;
    subtitle?: string;
    badge?: string;
    badgeColor?: 'primary' | 'amber' | 'emerald' | 'blue';
    className?: string;
}

export const ViewHeader: React.FC<ViewHeaderProps> = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    badge,
    badgeColor = 'primary',
    className 
}) => {
    // Determine title parts if it contains spaces to apply italic style to the last word/part
    const titleParts = title.split(' ');
    const lastPart = titleParts.length > 1 ? titleParts.pop() : '';
    const mainTitle = titleParts.join(' ');

    const badgeStyles = {
        primary: 'bg-primary/5 text-primary border-primary/20',
        amber: 'bg-amber-500/5 text-amber-500 border-amber-500/20',
        emerald: 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20',
        blue: 'bg-blue-500/5 text-blue-500 border-blue-500/20',
    };

    return (
        <header className={cn("flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 mb-10 w-full max-w-7xl mx-auto", className)}>
            <div className="space-y-4">
                <div className="flex items-center gap-6">
                    {/* Icon Container with Glow */}
                    <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary shadow-[0_0_30px_rgba(19,236,200,0.15)] border border-primary/20 shrink-0">
                        <Icon size={32} />
                    </div>
                    
                    <div>
                        <h2 className="text-4xl font-black text-white tracking-tighter leading-none flex flex-wrap gap-x-3 items-baseline">
                            <span>{mainTitle}</span>
                            {lastPart && (
                                <span className="text-primary italic tracking-normal font-serif">
                                    {lastPart}
                                </span>
                            )}
                        </h2>
                        {subtitle && (
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.3em] mt-3">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {badge && (
                <div className={cn(
                    "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] border shadow-2xl backdrop-blur-md shrink-0",
                    badgeStyles[badgeColor]
                )}>
                    ● {badge}
                </div>
            )}
        </header>
    );
};
