export const LINKS = {
  MAILING_LIST: "https://share.hsforms.com/1eWkfr6anSF-HKTZJVrElZQcrqzz",
  INSTAGRAM: "https://www.instagram.com/speedcubingcanada",
  FACEBOOK: "https://www.facebook.com/speedcubingcan",
  TWITTER: "https://twitter.com/SpeedcubingCAN",
  WCA: {
    HOME: "https://www.worldcubeassociation.org",
    COMPS_CANADA:
      "https://www.worldcubeassociation.org/competitions?region=Canada&show_registration_status=on",
    REGS: "https://www.worldcubeassociation.org/regulations",
    DELEGATES: "https://www.worldcubeassociation.org/delegates",
    REGIONAL_ORGS: "https://www.worldcubeassociation.org/organizations",
    WC2003: "https://www.worldcubeassociation.org/competitions/WC2003",
    CO2007:
      "https://www.worldcubeassociation.org/competitions/CanadianOpen2007",
    API: {
      COMPETITION_INFO:
        "https://www.worldcubeassociation.org/api/v0/competitions/{compId}",
      COMPETITION_WCIF:
        "https://www.worldcubeassociation.org/api/v0/competitions/{compId}/wcif/version/2",
      COMPETITION_SERIES:
        "https://www.worldcubeassociation.org/api/v0/competition_series/{seriesId}",
      PERSON: "https://www.worldcubeassociation.org/api/v0/persons/{wcaId}",
      SEARCH_USERS:
        "https://www.worldcubeassociation.org/api/v0/search/users?persons_table=true&q={query}",
    },
    PROFILE: "https://www.worldcubeassociation.org/persons/{wcaId}",
  },
  FIRST_COMP: "https://youtu.be/xK2ycvTfgUY",
  FIRST_COMP_FR: "https://youtu.be/yYZHzTc0GMc",
  COMP_BASICS: "https://youtu.be/vz1V0Gv0qX0",
  COMP_BASICS_FR: "https://youtu.be/LH3QG7krdgc",
  DISCORD_QC: "https://discord.gg/BTwYPg4qcJ",
  GOOGLE_DOC_BC:
    "https://docs.google.com/document/d/1ufNHCLll9U3Tz1cZWlcc3pW-6-m0ElCy-8dfKAOugDA",
  REPORT: "mailto:software@speedcubingcanada.org",
} as const;

/** Extracts the `{placeholder}` names from a template string. */
type PlaceholderKeys<T extends string> =
  T extends `${string}{${infer Key}}${infer Rest}`
    ? Key | PlaceholderKeys<Rest>
    : never;

/** The parameter object required to fill a link template. */
type LinkParams<T extends string> = {
  [K in PlaceholderKeys<T>]: string | number | boolean;
};

/** Fills `{placeholder}`s in a `LINKS` template and URL-encodes each value. */
export function formatLink<T extends string>(
  template: T,
  params: LinkParams<T>,
): string {
  const values: Record<string, string | number | boolean | null | undefined> =
    params;

  return template.replaceAll(/\{([^{}]+)\}/g, (_, key: string) => {
    const value = values[key];
    if (value == null) {
      throw new Error(
        `Missing link parameter "${key}" for template "${template}"`,
      );
    }
    return encodeURIComponent(String(value));
  });
}
