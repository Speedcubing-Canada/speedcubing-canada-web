import { resolveBrowserLocale, TranslationMessages } from "react-admin";
import polyglotI18nProvider from "ra-i18n-polyglot";
import { LOCALE_TO_LANGUAGE, resources } from "./locale";

interface Translations {
  [locale: string]: TranslationMessages;
}

const translations: Translations = resources;
const languages = Object.entries(LOCALE_TO_LANGUAGE).map(([locale, name]) => ({
  locale,
  name,
}));

export const i18nProvider = polyglotI18nProvider(
  (locale) => (translations[locale] ? translations[locale] : translations.en),
  resolveBrowserLocale(),
  languages,
);
