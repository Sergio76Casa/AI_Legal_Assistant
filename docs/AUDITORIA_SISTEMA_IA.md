# 🦾 Auditoría Técnica: Sistema de IA y RAG (Legal AI Global)
> **Fecha de creación:** 16 de Abril de 2026
> **Estado:** Documentación Maestra de Arquitectura

Este documento detalla el funcionamiento interno del chat, el pipeline de extracción de datos y los modelos de IA utilizados en el ecosistema de Legal AI Global.

---

## 1. Arquitectura de Modelos de IA (Binding)
El sistema utiliza una arquitectura multimodal basada en la familia de modelos **Google Gemini**, calibrada para alta velocidad y precisión jurídica.

| Función | Modelo Exacto | Especificación |
| :--- | :--- | :--- |
| **Chat y Razonamiento** | `gemini-2.0-flash` | v1beta. Optimizado para leyes españolas 2025. |
| **Embeddings (Memoria)** | `models/gemini-embedding-001` | **3072 dimensiones**. Inconsistencias aquí rompen el RAG. |
| **OCR y Visión** | `gemini-2.0-flash` | Capacidad multimodal para leer PDFs y fotos (JPG/PNG/HEIC). |

---

## 2. Funcionamiento del Chat ("STARK")
El asistente opera bajo el protocolo de personalidad **STARK** (Smart Legal Ally):
*   **Identidad:** Aliado inteligente, evita tecnicismos innecesarios ("abogado-ñol") y prioriza la empatía en trámites de extranjería.
*   **Sensibilidad:** Configuración de "Líneas Rojas" para temas Halal (finanzas sin usura, alimentación, etc.).
*   **Inyección de Datos Flash:** El prompt del sistema incluye conocimiento actualizado de 2025 sobre:
    *   Nuevo reglamento de Arraigo Social (2 años).
    *   Ley de Vivienda 12/2023 (El inquilino no paga honorarios).
    *   Trámites digitales de nacionalidad.

---

## 3. Pipeline de Extracción de Datos (RAG)
El flujo de datos desde que un Superadmin o Admin sube un PDF hasta que la IA "aprende" de él es el siguiente:

1.  **Subida (Multi-Bucket):**
    *   Leyes Globales -> `legal-global` (Storage).
    *   Documentos de Usuario -> `user-documents` (Storage).
2.  **Procesamiento (`process-pdf`):**
    *   Edge Function en Supabase extrae texto y transcribe imágenes usando Gemini 2.0 Flash.
3.  **Fragmentación y Vectorización:**
    *   El texto se divide en chunks.
    *   Cada chunk se convierte en un vector de **3072 dimensiones** mediante `gemini-embedding-001`.
4.  **Almacenamiento:**
    *   Los fragmentos se guardan en la tabla `knowledge_base` con metadatos de usuario/tenant.

---

## 4. Estrategia de Búsqueda y Respuesta
Cuando el usuario pregunta:
1.  Se convierte la consulta a vector (3072 dims).
2.  Se ejecuta la función `match_documents` (RPC) con un **umbral de similitud de 0.1**.
3.  Se recuperan los **5 fragmentos más relevantes**.
4.  Se inyectan en el prompt indicando si el documento es [DE USUARIO] o [GUÍA GLOBAL].

---

## 5. Auditoría de Seguridad y Trazabilidad
*   **Integridad:** Cada documento y firma cuenta con trazabilidad **SHA-256**.
*   **Aislamiento (Tenant Isolation):** Los documentos están aislados por `tenant_id` y `user_id`, garantizando que la IA no recupere información privada de otros usuarios/empresas.
*   **Límites de Uso:** Controlado por el hook `useUsageLimits` conectado a la suscripción del usuario.

---
> [!IMPORTANT]
> Para cualquier cambio en la estructura de vectores o actualización de modelos, consultar primero el documento `docs/PROTOCOLO_CHAT_RAG.md`.
