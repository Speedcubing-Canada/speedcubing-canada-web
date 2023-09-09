import { resolveBrowserLocale, TranslationMessages } from "react-admin";
import polyglotI18nProvider from "ra-i18n-polyglot";
import { resources } from "./locale";

interface Translations {
  [locale: string]: TranslationMessages;
}

const translations: Translations = resources;
export const i18nProvider = polyglotI18nProvider(
  (locale) => (translations[locale] ? translations[locale] : translations.en),
  resolveBrowserLocale(),
  [
    { locale: "en", name: "English" },
    { locale: "fr", name: "Français" },
  ],
);
