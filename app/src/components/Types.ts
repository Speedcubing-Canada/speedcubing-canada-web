import {AlertColor} from "@mui/material";

export interface User {
    id: number;
    name: string;
    roles: string[];
    province: string;
    wca_person: string;
    dob: string;
    email: string;
}

export interface Province {
    id: provinceID;
    label: string;
    region: string;
    region_id: regionID;
}

export interface Role {
    id: roleID;
    name: string;
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

export interface State {
  alert: boolean;
  alertType: AlertColor;
  alertContent: string;
}

export type Action =
  | {
      type: "SHOW_ALERT";
      alertType: AlertColor;
      alertContent: string;
    }
  | {
      type: "HIDE_ALERT";
    };

export type eventID = "333" | "222" | "444" | "555" | "666" | "777" | "333bf" | "333fm" | "333oh" | "333ft" | "minx" | "pyram" | "skewb" | "sq1" | "clock" | "444bf" | "555bf" | "333mbf" | "333mbo" | "magic" | "mmagic";

export type provinceID = "ab" | "bc" | "mb" | "nb" | "nl" | "ns" | "nt" | "nu" | "on" | "pe" | "qc" | "sk" | "yt" | "na";

export type regionID = "at" | "qc" | "on" | "pr" | "bc" | "te" | "na";

export type useAverage = "1" | "0";

export type chipColor = "default" | "error" | "primary" | "secondary" | "info" | "success" | "warning";

export type roleID = "GLOBAL_ADMIN" | "DIRECTOR" | "WEBMASTER" | "SENIOR_DELEGATE" | "DELEGATE" | "CANDIDATE_DELEGATE" | null;

export type IconSize = '1x' | '2x' | '3x' | '4x' | '5x'