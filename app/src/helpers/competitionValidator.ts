import { competition } from "../types";

const SPEEDCUBING_CANADA_USER_ID = "287748";

export const isSpeedcubingCanadaCompetition = (competition: competition) =>
  competition?.organizers?.some(
    (o) => o.id.toString() === SPEEDCUBING_CANADA_USER_ID,
  );
