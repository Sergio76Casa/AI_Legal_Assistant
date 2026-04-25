# 🚀 Roadmap de Mejoras del Sistema Chat IA
> **Fecha:** 17 de Abril de 2026
> **Basado en:** Auditoría técnica del sistema RAG actual
> **Archivos de referencia:** `docs/PROTOCOLO_CHAT_RAG.md`, `docs/AUDITORIA_SISTEMA_IA.md`
> **Estado:** PLANIFICADO - Pendiente de aprobación para implementación

---

## 🗺️ Visión General

El sistema actual de chat (`gemini-2.0-flash` + `gemini-embedding-001` + pgvector) es **técnicamente sólido** pero tiene limitaciones arquitectónicas que reducen su precisión y lo hacen **inflexible para múltiples clientes con temáticas distintas**.

Este roadmap define la evolución en 3 fases progresivas, ordenadas por urgencia e impacto.

---

## 🔴 FASE 0 — Chats Personalizados por Temática (Fundación)
> **Objetivo:** Que cada tenant pueda tener su propio asistente con personalidad, tema y base de conocimiento diferente.
> **Prioridad:** ALTA — Bloquea la escalabilidad del producto B2B.

### Cambios en Base de Datos

```sql
-- 1. Etiquetar cada fragmento de conocimiento con su temática
ALTER TABLE knowledge_base ADD COLUMN topic TEXT DEFAULT 'legal';

-- 2. Tabla nueva: configuración del chat por tenant
CREATE TABLE chat_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    name TEXT NOT NULL,           -- "Asistente de RRHH", "Bot de Nutrición Halal"
    system_prompt TEXT NOT NULL,  -- El "alma" del asistente, editable desde panel
    topic TEXT,                   -- Filtra qué documentos usa: 'rrhh', 'legal', etc.
    match_threshold FLOAT DEFAULT 0.1,  -- Precisión de búsqueda (0.0 = amplio, 0.9 = exacto)
    match_count INT DEFAULT 5,          -- Cuántos fragmentos inyectar al contexto
    flash_data TEXT,              -- Datos de referencia actualizables sin tocar código
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Cambios en Edge Function `chat/index.ts`
- Leer la `chat_config` del tenant al inicio de cada petición.
- Usar `config.system_prompt` en lugar del prompt STARK hardcodeado.
- Usar `config.topic` para filtrar documentos en `match_documents`.
- Usar `config.match_threshold` y `config.match_count` en lugar de valores fijos.
- Si no hay config, usar STARK como fallback por defecto.

### Cambios en Edge Function `process-pdf/index.ts`
- Aceptar un parámetro `topic` en el body.
- Guardarlo en `knowledge_base.topic` al insertar el fragmento.

### Panel de Admin (Frontend)
- Formulario con: nombre del asistente, instrucciones, tema, nivel de precisión (slider).
- Visible solo para admins y superadmins de cada tenant.

---

### 1.2 — Chunking Inteligente de Documentos (CRÍTICO - COMPLETADO)
**ESTADO:** ✅ **IMPLEMENTADO Y OPTIMIZADO (17 Abr 2026)**

**Solución Implementada:**
- **Extracción Nativa:** Se utiliza `unpdf` para leer el texto completo de PDFs de cualquier tamaño (probado con documentos de 201+ páginas).
- **Chunking (400/50):** Algoritmo de división en fragmentos de 400 palabras con solapamiento de 50 para mantener el contexto semántico entre bloques.
- **Sin Topes:** Se eliminó el límite de 50 chunks, permitiendo indexar leyes extensas de forma íntegra.
- **Vectores 3072:** Los embeddings generados mantienen la máxima dimensión para precisión jurídica.

---

## 🟡 FASE 2 — Mejoras de Calidad y Producto
> **Objetivo:** Elevar la calidad de las respuestas y añadir funcionalidades de producto visibles.
> **Prioridad:** MEDIA — Mejora la satisfacción del usuario, no bloquea el producto.

### 2.1 — Mostrar Fuentes Citadas en el Frontend
**El dato YA EXISTE. No se usa.**
El backend devuelve `sources` (línea 116 de `chat/index.ts`) pero `ChatDrawer.tsx` lo ignora completamente.

**Solución:** Añadir debajo de cada burbuja del asistente:
> 📄 *Basado en: Ley_Extranjería.pdf · Contrato_Alquiler.pdf*

Coste de implementación: **muy bajo** (el dato ya viene del servidor).

### 2.2 — Clasificación Automática de Temas al Subir PDFs
**Problema:** El admin tiene que clasificar manualmente cada documento subido.

**Solución:** Añadir una segunda llamada a Gemini dentro de `process-pdf` tras extraer el texto:
```typescript
const classifyResult = await model.generateContent(
    `Clasifica este documento en máximo 2 categorías de esta lista: 
    [legal, laboral, vivienda, halal, fiscal, salud, extranjeria, contratos, otro].
    Solo devuelve las categorías separadas por coma. Documento: ${text.substring(0, 2000)}`
);
// El topic se asigna automáticamente. El admin solo confirma o corrige.
```

### 2.3 — Guardrails Temáticos ("el bot no se sale del carril")
**Problema:** Si un chat está configurado para "nutrición Halal" y alguien le pregunta por impuestos, responde igualmente.

**Solución:** Añadir una instrucción en el `system_prompt` de cada config:
```
"Solo respondo sobre [TEMA]. Si me preguntan por otros temas, lo indico amablemente 
y sugiero que consulten con el especialista adecuado."
```

### 2.4 — Sistema de Feedback (👍 / 👎)
**Problema:** No existe ningún mecanismo para saber si las respuestas son útiles.

**Solución:**
```sql
-- Nueva tabla de feedback
CREATE TABLE chat_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    tenant_id UUID,
    query TEXT,
    response TEXT,
    rating BOOLEAN, -- true = positivo, false = negativo
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```
- Añadir botones 👍/👎 debajo de cada respuesta del asistente.
- Dashboard para admins donde ver qué preguntas tienen peor valoración.

---

## 🟢 FASE 3 — Arquitectura Avanzada (Nivel Enterprise)
> **Objetivo:** Alcanzar el estándar de la industria en sistemas RAG de producción.
> **Prioridad:** BAJA — Para cuando el producto esté estabilizado en fases anteriores.

### 3.1 — Búsqueda Híbrida (Semántica + Palabras Clave)
**Problema:** La búsqueda vectorial no captura bien números exactos (nºs de leyes, artículos).

**Solución:** Combinar búsqueda vectorial con `tsvector` de PostgreSQL. Mezclar los resultados con un peso configurable (ej: 70% semántico + 30% keyword). Esto se llama **Hybrid RAG** y es el estándar actual de la industria.

### 3.2 — Re-ranking de Resultados con IA
**Problema:** Los 5 fragmentos recuperados están ordenados por similitud matemática, no por utilidad real.

**Solución:** Antes de construir el prompt final, enviar los 10 mejores candidatos a Gemini con la pregunta y pedir que los ordene por relevancia real. Solo los 3 mejores van al prompt final. Resultado: **respuestas más precisas con menos tokens consumidos**.

### 3.3 — Caché de Embeddings de Consultas
**Problema:** Si 50 usuarios preguntan lo mismo (ej: "¿Qué es el arraigo social?"), se generan 50 embeddings idénticos y se hacen 50 búsquedas en base de datos.

**Solución:** Cachear el vector resultante de consultas frecuentes con un hash MD5 de la pregunta. La segunda vez que alguien hace la misma pregunta, se salta la vectorización y va directo a la búsqueda.

---

## 📊 Resumen de Impacto y Prioridad

| Mejora | Fase | Impacto Usuario | Dificultad | Estado |
| :--- | :---: | :--- | :--- | :--- |
| Chats personalizados por temática | 0 | 🔴 Muy Alto | Media | ⏳ Pendiente |
| Memoria de conversación | 1 | 🔴 Muy Alto | Media | ✅ **COMPLETADO** (16 Abr 2026) |
| Chunking inteligente de PDFs | 1 | 🔴 Muy Alto | Media | ✅ **OPTIMIZADO (Extracción Nativa)** |
| Mostrar fuentes citadas | 2 | 🟠 Alto | Baja | ✅ **COMPLETADO** (16 Abr 2026) |
| Clasificación automática de temas | 2 | 🟠 Alto | Baja | ⏳ Pendiente |
| Guardrails temáticos | 2 | 🟡 Medio | Baja | ⏳ Pendiente |
| Feedback 👍/👎 | 2 | 🟡 Medio | Baja | ⏳ Pendiente |
| Búsqueda híbrida | 3 | 🟠 Alto | Alta | 🔮 Futuro |
| Re-ranking con IA | 3 | 🟡 Medio | Alta | 🔮 Futuro |
| Caché de embeddings | 3 | 🟡 Medio | Media | 🔮 Futuro |

---

## 🚨 Acción Pendiente Crítica: Re-procesar Documentos Existentes

El chunking implementado el 16 Abr 2026 solo afecta a documentos **nuevos** que se suban a partir de ahora.
Los documentos ya existentes en `knowledge_base` siguen indexados como un único vector (baja precisión).

**Para aplicar la mejora a documentos existentes:**
1. Ir al panel de Superadmin → Repositorio de Leyes
2. Eliminar cada documento existente (esto borra sus vectores de `knowledge_base`)
3. Volver a subirlo — ahora se procesará con chunking automáticamente

**Alternativa (Técnica):** Ejecutar un script que llame a `process-pdf` para cada documento de `documents` donde `status = 'completed'` y `user_id IS NULL`.

---

> [!IMPORTANT]
> **Antes de implementar cualquier fase**, verificar que la dimensión vectorial sigue siendo **3072** ejecutando:
> `SELECT vector_dims(embedding) FROM knowledge_base LIMIT 1;`

> [!WARNING]
> **Chunking (Fase 1.2) requiere re-procesar todos los documentos existentes.** Los documentos actuales están indexados como un único vector. Tras activar el chunking, hay que re-ingestarlo todo para que la mejora sea efectiva.
