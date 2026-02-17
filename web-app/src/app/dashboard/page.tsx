'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, LayoutDashboard, Settings, User, LogOut, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ChatWidget from '@/components/ChatWidget';

export default function Dashboard() {
    const { user, session, loading, signOut } = useAuth();
    const router = useRouter();
    const [isUploading, setIsUploading] = useState(false);
    const [files, setFiles] = useState<Array<{ id: number | string, name: string, status: string, date: string }>>([
        { id: 'demo-1', name: 'Contrato_Alquiler_Madrid.pdf', status: 'Analizado', date: '10 Feb 2026' },
        { id: 'demo-2', name: 'Permiso_Residencia.jpg', status: 'Pendiente', date: '11 Feb 2026' },
    ]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#050505] text-white">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 bg-black/50 backdrop-blur-xl flex flex-col p-6">
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center">
                        <span className="font-bold text-sm">HL</span>
                    </div>
                    <span className="font-bold tracking-tight">HALAL<span className="text-purple-500">LEGAL</span></span>
                </div>

                <nav className="flex-1 space-y-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl text-purple-400 font-medium">
                        <LayoutDashboard className="w-5 h-5" /> Dashboard
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl text-gray-400 transition-colors">
                        <FileText className="w-5 h-5" /> Mis Documentos
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl text-gray-400 transition-colors">
                        <User className="w-5 h-5" /> Perfil
                    </button>
                </nav>

                <div className="mt-auto space-y-4">
                    <div className="p-4 bg-purple-600/10 border border-purple-500/20 rounded-2xl text-xs">
                        <p className="text-purple-400 font-bold mb-1">Plan Free</p>
                        <p className="text-gray-400">Te quedan 3 consultas gratis este mes.</p>
                    </div>
                    <button
                        onClick={signOut}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400/70 hover:text-red-400 transition-colors"
                    >
                        <LogOut className="w-5 h-5" /> Salir
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-12 relative">
                {/* Background Gradients */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none"></div>

                <header className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Bienvenido, {user.email?.split('@')[0]}</h1>
                        <p className="text-gray-400">Gestiona tus documentos y obtén análisis legal instantáneo.</p>
                    </div>
                    <button
                        onClick={() => setIsUploading(true)}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-xl font-bold transition-all shadow-lg"
                    >
                        <Upload className="w-5 h-5" /> Subir PDF / Foto
                    </button>
                </header>

                {/* Upload Area Modal (Simulation) */}
                {isUploading && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-[#0f0f0f] border border-white/10 p-12 rounded-3xl max-w-xl w-full text-center relative"
                        >
                            <button onClick={() => setIsUploading(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white">✕</button>
                            <div className="w-20 h-20 bg-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-500/30">
                                <Upload className="w-10 h-10 text-purple-400" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Sube tus documentos</h2>
                            <p className="text-gray-400 mb-8 text-sm">Arrastra aquí tus PDFs para que nuestra IA los analice.</p>

                            <input
                                type="file"
                                accept=".pdf"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    // Upload logic
                                    const formData = new FormData();
                                    formData.append('file', file);

                                    try {
                                        // Update UI to show processing
                                        const newFile = { id: Date.now(), name: file.name, status: 'Procesando...', date: new Date().toLocaleDateString() };
                                        setFiles(prev => [newFile, ...prev]);
                                        setIsUploading(false);

                                        const res = await fetch('/api/documents/upload', {
                                            method: 'POST',
                                            headers: {
                                                'Authorization': `Bearer ${session?.access_token || ''}`
                                            },
                                            body: formData
                                        });

                                        if (res.ok) {
                                            setFiles(prev => prev.map(f => f.id === newFile.id ? { ...f, status: 'Analizado' } : f));
                                        } else {
                                            setFiles(prev => prev.map(f => f.id === newFile.id ? { ...f, status: 'Error' } : f));
                                            console.error('Upload failed');
                                        }
                                    } catch (error) {
                                        console.error('Error uploading:', error);
                                    }
                                }}
                                className="hidden"
                                id="file-upload"
                            />
                            <label
                                htmlFor="file-upload"
                                className="block border-2 border-dashed border-white/10 rounded-2xl py-12 mb-8 hover:border-purple-500/30 transition-colors cursor-pointer"
                            >
                                <span className="text-gray-500">Haz clic para seleccionar un PDF</span>
                            </label>

                            {/* Old button removed or repurposed */}
                        </motion.div>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 mb-12">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                        <p className="text-gray-400 text-sm mb-1">Documentos Analizados</p>
                        <p className="text-3xl font-bold">12</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                        <p className="text-gray-400 text-sm mb-1">Cumplimiento Halal</p>
                        <p className="text-3xl font-bold text-green-400">100%</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                        <p className="text-gray-400 text-sm mb-1">Consultas Restantes</p>
                        <p className="text-3xl font-bold text-purple-400">3</p>
                    </div>
                </div>

                {/* Documents Table */}
                <section>
                    <h2 className="text-xl font-bold mb-6">Actividad Reciente</h2>
                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 text-xs uppercase tracking-widest text-gray-500">
                                    <th className="px-6 py-4">Documento</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {files.map((file) => (
                                    <tr key={file.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-blue-400" /> {file.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${file.status === 'Analizado' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                                {file.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">{file.date}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={async () => {
                                                    // Simulation of Edge Function Call
                                                    alert(`Iniciando análisis de contrato para: ${file.name}\n(Esta funcionalidad requiere desplegar la Edge Function 'analyze-contract')`);

                                                    // Real call would be:
                                                    /*
                                                    const { data, error } = await supabase.functions.invoke('analyze-contract', {
                                                        body: { documentId: file.id }
                                                    });
                                                    */
                                                }}
                                                className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-2"
                                            >
                                                <Settings className="w-4 h-4" /> Analizar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <ChatWidget />
            </main>
        </div>
    );
}
