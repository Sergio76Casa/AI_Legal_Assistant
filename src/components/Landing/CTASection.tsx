import { motion } from 'framer-motion';

interface CTASectionProps {
    onCreateOrg: () => void;
    onBookDemo?: () => void;
}

export function CTASection({ onCreateOrg, onBookDemo }: CTASectionProps) {
    return (
        <section className="py-24 px-4 overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-5xl mx-auto glass-card rounded-[2.5rem] p-10 md:p-20 text-center relative overflow-hidden backdrop-blur-2xl"
            >
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img src="/images/cta-signing.jpg" alt="" className="w-full h-full object-cover opacity-35" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark/90 via-background-dark/50 to-background-dark/40"></div>
                </div>

                {/* Glow Effects */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[120px] -mr-40 -mt-40"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/10 rounded-full blur-[120px] -ml-40 -mb-40"></div>

                <div className="relative z-10 space-y-8">
                    <h2 className="font-serif text-4xl md:text-6xl text-white max-w-3xl mx-auto leading-tight">
                        Digitaliza tu despacho con <span className="text-primary">IA de extranjería</span>
                    </h2>

                    <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
                        Únete a los profesionales que ya gestionan expedientes, documentos y consultas migratorias
                        en la mitad de tiempo con LegalFlow.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <button
                            onClick={onCreateOrg}
                            className="w-full sm:w-auto bg-primary text-background-dark px-10 py-5 rounded-full text-lg font-bold hover:scale-105 transition-all shadow-2xl shadow-primary/20 hover:shadow-primary/40"
                        >
                            Empezar prueba gratuita
                        </button>
                        <button
                            onClick={onBookDemo}
                            className="w-full sm:w-auto px-10 py-5 rounded-full text-lg font-bold border border-white/10 hover:bg-white/5 transition-all text-white"
                        >
                            Solicitar una demo
                        </button>
                    </div>

                    <p className="text-sm text-slate-500">
                        Sin tarjeta de crédito. Sin permanencia. Configuración en 2 minutos.
                    </p>
                </div>
            </motion.div>
        </section>
    );
}
