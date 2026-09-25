/**
 * logger.ts — Logger condicional para entornos de desarrollo y producción.
 *
 * En producción (import.meta.env.PROD), los métodos log, warn e info
 * son no-operaciones (no-op) para no exponer datos de sesión ni
 * información interna en la consola del navegador del usuario final.
 *
 * Uso:
 *   import logger from '@/lib/logger';
 *   logger.log('mensaje');   // sólo visible en dev
 *   logger.error('fallo');   // siempre visible
 */

const isDev = import.meta.env.DEV;

const logger = {
  /** Sólo visible en desarrollo */
  log: (...args: unknown[]): void => {
    if (isDev) console.log(...args);
  },

  /** Sólo visible en desarrollo */
  warn: (...args: unknown[]): void => {
    if (isDev) console.warn(...args);
  },

  /** Sólo visible en desarrollo */
  info: (...args: unknown[]): void => {
    if (isDev) console.info(...args);
  },

  /** Siempre visible — usar sólo para errores reales */
  error: (...args: unknown[]): void => {
    console.error(...args);
  },
};

export default logger;
