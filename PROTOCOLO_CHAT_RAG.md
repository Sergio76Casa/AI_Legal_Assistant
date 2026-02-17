# 📜 Protocolo de Calibración: Sistema Chat RAG (Legal & Halal)
> **ÚLTIMA REVISIÓN:** 17 Febrero 2026
> **ESTADO:** CRÍTICO - PRE-MIGRACIÓN MULTI-TENANT

Este documento contiene la configuración **EXACTA Y VINCULANTE** del cerebro de la IA (Gemini). Cualquier desviación de estos parámetros resultará en una degradación de la personalidad "STARK" o fallos en la recuperación de documentos.

---

## 1. Arquitectura de Modelos (Hardcoded)

El sistema utiliza una arquitectura híbrida de modelos de Google. **NO CAMBIAR** sin re-calibrar los prompts.

| Función | Modelo Exacto | API Version | Notas Críticas |
| :--- | :--- | :--- | :--- |
| **Chat / Razonamiento** | `gemini-2.0-flash` | v1beta | Elegido por velocidad/costo. Mantiene el contexto de leyes españolas 2025. |
| **Embeddings (Vectores)** | `models/gemini-embedding-001` | v1beta | Genera vectores de **3072 dimensiones**. Incompatible con `text-embedding-004`. |
| **OCR / Visión** | `gemini-2.0-flash` | - | Usado en `process-pdf` para leer tanto PDFs nativos como **Imágenes** (jpg, png, heic). |

### ⚠️ Configuración SQL de Vectores
La tabla `knowledge_base` y la función `match_documents` dependen estrictamente de la dimensión 3072.

```sql
-- La función RPC debe coincidir con la salida del modelo embedding-001
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(3072), -- OBLIGATORIO: 3072
  match_threshold float, -- Actual: 0.1
  match_count int,       -- Actual: 5 fragmentos
  p_user_id uuid DEFAULT NULL
) ...
```

---

## 2. Identidad y Prompt del Sistema ("STARK")

El "alma" del asistente reside en `supabase/functions/chat/index.ts`. Este prompt define la personalidad y las "Lineas Rojas".

### Persona: STARK (Aliado Legal Inteligente)
**Misión:** Simplificar burocracia, eliminar estrés legal, acompañamiento empático.

### Reglas de Comportamiento (System Prompt Vigente)
1.  **Claridad Total:** Prohibido el "abogado-ñol". Lenguaje llano.
2.  **Empatía Real:** Reconocer la ansiedad del usuario ante trámites de extranjería/vivienda.
3.  **Estructura Visual:** Uso intensivo de Markdown (Negritas, Listas).
4.  **Halal Friendly:** Sensibilidad cultural obligatoria (Alimentación E-120, Finanzas sin usura).

### Datos de Referencia "Flash" (Hardcoded en Prompt)
Estos datos se inyectan para asegurar precisión en temas comunes de 2025:
*   **Arraigo Social:** 2 años (Nuevo reglamento).
*   **Nacionalidad:** 10/2/1 años. Trámite digital.
*   **Vivienda:** Inquilino NO paga honorarios de agencia (Ley 12/2023).
*   **Convivencia:** Horarios tardíos, saludos con contacto leve.

> **IMPORTANTE PARA MIGRACIÓN:** Al pasar a Multi-tenant, verificar si estos "Datos Flash" deben ser configurables por Tenant o si todos los tenants operan bajo legislación española.

---

## 3. Estrategia RAG (Recuperación Aumentada)

### Construcción del Contexto
El backend (`chat/index.ts`) inyecta los fragmentos recuperados con una etiqueta explícita para que la IA sepa qué es privado y qué es público.

**Formato de Inyección:**
```text
[DOCUMENTO DE USUARIO: Contrato_Alquiler.pdf]
...contenido del contrato...

[GUÍA GLOBAL: Ley_Extranjería.pdf]
...contenido de la ley...
```

**Lógica de Selección (Query Actual):**
La función busca documentos donde:
1.  `user_id` coincide con el usuario (Privados).
2.  `user_id` es `NULL` (Públicos/Globales).

> **⚠️ ALERTA MULTI-TENANT:** Esta lógica (`user_id IS NULL`) es el punto crítico a cambiar. En multi-tenant, los documentos globales pasarán a ser "Globales del Tenant".

---

## 4. Pipeline de Ingesta (PDFs e Imágenes)

La función `process-pdf` no es solo un lector de texto. Es un **pipeline multimodal**.

1.  **Detección de MimeType:**
    *   Soporta: `pdf`, `jpg`, `jpeg`, `png`, `webp`, `heic`, `heif`.
2.  **Estrategia de Extracción con Gemini 2.0 Flash:**
    *   **Si es PDF:** "Extrae todo el texto de forma literal..."
    *   **Si es Imagen:** "Extrae todo el texto visible... Si es un documento, transcribe..."
3.  **Metadatos Críticos:**
    *   `source`: Guarda el `file_path` original. Usado para borrado en cascada.
    *   `type`: Siempre etiquetado como `document` en `knowledge_base`.

---

## 5. Protocolo de Restauración de Emergencia

Si tras la migración la IA "se vuelve tonta" o deja de encontrar archivos:

1.  **Verificar Dimensión de Vectores:** Ejecutar `SELECT vector_dims(embedding) FROM knowledge_base LIMIT 1;`. Debe dar **3072**.
2.  **Revisar Policies RLS:** Confirmar que la IA (Service Role) sigue teniendo acceso a `knowledge_base`.
3.  **Traza de Logs:** Revisar logs de Edge Function `chat`.
    *   Si dice `Found 0 matching documents` -> Fallo en `match_documents` o RLS.
    *   Si falla el `match_documents` con error de dimensiones -> Modelo incorrecto.

---

## RESUMEN DE CAMBIOS PARA MULTI-TENANT (Roadmap IA)
Para convertir esto a Multi-tenant sin romper STARK:

1.  **Base de Datos:** Añadir `tenant_id` a `knowledge_base`.
2.  **Ingesta (`process-pdf`):** Al guardar vectores, incluir el `tenant_id` del usuario.
3.  **Búsqueda (`match_documents`):**
    *   **ANTES:** `WHERE (user_id = p_user_id OR user_id IS NULL)`
    *   **DESPUÉS:** `WHERE tenant_id = p_tenant_id AND (user_id = p_user_id OR is_public_for_tenant = true)`
4.  **Prompt:** El prompt de STARK es lo único que **NO** necesita cambios inmediatos, ya que la personalidad jurídica es agnóstica del tenant (asumiendo todos operan en España).
