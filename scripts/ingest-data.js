/**
 * SCRIPT DE INGESTA MASIVA (GLOBAL) - STARK AI
 * 
 * Uso: Modifica el contenido de la variable 'content' y ejecuta:
 * node ingest-data.js
 */

// No se requiere 'node-fetch' en Node.js 18+ ya que fetch es global

// CONFIGURACIÓN (Sustituye por tus datos reales de Supabase)
const SUPABASE_PROJECT_REF = 'lkdfesfidxkaolcetseq';
const INGEST_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co/functions/v1/ingest`;

async function ingestGeneralLaw(title, text) {
    console.log(`🚀 Iniciando ingesta de: ${title}...`);

    try {
        const response = await fetch(INGEST_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: text,
                metadata: {
                    title: title,
                    type: 'general_law',
                    ingested_at: new Date().toISOString()
                },
                user_id: null // NULL indica que es una LEY GLOBAL para todos los usuarios
            })
        });

        const data = await response.json();
        if (data.success) {
            console.log(`✅ ¡ÉXITO! Documento guardado con éxito.`);
        } else {
            console.error(`❌ ERROR: ${data.error}`);
        }
    } catch (error) {
        console.error(`❌ FALLO DE CONEXIÓN: ${error.message}`);
    }
}

// EJEMPLO DE USO:
const titulo = "Guía del NIE para Extranjeros";
const contenido = `EL NIE es el Número de Identidad de Extranjero. Se solicita en la Policía Nacional. Requisitos: Pasaporte, Tasa 790 cod 012 pagada, y cita previa.`;

ingestGeneralLaw(titulo, contenido);
