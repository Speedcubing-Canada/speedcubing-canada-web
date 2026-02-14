import { Province, regionID } from "./types";

export const REGIONS: Record<regionID, string> = {
  at: "Atlantic",
  qc: "Quebec",
  on: "Ontario",
  pr: "Prairies",
  bc: "British Columbia",
  te: "Territories",
  na: "N/A",
};

export const getRegionName = (regionId: regionID): string => REGIONS[regionId];

const provinces: Province[] = [
  { label: "Alberta", id: "ab", region_id: "pr" },
  { label: "British Columbia", id: "bc", region_id: "bc" },
  { label: "Manitoba", id: "mb", region_id: "pr" },
  { label: "New Brunswick", id: "nb", region_id: "at" },
  { label: "Newfoundland and Labrador", id: "nl", region_id: "at" },
  { label: "Northwest Territories", id: "nt", region_id: "te" },
  { label: "Nova Scotia", id: "ns", region_id: "at" },
  { label: "Nunavut", id: "nu", region_id: "te" },
  { label: "Ontario", id: "on", region_id: "on" },
  { label: "Prince Edward Island", id: "pe", region_id: "at" },
  { label: "Quebec", id: "qc", region_id: "qc" },
  { label: "Saskatchewan", id: "sk", region_id: "pr" },
  { label: "Yukon", id: "yt", region_id: "te" },
];

export const NA_PROVINCE: Province = {
  label: "N/A",
  id: "na",
  region_id: "na",
};

export const getProvincesWithNA: () => Province[] = () => {
  return provinces.concat(NA_PROVINCE);
};

export const getProvinces = () => {
  return provinces;
};
