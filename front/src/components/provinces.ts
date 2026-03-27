import {
  Province,
  RegionID,
  REGIONS,
  PROVINCES_DATA,
  NA_PROVINCE_DATA,
} from "../types";

export const getRegionName = (regionId: RegionID): string => REGIONS[regionId];

export const getProvincesWithNA = (): Province[] => {
  return [...PROVINCES_DATA, NA_PROVINCE_DATA];
};

export const getProvinces = () => {
  return [...PROVINCES_DATA];
};

export const getNAProvince = () => {
  return { ...NA_PROVINCE_DATA };
};
