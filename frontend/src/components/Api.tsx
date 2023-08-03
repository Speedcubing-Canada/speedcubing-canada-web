import {useEffect, useState} from "react";
import {User} from "./Types";
import httpClient from "../httpClient";

export const PRODUCTION =
  process.env.NODE_ENV === 'production';
export const API_BASE_URL =
  process.env.API_BASE_URL || "http://localhost:8083";


export const signIn = () => {
    window.location.assign( API_BASE_URL+ "/login");
}

export const GetUser = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
    (async () => {
      try {
        const resp = await httpClient.get(API_BASE_URL + "/user_info");
        setUser(resp.data);
      } catch (error) {
        console.log("Not authenticated");
      }
    })();
  }, []);
    return user;
}


export const signOut = () => {
    window.location.assign(API_BASE_URL + "/logout");
}
