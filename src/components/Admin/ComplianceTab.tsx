import React, { useState } from 'react';
import { useCompliance } from '../../hooks/useCompliance';
import { Shield, Zap, AlertTriangle, CheckCircle2, Languages, RefreshCw, Loader2, Play, XCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '../../lib/utils';

interface ComplianceTabProps {
    tenantId: string;
}

export const ComplianceTab: React.FC<ComplianceTabProps> = ({ tenantId }) => {
    const { assets, loading, fetchAssets, analyzeWithAI } = useCompliance(tenantId);
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);
    const [report, setReport] = useState<string | null>(null);

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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'critical': return <AlertTriangle className="text-red-400" size={18} />;
            case 'warning': return <Zap className="text-amber-400" size={18} />;
            default: return <CheckCircle2 className="text-primary" size={18} />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'critical': return 'Crítico (Revisión Urgente)';
            case 'warning': return 'Atención (Próx. Caducidad)';
            default: return 'Al día';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* AI Report Modal/Alert */}
            {report && (
                <div className="mb-6 p-6 bg-primary/10 border border-primary/20 rounded-2xl relative animate-in zoom-in-95 duration-300">
                    <button 
                        onClick={() => setReport(null)}
                        className="absolute top-4 right-4 text-primary hover:text-white"
                    >
                        <XCircle size={20} />
                    </button>
                    <div className="prose prose-invert max-w-none">
                        <div className="whitespace-pre-wrap text-slate-200">
                            {report}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/10">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Shield className="text-primary" />
                        Compliance Eléctrico e Industria
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">Control de OCAs, Boletines (CIE) y Eficiencia Energética para Legal AI Global.</p>
                </div>
                <button 
                    onClick={() => fetchAssets()}
                    className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all border border-white/5"
                >
                    <RefreshCw size={20} className={cn(loading && "animate-spin")} />
                </button>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-sm border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-white/10">
                                <th className="px-6 py-4">Activo / Local</th>
                                <th className="px-6 py-4">Semáforo de Riesgo</th>
                                <th className="px-6 py-4">Próx. OCA</th>
                                <th className="px-6 py-4">Caducidad CIE</th>
                                <th className="px-6 py-4">Idioma IA</th>
                                <th className="px-6 py-4 text-right">Acciones IA</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <Loader2 className="animate-spin mx-auto text-primary mb-4" size={32} />
                                        <p className="text-slate-400 italic">Cargando activos técnicos...</p>
                                    </td>
                                </tr>
                            ) : assets.map((asset) => (
                                <tr key={asset.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-bold text-white">{asset.name}</p>
                                            <p className="text-xs text-slate-500 font-mono mt-0.5">{asset.cups}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={cn(
                                            "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                            asset.status === 'critical' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                            asset.status === 'warning' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                            "bg-primary/10 text-primary border-primary/20"
                                        )}>
                                            {getStatusIcon(asset.status)}
                                            {getStatusText(asset.status)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-300">
                                        {asset.oca_expiry ? format(parseISO(asset.oca_expiry), 'dd/MM/yyyy') : 'No registrada'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-300">
                                        {asset.cie_expiry ? format(parseISO(asset.cie_expiry), 'dd/MM/yyyy') : 'No registrado'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Languages size={14} />
                                            <span className="text-xs uppercase font-bold">{asset.preferred_language}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleAnalyze(asset)}
                                            disabled={!!analyzingId}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-bold bg-primary/10 text-primary hover:bg-primary hover:text-slate-900 rounded-lg transition-all border border-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Analizar Eficiencia y Notificaciones"
                                        >
                                            {analyzingId === asset.id ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                                            Analizar con IA
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!loading && assets.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                                        No hay activos eléctricos registrados para esta organización.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Info Cards */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-6 rounded-2xl border border-white/10">
                    <h4 className="font-bold text-white flex items-center gap-2 mb-2">
                        <Languages className="text-indigo-400" />
                        Traducción Automática de Notificaciones
                    </h4>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        Nuestro motor de Legal AI Global detecta notificaciones técnicas de industria y las traduce instantáneamente a Chino, Árabe o Urdu según la preferencia del cliente, manteniendo el rigor legal técnico.
                    </p>
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-emerald-500/10 p-6 rounded-2xl border border-white/10">
                    <h4 className="font-bold text-white flex items-center gap-2 mb-2">
                        <Zap className="text-primary" />
                        Optimización de Potencia
                    </h4>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        Analizamos el histórico de consumos para detectar potencias sobredimensionadas. Una alerta "Amarilla" puede indicar una oportunidad de ahorro de hasta el 20% en el término fijo.
                    </p>
                </div>
            </div>
        </div>
    );
};
