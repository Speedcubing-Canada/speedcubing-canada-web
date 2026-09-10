// A test-only i18next instance initialised with the real translation
// resources, so render tests can assert on the same strings users see.
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources } from "../locale";

void i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

// i18next 21 types t() as TFunctionResult (string | object | null | undefined),
// which no testing-library matcher accepts. Tests only ever look up keys that
// exist, so narrow the return once here instead of casting at every call site.
export type TestI18n = Omit<typeof i18n, "t"> & {
  t: (key: string, options?: Record<string, unknown>) => string;
};

export default i18n;
