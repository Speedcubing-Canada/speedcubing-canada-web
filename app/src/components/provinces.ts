import {
  Province,
  RegionID,
  REGIONS,
  PROVINCES_DATA,
  NA_PROVINCE_DATA,
} from "./types";

export { REGIONS };

export const getRegionName = (regionId: RegionID): string => REGIONS[regionId];

const provinces = PROVINCES_DATA as unknown as Province[];

export const NA_PROVINCE = NA_PROVINCE_DATA as unknown as Province;

export const getProvincesWithNA = (): Province[] => {
  return [...provinces, NA_PROVINCE];
};

export const getProvinces = () => {
  return provinces;
};
