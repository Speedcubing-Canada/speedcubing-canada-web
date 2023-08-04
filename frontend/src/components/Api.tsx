import {useEffect, useState} from "react";
import {eventID, provinceID, useAverage, User} from "./Types";
import httpClient from "../httpClient";

export const PRODUCTION =
    process.env.NODE_ENV === 'production';
export const API_BASE_URL =
    process.env.API_BASE_URL || "http://localhost:8083";


export const signIn = () => {
    window.location.assign(API_BASE_URL + "/login");
}

export const signOut = () => {
    window.location.assign(API_BASE_URL + "/logout");
}

export const GetRanking = (eventId: eventID | null, provinceId: provinceID | undefined, use_average: boolean) => {
    const [ranking, setRanking] = useState<any | null>(null);

    let use_average_str = "0";
    if (use_average) {
        use_average_str = "1";
    }

    useEffect(() => {
        (async () => {
            try {
                if (eventId === null || provinceId === null || use_average === null) {
                    return null;
                }
                //const resp = await httpClient.get(API_BASE_URL + "/province_rankings/" + eventId + "/" + provinceId + "/" + use_average_str);
                const resp = await httpClient.get(API_BASE_URL + "/test_rankings/");

                setRanking(resp.data);
            } catch (error: any) {
                if (error.response.status === 500) {
                    console.log("Internal server error" + error.response.data);
                } else if (error.response.status === 404) {
                    console.log("Not found" + error.response.data);
                }
            }
        })();
    }, []);
    return ranking;
}
