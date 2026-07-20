import { LINKS } from "../pages/links";

export interface WcaPerson {
  avatarThumbUrl: string;
  avatarIsDefault: boolean;
}

// Fetches a single person's public profile from the WCA API. Used to pull the
// avatar for the directors listing (PersonCard).
export const fetchWcaPerson = async (wcaId: string): Promise<WcaPerson> => {
  const { person } = await fetch(`${LINKS.WCA.API.PERSON}${wcaId}`).then(
    (response) => response.json(),
  );

  return {
    avatarThumbUrl: person.avatar.thumb_url,
    avatarIsDefault: person.avatar.is_default,
  };
};
