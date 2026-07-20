import { LINKS } from "../pages/links";

export interface WcaPerson {
  avatarThumbUrl: string;
  avatarIsDefault: boolean;
}

// Fetches a single person's public profile from the WCA API. Used to pull the
// avatar for the directors listing (PersonCard).
export const fetchWcaPerson = async (wcaId: string): Promise<WcaPerson> => {
  // Revalidate rather than trust the browser cache: newer WCA avatars expose a
  // content-addressed thumb_url that changes when the member edits their photo, so
  // a stale cached persons response would hand <img> a dead token (404). The WCA
  // API serves this endpoint "cache-control: public", so without this a returning
  // visitor can keep seeing the old avatar URL. (Legacy avatars use permanent file
  // paths and are unaffected.)
  const { person } = await fetch(`${LINKS.WCA.API.PERSON}${wcaId}`, {
    cache: "no-cache",
  }).then((response) => response.json());

  return {
    avatarThumbUrl: person.avatar.thumb_url,
    avatarIsDefault: person.avatar.is_default,
  };
};
