export const PRODUCTION = process.env.NODE_ENV === "production";

export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://api.speedcubingcanada.org";

export const signIn = () => {
  window.location.assign(new URL("/login", API_BASE_URL));
};

export const signOut = () => {
  window.location.assign(new URL("/logout", API_BASE_URL));
};
