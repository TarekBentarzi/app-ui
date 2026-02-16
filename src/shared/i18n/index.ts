import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';

const en = require('./locales/en.json');
const fr = require('./locales/fr.json');
const ar = require('./locales/ar.json');

const resources = {
    en: { translation: en },
    fr: { translation: fr },
    ar: { translation: ar },
};

const initI18n = async () => {
    const locale = Localization.getLocales()[0].languageCode ?? 'en';

    // Handle RTL for Arabic
    const isRTL = locale === 'ar';
    if (I18nManager.isRTL !== isRTL) {
        I18nManager.allowRTL(isRTL);
        I18nManager.forceRTL(isRTL);
        // Note: On some platforms, a restart might be required to apply RTL changes fully
    }

    await i18n
        .use(initReactI18next)
        .init({
            resources,
            lng: locale,
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
