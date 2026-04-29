import React from 'react';
import { useTranslation } from 'react-i18next';

interface FooterBrandProps {
    config: any;
    tenantName: string;
}

const OptionalLogo = ({ href, src, alt, height }: { href?: string; src: string; alt: string; height: string }) => {
    const img = <img src={src} className={`${height} object-contain`} alt={alt} />;
    const wrap = 'opacity-40 hover:opacity-100 transition-opacity';
    return href
        ? <a href={href} target="_blank" rel="noopener noreferrer" className={wrap}>{img}</a>
        : <div className={wrap}>{img}</div>;
};

export const FooterBrand: React.FC<FooterBrandProps> = ({ config, tenantName }) => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center justify-center gap-3 w-full">
                {config.show_logo && config.logo_url
                    ? <img src={config.logo_url} alt={tenantName} className="h-10 w-auto object-contain" />
                    : <span className="text-xl font-black text-white tracking-tighter uppercase">{tenantName}</span>
                }
            </div>

            <p className="text-slate-500 text-sm leading-relaxed max-w-xs italic text-center">
                {config.description || t('tenant_page.hero_desc')}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4 w-full">
                {config.partner_logo_url  && <OptionalLogo href={config.partner_url}  src={config.partner_logo_url}  alt="Partner"          height="h-8"  />}
                {config.iso_logo_url      && <OptionalLogo href={config.iso_url}      src={config.iso_logo_url}      alt="ISO"               height="h-12" />}
                {config.extra_logo_url    && <OptionalLogo href={config.extra_url}    src={config.extra_logo_url}    alt="Logo Adicional"    height="h-8"  />}
                {config.extra_logo_url_2  && <OptionalLogo href={config.extra_url_2}  src={config.extra_logo_url_2}  alt="Logo Adicional 2"  height="h-8"  />}
            </div>
        </div>
    );
};
