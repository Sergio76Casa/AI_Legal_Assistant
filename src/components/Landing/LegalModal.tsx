import { useEffect } from 'react';
import { X, Shield, Cookie, ShieldCheck } from 'lucide-react';

interface LegalModalProps {
    type: 'privacy' | 'cookies' | 'legal' | null;
    onClose: () => void;
}

const legalNoticeContent = [
    {
        title: '1. Información General',
        body: 'En cumplimiento del deber de información recogido en el artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico, se detallan los datos del titular del sitio web.'
    },
    {
        title: '2. Titular del Sitio Web',
        body: 'El sitio web legalflow.digital es propiedad de LegalFlow Technologies, S.L., con NIF B12345678 y domicilio social en Madrid, España. Sociedad inscrita en el Registro Mercantil de Madrid.'
    },
    {
        title: '3. Propiedad Intelectual',
        body: 'Todos los contenidos del sitio web, incluyendo textos, gráficos, logotipos e imágenes, son propiedad de LegalFlow Technologies, S.L. o de sus licenciantes y están protegidos por las leyes de propiedad intelectual.'
    },
    {
        title: '4. Condiciones de Uso',
        body: 'El usuario se compromete a hacer un uso adecuado de los contenidos y servicios de la plataforma, evitando actividades ilícitas o contrarias a la buena fe y al orden público.'
    },
    {
        title: '5. Exclusión de Responsabilidad',
        body: 'LegalFlow no se hace responsable de los daños y perjuicios que pudieran derivarse del uso de la información contenida en el sitio web, ni de la interrupción del servicio o la presencia de virus.'
    },
    {
        title: '6. Legislación Aplicable',
        body: 'Las presentes condiciones se rigen por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales de la ciudad de Madrid.'
    }
];

const privacyContent = [
    {
        title: '1. Responsable del Tratamiento',
        body: 'LegalFlow Technologies, S.L. (en adelante, "LegalFlow") con domicilio social en Madrid, España. Email de contacto: privacidad@legalflow.digital.'
    },
    {
        title: '2. Datos que Recopilamos',
        body: 'Recopilamos los datos que nos proporcionas al registrarte (nombre, email, organización), los documentos que subes para su análisis por IA, datos de uso y navegación, e información de facturación procesada de forma segura por Stripe.'
    },
    {
        title: '3. Finalidad del Tratamiento',
        body: 'Tus datos se utilizan para: prestación del servicio de asistencia legal con IA, gestión de tu cuenta y suscripción, mejora del servicio mediante análisis agregados y anónimos, comunicaciones relacionadas con el servicio y cumplimiento de obligaciones legales.'
    },
    {
        title: '4. Base Legal',
        body: 'El tratamiento se basa en: la ejecución del contrato de servicio (Art. 6.1.b RGPD), tu consentimiento explícito para el procesamiento de documentos (Art. 6.1.a RGPD), el interés legítimo para mejora del servicio (Art. 6.1.f RGPD) y el cumplimiento de obligaciones legales (Art. 6.1.c RGPD).'
    },
    {
        title: '5. Tecnología Iron Silo™',
        body: 'Todos los documentos se procesan con nuestra tecnología Iron Silo™ de cifrado de extremo a extremo. Los datos se almacenan en servidores ubicados en la UE, cumpliendo con el RGPD. No compartimos documentos con terceros y la IA procesa los datos en tiempo real sin almacenamiento persistente del contenido analizado.'
    },
    {
        title: '6. Conservación de Datos',
        body: 'Tus datos personales se conservan mientras mantengas tu cuenta activa. Los documentos subidos pueden ser eliminados por ti en cualquier momento. Tras la cancelación de la cuenta, los datos se eliminan en un plazo máximo de 30 días, salvo obligación legal de conservación.'
    },
    {
        title: '7. Derechos del Usuario',
        body: 'Puedes ejercer tus derechos de acceso, rectificación, supresión, portabilidad, limitación y oposición contactando a privacidad@legalflow.digital. También tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD).'
    },
    {
        title: '8. Transferencias Internacionales',
        body: 'No realizamos transferencias de datos fuera del Espacio Económico Europeo. Todos los servidores y servicios de procesamiento se encuentran en la UE.'
    }
];

