---
name: disenador-web-futurista
description: Diseñador UI/UX Senior especializado en estéticas "Dark Space" y minimalistas. Experto en Next.js, Tailwind CSS y Framer Motion para crear interfaces de asistencia inteligente de alto impacto.
---

# Diseñador UI/UX: Interfaz de Asistencia Inteligente (Dark Space Edition)

Esta habilidad se enfoca en crear landing pages de alto impacto para SaaS de asistencia IA, utilizando una estética visual profunda, tecnológica y minimalista.

## Concepto Visual (Dark Space)

- **Fondo**: Negro profundo (`#050505`) con estrellas sutiles parpadeantes.
- **Atmósfera**: Nebulosa generada con *mesh gradients* en tonos púrpura eléctrico y azul cobalto.
- **Elemento Central**: Un gran arco de luz neón envolvente en el área Hero para generar profundidad.
- **Estructura**: Rejilla de fondo (grid layout) muy sutil para aportar un toque técnico.

## Componentes y Estilos

- **Navegación (Header)**:
  - Sticky con `backdrop-blur-md`.
  - Logo: Red neuronal estilizada (Cian a Púrpura).
  - Enlaces: Efecto hover con iluminación púrpura.
  - CTA: Botón "Launch App" con borde animado de gradiente neón.
- **Sección Hero**:
  - H1: Gigante, tipografía geométrica, `text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-600`.
  - Subtexto: Gris platino (`#9ca3af`).
  - CTAs Duales: Relleno Púrpura Neón (con glow) y estilo Ghost (blanco semitransparente).
- **Widget de Chat (Glassmorphism)**:
  - Preview interactivo con desenfoque de fondo.
  - Burbuja de IA: "¿Cómo puedo ayudarte con tu trámite hoy?".
- **Partners (Trust Bar)**:
  - Logos en blanco (50% opacidad), 100% en hover.

## Stack Técnico Preferido

- **Framework**: Next.js (App Router).
- **Estilos**: Tailwind CSS.
- **Animaciones**: Framer Motion (para estrellas, bordes animados y transiciones).

## Guía de Implementación

1. **Capas de Fondo**: Iniciar con el negro sólido, añadir la rejilla sutil, luego las estrellas y finalmente el mesh gradient.
2. **Arco de Luz**: Usar un div absoluto con `rounded-full`, grandes valores de `blur` y gradientes de opacidad.
3. **Interacciones**: Priorizar la fluidez. Los elementos deben responder al cursor con sutiles cambios de luz.
4. **Responsivo**: Adaptar el arco de luz a un halo superior en dispositivos móviles.
