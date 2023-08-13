export const PRODUCTION =
    process.env.NODE_ENV === 'production';
export const API_BASE_URL =
    process.env.API_BASE_URL || "http://localhost:8083"; // doesn't seem to work, don't know why


export const signIn = () => {
    window.location.assign(API_BASE_URL + "/login");
}

export const signOut = () => {
    window.location.assign(API_BASE_URL + "/logout");
}

