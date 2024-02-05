export type competition = {
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
};

export type wcif = {
  series: { id: string; name: string };
  persons: { registration: null | { status: string } }[];
  schedule: { venues: { name: string }[] };
};
