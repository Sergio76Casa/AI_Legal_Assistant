import React from 'react';
import { FileText, Calendar, AlertCircle, ShieldCheck, ExternalLink, PenSquare, ArrowRight } from 'lucide-react';
import { ComplianceDocument } from '../../hooks/useComplianceDocs';
import { cn } from '../../lib/utils';
import { format, parseISO, isBefore, addDays } from 'date-fns';

interface ComplianceDocsListProps {
    documents: ComplianceDocument[];
    onSign: (doc: any) => void;
    onView: (doc: any) => void;
}

export const ComplianceDocsList: React.FC<ComplianceDocsListProps> = ({ documents, onSign, onView }) => {
    
    const getStatusStyles = (expiryDate: string | null) => {
        if (!expiryDate) return "bg-slate-500/10 text-slate-400 border-slate-500/20";
        const date = parseISO(expiryDate);
        const now = new Date();
        if (isBefore(date, now)) return "bg-red-500/10 text-red-400 border-red-500/20";
        if (isBefore(date, addDays(now, 30))) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    };

    const getDocIcon = (type: string) => {
        switch (type) {
            case 'sanitation': return <ShieldCheck className="text-emerald-400" size={20} />;
            case 'insurance': return <ShieldCheck className="text-blue-400" size={20} />;
            case 'energy': return <FileText className="text-amber-400" size={20} />;
            default: return <FileText className="text-slate-400" size={20} />;
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.length === 0 ? (
                <div className="col-span-full py-12 text-center bg-white/5 rounded-3xl border border-white/5 italic text-slate-500">
                    No hay documentos de cumplimiento registrados en este portal.
                </div>
            ) : documents.map((doc) => (
                <div 
                    key={doc.id}
                    className="group bg-white/5 border border-white/10 rounded-[32px] p-6 hover:bg-white/[0.07] transition-all hover:scale-[1.01] active:scale-[0.99] border-t-white/10"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 group-hover:border-primary/30 transition-colors">
                            {getDocIcon(doc.type)}
                        </div>
                        <div className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                            doc.status === 'signed' ? "bg-primary/20 text-primary border-primary/30" : getStatusStyles(doc.expiry_date)
                        )}>
                            {doc.status === 'signed' ? 'Certificado' : (doc.expiry_date ? (isBefore(parseISO(doc.expiry_date), new Date()) ? 'Expirado' : 'Activo') : 'Permanente')}
                        </div>
                    </div>

                    <h4 className="text-lg font-bold text-white mb-1 truncate">{doc.name}</h4>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-6">
                        <Calendar size={12} />
                        {doc.expiry_date ? `Vence: ${format(parseISO(doc.expiry_date), 'dd MMMM, yyyy')}` : 'Sin vencimiento'}
                    </p>

                    <div className="flex items-center gap-2 mt-auto">
                        {doc.status === 'signed' ? (
                            <button 
                                className="flex-1 py-3 px-4 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                onClick={() => onView(doc)}
                            >
                                <ShieldCheck size={14} />
                                Ver Certificado
                            </button>
                        ) : (
                            <button 
                                className="flex-1 py-3 px-4 bg-primary/10 hover:bg-primary text-primary hover:text-slate-900 border border-primary/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                onClick={() => onSign(doc)}
                            >
                                <PenSquare size={14} />
                                Firmar
                            </button>
                        )}
                        <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
                            <ExternalLink size={14} />
                        </button>
                    </div>
                </div>
            ))}

            {/* Quick Actions Card */}
            <div className="bg-gradient-to-br from-primary/10 to-indigo-500/10 border border-primary/20 rounded-[32px] p-6 flex flex-col justify-center items-center text-center gap-4 cursor-pointer hover:scale-[1.01] transition-all group">
                <div className="w-12 h-12 bg-primary text-slate-900 rounded-full flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
                    <ArrowRight size={24} />
                </div>
                <div>
                    <h4 className="text-white font-bold">Nuevo Documento</h4>
                    <p className="text-xs text-slate-400 mt-1">Añadir RCA, Sanidad o Seguros</p>
                </div>
            </div>
        </div>
    );
};
