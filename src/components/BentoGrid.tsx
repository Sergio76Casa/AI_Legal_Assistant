import React from 'react';
import { FileText, Home, Heart, ArrowUpRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

interface ServiceCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    className?: string;
    colorClass: string;
    onClick?: () => void;
}

function ServiceCard({ title, description, icon, className, colorClass, onClick }: ServiceCardProps) {
    const { t } = useTranslation();
    return (
        <div
            onClick={onClick}
            className={cn("group relative p-8 rounded-3xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 overflow-hidden cursor-pointer border border-white/10", className, colorClass)}
        >
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300 scale-150 rotate-12 text-current">
                {icon}
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4 border border-white/10 text-primary">
                        {icon}
                    </div>
                    <h3 className="font-serif text-2xl text-white mb-2">{title}</h3>
                    <p className="text-slate-400 leading-relaxed font-light">{description}</p>
                </div>

                <div className="flex items-center text-sm font-medium text-slate-500 opacity-60 group-hover:opacity-100 group-hover:text-primary transition-all">
                    <span>{t('bento.explore')}</span>
                    <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
            </div>
        </div>
    );
}

export function BentoGrid({ onNavigate }: { onNavigate: (view: any) => void }) {
    const { t } = useTranslation();
    return (
        <section className="px-6 pb-32 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[400px]">
                {/* Legal Card */}
                <ServiceCard
                    title={t('bento.legal_title')}
                    description={t('bento.legal_desc')}
                    icon={<FileText className="w-6 h-6" />}
                    className="md:col-span-2 bg-white/5"
                    colorClass="hover:bg-primary/5 hover:border-primary/30"
                    onClick={() => onNavigate('legal-procedures')}
                />

                {/* Halal/Culture Card */}
                <ServiceCard
                    title={t('bento.halal_title')}
                    description={t('bento.halal_desc')}
                    icon={<Heart className="w-6 h-6" />}
                    className="bg-white/5"
                    colorClass="hover:bg-amber-500/5 hover:border-amber-500/30"
                    onClick={() => onNavigate('halal-culture')}
                />

                {/* Housing Card */}
                <ServiceCard
                    title={t('bento.rent_title')}
                    description={t('bento.rent_desc')}
                    icon={<Home className="w-6 h-6" />}
                    className="bg-white/5"
                    colorClass="hover:bg-blue-500/5 hover:border-blue-500/30"
                    onClick={() => onNavigate('housing-guide')}
                />

                {/* Community Card */}
                <div
                    onClick={() => alert('🚀 ¡Próximamente! Estamos preparando la comunidad exclusiva en Telegram.')}
                    className="md:col-span-2 relative p-8 rounded-3xl bg-primary overflow-hidden group cursor-pointer border border-primary/50"
                >
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-20 group-hover:scale-105 transition-transform duration-700"></div>
                    <div className="relative z-10 flex flex-col justify-center h-full max-w-lg">
                        <h3 className="font-serif text-3xl mb-4 text-white">{t('bento.community_title')}</h3>
                        <p className="text-primary-foreground/70 text-lg font-light mb-8">{t('bento.community_desc')}</p>
                        <button className="self-start px-6 py-3 bg-slate-900 text-primary rounded-full font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-xl">
                            {t('bento.community_btn')}
                            <span className="text-xs bg-blue-400/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/20">Telegram</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
