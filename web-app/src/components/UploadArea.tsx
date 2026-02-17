'use client';

import React from 'react';
import { Upload } from 'lucide-react';

export default function UploadArea({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#0f0f0f] border border-white/10 p-12 rounded-3xl max-w-xl w-full text-center relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white">✕</button>
                <div className="w-20 h-20 bg-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-500/30">
                    <Upload className="w-10 h-10 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Análisis de Documentos</h2>
                <p className="text-gray-400 mb-8 text-sm">Nuestra IA analizará la legalidad y cumplimiento cultural de tus PDFs o fotos de forma privada.</p>
                <label className="border-2 border-dashed border-white/10 rounded-2xl py-12 mb-8 hover:border-purple-500/30 transition-colors cursor-pointer block">
                    <input type="file" className="hidden" />
                    <span className="text-gray-500">Arrastra o haz clic para subir</span>
                </label>
                <button className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors">Empezar Análisis</button>
            </div>
        </div>
    );
}
