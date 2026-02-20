import { useTranslation } from 'react-i18next';

interface HeroProps {
    onCreateOrg: () => void;
    onBookDemo: () => void;
}

export function Hero({ onCreateOrg, onBookDemo }: HeroProps) {
    const { t } = useTranslation();

    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-4 hero-gradient overflow-hidden">
            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="flex flex-col gap-8 text-left z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest w-fit animate-fade-in">
                        <span className="material-symbols-outlined text-sm">verified_user</span>
                        {t('landing.hero.new_tag')}
                    </div>

                    <h1 className="font-serif text-5xl md:text-7xl leading-[1.1] text-white">
                        Tu nueva vida en España, <span className="text-primary italic">sin complicaciones</span> legales
                    </h1>

                    <p className="text-lg md:text-xl text-slate-400 max-w-xl leading-relaxed">
                        {t('landing.hero.desc')}
                    </p>

                    <div className="flex flex-wrap gap-4 mt-4">
                        <button
                            onClick={onCreateOrg}
                            className="bg-primary text-background-dark px-8 py-4 rounded-lg text-base font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                        >
                            {t('landing.hero.start_free')}
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                        <button
                            onClick={onBookDemo}
                            className="bg-white/5 backdrop-blur-md border border-white/10 text-white px-8 py-4 rounded-lg text-base font-bold hover:bg-white/10 transition-all"
                        >
                            {t('landing.hero.book_demo')}
                        </button>
                    </div>

                    <div className="flex items-center gap-6 mt-8">
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-background-dark bg-slate-800 flex items-center justify-center text-[10px] text-slate-500 overflow-hidden">
                                    <img
                                        src={`https://i.pravatar.cc/100?img=${i + 10}`}
                                        alt="User"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-slate-400">
                            {t('hero.social_proof')}
                        </p>
                    </div>
                </div>

                <div className="relative flex justify-center items-center">
                    <div className="relative w-full aspect-square max-w-xl group">
                        {/* Dynamic Glow Effect */}
                        <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-[100px] group-hover:bg-primary/30 transition-all duration-700"></div>

                        {/* Image Container with Glassmorphism Border */}
                        <div className="relative z-10 w-full h-full glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-500 group-hover:border-primary/30">
                            <img
                                src="/hero-legalflow.png"
                                alt="LegalFlow - Multinational Legal Support"
                                className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-105"
                                onError={(e) => {
                                    // Fallback to a high-quality abstract legal/tech image if file is missing
                                    e.currentTarget.src = "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=2070";
                                }}
                            />

                            {/* Professional Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-background-dark/60 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity"></div>

                            {/* Floating UI Elements (Decorative) */}
                            <div className="absolute bottom-6 left-6 right-6 p-4 glass-card rounded-xl border-white/5 backdrop-blur-lg translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                    <p className="text-xs font-medium text-white/90 tracking-wide uppercase">
                                        Procesando Visado en Tiempo Real • IA Activa
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Secondary Accent Glows */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
