import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.21.0'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GLOBAL_GUIDES = [
    {
        title: "Guía Oficial: Arraigo Social (Reglamento 2025)",
        content: `HOJA INFORMATIVA: AUTORIZACIÓN DE RESIDENCIA POR ARRAIGO SOCIAL (ESPAÑA)
Actualizado a Real Decreto 1155/2024 (Nuevo Reglamento de Extranjería).

REQUISITOS:
1. Permanencia: Haber residido en España de forma continuada durante un mínimo de 2 AÑOS (según la nueva normativa 2025). La permanencia se acredita mediante el empadronamiento o documentos oficiales.
2. Antecedentes Penales: Carecer de antecedentes penales en España y en los países de residencia anteriores por delitos existentes en el ordenamiento español.
3. Vínculos familiares o Informe de Integración: 
   - Opción A: Acreditar vínculos familiares con otros extranjeros residentes (cónyuge, pareja de hecho, ascendientes o descendientes en primer grado).
   - Opción B: Informe de inserción social emitido por la Comunidad Autónoma o el Ayuntamiento de residencia.
4. Medios Económicos / Contrato: 
   - Contrato de trabajo firmado por el empleador y el trabajador con una duración mínima de un año, o medios económicos suficientes demostrables.

PROCEDIMIENTO:
- Modelo oficial: EX-10.
- Tasa: Modelo 790 código 052.
- Lugar: Oficina de Extranjería de la provincia donde resida el extranjero.`,
        country: "ES"
    },
    {
        title: "Guía Oficial: Nacionalidad Española por Residencia",
        content: `PROCEDIMIENTO DE OBTENCIÓN DE LA NACIONALIDAD ESPAÑOLA POR RESIDENCIA

PLAZOS REQUERIDOS DE RESIDENCIA LEGAL:
- General: 10 años.
- Refugiados: 5 años.
- Nacionales de países iberoamericanos, Andorra, Filipinas, Guinea Ecuatorial, Portugal o sefardíes: 2 años.
- Casados con español/a o nacidos en España: 1 año.

REQUISITOS ADICIONALES:
1. Buena conducta cívica (Certificado de antecedentes penales).
2. Grado suficiente de integración en la sociedad española:
   - Examen DELE (Idioma, nivel A2 o superior) salvo exenciones por lengua materna.
   - Examen CCSE (Conocimientos constitucionales y socioculturales de España).
3. Residencia debe ser legal, continuada e inmediatamente anterior a la solicitud.

PROCESO DE PRESENTACIÓN TELEMÁTICA (Sede Electrónica):
Actualmente, la solicitud es 100% digital a través de la Sede Electrónica del Ministerio de Justicia.
1. Requisitos Técnicos: 
   - Certificado Digital (FNMT) o DNI Electrónico personal.
   - Uso de la aplicación "Autofirma" instalada en el ordenador.
2. Pago de Tasa: 
   - Modelo 790, código 026. Importe: 104,05€ (actualizado 2024/25).
   - El pago debe realizarse de forma telemática antes de firmar la solicitud.
3. Envío y Plazos: 
   - Tras la firma digital, se genera un justificante con número de expediente (R-...). 
   - El Ministerio tiene 1 año para responder oficialmente; si no hay respuesta, se entiende desestimada por silencio administrativo (aunque suele resolverse más tarde).

DOCUMENTACIÓN DIGITALIZADA:
- Pasaporte completo (todas las páginas escaneadas).
- Certificado de nacimiento traducido y legalizado/apostillado.
- Certificado de antecedentes penales del país de origen.
- Justificantes de exámenes CCSE y DELE (si procede).`,
        country: "ES"
    },
    {
        title: "Guía Oficial: Trámites de NIE y TIE",
        content: `INSTRUCCIÓN TÉCNICA: DIFERENCIA Y OBTENCIÓN DE NIE Y TIE

¿QUÉ ES EL NIE (Número de Identidad de Extranjero)?
Es un número secuencial de identificación para efectos administrativos, económicos o profesionales. No otorga por sí mismo residencia legal, solo identifica.
- Modelo: EX-15.
- Tasa: 790-012.

¿QUÉ ES LA TIE (Tarjeta de Identidad de Extranjero)?
Es el documento físico (la tarjeta) que acredita la residencia legal en España. Contiene el NIE, la foto y el tipo de autorización.
- Obligatorio para estancias superiores a 6 meses.
- Modelo: EX-17.
- Tasa: 790-012.

PROCESO DE TOMA DE HUELLAS:
Una vez concedida la resolución de residencia, el extranjero tiene 1 mes para solicitar la TIE.
Requisitos para la cita de huellas:
1. Formulario EX-17 cumplimentado.
2. Pasaporte original.
3. Resolución de concesión de la residencia.
4. Justificante de pago de tasa.
5. 1 fotografía tamaño carné.
6. Empadronamiento (si ha cambiado de domicilio).`,
        country: "ES"
    },
    {
        title: "Guía Maestra: Alimentación Halal en Europa (2025)",
        content: `GUÍA DEFINITIVA DE ALIMENTACIÓN HALAL EN EUROPA
Este documento ayuda a identificar productos permitidos y prohibidos según la jurisprudencia islámica aplicada al mercado europeo.

1. ADITIVOS CRÍTICOS (E-Numbers):
- NO HALAL / DUDOSOS: E120 (Cochinilla), E441 (Gelatina), E471-E472 (si son de origen animal no especificado), E542 (Harina de huesos), E904 (Goma laca).
- SIEMPRE HALAL (Origen vegetal): E100, E160, E410, E412, E415.

2. CERTIFICACIONES RECONOCIDAS:
- Instituto Halal (España): Sello de garantía de la Junta Islámica.
- Halal Food Council of Europe (HFCE).
- Halal Control (Europa).

3. REGLAS EN EL SUPERMERCADO:
- Carnes: Deben llevar el sello Halal explícito. Si el animal es sacrificado por "Gente del Libro" (judíos/cristianos) sin ritos paganos, algunos eruditos lo permiten, pero la certificación Halal es la única garantía total.
- Alcohol: Prohibido incluso en trazas pequeñas para cocinar (ej: vinagre de vino es permitido si el cambio químico es completo, pero el vino como ingrediente no).
- Panadería: Cuidado con la manteca de cerdo (Lard) muy común en repostería tradicional española.`,
        country: "ES"
    },
    {
        title: "Guía: Integración y Cultura en España",
        content: `GUÍA DE PROTOCOLO Y CONVIVENCIA CULTURAL EN ESPAÑA
Consejos prácticos para la integración de la comunidad musulmana y extranjera.

1. SALUDOS Y CONTACTO SOCIAL:
- El contacto físico leve (dos besos o apretón de manos) es común entre hombres y mujeres. Si el usuario prefiere evitarlo por motivos religiosos, se recomienda poner la mano sobre el pecho y gesticular una sonrisa con una leve inclinación de cabeza de forma educada.

2. HORARIOS Y COSTUMBRES:
- Comidas: Los horarios en España son más tardíos (Comida 14:00-15:00, Cena 21:00-22:00).
- Calendario: Se respetan las festividades cristianas nacionales. Las festividades islámicas (Eid al-Fitr, Eid al-Adha) no son festivos oficiales nacionales pero están reconocidas en el Acuerdo de Cooperación de 1992 (posibilidad de solicitar el día libre mediante acuerdo previo).

3. RESPETO Y CONVIVENCIA:
- El ruido en comunidades debe moderarse después de las 22:00.
- La puntualidad es valorada en entornos profesionales, aunque en lo social hay cierta flexibilidad.`,
        country: "ES"
    },
    {
        title: "Guía: Vivienda y Alquiler en España (LAU)",
        content: `GUÍA PRÁCTICA DE ALQUILER DE VIVIENDA EN ESPAÑA
Basada en la Ley de Arrendamientos Urbanos (LAU) y Ley de Vivienda 2023.

1. TIPOS DE CONTRATO:
- Vivienda Habitual: Duración mínima de 5 años (si el casero es persona física) o 7 años (persona jurídica). Prórrogas automáticas.
- Temporada (Estudiantes/Nómadas): Para fines específicos, no es vivienda permanente. Menos protección legal.

2. FIANZAS Y DEPÓSITOS:
- Fianza Legal: Es obligatoria y equivale a 1 MES de renta (vivienda habitual) o 2 meses (uso distinto). El casero debe depositarla en el organismo correspondiente de su CA.
- Garantía Adicional: Máximo 2 meses adicionales de renta.

3. GASTOS Y REPARACIONES:
- Honorarios Inmobiliaria: Por ley, los paga el CASERO (en vivienda habitual).
- Suministros: Agua, luz e internet los paga el INQUILINO.
- Reparaciones: El casero paga las necesarias para la habitabilidad. El inquilino paga pequeñas reparaciones por uso ordinario.

4. DERECHOS CLAVE:
- Recuperación de Fianza: El casero tiene 30 días tras la entrega de llaves para devolverla o justificar daños.
- Desahucio: Proceso legal largo, prohibido el corte de suministros o cambio de cerradura por parte del casero (es delito de coacciones).`,
        country: "ES"
    },
    {
        title: "Guía Oficial: Permisos de Trabajo y Nómadas Digitales (2025)",
        content: `GUÍA DE PERMISOS DE TRABAJO Y VISADOS ESPECIALES EN ESPAÑA
Actualizado según la Ley de Startups y el Nuevo Reglamento de Extranjería 2025.

1. VISA DE NÓMADA DIGITAL (Teletrabajo de Carácter Internacional):
- Perfil: Personas que trabajan a distancia para empresas fuera de España.
- Requisitos:
  * Titulación universitaria o experiencia profesional de 3 años.
  * Relación laboral/profesional de al menos 3 meses con la empresa.
  * Carecer de antecedentes penales.
  * Seguro médico privado sin copagos.
  * Ingresos mínimos: Aprox. 200% del SMI (Salario Mínimo Interprofesional). En 2025 ronda los 2.600€/mes para el titular.

2. PROFESIONALES ALTAMENTE CUALIFICADOS (PAC):
- Dirigido a: Directivos o personal técnico especializado con un salario superior a ciertos umbrales (aprox. 54.000€ para directivos, 40.000€ para técnicos, con reducciones para jóvenes).
- Ventaja: Tramitación rápida (UGE-CE) y autorización de residencia y trabajo válida en todo el territorio nacional.

3. ESTUDIANTES Y TRABAJO (Residencias de Estudiante):
- ¿Se puede trabajar? SÍ. Con la normativa actual, los estudiantes de estudios superiores pueden trabajar por cuenta ajena o propia hasta 30 HORAS semanales automáticamente sin necesidad de permiso adicional, siempre que no afecte a los estudios.
- Modificación a Trabajo: Tras finalizar los estudios, se puede modificar a una autorización de trabajo sin necesidad de haber estado 3 años en España (eliminado el plazo previo por el nuevo reglamento).

4. TRABAJO POR CUENTA AJENA / PROPIA:
- Cuenta Ajena: Requiere que un empleador presente la solicitud. La situación nacional de empleo suele ser una barrera a menos que el puesto esté en la lista de difícil cobertura o se trate de ciudadanos de países con convenios especiales (como Chile o Perú).
- Cuenta Propia: Requiere un plan de negocio aprobado por asociaciones como UATAE o ATA, y acreditar suficiencia económica e inversión inicial.`,
        country: "ES"
    },
    {
        title: "Guía Oficial: Protección Internacional y Asilo (2025)",
        content: `GUÍA PARA SOLICITANTES DE PROTECCIÓN INTERNACIONAL (ASILO) EN ESPAÑA
Actualizado a 2024/2025 - Procedimientos de la OAR (Oficina de Asilo y Refugio).

1. PRIMERA FASE: SOLICITUD DE CITA Y MANIFESTACIÓN DE VOLUNTAD
Para iniciar el proceso, el extranjero debe manifestar su voluntad de solicitar protección internacional lo antes posible.
- Cita Previa: Dependiendo de la provincia, se solicita vía Sede Electrónica o por teléfono.
  * Madrid: 913 220 189 / 913 220 190 (L-V 09:00 a 19:00).
  * Barcelona: 932 903 098 (L-V 08:30 a 11:00).
- Hoja Blanca: En la primera cita se entrega un resguardo blanco ("Manifestación de voluntad"). Este documento asigna un NIE y garantiza que la persona no puede ser expulsada legalmente de España.

2. SEGUNDA FASE: LA TARJETA ROJA
Una vez la solicitud es admitida a trámite, se entrega el "Documento acreditativo de la condición de solicitante de protección internacional", conocido popularmente como "Tarjeta Roja".
- Validez: Inicialmente 6 meses.
- Renovación: Debe renovarse cada 6 meses en la Comisaría de Policía.
- Autorización de Trabajo: La Tarjeta Roja NO permite trabajar los primeros 6 meses. Tras la PRIMERA RENOVACIÓN (pasados los 6 meses iniciales), el documento ya incluye automáticamente la leyenda "Autoriza a trabajar".

3. DERECHOS DEL SOLICITANTE:
- Derecho a la asistencia jurídica gratuita y a intérprete.
- Derecho a la asistencia sanitaria pública (Tarjeta Sanitaria).
- Derecho a la escolarización de menores.
- Suspensión de cualquier proceso de devolución o expulsión.
- Posibilidad de acceder al sistema de acogida (albergues, ayudas económicas) si se carece de recursos.

4. RESOLUCIÓN Y TIEMPOS:
El proceso puede tardar entre 18 y 24 meses. Si la resolución es favorable, se obtiene el Estatuto de Refugiado o Protección Subsidiaria. Si es desfavorable (Denegación), en algunos casos se concede automáticamente la Residencia por Razones Humanitarias (común para ciudadanos venezolanos).`,
        country: "ES"
    },
    {
        title: "Guía Oficial: Calendario Laboral y Festivos (2025)",
        content: `CALENDARIO LABORAL OFICIAL DE ESPAÑA 2025
Resolución de la Dirección General de Trabajo publicada en el BOE.

1. FESTIVOS NACIONALES (No sustituibles, en toda España):
- 1 de enero (miércoles): Año Nuevo.
- 18 de abril (viernes): Viernes Santo.
- 1 de mayo (jueves): Fiesta del Trabajo.
- 15 de agosto (viernes): Asunción de la Virgen.
- 12 de octubre (domingo): Fiesta Nacional de España (al caer en domingo, algunas CCAA lo trasladan al lunes 13).
- 1 de noviembre (sábado): Todos los Santos.
- 6 de diciembre (sábado): Día de la Constitución Española.
- 8 de diciembre (lunes): Inmaculada Concepción.
- 25 de diciembre (jueves): Natividad del Señor.

2. FIESTAS AUTONÓMICAS COMUNES:
- 6 de enero (lunes): Epifanía del Señor (Reyes). Festivo en todas las CCAA este año.
- 17 de abril (Jueves Santo): Festivo en la mayoría de CCAA excepto Cataluña y C. Valenciana.

3. DÍAS CLAVE POR COMUNIDAD AUTÓNOMA:
- Madrid: 2 de mayo (viernes) - Fiesta de la Comunidad. 25 de julio (Santiago Apóstol).
- Cataluña: 21 de abril (Lunes de Pascua). 24 de junio (San Juan). 11 de septiembre (Diada). 26 de diciembre (San Esteban).
- Andalucía: 28 de febrero (Día de Andalucía).
- Comunidad Valenciana: 19 de marzo (San José). 9 de octubre.
- País Vasco: 25 de julio (Santiago Apóstol).

NOTA: Además de estos, cada municipio designa 2 fiestas locales propias (ej: San Isidro en Madrid el 15 de mayo, La Mercè en Barcelona el 24 de septiembre).`,
        country: "ES"
    }
];

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const supabase = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
        const apiKey = Deno.env.get('GOOGLE_API_KEY_CHAT');
        const genAI = new GoogleGenerativeAI(apiKey!);
        const embeddingModel = genAI.getGenerativeModel({ model: "models/gemini-embedding-001" }, { apiVersion: 'v1beta' });

        console.log("Iniciando carga de Guías Globales...");

        for (const guide of GLOBAL_GUIDES) {
            console.log("--- Iniciando: " + guide.title + " ---");

            const url = "global/" + guide.title.split(" ").join("_") + ".txt";

            // Verificar si ya existe
            console.log("Verificando existencia de: " + guide.title);
            const { data: existing } = await supabase.from('documents').select('id').eq('name', guide.title).maybeSingle();

            if (existing) {
                console.log("[EXISTE] Saltando: " + guide.title);
                continue;
            }

            console.log("Generando embedding para: " + guide.title + "...");
            const embResult = await embeddingModel.embedContent(guide.content);
            const embedding = embResult.embedding.values;
            console.log("Embedding generado (" + embedding.length + " dims)");

            console.log("Insertando en knowledge_base...");
            const { error: kbError } = await supabase.from('knowledge_base').insert({
                content: guide.content,
                title: guide.title,
                metadata: {
                    type: 'global_guide',
                    country: guide.country,
                    source: url
                },
                user_id: null,
                embedding: embedding
            });

            if (kbError) {
                console.error("Error en knowledge_base:", kbError);
                throw kbError;
            }

            console.log("Insertando en documents...");
            const { error: docError } = await supabase.from('documents').insert({
                user_id: null,
                name: guide.title,
                type: 'pdf',
                url: url,
                status: 'completed',
                country: guide.country
            });

            if (docError) {
                console.error("Error en documents para " + guide.title + ":", docError);
            } else {
                console.log("[EXITO] Guardado en ambas tablas: " + guide.title);
            }
        }

        console.log("Carga de guías finalizada con éxito.");

        return new Response(JSON.stringify({ success: true, message: "Guías globales cargadas correctamente." }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
})
