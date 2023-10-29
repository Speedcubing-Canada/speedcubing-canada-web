export interface User {
  id: number;
  name: string;
  roles: string[];
  province: string;
  wca_person: string;
  dob: string;
}

export interface Province {
  id: provinceID;
  label: string;
  region: string;
  region_id: regionID;
}

export interface ProfileEditData {
  province: string;
}

export interface ChipData {
  key: number;
  label: string;
}

export type eventID =
  | "333"
  | "222"
  | "444"
  | "555"
  | "666"
  | "777"
  | "333bf"
  | "333fm"
  | "333oh"
  | "333ft"
  | "minx"
  | "pyram"
  | "skewb"
  | "sq1"
  | "clock"
  | "444bf"
  | "555bf"
  | "333mbf"
  | "333mbo"
  | "magic"
  | "mmagic";

export type provinceID =
  | "ab"
  | "bc"
  | "mb"
  | "nb"
  | "nl"
  | "ns"
  | "nt"
  | "nu"
  | "on"
  | "pe"
  | "qc"
  | "sk"
  | "yt"
  | "na";

export type regionID = "at" | "qc" | "on" | "pr" | "bc" | "te" | "na";

export type useAverage = "1" | "0";

export type chipColor =
  | "default"
  | "error"
  | "primary"
  | "secondary"
  | "info"
  | "success"
  | "warning";
