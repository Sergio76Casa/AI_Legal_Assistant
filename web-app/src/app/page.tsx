'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, ArrowRight, ShieldCheck, Globe, Scale, Upload } from 'lucide-react';

/**
 * Landing Page: Dark Space Edition
 * Estética: Negro profundo, Mesh Gradients, Efectos Neón y Glassmorphism.
 */
export default function LandingPage() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500/30 overflow-x-hidden relative">

      {/* 1. Fondo Técnico (Grid) */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      {/* 2. Estrellas Sutiles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-10 left-1/4 w-0.5 h-0.5 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-40 left-3/4 w-1 h-1 bg-white rounded-full animate-pulse opacity-50"></div>
        <div className="absolute top-2/3 left-1/2 w-0.5 h-0.5 bg-white rounded-full animate-pulse"></div>
      </div>

      {/* 3. Mesh Gradient / Nebulosa */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-purple-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[10%] -right-[5%] w-[60%] h-[60%] bg-blue-600/10 blur-[100px] rounded-full"></div>
      </div>

      {/* 4. Arco de Luz Hero */}
      <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[120%] h-[50%] z-0">
        <div className="w-full h-full bg-gradient-to-b from-purple-500/20 via-blue-500/5 to-transparent blur-[80px] rounded-[100%]"></div>
      </div>

      {/* Navegación */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 max-w-7xl mx-auto backdrop-blur-md bg-black/40 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-purple-600 p-[1px]">
            <div className="w-full h-full bg-black rounded-[11px] flex items-center justify-center">
              <Scale className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            HALAL<span className="text-purple-500">LEGAL</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-400">
          <a href="#" className="hover:text-purple-400 transition-all duration-300">Servicios</a>
          <a href="#" className="hover:text-purple-400 transition-all duration-300">Cumplimiento</a>
          <a href="#" className="hover:text-purple-400 transition-all duration-300">Dashboard</a>
        </div>

        <button className="relative group px-6 py-2 rounded-full font-bold text-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:opacity-80 transition-opacity"></div>
          <span className="relative z-10">Iniciar Sesión</span>
        </button>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-32 pb-32 grid md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-600">
            Inteligencia Legal <br /> con Contexto Cultural.
          </h1>

          <p className="text-xl text-[#9ca3af] leading-relaxed mb-10 max-w-lg">
            Asistencia IA especializada en trámites españoles y normativa Halal para la comunidad musulmana y expats.
            Tus dudas resueltas con rigor jurídico.
          </p>

          <div className="flex flex-col sm:flex-row gap-5">
            <button className="px-8 py-4 rounded-full bg-purple-600 font-bold shadow-[0_0_30px_-5px_rgba(168,85,247,0.5)] hover:shadow-[0_0_45px_-5px_rgba(168,85,247,0.7)] transition-all transform hover:-translate-y-1">
              Consultar Gratis
            </button>
            <button className="px-8 py-4 rounded-full border border-white/10 bg-white/5 font-bold hover:bg-white/10 transition-all flex items-center gap-2">
              <Upload className="w-4 h-4" /> Subir Documento
            </button>
          </div>
        </motion.div>

        {/* Chat Tooltip Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Consultor IA v1.5</span>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <p className="text-sm text-gray-300 italic">"¿Cómo puedo solicitar el permiso de residencia por arraigo familiar en España siguiendo las normativas vigentes?"</p>
              </div>
              <div className="bg-purple-600/20 rounded-2xl p-4 border border-purple-500/20 ml-6">
                <p className="text-sm text-purple-100">Para el Arraigo Familiar (Family Roots), los requisitos técnicos incluyen: Certificado de antecedentes penales, prueba de vínculo familiar...</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Floating Chat Widget */}
      <div className="fixed bottom-8 right-8 z-[100]">
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-16 right-0 w-[350px] h-[450px] bg-[#0d0d0d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 font-bold flex justify-between items-center">
                <span>Asistente HalalLegal</span>
                <button onClick={() => setChatOpen(false)} className="text-xs opacity-70 hover:opacity-100">Cerrar</button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                <div className="bg-white/5 p-3 rounded-xl text-sm">Salam Alaikom. Soy tu asesor legal inteligente. ¿En qué puedo ayudarte hoy?</div>
              </div>
              <div className="p-4 border-t border-white/5 flex gap-2">
                <input type="text" placeholder="Escribe tu duda..." className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-purple-500" />
                <button className="bg-purple-600 p-2 rounded-full"><Send className="w-4 h-4" /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
        >
          <MessageSquare className="w-7 h-7" />
        </button>
      </div>

      <footer className="relative z-10 py-12 border-t border-white/5 text-center text-xs text-gray-600 tracking-widest">
        &copy; 2026 HALAL LEGAL. INTELIGENCIA PARA LA COMUNIDAD.
      </footer>
    </div>
  );
}
