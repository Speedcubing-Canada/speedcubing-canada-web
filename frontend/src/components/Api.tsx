export const PRODUCTION =
    process.env.NODE_ENV === 'production';

export const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "https://api.speedcubingcanara.org";


export const signIn = () => {
    window.location.assign(API_BASE_URL + "/login");
}

export const signOut = () => {
    window.location.assign(API_BASE_URL + "/logout");
}

