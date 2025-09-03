export type Competition = {
  id: string;
  name: string;
  venue: string;
  city: string;
  registration_open: string;
  registration_close: string;
  competitor_limit: number;
  venue_address: string;
  url: string;
  start_date: string;
  organizers: Array<{ id: number }>;
};

export type Wcif = {
  series: WcifSeries;
  persons: WcifPerson[];
  schedule: WcifSchedule;
};

export type RegistrationStatus = "accepted" | "pending" | "deleted";

export type WcifSeries = { id: string; name: string };

export type WcifPerson = {
  registration: null | { status: RegistrationStatus };
};

export type WcifVenue = {
  name: string;
};
export type WcifSchedule = {
  venues: WcifVenue[];
};
