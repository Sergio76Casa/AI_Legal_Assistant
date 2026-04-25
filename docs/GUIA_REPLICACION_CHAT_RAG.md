# 🏗️ Blueprint: Replicación del Sistema Chat RAG (Edición 2026)

Esta guía detalla los pasos técnicos para replicar el sistema de Chat RAG de Legal AI Global en cualquier otro proyecto. Este sistema está optimizado para documentos legales extensos (200+ páginas) y alta precisión semántica.

---

## 1. Stack Tecnológico de Referencia

| Componente | Tecnología | Razón |
| :--- | :--- | :--- |
| **Infraestructura** | Supabase | Postgres + pgvector + Edge Functions (Deno). |
| **Vectores** | `gemini-embedding-001` | **3072 dimensiones**. Alta resolución para temas técnicos. |
| **Cerebro (LLM)** | `gemini-2.0-flash` | v1beta. Ventana de contexto de 1M tokens. |
| **Extracción** | `unpdf` (Nativo) | Evita límites de tokens de salida de la IA. |

---

## 2. Base de Datos (SQL pgvector)

Primero, activa la extensión `vector` y crea la estructura de almacenamiento.

```sql
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabla principal de conocimiento
CREATE TABLE knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    user_id UUID,
    content TEXT NOT NULL,
    title TEXT,
    embedding vector(3072), -- CRÍTICO: Debe ser 3072 para Gemini-001
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Función de búsqueda semántica (RPC)
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(3072),
  match_threshold float,
  match_count int,
  p_tenant_id uuid DEFAULT NULL,
  p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  title text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.content,
    kb.title,
    kb.metadata,
    1 - (kb.embedding <=> query_embedding) AS similarity
  FROM knowledge_base kb
  WHERE 
    (kb.tenant_id = p_tenant_id OR kb.tenant_id = '00000000-0000-0000-0000-000000000000') AND
    (kb.user_id = p_user_id OR kb.user_id IS NULL) AND
    (1 - (kb.embedding <=> query_embedding)) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

## 3. Pipeline de Ingesta (Edge Function)

La clave para leer 200+ páginas es NO pedirle a Gemini que extraiga el texto. El texto se extrae por software y Gemini solo lo vectoriza.

### Algoritmo de Procesamiento:
1.  **Descargar PDF** desde el Storage.
2.  **Extraer texto nativo:** Usar `extractText` de `unpdf`.
3.  **Chunking con Overlap:**
    ```typescript
    function splitIntoChunks(text, size = 400, overlap = 50) {
        // Divide el texto en bloques de 400 palabras
        // Avanza 350 palabras (mantiene 50 del bloque anterior para contexto)
    }
    ```
4.  **Generar Vector:** Para cada fragmento, llamar a `gemini-embedding-001`.
5.  **Insertar en DB:** Guardar el texto, el vector y la referencia al archivo original.

---

## 4. Cerebro del Chat (STARK Logic)

El prompt del sistema debe ser restrictivo para evitar alucinaciones.

### Estructura de la Petición:
```typescript
const context = retrieved_chunks.map(c => `[FUENTE: ${c.title}]\n${c.content}`).join('\n\n');

const prompt = `Eres STARK, un asistente legal empático y profesional. 
Usa SOLO el siguiente contexto para responder. 
Si no está en el contexto, indícalo claramente.

CONTEXTO:
${context}

PREGUNTA:
${user_query}`;
```

### Memoria de Conversación:
Para que el chat no olvide lo anterior, usa `history` en Gemini:
```typescript
const chat = model.startChat({
  history: [
    { role: "user", parts: [{ text: "..." }] },
    { role: "model", parts: [{ text: "..." }] },
  ],
});
```

---

## 5. Secretos del Éxito (Configuración Gemini)

*   **Embeddings Dimension:** Asegúrate de usar `outputDimensionality: 3072` si el modelo lo permite (en el `001` es por defecto).
*   **Threshold:** Un `match_threshold` de **0.1 a 0.2** es ideal para encontrar información técnica.
*   **Chunk Size:** 400-500 palabras es el "sweet spot". Menos pierde contexto, más difumina el vector.

---

> [!TIP]
> **¿Por qué este sistema es mejor?**
> Al usar extracción nativa y chunking sin límites, evitas que la IA "se olvide" de las páginas finales de una ley larga, algo que falla en el 90% de las implementaciones RAG básicas.
