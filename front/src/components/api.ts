export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const signIn = () => {
  window.location.assign(API_BASE_URL + "/login");
};

export const signOut = () => {
  window.location.assign(API_BASE_URL + "/logout");
};
