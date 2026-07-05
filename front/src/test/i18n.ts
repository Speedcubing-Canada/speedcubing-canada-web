// A test-only i18next instance initialised with the real translation
// resources, so render tests can assert on the same strings users see.
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources } from "../locale";

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
