import React, { useState } from 'react';
import { useCompliance } from '../../hooks/useCompliance';
import { useComplianceDocs } from '../../hooks/useComplianceDocs';
import { Shield, Zap, AlertTriangle, CheckCircle2, Loader2, Play, XCircle, LayoutGrid } from 'lucide-react';
import { useSignatureEvents } from '../../hooks/useSignatureEvents';
import { format, parseISO } from 'date-fns';
import { cn } from '../../lib/utils';
import { ComplianceDocsList } from './ComplianceDocsList';
import { SignDocumentModal } from '../Signature/SignDocumentModal';
import { ViewHeader } from './ViewHeader';

interface ComplianceTabProps {
    tenantId: string;
}

export const ComplianceTab: React.FC<ComplianceTabProps> = ({ tenantId }) => {
    const { assets, loading: loadingAssets, analyzeWithAI } = useCompliance(tenantId);
    const { documents, fetchDocuments } = useComplianceDocs();
    const { generateEvidencePDF } = useSignatureEvents();
    
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);
    const [report, setReport] = useState<string | null>(null);
    
    // Modal states
    const [isSignModalOpen, setIsSignModalOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<any>(null);

    const handleAnalyze = async (asset: any) => {
        setAnalyzingId(asset.id);
        setReport(null);
        const result = await analyzeWithAI(asset);
        if (result && result.success) {
            setReport(result.recommendation || 'No hay recomendaciones.');
        } else if (result) {
            alert(result.message);
        }
        setAnalyzingId(null);
    };

    const handleSignRequest = (doc: any) => {
        setSelectedDoc({
            id: doc.id,
            title: `Autorización: ${doc.name}`,
            assetName: doc.name,
            assetId: doc.id,
            signerName: 'Administrador Stark'
        });
        setIsSignModalOpen(true);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'critical': return <AlertTriangle className="text-red-400" size={18} />;
            case 'warning': return <Zap className="text-amber-400" size={18} />;
            default: return <CheckCircle2 className="text-primary" size={18} />;
        }
    };

    return (
        <div className="page-enter space-y-12">
            <ViewHeader 
                icon={Shield} 
                title="Compliance Global" 
                subtitle="Control de OCAs, CIE y Optimización IA"
                badge="Protocolo Seguro"
                badgeColor="blue"
            />

            <div className="max-w-7xl mx-auto px-4 pb-20 space-y-12">
                {/* 1. SECCIÓN: CONTROL DE SUMINISTROS (IA e INDUSTRIA) */}
            <div className="space-y-6">
                {report && (
                    <div className="p-8 bg-primary/10 border border-primary/20 rounded-[32px] relative animate-in zoom-in-95 duration-300">
                        <button onClick={() => setReport(null)} className="absolute top-6 right-6 text-primary hover:text-white">
                            <XCircle size={24} />
                        </button>
                        <div className="prose prose-invert max-w-none">
                            <div className="whitespace-pre-wrap text-slate-200 leading-relaxed font-medium">
                                {report}
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-[#0A0F1D]/50 backdrop-blur-xl rounded-[40px] border border-white/5 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                                <th className="px-8 py-5">Activo / Local</th>
                                <th className="px-8 py-5">Riesgo</th>
                                <th className="px-8 py-5">Próx. OCA</th>
                                <th className="px-8 py-5">Caducidad CIE</th>
                                <th className="px-8 py-5 text-right">Acciones IA</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loadingAssets ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <Loader2 className="animate-spin mx-auto text-primary mb-4" size={32} />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Sincronizando con Ministerio de Industria...</p>
                                    </td>
                                </tr>
                            ) : assets.map((asset) => (
                                <tr key={asset.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-6">
                                        <div>
                                            <p className="font-bold text-white text-base">{asset.name}</p>
                                            <p className="text-[10px] text-slate-600 font-mono mt-0.5 tracking-tighter capitalize">CUPS: {asset.cups}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={cn(
                                            "inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                            asset.status === 'critical' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                            asset.status === 'warning' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                            "bg-primary/10 text-primary border-primary/20"
                                        )}>
                                            {getStatusIcon(asset.status)}
                                            {asset.status === 'critical' ? 'Crítico' : asset.status === 'warning' ? 'Aviso' : 'Óptimo'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-medium text-slate-400">
                                        {asset.oca_expiry ? format(parseISO(asset.oca_expiry), 'dd/MM/yyyy') : '---'}
                                    </td>
                                    <td className="px-8 py-6 text-sm font-medium text-slate-400">
                                        {asset.cie_expiry ? format(parseISO(asset.cie_expiry), 'dd/MM/yyyy') : '---'}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            onClick={() => handleAnalyze(asset)}
                                            disabled={!!analyzingId}
                                            className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary hover:bg-primary hover:text-slate-900 rounded-xl transition-all border border-primary/20"
                                        >
                                            {analyzingId === asset.id ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                                            <span className="ml-2">Analizar IA</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 2. SECCIÓN: PORTAL DOCUMENTAL Y FIRMAS */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
                            <LayoutGrid size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight uppercase">
                                Centro de Documentación
                            </h3>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Seguros RC, Sanidad y Certificados Legales</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                        <Shield size={14} className="text-indigo-500" />
                        <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Almacén Encriptado Stark</span>
                    </div>
                </div>

                <ComplianceDocsList 
                    documents={documents} 
                    onSign={handleSignRequest}
                    onView={(doc) => {
                        if (doc.signature_url) {
                            generateEvidencePDF(doc.signature_url, {
                                title: `Certificado: ${doc.name}`,
                                assetName: doc.name,
                                assetId: doc.id,
                                signerName: doc.signer_name || 'Administrador Stark'
                            });
                        }
                    }}
                />
            </div>

            {/* Modal de Firma */}
            {selectedDoc && (
                <SignDocumentModal 
                    isOpen={isSignModalOpen}
                    onClose={() => setIsSignModalOpen(false)}
                    documentData={selectedDoc}
                    onComplete={fetchDocuments}
                />
            )}
            </div>
        </div>
    );
};
