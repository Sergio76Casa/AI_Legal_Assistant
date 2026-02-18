import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar locales (los crearemos a continuación)
import es from '../locales/es.json';
import en from '../locales/en.json';
import fr from '../locales/fr.json';
import ar from '../locales/ar.json';
import zh from '../locales/zh.json';
import ur from '../locales/ur.json';
import ru from '../locales/ru.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            es: { translation: es },
            en: { translation: en },
            fr: { translation: fr },
            ar: { translation: ar },
            zh: { translation: zh },
            ur: { translation: ur },
            ru: { translation: ru }
        },
        fallbackLng: 'es',
        interpolation: {
            escapeValue: false
        },
        detection: {
            order: ['localStorage', 'cookie', 'htmlTag', 'path', 'subdomain'],
            caches: ['localStorage']
        }
    });

export default i18n;
