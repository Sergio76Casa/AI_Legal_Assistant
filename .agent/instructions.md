# 🧠 Instrucciones del Agente - Legal AI Global

Este archivo contiene la memoria operativa del sistema para que cualquier instancia de Antigravity pueda operar con precisión sobre la arquitectura de IA y Multitenancy.

---

## 🚀 Arquitectura de IA Crucial
- **Modelos:** Chat (`gemini-2.0-flash`), Embeddings (`gemini-embedding-001`), OCR/Visión (`gemini-2.0-flash`)
- **API Version:** v1beta para todos los modelos
- **Dimensión Vectorial:** Siempre **3072**. NO cambiar el modelo de embedding sin migrar la tabla `knowledge_base`.
- **Pipeline RAG:** Los documentos se procesan vía `supabase/functions/process-pdf`.
- **Personalidad:** STARK (Empático, legalmente preciso, sin tecnicismos, Halal Friendly).
- **Chunking activo:** Desde el 16 Abr 2026, cada documento se divide en chunks de 400 palabras (overlap 50). Los documentos anteriores a esa fecha siguen con vector único y deberían re-procesarse.

---

## 📂 Archivos de Referencia Maestra
- `docs/AUDITORIA_SISTEMA_IA.md`: Detalles técnicos del chat y el pipeline de datos.
- `docs/PROTOCOLO_CHAT_RAG.md`: Calibración y configuración SQL de vectores. NO cambiar modelos ni dimensiones sin revisar este doc.
- `docs/ROADMAP_CHAT_IA_MEJORAS.md`: Plan completo de mejoras del sistema por fases. **Ver tabla de estado para saber lo que está COMPLETADO vs PENDIENTE.**
- `src/lib/TenantContext.tsx`: Núcleo de la lógica multi-tenant (Silo de Hierro).

---

## ✅ Estado de Implementación (actualizado 16 Abr 2026)

### Completado hoy:
1. **Memoria de conversación** (`chat/index.ts`) — El chat ahora usa `startChat + history` con Gemini. Envía los últimos 8 mensajes como contexto.
2. **Fuentes citadas** (`ChatDrawer.tsx`) — Muestra qué documentos usó la IA con % de similitud bajo cada respuesta.
3. **Chunking inteligente** (`process-pdf/index.ts`) — Cada PDF se divide en múltiples vectores para búsquedas más precisas.

### Pendiente (por orden de prioridad):
1. **Deployar las Edge Functions** en Supabase (las funciones fueron modificadas pero no desplegadas aún).
2. **Re-procesar documentos existentes** — Los PDFs ya subidos tienen vector único antiguo. Hay que borrarlos y re-subirlos desde el panel de Superadmin.
3. **Fase 0 — Chats temáticos por tenant** — Requiere migración SQL (`chat_configs` table) + cambios en `chat/index.ts` + panel de admin.
4. **Fase 2 — Clasificación automática de temas al subir PDFs**.
5. **Fase 2 — Feedback 👍/👎 en el chat**.

---

## 🛠️ Reglas de Operación
1. **Aislamiento:** Nunca realices consultas a `documents` o `knowledge_base` sin filtrar por `tenant_id` y `user_id` (excepto para `user_id IS NULL` en documentos globales).
2. **Multilingüismo:** Respeta siempre las traducciones en `src/locales/`. No hardcodees textos en el UI.
3. **Seguridad:** Toda firma debe mantener su integridad SHA-256.
4. **Antes de cualquier cambio en los modelos de IA:** Verificar que la dimensión vectorial sigue siendo 3072 ejecutando `SELECT vector_dims(embedding) FROM knowledge_base LIMIT 1;`
5. **Edge Functions:** Los imports de Deno (esm.sh, deno.land) generan errores de lint falsos en el IDE de Windows. Son normales y no indican un error real — Deno los resuelve en runtime.

---

*Última actualización: 16 de Abril de 2026, 22:00h*
