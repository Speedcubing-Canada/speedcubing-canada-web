const searchParams = new URLSearchParams(window.location.search);
export const PRODUCTION =
  process.env.NODE_ENV === 'production' && !searchParams.has('staging');

export const WCA_ORIGIN = PRODUCTION
  ? 'https://www.worldcubeassociation.org'
  : 'https://staging.worldcubeassociation.org';

export const WCA_OAUTH_CLIENT_ID : string = PRODUCTION
  ? process.env.WCA_OAUTH_CLIENT_ID ?? 'example-application-id' //to handle the undefined case
  : 'example-application-id';

export const WCA_OAUTH_CLIENT_SECRET : string = PRODUCTION
  ? process.env.WCA_OAUTH_CLIENT_SECRET ?? 'example-application-secret' //to handle the undefined case
  : 'example-application-secret';