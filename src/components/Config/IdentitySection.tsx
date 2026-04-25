import React from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Upload, Loader2, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

interface IdentitySectionProps {
    identity: any;
    setIdentity: (data: any) => void;
    uploadingField: string | null;
    handleFileUpload: (field: string, file: File, onSuccess: (url: string) => void) => void;
}

export const IdentitySection: React.FC<IdentitySectionProps> = ({ 
    identity, 
    setIdentity, 
    uploadingField, 
    handleFileUpload 
}) => {
    const handleUpdate = (field: string, value: any) => {
        setIdentity({ ...identity, [field]: value });
    };

    return (
        <div className="p-6 md:p-8 pt-0 border-t border-white/5 relative">
            {/* Animated background glow */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <ImageIcon size={180} className="text-primary" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-6 relative z-10">
                <div className="space-y-6">
                    <div className="flex flex-col gap-2 group">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-primary transition-colors">
                            Nombre de la Organización
                        </label>
                        <input
                            type="text"
                            value={identity.name}
                            onChange={e => handleUpdate('name', e.target.value)}
                            className="w-full bg-slate-900/40 border border-white/10 hover:border-primary/30 rounded-2xl px-4 py-3.5 text-sm font-medium text-white focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all placeholder:text-slate-700 shadow-inner"
                            placeholder="Ej. Acme Corp Lawyers"
                        />
                    </div>

                    <div className="flex flex-col gap-2 group">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-primary transition-colors">
                            Eslogan / Descripción Breve
                        </label>
                        <textarea
                            value={identity.description}
                            onChange={e => handleUpdate('description', e.target.value)}
                            rows={3}
                            className="w-full bg-slate-900/40 border border-white/10 hover:border-primary/30 rounded-2xl px-4 py-3.5 text-sm font-medium text-white focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all resize-none placeholder:text-slate-700 shadow-inner"
                            placeholder="Un despacho de abogados innovador..."
                        />
                    </div>

                    <div className="flex items-center justify-between gap-4 p-5 bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/5 hover:border-primary/20 transition-all group/toggle">
                        <div>
                            <p className="text-sm font-bold text-white group-hover/toggle:text-primary transition-colors">Mostrar Logo en el Footer</p>
                            <p className="text-xs text-slate-500 mt-1">Si se desactiva, renderiza el nombre en texto plano.</p>
                        </div>
                        <button
                            onClick={() => handleUpdate('show_logo', !identity.show_logo)}
                            className={cn(
                                "w-14 h-7 rounded-full transition-all relative flex items-center px-1 shrink-0",
                                identity.show_logo ? "bg-primary shadow-[0_0_15px_rgba(var(--primary),0.4)]" : "bg-slate-800"
                            )}
                        >
                            <motion.div
                                layout
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className={cn("w-5 h-5 rounded-full bg-white shadow-md z-10", identity.show_logo ? "ml-auto" : "ml-0")}
                            />
                        </button>
                    </div>

                    <div className="flex items-center justify-between gap-4 p-5 bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/5 hover:border-primary/20 transition-all group/toggle">
                        <div>
                            <p className="text-sm font-bold text-white group-hover/toggle:text-primary transition-colors">Mostrar Logo en el Navbar</p>
                            <p className="text-xs text-slate-500 mt-1">Si se desactiva, renderiza el nombre en texto plano en la cabecera.</p>
                        </div>
                        <button
                            onClick={() => handleUpdate('show_navbar_logo', !identity.show_navbar_logo)}
                            className={cn(
                                "w-14 h-7 rounded-full transition-all relative flex items-center px-1 shrink-0",
                                identity.show_navbar_logo ? "bg-primary shadow-[0_0_15px_rgba(var(--primary),0.4)]" : "bg-slate-800"
                            )}
                        >
                            <motion.div
                                layout
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className={cn("w-5 h-5 rounded-full bg-white shadow-md z-10", identity.show_navbar_logo ? "ml-auto" : "ml-0")}
                            />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {[
                        { id: 'logo_url', label: 'Logo Principal' },
                        { id: 'partner_logo_url', label: 'Logo Partner', showUrl: true, urlKey: 'partner_url' },
                        { id: 'iso_logo_url', label: 'Sello Calidad / ISO', showUrl: true, urlKey: 'iso_url' },
                        { id: 'extra_logo_url', label: 'Logo Adicional', showUrl: true, urlKey: 'extra_url' },
                        { id: 'extra_logo_url_2', label: 'Logo Adicional 2', showUrl: true, urlKey: 'extra_url_2' }
                    ].map((asset) => (
                        <div key={asset.id} className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                {asset.label}
                                {asset.id === 'partner_logo_url' && <Info size={10} className="text-primary/40" />}
                            </label>
                            <div className="relative aspect-video rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden group/img hover:border-primary/40 transition-all shadow-inner">
                                {identity[asset.id] ? (
                                    <img src={identity[asset.id]} className="w-full h-full object-contain p-4 group-hover/img:scale-110 transition-transform duration-500" alt={asset.label} />
                                ) : (
                                    <ImageIcon className="text-slate-800 group-hover/img:text-primary/20 transition-colors" size={32} />
                                )}
                                <label className="absolute inset-0 bg-primary/20 backdrop-blur-sm opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center cursor-pointer">
                                    {uploadingField === asset.id ? (
                                        <Loader2 size={24} className="animate-spin text-white" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <Upload size={24} className="text-white" />
                                            <span className="text-[10px] font-black text-white uppercase tracking-tighter">Subir</span>
                                        </div>
                                    )}
                                    <input type="file" className="hidden" accept="image/*" onChange={e => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(asset.id, file, (url) => handleUpdate(asset.id, url));
                                    }} />
                                </label>
                            </div>
                            {asset.showUrl && (
                                <input
                                    type="text"
                                    placeholder="Enlace (Opcional)"
                                    value={identity[asset.urlKey!]}
                                    onChange={e => handleUpdate(asset.urlKey!, e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-slate-400 focus:ring-1 focus:ring-primary/30 focus:border-primary/30 outline-none transition-all"
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
