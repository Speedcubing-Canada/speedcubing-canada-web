export const PRODUCTION = import.meta.env.MODE === "production";

const defaultApiBaseUrl =
  import.meta.env.MODE === "staging"
    ? "https://api.staging.speedcubingcanada.org"
    : "https://api.speedcubingcanada.org";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl;

export const signIn = () => {
  window.location.assign(new URL("/login", API_BASE_URL));
};

export const signOut = () => {
  window.location.assign(new URL("/logout", API_BASE_URL));
};
