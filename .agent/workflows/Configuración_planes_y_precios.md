---
description: Configuración estratégica de precios, planes B2B/B2C y terminología técnica para el ecosistema de Legal AI Global.
---

# 📑 ESTRUCTURA DE PRECIOS, PRODUCTO Y NAVEGACIÓN: LEGAL AI GLOBAL

Este documento es la "Verdad Única" para el Agente. Define la relación entre los nombres comerciales (Marketing) y los identificadores técnicos (Base de Datos/Código), así como la estructura de URLs y límites de uso.

## 1. MAPEO TÉCNICO DE PLANES (B2B - PROFESIONALES)
Para cualquier tarea técnica, el Agente debe asociar los nombres de marketing con los `plan_type` del código:

* **Plan Starter (Comercial) = `free` (Técnico en DB)**
    * **Precio:** 49€/mes.
    * **Capacidad:** Hasta 10 expedientes nuevos/mes.
    * **Funciones:** Escaneo inteligente (OCR), acceso básico al Motor STARK 2.0, panel de gestión y soporte vía email.
* **Plan Business (Comercial) = `pro` (Técnico en DB)**
    * **Precio:** 149€/mes.
    * **Capacidad:** Hasta 50 expedientes nuevos/mes.
    * **Funciones:** Seguridad Iron Silo™ avanzada, hasta 3 cuentas de usuario (gestores), traducción automática y acceso completo al Motor STARK 2.0.
    * **Soporte:** Prioritario 24/7.
* **Plan Enterprise (Comercial) = `business` (Técnico en DB)**
    * **Precio:** Desde 399€/mes.
    * **Capacidad:** Expedientes ilimitados.
    * **Funciones:** Integración vía API, arquitectura Multi-Tenant dedicada (Iron Silo), formación personalizada, gestor de cuenta exclusivo y SLA garantizado.

## 2. PLANES DE ACCESO / CLIENTE FINAL (B2C)
* **Acceso Básico (0€/mes):** Ideal para consultas puntuales. Incluye Chat IA básico, visualización de documentos públicos y soporte por email.
* **Acceso Premium (9,99€/mes):** Gestión completa de expedientes. Incluye subida ilimitada de documentos, análisis IA avanzado de archivos y soporte prioritario 24/7.

## 3. ESTRUCTURA DE NAVEGACIÓN (URLS)
El Agente debe proponer o usar estas rutas para mantener el orden jerárquico:
* **Home Global:** `/` (Selector de perfil).
* **Sección Profesionales:** `/pro` (Landing B2B).
* **Precios Profesionales:** `/pro/pricing` (Starter, Business, Enterprise).
* **Sección Particulares:** `/personal` (Landing B2C).
* **Precios Particulares:** `/personal/pricing` (Básico, Premium).
* **Dashboard / App:** `/app/dashboard` (Acceso tras login).
* **Afiliados:** `/afiliados` (Información del programa).

## 4. GLOSARIO TÉCNICO OBLIGATORIO
* **Motor STARK 2.0:** Motor de IA para procesamiento de expedientes.
* **Iron Silo™ Security:** Estándar de aislamiento de datos Multi-Tenant para planes Business y Enterprise.

## 5. REGLAS DE CONTROL (QUOTAS)
El Agente debe validar acciones usando las funciones `get_tier_limits` y `can_perform_action` mencionadas en `ARCHITECTURE.md`, asegurando que un usuario en el plan `free` (Starter) no exceda los 10 expedientes.