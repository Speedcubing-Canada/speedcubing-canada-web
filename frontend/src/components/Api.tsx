const API_BASE_URL = "http://localhost:8080"

export const signIn = () => {
    window.location.assign( API_BASE_URL+ "/login");
}