import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFooterLogic } from '../hooks/useFooterLogic';
import { FooterBrand } from './DynamicFooter/FooterBrand';
import { FooterLinkColumn } from './DynamicFooter/FooterLinkColumn';
import { FooterContact } from './DynamicFooter/FooterContact';
import { FooterLinkModal } from './DynamicFooter/FooterLinkModal';

interface DynamicFooterProps {
    tenant?: any;
    onOpenLegal?: (type: 'privacy' | 'cookies' | 'legal') => void;
    onOpenService?: (type: 'documents' | 'templates' | 'organization' | 'affiliates') => void;
}

export const DynamicFooter: React.FC<DynamicFooterProps> = ({ tenant: propTenant, onOpenLegal, onOpenService }) => {
    const { t } = useTranslation();
    const f = useFooterLogic(propTenant);

    if (!f.tenant) return null;

    return (
        <footer className="w-full bg-[#0a0f1d] pt-20 pb-12 border-t border-white/5">
            <div className="mx-auto max-w-6xl px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

                    <FooterBrand config={f.config} tenantName={f.tenant.name} />

                    <FooterLinkColumn
                        title={t('footer.sections.services')}
                        links={f.finalServices}
                        defaultIconName="FileText"
                        getLocalized={f.getLocalized}
                        onLinkClick={(link) =>
                            link.isAction ? onOpenService?.(link.url) : f.setActiveModal(link)
                        }
                    />

                    <FooterLinkColumn
                        title={t('footer.sections.legal')}
                        links={f.finalLegal}
                        defaultIconName="ShieldCheck"
                        getLocalized={f.getLocalized}
                        onLinkClick={(link) =>
                            link.isLegal ? onOpenLegal?.(link.url) : f.setActiveModal(link)
                        }
                    />

                    <FooterContact config={f.config} offices={f.offices} social={f.social} />
                </div>

                <div className="mt-20 pt-8 border-t border-white/5 text-center">
                    <p className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.3em]">
                        &copy; {new Date().getFullYear()} {f.tenant.name} • {t('footer.rights')}
                    </p>
                </div>
            </div>

            <FooterLinkModal
                activeModal={f.activeModal}
                onClose={() => f.setActiveModal(null)}
                getLocalized={f.getLocalized}
            />
        </footer>
    );
};
