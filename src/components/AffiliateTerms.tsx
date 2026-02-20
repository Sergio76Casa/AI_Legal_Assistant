import { motion } from 'framer-motion';

interface AffiliateTermsProps {
    onBack: () => void;
}

export function AffiliateTerms({ onBack }: AffiliateTermsProps) {
    return (
        <div className="min-h-screen bg-background-dark py-20 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto"
            >
                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-10 text-sm font-medium"
                >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    Volver
                </button>

                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <span className="material-symbols-outlined">handshake</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white">Términos del Programa de Afiliados</h1>
                    </div>
                    <p className="text-slate-500 text-sm">
                        Última actualización: Febrero 2026 • LegalFlow Pro
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-10">
                    {/* Section 1 */}
                    <section className="glass-card rounded-2xl p-8 space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="text-primary font-black text-lg">01</span>
                            <h2 className="text-xl font-bold text-white">Elegibilidad</h2>
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                            El Programa de Afiliados de LegalFlow está abierto a profesionales del sector legal,
                            gestores administrativos, agencias de relocation, consultorías de inmigración y creadores
                            de contenido que cumplan con la normativa vigente en España.
                        </p>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Para participar, el solicitante debe ser mayor de edad y disponer de capacidad legal
                            para celebrar contratos. LegalFlow se reserva el derecho de aceptar o rechazar solicitudes
                            de afiliación a su discreción.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section className="glass-card rounded-2xl p-8 space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="text-primary font-black text-lg">02</span>
                            <h2 className="text-xl font-bold text-white">Estructura de Comisiones</h2>
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                            Se otorgará una comisión del <span className="text-primary font-bold">20% recurrente</span> (mensual
                            o anual) por cada nuevo suscriptor que contrate un plan de pago a través del enlace
                            personalizado del afiliado.
                        </p>
                        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 text-sm">
                            <p className="text-slate-300">
                                <span className="text-primary font-bold">Ejemplo:</span> Si refieres un suscriptor al
                                Plan Business (149€/mes), recibirás <span className="text-white font-bold">29,80€/mes</span> de
                                forma recurrente mientras el suscriptor mantenga su plan activo.
                            </p>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section className="glass-card rounded-2xl p-8 space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="text-primary font-black text-lg">03</span>
                            <h2 className="text-xl font-bold text-white">Atribución y Cookies</h2>
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                            Utilizamos una ventana de atribución de <span className="text-white font-bold">30 días</span>.
                            Si un cliente potencial hace clic en tu enlace de afiliado y completa la suscripción
                            dentro de ese periodo, la comisión te será asignada automáticamente.
                        </p>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            La cookie de seguimiento se almacena en el navegador del visitante con una duración
                            de 30 días naturales. En caso de que el visitante haga clic en el enlace de otro
                            afiliado, prevalecerá la atribución más reciente (last-click attribution).
                        </p>
                    </section>

                    {/* Section 4 */}
                    <section className="glass-card rounded-2xl p-8 space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="text-primary font-black text-lg">04</span>
                            <h2 className="text-xl font-bold text-white">Pagos y Liquidación</h2>
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                            Las comisiones se liquidarán <span className="text-white font-bold">mensualmente</span> a
                            través de Stripe o transferencia bancaria, una vez alcanzado un umbral mínimo
                            de <span className="text-primary font-bold">50€</span>.
                        </p>
                        <ul className="space-y-2 text-slate-400 text-sm">
                            <li className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-primary text-sm mt-0.5">check</span>
                                Las comisiones se calculan sobre el importe neto (sin IVA) de la suscripción.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-primary text-sm mt-0.5">check</span>
                                El afiliado es responsable de cumplir con sus obligaciones fiscales.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-primary text-sm mt-0.5">check</span>
                                Los pagos pendientes por debajo del umbral se acumulan para el siguiente periodo.
                            </li>
                        </ul>
                    </section>

                    {/* Section 5 */}
                    <section className="glass-card rounded-2xl p-8 space-y-4 border-red-500/10">
                        <div className="flex items-center gap-3">
                            <span className="text-red-400 font-black text-lg">05</span>
                            <h2 className="text-xl font-bold text-white">Ética, Conducta y Spam</h2>
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                            Queda <span className="text-red-400 font-bold">estrictamente prohibido</span> el uso de
                            técnicas de spam, publicidad engañosa, suplantación de identidad o cualquier práctica
                            que pueda dañar la reputación de LegalFlow.
                        </p>
                        <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 text-sm">
                            <p className="text-slate-400">
                                <span className="text-red-400 font-bold">⚠️ Importante:</span> El incumplimiento de esta norma
                                supondrá la <span className="text-white font-bold">baja inmediata</span> del programa y la
                                pérdida de todas las comisiones acumuladas y pendientes de pago.
                            </p>
                        </div>
                    </section>

                    {/* Section 6 */}
                    <section className="glass-card rounded-2xl p-8 space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="text-primary font-black text-lg">06</span>
                            <h2 className="text-xl font-bold text-white">Modificaciones y Vigencia</h2>
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                            LegalFlow se reserva el derecho de modificar estos términos en cualquier momento,
                            notificando previamente al afiliado por correo electrónico con un mínimo de 15 días
                            de antelación.
                        </p>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            La participación continuada en el programa tras la notificación de cambios se
                            entenderá como aceptación de los nuevos términos. El afiliado puede darse de baja
                            del programa en cualquier momento sin penalización.
                        </p>
                    </section>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center">
                    <p className="text-slate-600 text-xs">
                        © 2026 LegalFlow Pro. Todos los derechos reservados.
                        <br />Estos términos están sujetos a la legislación española y a la jurisdicción de los tribunales de Madrid.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
