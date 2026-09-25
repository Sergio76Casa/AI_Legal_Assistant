/**
 * auth.ts — Constantes de autenticación y autorización.
 *
 * SUPERADMIN_EMAIL: email del superadministrador del sistema.
 * Lee desde la variable de entorno VITE_SUPERADMIN_EMAIL.
 * Si no está definida (producción sin .env), queda como string vacío
 * y el acceso superadmin se basará exclusivamente en profile.role.
 *
 * Para desarrollo local, añadir a .env.local:
 *   VITE_SUPERADMIN_EMAIL=lsergiom76@gmail.com
 *
 * Para producción, configurar en el panel de Vercel/Netlify/etc.
 * o dejar vacío y gestionar el rol en la BD (recomendado a largo plazo).
 */
export const SUPERADMIN_EMAIL: string =
    import.meta.env.VITE_SUPERADMIN_EMAIL ?? '';

/**
 * Comprueba si un email dado corresponde al superadmin del sistema.
 * Preferir comprobar profile.role === 'superadmin' siempre que sea posible.
 */
export const isSuperAdminEmail = (email: string | null | undefined): boolean =>
    Boolean(SUPERADMIN_EMAIL && email === SUPERADMIN_EMAIL);
