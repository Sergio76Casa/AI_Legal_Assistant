# 🚀 EJECUTAR MIGRACIÓN SQL - INSTRUCCIONES PASO A PASO

## ⚠️ IMPORTANTE: Debes hacer esto manualmente

No tengo permisos para ejecutar migraciones automáticamente.
Sigue estos pasos para ejecutar la migración del sistema de suscripciones:

---

## 📋 PASOS A SEGUIR:

### **1. Abre Supabase Dashboard**
- Ve a: https://supabase.com/dashboard
- Inicia sesión si es necesario

### **2. Selecciona tu Proyecto**
- Busca y selecciona el proyecto: `qcxqfmxqfpfxqxdvbcqb`
- O busca por nombre: "Legal & Halal" (o como lo hayas llamado)

### **3. Ve al SQL Editor**
- En el menú lateral izquierdo, haz clic en **"SQL Editor"**
- O usa el atajo: Ctrl+K y escribe "SQL"

### **4. Crea una Nueva Query**
- Haz clic en **"New query"** (botón verde arriba a la derecha)
- O usa el botón **"+"** en la parte superior

### **5. Copia el Código SQL**
- Abre el archivo: `supabase/migrations/add_subscription_system.sql`
- **Selecciona TODO el contenido** (Ctrl+A)
- **Copia** (Ctrl+C)

### **6. Pega en el Editor**
- Vuelve a Supabase Dashboard
- **Pega** el código SQL en el editor (Ctrl+V)

### **7. Ejecuta la Migración**
- Haz clic en el botón **"Run"** (esquina superior derecha)
- O usa el atajo: **Ctrl+Enter**

### **8. Verifica el Resultado**
- Deberías ver un mensaje: **"Success. No rows returned"**
- Si hay errores, cópialos y dímelos para ayudarte

### **9. Verifica las Tablas Creadas**
- Ve a **"Table Editor"** en el menú lateral
- Deberías ver dos nuevas tablas:
  - ✅ `subscriptions`
  - ✅ `usage_tracking`

---

## ✅ VERIFICACIÓN RÁPIDA

Después de ejecutar, verifica que todo funciona:

### **Opción A: Desde SQL Editor**
Ejecuta esta query para verificar:

```sql
-- Verificar que las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('subscriptions', 'usage_tracking');

-- Verificar que las funciones existen
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_tier_limits', 'can_perform_action', 'increment_usage');
```

Deberías ver:
- 2 tablas
- 3 funciones

### **Opción B: Desde Table Editor**
- Ve a **Table Editor**
- Busca las tablas `subscriptions` y `usage_tracking`
- Si las ves, ¡está todo bien! ✅

---

## 🎯 DESPUÉS DE EJECUTAR

Una vez ejecutada la migración, vuelve aquí y dime:
- ✅ "Migración ejecutada con éxito"
- ❌ "Hubo un error: [copia el error]"

Entonces continuaremos con la integración de los componentes en la UI.

---

## 📁 ARCHIVO A COPIAR

**Ruta completa:**
```
c:\Users\USER\Desktop\Proyectos Antigravity\Legal\supabase\migrations\add_subscription_system.sql
```

**Contenido:** 200 líneas de SQL que crean:
- 2 tablas
- 4 índices
- 4 funciones
- 1 trigger
- 3 políticas RLS

---

## 💡 TIPS

- **No cierres** el archivo SQL hasta que hayas pegado todo
- **Verifica** que copiaste TODO (debe empezar con "-- Migración:" y terminar con "service_role');")
- **No modifiques** el código SQL
- Si hay errores, **no entres en pánico**, solo cópialos y te ayudo

---

## 🆘 ¿PROBLEMAS?

Si tienes algún error:
1. Copia el mensaje de error completo
2. Dímelo aquí
3. Te ayudaré a resolverlo

---

**¡Adelante! Ejecuta la migración y avísame cuando esté lista.** 🚀
