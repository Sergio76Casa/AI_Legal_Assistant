import { motion } from 'framer-motion';

export function Partners() {
    return (
        <section id="partners" className="py-24 px-4 max-w-6xl mx-auto">
            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card rounded-[2.5rem] p-10 md:p-16 relative overflow-hidden"
            >
                {/* Glow Effects */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[150px] -mr-48 -mt-48"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-[120px] -ml-36 -mb-36"></div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    {/* Left - Copy */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-4">
                                Programa de Partners
                            </h2>
                            <h3 className="font-serif text-3xl md:text-4xl text-white leading-tight">
                                ¿Conoces a otros <span className="text-primary">profesionales</span>?
                            </h3>
                            <p className="text-slate-400 text-lg mt-4 leading-relaxed">
                                Gana comisiones recurrentes recomendando la tecnología líder en extranjería.
                                Cada cliente que traigas significa ingresos pasivos para ti, mes a mes.
                            </p>
                        </div>

                        {/* Features */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary/20 transition-colors">
                                    <span className="material-symbols-outlined text-xl">trending_up</span>
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">Comisiones del 20% recurrente</p>
                                    <p className="text-slate-500 text-xs">Por cada despacho o agencia que se suscriba con tu enlace</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary/20 transition-colors">
                                    <span className="material-symbols-outlined text-xl">handshake</span>
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">Panel de seguimiento en tiempo real</p>
                                    <p className="text-slate-500 text-xs">Visualiza referidos, conversiones y pagos</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary/20 transition-colors">
                                    <span className="material-symbols-outlined text-xl">workspace_premium</span>
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">Material de marketing exclusivo</p>
                                    <p className="text-slate-500 text-xs">Banners, demos y contenido para compartir</p>
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <a
                            href="/register-affiliate"
                            className="inline-flex items-center gap-2 bg-primary text-slate-900 px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40"
                        >
                            <span className="material-symbols-outlined text-lg">group_add</span>
                            Unirme al programa
                        </a>
                    </div>

                    {/* Right - Golden Close Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="bg-gradient-to-br from-amber-500/10 via-primary/5 to-transparent rounded-3xl border border-amber-500/20 p-8 md:p-10 space-y-6">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 text-xs font-black px-4 py-1.5 rounded-full border border-amber-500/20 uppercase tracking-wider">
                                <span className="material-symbols-outlined text-sm">emoji_events</span>
                                Cierre Dorado
                            </div>

                            <h4 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                                Usa LegalFlow <span className="text-amber-400">gratis</span>
                            </h4>

                            <p className="text-slate-300 leading-relaxed">
                                Si traes a <span className="text-primary font-bold">3 profesionales</span> que se suscriban,
                                tu plan <span className="text-amber-400 font-bold">Business te sale a coste cero</span>.
                                Así de simple.
                            </p>

                            {/* Visual Steps */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-black border border-primary/30">1</div>
                                    <p className="text-sm text-slate-400">Regístrate como Partner</p>
                                </div>
                                <div className="w-px h-4 bg-white/10 ml-4"></div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-black border border-primary/30">2</div>
                                    <p className="text-sm text-slate-400">Comparte tu enlace con 3 profesionales</p>
                                </div>
                                <div className="w-px h-4 bg-white/10 ml-4"></div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-black border border-amber-500/30">🎉</div>
                                    <p className="text-sm text-white font-bold">¡Tu Business es gratis para siempre!</p>
                                </div>
                            </div>

                            {/* Savings Badge */}
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
                                <span className="material-symbols-outlined text-emerald-400 text-2xl">savings</span>
                                <div>
                                    <p className="text-emerald-400 font-bold text-sm">Ahorras 1.788€ al año</p>
                                    <p className="text-slate-500 text-xs">Valor del plan Business anual completo</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
}
