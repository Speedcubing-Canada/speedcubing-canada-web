export const PRODUCTION = import.meta.env.MODE === "production";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.speedcubingcanada.org";

export const signIn = () => {
  window.location.assign(new URL("/login", API_BASE_URL));
};

export const signOut = () => {
  window.location.assign(new URL("/logout", API_BASE_URL));
};
