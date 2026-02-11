---
name: creador-de-habilidades
description: Una habilidad para crear otras habilidades siguiendo los estándares de Antigravity en idioma español. Proporciona plantillas, guías de estructura y mejores prácticas.
---

# Creador de Habilidades Antigravity

Esta habilidad te permite crear nuevas habilidades de manera consistente y eficiente en este workspace. Sigue las instrucciones a continuación para generar una nueva habilidad.

## Procedimiento de Creación

Para crear una nueva habilidad, sigue estos pasos:

1. **Definir el nombre**: Usa un nombre descriptivo en minúsculas con guiones si es necesario (ej: `analizador-de-contratos`).
2. **Crear la estructura de carpetas**:
   - `.agent/skills/<nombre-de-la-habilidad>/`
   - Dentro, crea obligatoriamente `SKILL.md`.
   - Opcionalmente crea: `scripts/`, `resources/`, `examples/`.
3. **Escribir el `SKILL.md`**:
   - Debe comenzar con el frontmatter YAML (`name` y `description`).
   - El cuerpo debe contener instrucciones claras para el agente.
4. **Agregar Recursos**: Si la habilidad requiere plantillas o datos de referencia, colócalos en `resources/`.

## Estructura Recomendada

```text
.agent/skills/<nombre>/
├── SKILL.md            # Instrucciones principales (obligatorio)
├── scripts/            # Scripts ejecutables (Bash, JS, etc.)
├── resources/          # Plantillas, archivos JSON, MD de referencia
└── examples/           # Ejemplos de uso para que el agente entienda el contexto
```

## Ejemplo de Frontmatter

```yaml
---
name: nombre-de-la-habilidad
description: Breve descripción de qué hace y cuándo debe usarse.
---
```

## Consejos para las Instrucciones (SKILL.md)

- Sé específico sobre qué herramientas debe usar el agente.
- Define flujos de trabajo paso a paso.
- Usa español claro y profesional.
- Evita instrucciones ambiguas.

Consulta los archivos en `resources/` y `examples/` de esta habilidad para obtener plantillas y ejemplos reales.
