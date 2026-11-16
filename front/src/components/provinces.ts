import { Province, PROVINCES_DATA, NA_PROVINCE_DATA } from "../types";

export const getProvincesWithNA = (): Province[] => {
  return [...PROVINCES_DATA, NA_PROVINCE_DATA];
};

export const getProvinces = () => {
  return [...PROVINCES_DATA];
};

export const getNAProvince = () => {
  return { ...NA_PROVINCE_DATA };
};