const cookiesContent = [
    {
        title: '1. ¿Qué son las Cookies?',
        body: 'Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas nuestra web. Nos ayudan a mejorar tu experiencia y a entender cómo usas el servicio.'
    },
    {
        title: '2. Cookies Técnicas (Necesarias)',
        body: 'Estas cookies son esenciales para el funcionamiento de la plataforma: sesión de autenticación (mantiene tu sesión iniciada), preferencias de idioma (recuerda tu idioma seleccionado) y token CSRF (protección de seguridad contra ataques). No se pueden desactivar.'
    },
    {
        title: '3. Cookies de Afiliación',
        body: 'Si llegas a LegalFlow a través de un enlace de afiliado, almacenamos una cookie de referencia (referral_code) durante 30 días para atribuir correctamente la recomendación. Esta cookie solo contiene el código del afiliado.'
    },
    {
        title: '4. Cookies Analíticas',
        body: 'Utilizamos cookies analíticas propias para entender patrones de uso agregados. No utilizamos Google Analytics ni servicios de terceros que rastreen tu actividad en otros sitios. Los datos son completamente anónimos.'
    },
    {
        title: '5. Cookies de Terceros',
        body: 'Stripe (procesador de pagos): utiliza cookies estrictamente necesarias para procesar pagos de forma segura. Estas cookies están sujetas a la política de privacidad de Stripe. No utilizamos cookies publicitarias ni de redes sociales.'
    },
    {
        title: '6. Gestión de Cookies',
        body: 'Puedes configurar tu navegador para bloquear o eliminar cookies en cualquier momento. Ten en cuenta que desactivar las cookies técnicas puede afectar al funcionamiento de la plataforma. Para más información, consulta la ayuda de tu navegador.'
    },
    {
        title: '7. Actualizaciones',
        body: 'Esta política puede actualizarse periódicamente. La fecha de última actualización se muestra al final del documento. Te notificaremos cambios significativos por email.'
    }
];

export function LegalModal({ type, onClose }: LegalModalProps) {
    useEffect(() => {
        if (type) document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, [type]);

    if (!type) return null;

    const content = type === 'privacy'
        ? privacyContent
        : type === 'cookies'
            ? cookiesContent
            : legalNoticeContent;

    const modalTitle = type === 'privacy'
        ? 'Política de Privacidad'
        : type === 'cookies'
            ? 'Política de Cookies'
            : 'Aviso Legal';

    const Icon = type === 'privacy'
        ? Shield
        : type === 'cookies'
            ? Cookie
            : ShieldCheck;

    const iconColorClass = type === 'privacy'
        ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
        : type === 'cookies'
            ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
            : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>

            {/* Modal */}
            <div className="relative bg-slate-900 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl flex items-center justify-center border ${iconColorClass}`}>
                            <Icon size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {modalTitle}
                            </h2>
                            <p className="text-xs text-slate-500">Última actualización: Febrero 2026</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto max-h-[calc(85vh-88px)] space-y-6">
                    <p className="text-sm text-slate-400 leading-relaxed">
                        {type === 'privacy'
                            ? 'En LegalFlow nos tomamos muy en serio la protección de tus datos. Esta política explica cómo recopilamos, usamos y protegemos tu información personal.'
                            : type === 'cookies'
                                ? 'Esta política explica cómo utilizamos las cookies y tecnologías similares en legalflow.digital.'
                                : 'Este aviso regula las condiciones generales de uso del portal legalflow.digital.'}
                    </p>

                    {content.map((section, i) => (
                        <div key={i} className="space-y-2">
                            <h3 className="text-sm font-bold text-white">{section.title}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">{section.body}</p>
                        </div>
                    ))}

                    {/* Footer note */}
                    <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <p className="text-xs text-slate-600">
                            Para cualquier consulta sobre este documento, contacta con privacidad@legalflow.digital
                        </p>
                        <button
                            onClick={onClose}
                            className="w-full md:w-auto px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
