import { ProvinceID, PROVINCES_DATA, NA_PROVINCE_DATA } from "../types";

const PREFERRED_PROVINCE_STORAGE_KEY = "rankings_preferred_province";

const VALID_PROVINCE_IDS = new Set<string>([
  ...PROVINCES_DATA.map((p) => p.id),
  NA_PROVINCE_DATA.id,
]);

export const isValidProvinceId = (value: unknown): value is ProvinceID =>
  typeof value === "string" && VALID_PROVINCE_IDS.has(value);

export const getCachedRankingsPreferredProvinceId = (): ProvinceID | null => {
  const cached = window.localStorage.getItem(PREFERRED_PROVINCE_STORAGE_KEY);
  if (cached && isValidProvinceId(cached)) {
    return cached;
  }
  // If invalid, we remove it and return null
  if (cached) {
    window.localStorage.removeItem(PREFERRED_PROVINCE_STORAGE_KEY);
  }

  return null;
};

export const setCachedRankingsPreferredProvinceId = (
  provinceId: ProvinceID,
): void => {
  window.localStorage.setItem(PREFERRED_PROVINCE_STORAGE_KEY, provinceId);
};

export const removeCachedRankingsPreferredProvinceId = (): void => {
  window.localStorage.removeItem(PREFERRED_PROVINCE_STORAGE_KEY);
};
