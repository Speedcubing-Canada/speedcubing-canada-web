const PREFERRED_PROVINCE_STORAGE_KEY = "rankings_preferred_province";

export const getCachedRankingsPreferredProvinceId = (): string | null => {
  return window.localStorage.getItem(PREFERRED_PROVINCE_STORAGE_KEY);
};

export const setCachedRankingsPreferredProvinceId = (
  provinceId: string,
): void => {
  window.localStorage.setItem(PREFERRED_PROVINCE_STORAGE_KEY, provinceId);
};

export const removeCachedRankingsPreferredProvinceId = (): void => {
  window.localStorage.removeItem(PREFERRED_PROVINCE_STORAGE_KEY);
};
