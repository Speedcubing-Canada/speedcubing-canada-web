const API_BASE_URL = "http://localhost:8083"

export const signIn = () => {
    window.location.assign( API_BASE_URL+ "/login");
}