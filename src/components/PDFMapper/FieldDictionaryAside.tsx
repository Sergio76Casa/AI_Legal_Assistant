import { cn } from '../../lib/utils';
import type { AvailableField } from './types';

interface FieldDictionaryAsideProps {
    fieldGroups: Record<string, AvailableField[]>;
    mobileLayer: 'pdf' | 'fields' | 'config';
}

export const FieldDictionaryAside: React.FC<FieldDictionaryAsideProps> = ({ fieldGroups, mobileLayer }) => {
    return (
        <aside className={cn(
            "w-72 bg-[#0A0F1D]/60 border-r border-white/5 flex flex-col transition-all duration-300",
            mobileLayer === 'fields' ? "flex fixed inset-0 z-40 bg-[#020617] pt-16" : "hidden xl:flex h-full"
        )}>
            <div className="p-6 border-b border-white/5 shrink-0">
                <h3 className="text-white font-bold text-sm tracking-tight mb-1">Diccionario de Campos</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Smart Binding Available</p>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scrollbar-thin">
                {Object.entries(fieldGroups).map(([group, fields]) => (
                    <div key={group} className="space-y-2">
                        <h4 className="px-2 text-[9px] font-black text-primary/50 uppercase tracking-[0.2em]">{group}</h4>
                        <div className="space-y-1">
                            {fields.map(f => (
                                <div key={f.key} className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-[11px] font-bold text-slate-300 hover:border-primary/20 hover:bg-primary/5 transition-all cursor-default">
                                    {f.label}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                <div className="h-32 lg:h-10" />
            </div>
        </aside>
    );
};
