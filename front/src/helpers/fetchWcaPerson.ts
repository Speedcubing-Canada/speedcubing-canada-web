import { LINKS } from "../pages/links";

export interface WcaPerson {
  name: string;
  avatarUrl: string;
  avatarThumbUrl: string;
  avatarIsDefault: boolean;
  delegateStatus: string | null;
}

// Fetches a single person's public profile from the WCA API. Used to pull
// avatars (and delegate status) for the directors and delegates listings.
export const fetchWcaPerson = async (wcaId: string): Promise<WcaPerson> => {
  const { person } = await fetch(`${LINKS.WCA.API.PERSON}${wcaId}`).then(
    (response) => response.json(),
  );

  return {
    name: person.name,
    avatarUrl: person.avatar.url,
    avatarThumbUrl: person.avatar.thumb_url,
    avatarIsDefault: person.avatar.is_default,
    delegateStatus: person.delegate_status ?? null,
  };
};
