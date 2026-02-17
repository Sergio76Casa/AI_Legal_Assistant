import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Globe, FileText, TrendingUp } from 'lucide-react';

interface CountryStats {
    country: string;
    userCount: number;
    documentCount: number;
}

export const StatsPanel: React.FC = () => {
    const [stats, setStats] = useState<CountryStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalDocs, setTotalDocs] = useState(0);

    const countryNames: Record<string, string> = {
        'ES': '🇪🇸 España', 'FR': '🇫🇷 Francia', 'GB': '🇬🇧 Reino Unido',
        'DE': '🇩🇪 Alemania', 'IT': '🇮🇹 Italia', 'MA': '🇲🇦 Marruecos',
        'DZ': '🇩🇿 Argelia', 'TN': '🇹🇳 Túnez', 'PK': '🇵🇰 Pakistán',
        'IN': '🇮🇳 India', 'BD': '🇧🇩 Bangladesh', 'CN': '🇨🇳 China',
        'TR': '🇹🇷 Turquía', 'EG': '🇪🇬 Egipto', 'SA': '🇸🇦 Arabia Saudita',
        'AE': '🇦🇪 Emiratos', 'US': '🇺🇸 Estados Unidos', 'CA': '🇨🇦 Canadá',
        'MX': '🇲🇽 México', 'BR': '🇧🇷 Brasil', 'AR': '🇦🇷 Argentina', 'CO': '🇨🇴 Colombia'
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Obtener documentos por país
            const { data: docs } = await supabase
                .from('documents')
                .select('country');

            // Contar por país
            const countryMap: Record<string, { userCount: number; documentCount: number }> = {};

            docs?.forEach(doc => {
                const country = doc.country || 'ES';
                if (!countryMap[country]) {
                    countryMap[country] = { userCount: 0, documentCount: 0 };
                }
                countryMap[country].documentCount++;
            });

            const statsArray = Object.entries(countryMap).map(([country, data]) => ({
                country,
                userCount: data.userCount,
                documentCount: data.documentCount
            })).sort((a, b) => b.documentCount - a.documentCount);

            setStats(statsArray);
            setTotalDocs(docs?.length || 0);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching stats:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
                <Globe className="w-8 h-8 text-emerald-600" />
                <h2 className="text-2xl font-bold text-slate-900">Estadísticas por Región</h2>
            </div>

            {/* Resumen Global */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-6 h-6 text-emerald-700" />
                        <span className="text-sm font-medium text-emerald-700">Total Documentos</span>
                    </div>
                    <p className="text-3xl font-bold text-emerald-900">{totalDocs}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-6 h-6 text-blue-700" />
                        <span className="text-sm font-medium text-blue-700">Países Activos</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-900">{stats.length}</p>
                </div>
            </div>

            {/* Tabla de Países */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">
                    Distribución por País
                </h3>
                {stats.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No hay datos disponibles</p>
                ) : (
                    stats.map((stat) => (
                        <div
                            key={stat.country}
                            className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-semibold text-slate-700">
                                    {countryNames[stat.country] || stat.country}
                                </span>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-xs text-slate-500">Documentos</p>
                                    <p className="text-lg font-bold text-emerald-600">{stat.documentCount}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
