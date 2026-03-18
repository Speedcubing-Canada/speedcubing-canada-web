import { AlertColor } from "@mui/material";

export interface User {
  id: number;
  name: string;
  roles: string[];
  province: string;
  wca_id: string;
  dob: string;
  email: string;
}

export interface ProfileEditData {
  province: string;
}

export interface ChipData {
  key: number;
  label: string;
}

export interface Ranking {
  name: string;
  rank: number;
  time: string;
  url: string;
}

export interface AlertState {
  alert: boolean;
  alertType: AlertColor;
  alertContent: string;
}

export type AlertAction =
  | {
      type: "SHOW_ALERT";
      alertType: AlertColor;
      alertContent: string;
    }
  | {
      type: "HIDE_ALERT";
    };

export const EVENTS = [
  "333",
  "222",
  "444",
  "555",
  "666",
  "777",
  "333bf",
  "333fm",
  "333oh",
  "333ft",
  "minx",
  "pyram",
  "skewb",
  "sq1",
  "clock",
  "444bf",
  "555bf",
  "333mbf",
  "333mbo",
  "magic",
  "mmagic",
] as const;

export type EventID = (typeof EVENTS)[number];

// Active events used for rankings
export const ACTIVE_EVENTS = [
  "333",
  "222",
  "444",
  "555",
  "666",
  "777",
  "333bf",
  "333fm",
  "333oh",
  "clock",
  "minx",
  "pyram",
  "skewb",
  "sq1",
  "444bf",
  "555bf",
  "333mbf",
] as const;

export const REGIONS = {
  at: "Atlantic",
  qc: "Quebec",
  on: "Ontario",
  pr: "Prairies",
  bc: "British Columbia",
  te: "Territories",
  na: "N/A",
} as const;

export type RegionID = keyof typeof REGIONS;

export const PROVINCES_DATA = [
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
] as const;

export const NA_PROVINCE_DATA = {
  label: "N/A",
  id: "na",
  region_id: "na",
} as const;

export type Province =
  | (typeof PROVINCES_DATA)[number]
  | typeof NA_PROVINCE_DATA;

export type ProvinceID = Province["id"];

export const ROLES_DATA = [
  { id: "GLOBAL_ADMIN", name: "Global Admin" },
  { id: "DIRECTOR", name: "Director" },
  { id: "WEBMASTER", name: "Webmaster" },
  { id: "SENIOR_DELEGATE", name: "Senior Delegate" },
  { id: "DELEGATE", name: "Delegate" },
  { id: "CANDIDATE_DELEGATE", name: "Junior Delegate" },
] as const;

export type Role = (typeof ROLES_DATA)[number];
export type RoleID = Role["id"];

export type ChipColor =
  | "default"
  | "error"
  | "primary"
  | "secondary"
  | "info"
  | "success"
  | "warning";

export type IconSize = "1x" | "2x" | "3x" | "4x" | "5x";

export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl";
