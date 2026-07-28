import i18n from "i18next";

// Picks the field variant for the active locale (e.g. localized(team, "name") ->
// team.name_fr in French), falling back to the English variant. Bilingual records
// (teams, directors, featured members) store parallel `<field>_en` / `<field>_fr`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const localized = (record: any, field: string): string | null => {
  const lang = i18n.language?.startsWith("fr") ? "fr" : "en";
  const value = record?.[`${field}_${lang}`] ?? record?.[`${field}_en`];
  return typeof value === "string" && value.length > 0 ? value : null;
};
