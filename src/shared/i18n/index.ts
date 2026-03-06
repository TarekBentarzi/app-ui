import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';

import en from './locales/en.json';
import fr from './locales/fr.json';
import ar from './locales/ar.json';

const resources = {
    en: { translation: en },
    fr: { translation: fr },
    ar: { translation: ar },
};

const initI18n = async () => {
    const locale = Localization.getLocales()[0].languageCode ?? 'en';
    
    // Forcer le français pour le développement
    const forcedLocale = 'fr'; // Changez en 'en' ou 'ar' si besoin

    console.log('[i18n] Langue détectée:', locale, '- Langue forcée:', forcedLocale);

    // Handle RTL for Arabic
    const isRTL = forcedLocale === 'ar';
    if (I18nManager.isRTL !== isRTL) {
        I18nManager.allowRTL(isRTL);
        I18nManager.forceRTL(isRTL);
        // Note: On some platforms, a restart might be required to apply RTL changes fully
    }

    await i18n
        .use(initReactI18next)
        .init({
            resources,
            lng: forcedLocale, // Utiliser la langue forcée
            fallbackLng: 'en',
            interpolation: {
                escapeValue: false,
            },
            react: {
                useSuspense: false,
            },
        });
};

initI18n();

export default i18n;
