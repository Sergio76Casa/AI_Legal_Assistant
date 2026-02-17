---
description: Protocolo Maestro para transformar la arquitectura Single-Tenant en Multi-Tenant (SaaS B2B).
---

# 🏭 Workflow: Transformación a Multi-Tenant (Arquitectura "Iron Silo")

Este workflow automatiza la conversión del sistema Legal AI actual en una plataforma Multi-Tenant escalable.
**Objetivo**: Permitir múltiples organizaciones aisladas (Tenants) compartiendo la misma infraestructura, garantizando que los datos y la IA de la Organización A sean invisibles para la Organización B.

## 🚨 Fase 0: Preparación y Seguridad (Manual)

1. **Backup en Frío**: Antes de ejecutar nada, realizar un backup completo de la base de datos Supabase.
2. **Snapshot de Código**: Asegurar que `git status` está limpio.

## 🏗️ Fase 1: Arquitectura de Base de Datos (SQL)

Esta fase establece los cimientos del aislamiento.

1. **Crear Tabla Maestra de Tenants**:
   ```sql
   CREATE TABLE public.tenants (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       name TEXT NOT NULL,
       slug TEXT UNIQUE NOT NULL, -- Para subdominios: empresa.legalai.com
       plan_type TEXT DEFAULT 'free',
       config JSONB DEFAULT '{}', -- Configuración específica (colores, logo, reglas)
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
   ```

2. **Migración de Datos Existentes (Estrategia "Legacy Ark")**:
   - Crear un Tenant por defecto llamado "Global/Legacy".
   - Asignar todos los usuarios y documentos actuales a este Tenant para evitar roturas.

   ```sql
   -- Insertar Tenant Default
   INSERT INTO public.tenants (id, name, slug, plan_type)
   VALUES ('00000000-0000-0000-0000-000000000000', 'Legal AI Global', 'global', 'business');

   -- Modificar Tablas Críticas
   ALTER TABLE profiles ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000000';
   ALTER TABLE knowledge_base ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000000';
   ALTER TABLE chat_logs ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000000';
   ALTER TABLE documents ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000000';
   
   -- Quitar default tras migración para forzar integridad futura
   -- ALTER TABLE profiles ALTER COLUMN tenant_id DROP DEFAULT;
   ```

## 🛡️ Fase 2: Escudo de Seguridad RLS (Row Level Security)

Reemplazar las políticas de "Dueño del Dato" por políticas de "Inquilino del Dato".

1. **Actualizar Policies**:
   ```sql
   -- Ejemplo para knowledge_base (El núcleo de la IA)
   DROP POLICY IF EXISTS "Authenticated users can read knowledge base" ON knowledge_base;
   
   CREATE POLICY "Tenant Isolation Protocol" ON knowledge_base
   FOR SELECT
   USING (
       tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
       OR 
       tenant_id = '00000000-0000-0000-0000-000000000000' -- Acceso a Documentos Globales
   );
   ```

## 🧠 Fase 3: Recalibración de la IA (Gemini)

Actualizar el cerebro para que entienda el contexto organizacional.

1. **Modificar Función RPC `match_documents`**:
   - Añadir parámetro `p_tenant_id UUID`.
   - Filtrar vectores donde `tenant_id` sea el del usuario O el global.

2. **Actualizar Edge Function `process-pdf`**:
   - Al recibir un archivo, debe recibir también el `tenant_id`.
   - Al guardar en `knowledge_base`, debe inyectar ese ID.

3. **Actualizar Edge Function `chat`**:
   - Detectar el Tenant del usuario antes de llamar a `match_documents`.

## 🖥️ Fase 4: Frontend Multi-Visual

1. **Adaptar `AuthContext`**:
   - Al hacer login, recuperar no solo el User, sino su `tenant` completo (nombre, configuración).
   
2. **Router de Tenants**:
   - Opción A (Simple): Dropdown en el login para elegir Organización.
   - Opción B (Pro): Detección por Subdominio (`empresa.app.com`).
   - Implementaremos **Opción A** primero para rapidez.

## ✅ Fase 5: Verificación "Zero-Leak"

Ejecutar tests de penetración:
1. Crear Usuario A en Tenant Alpha.
2. Crear Usuario B en Tenant Beta.
3. Usuario A sube documento secreto.
4. Usuario B pregunta a la IA por el documento secreto.
5. **Resultado Esperado**: "No tengo información sobre eso".

---
**Para ejecutar este skill:** Pide al agente que inicie la "Fase 1 del Workflow Multi-Tenant".
