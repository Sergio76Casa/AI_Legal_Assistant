import React from 'react';
// Nota: En una implementación real se usaría: import { motion } from 'framer-motion';

/**
 * Plantilla de Landing Page: Dark Space Edition
 * Estética: Negro profundo, Mesh Gradients, Efectos Neón y Glassmorphism.
 */
const LandingPageDarkSpace = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500/30 overflow-x-hidden relative">

      {/* 1. Fondo Técnico (Grid) */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      {/* 2. Estrellas Sutiles (Simuladas con divs) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-10 left-1/4 w-0.5 h-0.5 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-40 left-3/4 w-1 h-1 bg-white rounded-full animate-pulse opacity-50"></div>
        <div className="absolute top-2/3 left-1/2 w-0.5 h-0.5 bg-white rounded-full animate-pulse-slow"></div>
      </div>

      {/* 3. Mesh Gradient / Nebulosa */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-purple-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[10%] -right-[5%] w-[60%] h-[60%] bg-blue-600/10 blur-[100px] rounded-full"></div>
      </div>

      {/* 4. El Gran Arco de Luz Hero */}
      <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[120%] h-[50%] z-0">
        <div className="w-full h-full bg-gradient-to-b from-purple-500/20 via-blue-500/5 to-transparent blur-[80px] rounded-[100%]"></div>
      </div>

      {/* Navegación (Header) */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 max-w-7xl mx-auto backdrop-blur-md bg-black/40 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-purple-600 p-[1px]">
            <div className="w-full h-full bg-black rounded-[11px] flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3m0 14v3M2 12h3m14 0h3m-3.5-6.5l-2 2m-9 9l-2 2m11 0l2 2m-11-13l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            NEURAL<span className="text-purple-500">ASSIST</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-400">
          <a href="#" className="hover:text-purple-400 transition-all duration-300">Producto</a>
          <a href="#" className="hover:text-purple-400 transition-all duration-300">Soluciones</a>
          <a href="#" className="hover:text-purple-400 transition-all duration-300">Precios</a>
        </div>

        <button className="relative group px-6 py-2 rounded-full font-bold text-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:opacity-80 transition-opacity"></div>
          <span className="relative z-10">Launch App</span>
          <div className="absolute inset-0 border border-white/20 rounded-full group-hover:border-purple-400/50 transition-colors"></div>
        </button>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-32 pb-32 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-600">
            Inteligencia que comprende <br /> tu cultura.
          </h1>

          <p className="text-xl text-[#9ca3af] leading-relaxed mb-10 max-w-lg">
            La asistencia IA diseñada para resolver trámites complejos y dudas culturales con precisión humana y velocidad tecnológica.
          </p>

          <div className="flex flex-col sm:flex-row gap-5">
            <button className="px-8 py-4 rounded-full bg-purple-600 font-bold shadow-[0_0_30px_-5px_rgba(168,85,247,0.5)] hover:shadow-[0_0_45px_-5px_rgba(168,85,247,0.7)] transition-all transform hover:-translate-y-1">
              Empezar Gratis
            </button>
            <button className="px-8 py-4 rounded-full border border-white/10 bg-white/5 font-bold hover:bg-white/10 transition-all">
              Saber Más
            </button>
          </div>
        </div>

        {/* Widget de Chat (Glassmorphism) */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
              <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
              <span className="ml-auto text-[10px] text-gray-500 uppercase tracking-widest font-bold">Neural Core v2.5</span>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-2xl rounded-tl-none p-4 max-w-[80%] border border-white/5">
                <p className="text-sm text-gray-300">Hola, soy tu asistente. Tengo experiencia en normativas legales y cultura Halal.</p>
              </div>
              <div className="bg-purple-600/20 rounded-2xl rounded-tr-none p-4 ml-auto max-w-[80%] border border-purple-500/20">
                <p className="text-sm text-purple-100 font-medium">¿Cómo puedo ayudarte con tu trámite hoy?</p>
              </div>
            </div>

            <div className="mt-8 flex gap-2">
              <div className="flex-1 bg-white/5 rounded-full border border-white/5 px-4 py-2 text-xs text-gray-500">Escribe tu duda aquí...</div>
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Trust Bar (Partners) */}
      <section className="relative z-10 border-t border-white/5 py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24">
            {['Telegram', 'Google Cloud', 'Supabase', 'Antigravity'].map((name) => (
              <span key={name} className="text-lg font-black tracking-widest text-white/50 hover:text-white transition-all cursor-default uppercase">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Sutil */}
      <footer className="relative z-10 py-12 border-t border-white/5 text-center text-xs text-gray-600 tracking-widest">
        &copy; 2026 NEURAL ASSIST. TODOS LOS DERECHOS RESERVADOS.
      </footer>
    </div>
  );
};

export default LandingPageDarkSpace;
