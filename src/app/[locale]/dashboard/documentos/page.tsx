"use client";

import { useState } from "react";
import { Folder, FileText, Search, MoreVertical, Send } from "lucide-react";

// Mock data - In real implementation, fetch from Supabase 'chat_logs' or 'documents' table
const mockDocuments = [
    { id: 1, title: "Multa de Tráfico - Madrid", date: "2024-02-10", type: "Chat", status: "Resolved" },
    { id: 2, title: "Renovación NIE", date: "2024-02-08", type: "PDF Analysis", status: "Pending" },
    { id: 3, title: "Contrato Alquiler", date: "2024-01-25", type: "Chat", status: "Resolved" },
];

export default function MyDocuments() {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-gray-900">Mis Documentos</h1>
                        <p className="text-gray-500 mt-2">Gestiona tus consultas legales y archivos.</p>
                    </div>
                    <button className="flex items-center gap-2 bg-[#229ED9] text-white px-4 py-2 rounded-lg hover:bg-[#1d8ebf] transition-colors text-sm font-medium">
                        <Send className="w-4 h-4" />
                        Conectar Telegram
                    </button>
                </header>

                {/* Filters & Search */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar documentos..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-brand-green/10 text-brand-green rounded-lg text-sm font-medium hover:bg-brand-green/20">
                            + Nueva Carpeta
                        </button>
                        <button className="px-4 py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-brand-green/90">
                            Subir Archivo
                        </button>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Folder Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-blue-100 transition-colors">
                                <Folder className="w-8 h-8 text-blue-500" />
                            </div>
                            <button className="text-gray-400 hover:text-gray-600">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>
                        <h3 className="font-semibold text-gray-900">Trámites Extranjería</h3>
                        <p className="text-sm text-gray-500 mt-1">4 archivos</p>
                    </div>

                    {/* Document Cards */}
                    {mockDocuments.map((doc) => (
                        <div key={doc.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-brand-green/5 p-3 rounded-lg group-hover:bg-brand-green/10 transition-colors">
                                    <FileText className="w-8 h-8 text-brand-green" />
                                </div>
                                <div className={`px-2 py-1 rounded text-xs font-medium ${doc.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {doc.status}
                                </div>
                            </div>
                            <h3 className="font-semibold text-gray-900 truncate">{doc.title}</h3>
                            <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                                <span>{doc.date}</span>
                                <span>{doc.type}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
