import { WCA_ORIGIN, WCA_OAUTH_CLIENT_ID, WCA_OAUTH_CLIENT_SECRET } from './wca-env';
import { User} from '../models/user.model';

const tokenURL = `${WCA_ORIGIN}/oauth/token`;
const userProfileURL = `${WCA_ORIGIN}/api/v0/me`;

const checkStatus = async (res: any) => {
  if (res.ok) { // res.status >= 200 && res.status < 300
    return res;
  }
  throw await res.json();
};
/**
 * Checks the URL hash for presence of OAuth access token
 * and return it if it's found.
 * Should be called on application initialization (before any kind of router takes over the location).
 */
export const getOauthTokenIfAny = () => {
  const hash = window.location.hash.replace(/^#/, '');
  const hashParams = new URLSearchParams(hash);
  if (hashParams.has('access_token')) {
    window.location.hash = '';
    return hashParams.get('access_token');
  }
  return null;
};

export const signIn = () => {
  /* First we get the code */
  const paramsCode = new URLSearchParams({
    client_id: WCA_OAUTH_CLIENT_ID,
    response_type: 'code',
    redirect_uri: oauthRedirectUri(),
    scope: 'public dob',
  });
  const win: Window = window;
  win.location = `${WCA_ORIGIN}/oauth/authorize?${paramsCode.toString()}`;
};

export const getToken = async () => {
  /* Then we get the token */
  const code = new URLSearchParams(window.location.search).get('code') ??'';
  if (code === '') {
    throw new Error(
        JSON.stringify({
            error: 'Code is not defined',
        }));
  }
  console.log(code);
  const paramsToken = new URLSearchParams({
    client_id: WCA_OAUTH_CLIENT_ID,
    client_secret: WCA_OAUTH_CLIENT_SECRET,
    grant_type: 'authorization_code',
    redirect_uri: oauthRedirectUri(),
    code: code,
  });

  try {
    const tokenRes = await fetch(tokenURL, {
      method: 'POST',
      body: paramsToken,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }).then(checkStatus).then((data) => data.json());

    const meRes = await fetch(userProfileURL, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${tokenRes.access_token}`,
      },
    }).then(checkStatus).then((data) => data.json());

    if (!meRes) {
      throw new Error(
          JSON.stringify({
            error: 'Profile is not defined',
          }));
    }

    const profile = meRes.me;
    console.log(profile);
  } catch (err) {
    throw new Error(JSON.stringify(err));
  }
}

const oauthRedirectUri = () => {
  const { origin, pathname, search } = window.location;
  const searchParams = new URLSearchParams(search);
  const staging = searchParams.get('staging');
  const appUri = `${origin}${'/wca_callback'}`.replace(/\/$/, '');
  return staging ? `${appUri}?staging=true` : appUri;
};